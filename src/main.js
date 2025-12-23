const { app, BrowserWindow, screen } = require('electron');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logger, spawnWrapper, spawnPhpCgiWorker, runInstaller, ipv4Address, setMenu } = require('./helpers');

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
  // Spawn nginx
  spawnWrapper("[Nginx]", nginxPath, { cwd: appDir });

  // Spawn PHP workers
  [9000].forEach(port => spawnPhpCgiWorker(phpCGi, port));

  // Spawn artisan schedule and queue
  spawnWrapper("[Application]", phpPathCli, ['artisan', 'schedule:work'], { cwd: srcDirectory });
  spawnWrapper("[Application]", phpPathCli, ['artisan', 'queue:work'], { cwd: srcDirectory });

  logger('Application', `Application started at http://${ipv4Address}:8000`);
}

function createNginxWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  nginxWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  nginxWindow.loadURL(`http://${ipv4Address}:8000`);
  nginxWindow.maximize();

  nginxWindow.on('closed', () => {
    nginxWindow = null;
  });

  startServices();
}

function stopServices() {
  return new Promise(resolve => {
    fs.appendFileSync(path.join(__dirname, 'SMARTQUEUE_SHUTDOWN.txt'), 'Stopping services...\n');

    const commands = [
      'taskkill /IM nginx.exe /T /F',
      'taskkill /IM php.exe /T /F',
      'taskkill /IM php-cgi.exe /T /F'
    ];

    for (const cmd of commands) {
      try {
        execSync(cmd, { stdio: 'ignore' });
        fs.appendFileSync(path.join(__dirname, 'SMARTQUEUE_SHUTDOWN.txt'), `✅ ${cmd}\n`);
      } catch {
        fs.appendFileSync(path.join(__dirname, 'SMARTQUEUE_SHUTDOWN.txt'), `ℹ️ ${cmd} (not running)\n`);
      }
    }

    setTimeout(resolve, 1000);
  });
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

  fs.appendFileSync(path.join(__dirname, 'SMARTQUEUE_SHUTDOWN.txt'), 'before-quit fired\n');

  await stopServices();

  app.exit(0);
});
