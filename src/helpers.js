const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { spawn,spawnSync } = require('child_process');
const os = require("os");
const { app, Notification } = require('electron');

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

function tailLogFile(logFilePath) {
    const tail = spawn('powershell.exe', [
        '-Command',
        `Get-Content -Path "${logFilePath}" -Wait -Tail 10`
    ]);

    tail.stdout.on('data', (data) => {
        log(`[NGINX] ${data.toString()}`);
    });

    tail.stderr.on('data', (data) => {
        log(`[NGINX-ERROR] ${data.toString()}`);
    });
}

// Flexible spawn wrapper
function spawnWrapper(mainWindow, processType, command, argsOrOptions, maybeOptions) {
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
        log(mainWindow, `${processType} ${data.toString()}`);
    });

    child.stderr.on('data', (data) => {
        log(mainWindow, `${processType} ${data.toString()}`);
    });

    child.on('close', (code) => {
        log(mainWindow, `${processType} exited with code ${code} for ${JSON.stringify(argsOrOptions)}`);
    });

    child.on('error', (err) => {
        log(mainWindow, `${processType} ${err.message}`);
    });

    return child;
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

        return child;
    }

    return start();
}


function log(mainWindow, message) {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    const fullMessage = `[${timestamp}] ${message}\n`;

    // Send to frontend
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('log', fullMessage);
    }

    // Write to file in logs directory within appDir
    const logDir = path.join(appDir, 'logs');
    const logFile = path.join(logDir, `${year}-${month}-${day}.log`);

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

function stopProcess(mainWindow, Process) {

    if (!Process) {
        log(mainWindow, `Something went wrong ${Process}.`);
        return;
    }

    Process.kill();
    Process = null;
    log(mainWindow, `${Process} has been stopped.`);

}

function cloneTheRepoIfRequired(mainWindow, appDir, targetDir, backendDir, phpPath, repoUrl) {
    const composerPhar = path.join(appDir, 'composer.phar');

    if (!fs.existsSync(targetDir) || fs.readdirSync(targetDir).length === 0) {
        log(mainWindow, `Cloning repository from ${repoUrl}`);
        const git = simpleGit();

        git.clone(repoUrl, targetDir)
            .then(() => {
                log(mainWindow, 'Repository cloned successfully.');

                // Run `composer install`
                return spawnWrapper(mainWindow, "Repo", phpPath, [composerPhar, 'install'], {
                    cwd: backendDir
                });
            })
            .then(() => {
                // Run `php artisan migrate --force`
                log(mainWindow, 'Running php artisan migrate --force');
                return spawnWrapper(mainWindow, "Repo", phpPath, ['artisan', 'migrate', '--force'], {
                    cwd: backendDir
                });
            })
            .then(() => {
                log(mainWindow, 'Migration completed successfully.');
            })
            .catch(err => {
                log(mainWindow, `Error: ${err.message}`);
            });
    } else {
        // log(mainWindow, 'Repository already cloned.');
    }
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
            console.log('✅ VS Redistributable already installed.');
            return resolve('Already installed');
        }

        const installer = spawn(installerPath, ['/quiet', '/norestart']);

        installer.stdout.on('data', (data) => {
            console.log(data.toString());
            logger(`VS_REDIST`, data.toString());
        });

        installer.stderr.on('data', (data) => {
            logger(`VS_REDIST`, data.toString());
        });

        installer.on('close', (code) => {
            if (code === 0) {
                console.log('Installed successfully');
                
                logger(`VS_REDIST`, 'Installed successfully');
                resolve('Installed successfully');
            } else if (code === 1638) {
                console.log('Already installed (code 1638)');

                logger(`VS_REDIST`, 'Already installed (code 1638)');
                resolve('Already installed');
            } else {
                console.log( `❌ Installation failed with code ${code}`);
                logger(`VS_REDIST`, `❌ Installation failed with code ${code}`);
                reject(new Error(`Installation failed with code ${code}`));
            }
        });
    });
}

module.exports = {
    logger, runInstaller,
    tailLogFile,
    spawnWrapper, spawnPhpCgiWorker,
    stopProcess,
    cloneTheRepoIfRequired,
    getFormattedDate, notify,
    timezoneOptions, ipv4Address
}