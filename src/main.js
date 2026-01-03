const { app, BrowserWindow, screen, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logger, spawnWrapper, spawnPhpCgiWorker, runInstaller, ipv4Address, setMenu, stopServices } = require('./helpers');

app.setName('SmartQueue');
app.setAppUserModelId('SmartQueue');

let isQuitting = false;

const isDev = !app.isPackaged;
const appDir = isDev ? __dirname : process.resourcesPath;
const srcDirectory = path.join(appDir, 'www');

const nginxPath = path.join(appDir, 'nginx.exe');
const phpPath = path.join(srcDirectory, 'php');
const phpPathCli = path.join(phpPath, 'php.exe');
const phpCGi = path.join(phpPath, 'php-cgi.exe');

let nginxWindow;

let nginxPID = null;
let schedulePID = null;
let queuePID = null;
let serverPID = null;

// -------------------- SOCKET CLEANUP --------------------
const socketPort = 7777; // declare outside

try {
  const command = `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${socketPort}') do taskkill /PID %a /F`;
  execSync(command, { stdio: 'ignore' });
  logger(`SOCKET`, `✅ Freed port ${socketPort} before starting socket server.`);
} catch (err) {
  logger(`SOCKET`, `ℹ️ Port ${socketPort} was free, continuing...`);
}

// Initialize socket
require('./socket');

function startServices() {

  nginxPID = spawnWrapper("[Nginx]", nginxPath, { cwd: appDir });

  console.log("PID", nginxPID);

  // Spawn PHP workers
  [9000].forEach(port => {
    serverPID = spawnPhpCgiWorker(phpCGi, port);
    console.log("serverPID", serverPID);
  });

  schedulePID = spawnWrapper("[Application]", phpPathCli, ['artisan', 'schedule:work'], { cwd: srcDirectory });
  console.log("schedulePID", schedulePID);
  queuePID = spawnWrapper("[Application]", phpPathCli, ['artisan', 'queue:work'], { cwd: srcDirectory });
  console.log("queuePID", queuePID);


  logger('Application', `Application started at http://${ipv4Address}:8000`);
}

ipcMain.handle('open-report-window', (event, url) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const reportWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  reportWindow.loadURL(url);
});

function createNginxWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  nginxWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  nginxWindow.loadURL(`http://${ipv4Address}:8000`);
  nginxWindow.maximize();

  nginxWindow.on('closed', () => {
    nginxWindow = null;
  });

  startServices();
}



app.whenReady().then(async () => {
  setMenu();
  createNginxWindow();
  await runInstaller(path.join(appDir, 'vs_redist.exe'));
});

// Ensure app quits cleanly and stops services
app.on('before-quit', async e => {
  if (isQuitting) return;

  e.preventDefault();
  isQuitting = true;

  fs.appendFileSync(path.join(appDir, "logs", 'SMARTQUEUE_SHUTDOWN.txt'), 'before-quit fired\n');

  await stopServices(nginxPID);
  await stopServices(schedulePID);
  await stopServices(queuePID);
  await stopServices(serverPID);

  app.exit(0);
});


app.on('will-quit', async () => {
  fs.appendFileSync(path.join(appDir, "logs", 'SMARTQUEUE_SHUTDOWN.txt'), 'will-quit fired\n');
  await stopServices(nginxPID);
  await stopServices(schedulePID);
  await stopServices(queuePID);
  await stopServices(serverPID);
});
