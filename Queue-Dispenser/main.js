const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
        kiosk: true,
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
        try {
            let url = `http://${serverIp}:8000/api/electron/next-ticket`;
            console.log(url);
            
            const response = await axios.get(url);
            if(response.data.status) {
                const pdfBase64 = response.data.message;
                const tempPath = path.join(__dirname, 'temp_ticket.pdf');

                fs.writeFileSync(tempPath, Buffer.from(pdfBase64, 'base64'));

                const printWin = new BrowserWindow({ show: false });
                await printWin.loadFile(tempPath);

                printWin.webContents.print({
                    silent: true,
                    printBackground: true
                }, (success, errorType) => {
                    if (!success) console.log("Print failed:", errorType);
                    printWin.close();
                    fs.unlinkSync(tempPath);
                });
            }
        } catch (err) {
            console.error("Error fetching ticket:", err.message);
        }
        // Schedule next poll
        setTimeout(fetchAndPrint, pollInterval);
    };

    fetchAndPrint();
}

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
