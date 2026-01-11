const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync, execSync } = require('child_process');
const os = require("os");
const { app, Notification, dialog, Menu } = require('electron');
const unzipper = require('unzipper');


const si = require('systeminformation');
const crypto = require('crypto');



const isDev = !app.isPackaged;

let appDir;
if (isDev) {
    appDir = path.join(__dirname);
} else {
    appDir = process.resourcesPath; // where extraResources are placed
}

const networkInterfaces = os.networkInterfaces();

let ipv4Address = "localhost";

Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((networkInterface) => {
        // Only consider IPv4 addresses, ignore internal and loopback addresses
        if (networkInterface.family === "IPv4" && !networkInterface.internal) {
            ipv4Address = networkInterface.address;
        }
    });
});

// Flexible spawn wrapper
function spawnWrapper(processType, command, argsOrOptions, maybeOptions) {
    let args = [];
    let options = {};

    if (Array.isArray(argsOrOptions)) {
        args = argsOrOptions;
        options = maybeOptions || {};
    } else {
        options = argsOrOptions || {};
    }

    const child = spawn(command, args, options);

    child.stdout.on('data', (data) => {
        logger(processType, `${processType} ${data.toString()}`);
    });

    child.stderr.on('data', (data) => {
        logger(processType, `${processType} ${data.toString()}`);
    });

    child.on('close', (code) => {
        logger(processType, `${processType} exited with code ${code} for ${JSON.stringify(argsOrOptions)}`);
    });

    child.on('error', (err) => {
        logger(processType, `${processType} ${err.message}`);
    });

    return child.pid;
}

function spawnPhpCgiWorker(phpCGi, port) {
    const args = ['-b', `127.0.0.1:${port}`];
    const options = { cwd: appDir };

    function start() {
        const child = spawn(phpCGi, args, options);

        child.stdout.on('data', (data) => {
            logger(port, `[PHP-CGI:${port}] ${data.toString()}`);
        });

        child.stderr.on('data', (data) => {
            logger(port, `[PHP-CGI:${port}] ${data.toString()}`);
        });

        child.on('close', (code) => {
            logger(port, `[PHP-CGI:${port}] exited with code ${code}. Restarting in 2s...`);
            setTimeout(start, 2000); // auto-restart after 2 seconds
        });

        child.on('error', (err) => {
            logger(port, `[PHP-CGI:${port}] error: ${err.message}`);
        });

        return child.pid;
    }

    return start();
}

const timezoneOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Use 24-hour format
    timeZone: "Asia/Dubai",
};

function getFormattedDate() {
    const [newDate, newTime] = new Intl.DateTimeFormat("en-US", timezoneOptions)
        .format(new Date())
        .split(",");
    const [m, d, y] = newDate.split("/");

    return {
        date: `${d.padStart(2, 0)}-${m.padStart(2, 0)}-${y}`,
        time: newTime,
    };
}

function notify(title = "", body = "", icon = 'favicon-256x256.png', onClick = null) {
    const notification = new Notification({
        title,
        body,
        icon: path.join(appDir, 'www', icon)
    });

    if (onClick && typeof onClick === 'function') {
        notification.on('click', onClick);
    }
    notification.show();
}

function logger(processType, message) {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    const fullMessage = `[${timestamp}] ${message}\n`;

    // Write to file in logs directory within appDir
    const logDir = path.join(appDir, 'logs');
    const logFile = path.join(logDir, `${processType}-${year}-${month}-${day}.log`);

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFile(logFile, fullMessage, (err) => {
        if (err) {
            console.error("❌ Failed to write log file:", err);
        }
    });
}


/**
 * Checks if VS Redistributable is already installed
 * @param {string} displayName - Part of the name to check in installed programs
 * @returns {boolean}
 */
