const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');

let win;
let pollingActive = false;
let pollingTimeout = null;

function writeLog(ip) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - Loaded IP: ${ip}`;
  console.log(logMessage);
  // Optionally append to file
  // fs.appendFileSync(path.join(__dirname, 'guest_ips.log'), logMessage + '\n', 'utf8');
}

function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    autoHideMenuBar: true,
    kiosk: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // Shortcut to return to IP entry screen
  // globalShortcut.register('CommandOrControl+I', () => {
  //   if (win) win.loadFile('index.html');
  // });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.on('load-guest', (event, { ip, languages }) => {
  console.log({ ip, languages });
  writeLog(ip);

  win.setFullScreen(true);
  win.setResizable(false);
  win.setMenuBarVisibility(false);

  // always STOP polling BEFORE trying to load anything new
  stopAutoTicketPolling();

  const targetUrl = `http://${ip}:5174`;
  console.log("Loading guest URL:", targetUrl);

  win.loadURL(targetUrl);

  const onFinish = () => {
    console.log("Guest page loaded");
    win.webContents.send("guest-data", { ip, languages });
    startAutoTicketPolling(ip);

    cleanup();
  };

  const onFail = (e, code, desc) => {
    console.log("Guest page failed:", code, desc);
    stopAutoTicketPolling();       // <-- HARD STOP
    win.loadFile(path.join(__dirname, "offline.html"));

    cleanup();
  };

  function cleanup() {
    win.webContents.removeListener("did-finish-load", onFinish);
    win.webContents.removeListener("did-fail-load", onFail);
  }

  win.webContents.once("did-finish-load", onFinish);
  win.webContents.once("did-fail-load", onFail);
});


// Safe polling: single loop, cancellable
async function startAutoTicketPolling(serverIp) {
  if (pollingActive) {
    console.log('Polling already active; ignoring start request');
    return;
  }

  pollingActive = true;
  console.log('startAutoTicketPolling:', serverIp);

  const pollInterval = 3000; // ms

  const fetchAndPrint = async () => {
    if (!pollingActive) return;

    const tempFile = app.isPackaged
      ? path.join(app.getPath('temp'), 'ticket.pdf')
      : path.join(__dirname, 'ticket.pdf');

    const sumatraPath = app.isPackaged
      ? path.join(process.resourcesPath, 'print.exe')
      : path.join(__dirname, 'print.exe');

    try {
      const url = `http://${serverIp}:8000/api/electron/next-ticket`;
      console.log('Fetching:', url);

      // allow handling of non-2xx in code so we can react to 404/500 without throwing
      const response = await axios.get(url, { responseType: 'arraybuffer', validateStatus: () => true });

      if (response.status === 200 && response.data && response.data.length) {
        fs.writeFileSync(tempFile, response.data);

        const command = `"${sumatraPath}" -print-to-default -silent "${tempFile}"`;
        // exec(command, (error, stdout, stderr) => {
        //   if (error) {
        //     console.error('Error printing:', error.message);
        //     return;
        //   }
        //   console.log('Printed using Sumatra successfully.');
        // });

      } else {
        // Log status and message for debugging
        console.log(`No ticket (status: ${response.status}). Will retry.`);

        // If server returns 500 consistently, you might want to stop polling until manual retry.
        // For now we keep retrying. If you'd prefer to stop on repeated 5xx, implement a backoff or failure counter.
      }

    } catch (error) {
      console.error('Polling error:', error && error.message);
    }

    // Schedule next poll only if still active
    if (pollingActive) {
      pollingTimeout = setTimeout(fetchAndPrint, pollInterval);
    }
  };

  // Start the loop
  fetchAndPrint();
}

function stopAutoTicketPolling() {
  console.log('Stopping polling...');
  pollingActive = false;

  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
    pollingTimeout = null;
  }
}

// Optional: allow renderer to manually stop/start/retry
ipcMain.on('stop-polling', () => stopAutoTicketPolling());
ipcMain.on('start-polling', (e, ip) => startAutoTicketPolling(ip));
ipcMain.on('retry-to-index', () => {
  try {
    if (win && !win.isDestroyed()) win.loadFile('index.html');
  } catch (e) {
    console.error('retry-to-index error:', e.message);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
