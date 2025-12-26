const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ticketService = require('./helpers/ticketService');
const logger = require('./helpers/logger');

let win;

function createWindow() {
  win = new BrowserWindow({
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');
  win.maximize();
  logger.log('Main | BrowserWindow created and maximized');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

/* =======================
   IPC: Load Guest
======================= */
ipcMain.on('load-guest', (event, { ip, languages }) => {
  logger.log(`Main | Loading guest page for IP: ${ip}, languages: ${languages}`);

  win.setFullScreen(true);
  win.setResizable(false);
  win.setMenuBarVisibility(false);

  const targetUrl = path.join(__dirname, 'renderer', 'index.html');
  win.loadFile(targetUrl);

  const onFinish = () => {
    logger.log('Main | Guest page loaded successfully');
    win.webContents.send("guest-data", { ip, languages });

    ticketService.start(ip);
    cleanup();
  };

  const onFail = (e, code, desc) => {
    logger.log(`Main | Guest page failed to load (code: ${code}, desc: ${desc})`, 'ERROR');

    ticketService.stop();
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

/* =======================
   IPC: Retry to Index
======================= */
ipcMain.on('retry-to-index', () => {
  try {
    logger.log('Main | Retry to index requested');
    ticketService.stop();

    if (win && !win.isDestroyed()) {
      win.loadFile('index.html');
    }
  } catch (e) {
    logger.log(`Main | retry-to-index error: ${e.message}`, 'ERROR');
  }
});

/* =======================
   App Lifecycle
======================= */
app.on('window-all-closed', () => {
  logger.log('Main | All windows closed, quitting app');
  if (process.platform !== 'darwin') app.quit();
});