function isVSRedistInstalled(displayName = 'Microsoft Visual C++') {
    // Use PowerShell to check registry for installed programs
    const psScript = `
    Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*,
                      HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* |
    Where-Object { $_.DisplayName -like "*${displayName}*" } |
    Select-Object -ExpandProperty DisplayName
  `;

    const result = spawnSync('powershell.exe', ['-Command', psScript], { encoding: 'utf8' });

    return result.stdout && result.stdout.trim().length > 0;
}

function runInstaller(installerPath) {
    return new Promise((resolve, reject) => {
        if (isVSRedistInstalled()) {
            logger(`VS_REDIST`, '✅ VS Redistributable already installed.');
            return resolve('Already installed');
        }

        const installer = spawn(installerPath, ['/quiet', '/norestart']);

        installer.stdout.on('data', (data) => {
            logger(`VS_REDIST`, data.toString());
        });

        installer.stderr.on('data', (data) => {
            logger(`VS_REDIST`, data.toString());
        });

        installer.on('close', (code) => {
            if (code === 0) {

                logger(`VS_REDIST`, 'Installed successfully');
                resolve('Installed successfully');
            } else if (code === 1638) {

                logger(`VS_REDIST`, 'Already installed (code 1638)');
                resolve('Already installed');
            } else {
                logger(`VS_REDIST`, `❌ Installation failed with code ${code}`);
                reject(new Error(`Installation failed with code ${code}`));
            }
        });
    });
}



async function openUpdaterWindow() {
    const result = await dialog.showOpenDialog({
        title: 'Select Update ZIP File',
        filters: [{ name: 'ZIP Files', extensions: ['zip'] }],
        properties: ['openFile']
    });

    logger('Updater', `called openUpdaterWindow, result: ${JSON.stringify(result)}`);


    if (!result.canceled && result.filePaths.length > 0) {
        const zipPath = result.filePaths[0];
        await applyUpdate(zipPath);
    }
}

async function applyUpdate(zipPath) {
    try {
        const tempDir = path.join(appDir, 'SmartQueueUpdate');

        // Clean temp dir first
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });

        // Extract ZIP
        await fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: tempDir }))
            .promise();

        // Copy files to app directory
        copyFolderRecursiveSync(tempDir, appDir);

        // ✅ DELETE temp update folder after copy
        fs.rmSync(tempDir, { recursive: true, force: true });

        const { dialog } = require('electron');
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Applied',
            message: 'Update applied successfully. The app will now restart.'
        }).then(() => {
            app.relaunch();
            app.exit();
        });

    } catch (err) {
        logger('Updater', `Failed to apply update: ${err}`);
    }
}

function copyFolderRecursiveSync(source, target) {
    if (!fs.existsSync(source)) return;
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const srcPath = path.join(source, file);
        const destPath = path.join(target, file);
        if (fs.lstatSync(srcPath).isDirectory()) {
            if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
            copyFolderRecursiveSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

function setMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Update App',
                    click: () => openUpdaterWindow(), // now works
                },
                { role: 'quit' },
            ]
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function stopServices(pid) {
    return new Promise(resolve => {
        fs.appendFileSync(path.join(appDir, "logs", 'SMARTQUEUE_SHUTDOWN.txt'), 'Stopping services...\n');

        if (pid) {
            try {
                execSync(`taskkill /PID ${pid} /T /F`);
                fs.appendFileSync(path.join(appDir, "logs", 'SMARTQUEUE_SHUTDOWN.txt'), `✅ ${pid} stopped\n`);
            } catch (err) {
                fs.appendFileSync(path.join(appDir, "logs", 'SMARTQUEUE_SHUTDOWN.txt'), `ℹ️ Failed to stop\n`);
            }
        }

        setTimeout(resolve, 2000);
    });
}

