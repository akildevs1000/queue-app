const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require("child_process");

let win;
// const logDir = path.join(__dirname, 'logs');

// Ensure logs folder exists
// if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Log IPs
function writeLog(ip) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - Loaded IP: ${ip}\n`;
    console.log(logMessage);
    // fs.appendFileSync(path.join(logDir, 'guest_ips.log'), logMessage, 'utf8');
}

// Create main window
function createWindow() {
    win = new BrowserWindow({
        fullscreen: true,
        frame: false,
        autoHideMenuBar: true,
        kiosk: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    globalShortcut.register('CommandOrControl+I', () => {
        if (win) win.loadFile('index.html');
    });
});

// Load guest page
ipcMain.on('load-guest', (event, ip) => {
    writeLog(ip);
    win.setFullScreen(true);
    win.setResizable(false);
    win.setMenuBarVisibility(false);
    win.loadURL(`http://${ip}:8000/guest`);

    // Start auto ticket polling
    startAutoTicketPolling(ip);
});

async function startAutoTicketPolling(serverIp) {
    const pollInterval = 3000; // 2 seconds

    const fetchAndPrint = async () => {

        const tempFile = app.isPackaged
            ? path.join(app.getPath("temp"), "ticket.pdf") // production
            : path.join(__dirname, "ticket.pdf");          // development

        const sumatraPath = app.isPackaged
            ? path.join(process.resourcesPath, "print.exe")
            : path.join(__dirname, "print.exe");

        try {
            const url = `http://${serverIp}:8000/api/electron/next-ticket`;

            console.log("Fetching:", url);

            const response = await axios.get(url, { responseType: "arraybuffer" });

            fs.writeFileSync(tempFile, response.data);

            const command = `"${sumatraPath}" -print-to-default -silent "${tempFile}"`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error("Error printing:", error);
                    return;
                }
                console.log("Printed using Sumatra successfully.");
            });

        } catch (error) {
            console.error("Print error:", error.message);
        }

        // Schedule next poll
        setTimeout(fetchAndPrint, pollInterval);
    };

    fetchAndPrint();
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
