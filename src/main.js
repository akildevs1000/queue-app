const { app, BrowserWindow, screen, ipcMain,dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logger, spawnWrapper, spawnPhpCgiWorker, runInstaller, ipv4Address, setMenu, stopServices, getCachedMachineId, isClockTampered } = require('./helpers');

app.setName('SmartQueue');
app.setAppUserModelId('SmartQueue');

let isQuitting = false;

const isDev = !app.isPackaged;
const appDir = isDev ? process.cwd() : process.resourcesPath;

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
let MACHINE_ID = null;


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


  // Spawn PHP workers
  [9000].forEach(port => {
    serverPID = spawnPhpCgiWorker(phpCGi, port);
  });

  schedulePID = spawnWrapper("[Application]", phpPathCli, ['artisan', 'schedule:work'], { cwd: srcDirectory });
  queuePID = spawnWrapper("[Application]", phpPathCli, ['artisan', 'queue:work'], { cwd: srcDirectory });


  logger('Application', `Application started at http://${ipv4Address}:8000`);
}

ipcMain.handle('open-report-window', (event, url) => {

  fs.appendFileSync(path.join(appDir, "logs", 'ips.txt'), `${url}\n`);

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

  if (isClockTampered()) {

    dialog.showErrorBox(
      'System Time Error',
      'System date/time appears to have been changed.\n\nPlease correct your system clock and restart the application.'
    );

    app.exit(1);
    return;
  }

  // ✅ Continue normal startup
  MACHINE_ID = await getCachedMachineId();
  ipcMain.handle('get-machine-id', () => MACHINE_ID);

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