async function generateHardwareFingerprint() {
    const [
        cpu,
        baseboard,
        disks,
        network,
        os
    ] = await Promise.all([
        si.cpu(),
        si.baseboard(),
        si.diskLayout(),
        si.networkInterfaces(),
        si.osInfo()
    ]);

    const primaryDisk = disks.find(d => d.serial) || {};

    const macs = network
        .filter(n => !n.internal && n.mac)
        .map(n => n.mac)
        .join(",");

    const raw = [
        cpu.brand,
        cpu.physicalCores,
        baseboard.serial || "NO_MB",
        primaryDisk.serial || "NO_DISK",
        os.hostname,
        macs
    ].join("|");

    return crypto
        .createHash("sha256")
        .update(raw)
        .digest("hex");
}

async function getCachedMachineId() {
    const filePath = path.join(appDir, 'machine.id');

    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
    }

    const id = await generateHardwareFingerprint();
    fs.writeFileSync(filePath, id, 'utf8');
    return id;
}


// ---------------- CLOCK TAMPERING PROTECTION ----------------
const CLOCK_FILE = path.join(appDir, 'clock.json');

function readClock() {
    if (!fs.existsSync(CLOCK_FILE)) return null;
    try {
        return JSON.parse(fs.readFileSync(CLOCK_FILE, 'utf8'));
    } catch {
        return null;
    }
}

function writeClock(ts) {
    fs.writeFileSync(CLOCK_FILE, JSON.stringify({ last: ts }));
}

function isClockTampered() {
    const data = readClock();
    if (!data || !data.last) {
        // first run → trust system time
        writeClock(Date.now());
        return false;
    }

    const now = Date.now();
    const ALLOWED_DRIFT = 5 * 60 * 1000; // 5 minutes

    if (now + ALLOWED_DRIFT < data.last) {
        return true;
    }

    // update monotonic timestamp
    writeClock(now);
    return false;
}



const VIOLATION_FILE = path.join(process.cwd(), 'integrity.json');
const MAX_VIOLATIONS = 3; // change to 3 if needed

function hashFile(file) {
    return crypto
        .createHash('sha256')
        .update(fs.readFileSync(file))
        .digest('hex');
}

function scanPhpFiles(dir, map = {}) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const f of files) {
        const full = path.join(dir, f.name);

        if (f.isDirectory()) {
            scanPhpFiles(full, map);
        } else if (f.isFile() && f.name.endsWith('.php')) {
            map[full] = hashFile(full);
        }
    }

    return map;
}

function loadState() {
    if (!fs.existsSync(VIOLATION_FILE)) {
        return { hashes: {}, violations: 0 };
    }
    return JSON.parse(fs.readFileSync(VIOLATION_FILE, 'utf8'));
}

function saveState(state) {
    fs.writeFileSync(VIOLATION_FILE, JSON.stringify(state));
}

function checkIntegrity(watchDir) {
    const state = loadState();
    const current = scanPhpFiles(watchDir);

    let changed = false;

    for (const file in current) {
        if (!state.hashes[file]) {
            changed = true;
        } else if (state.hashes[file] !== current[file]) {
            changed = true;
        }
    }

    for (const file in state.hashes) {
        if (!current[file]) {
            changed = true;
        }
    }

    // 🔐 FIRST RUN → create baseline
    if (Object.keys(state.hashes).length === 0) {
        state.hashes = current;
        state.violations = 0;
        saveState(state);
        return false;
    }

    if (changed) {
        state.violations += 1;
    }

    // ✅ ALWAYS update hashes
    state.hashes = current;
    saveState(state);

    return state.violations >= MAX_VIOLATIONS;
}

function verifySignature(signature) {
    const verify = crypto.createVerify('SHA256');
    verify.update(`App_Unlock_Temp_Name`);
    verify.end();
    return verify.verify(fs.readFileSync('public_key.pem', 'utf8'), Buffer.from(signature, 'base64'));
}

module.exports = {
    logger, runInstaller, stopServices,
    spawnWrapper, spawnPhpCgiWorker,
    ipv4Address,
    setMenu, getCachedMachineId, isClockTampered, checkIntegrity, verifySignature
}