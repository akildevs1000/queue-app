const { app, BrowserWindow, ipcMain, screen, } = require('electron');

const path = require('path');
const { spawn, execSync } = require('child_process');

app.setName('SmartQueue');
app.setAppUserModelId('SmartQueue');

const { logger, spawnWrapper, spawnPhpCgiWorker, stopProcess, runInstaller, ipv4Address, setMenu } = require('./helpers');


const socketPort = 7777; // declare outside

try {
  const command = `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${socketPort}') do taskkill /PID %a /F`;
  execSync(command, { stdio: 'ignore' });
  logger(`SOCKET`, `✅ Freed port ${socketPort} before starting socket server.`);
} catch (err) {
  logger(`SOCKET`, `ℹ️ Port ${socketPort} was free, continuing...`);
}


require('./socket');

const isDev = !app.isPackaged;

let appDir;
if (isDev) {
  appDir = path.join(__dirname);
} else {
  appDir = process.resourcesPath; // where extraResources are placed
}

const srcDirectory = path.join(appDir, 'www');
const phpPath = path.join(srcDirectory, 'php');

const nginxPath = path.join(appDir, 'nginx.exe');
const phpPathCli = path.join(phpPath, 'php.exe');
const phpCGi = path.join(phpPath, 'php-cgi.exe');

let mainWindow;
let nginxWindow;

function createWindow() {

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    show: false, // enable to hide the window
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.once('did-finish-load', () => {
    const phpPorts = [9000];
    phpPorts.forEach(port => {
      spawnPhpCgiWorker(phpCGi, port);
    });
    startServices(mainWindow);
  });
}

function startServices(mainWindow) {
  const address = `http://${ipv4Address}:8000`;



  NginxProcess = spawnWrapper(mainWindow, "[Nginx]", nginxPath, { cwd: appDir });

  logger('Application', `Application started on ${address}`);


  ScheduleProcess = spawnWrapper(mainWindow, "[Application]", phpPathCli, ['artisan', 'schedule:work'], {
    cwd: srcDirectory
  });

  QueueProcess = spawnWrapper(mainWindow, "[Application]", phpPathCli, ['artisan', 'queue:work'], {
    cwd: srcDirectory
  });


  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // ✅ Only create a new window if it's not already open
  if (!nginxWindow || nginxWindow.isDestroyed()) {
    nginxWindow = new BrowserWindow({
      width,
      height,
      // frame: false,
      // fullscreen: true,
      // autoHideMenuBar: true,
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
  } else {
    nginxWindow.focus(); // ✅ Bring existing window to front
  }
}

function stopServices() {
  return new Promise((resolve) => {
    const batFile = path.join(appDir, 'stop-services.bat');

    const child = spawn('cmd.exe', ['/c', batFile], {
      windowsHide: true,
      cwd: appDir
    });

    child.on('exit', () => {
      logger('Application', 'stop-services.bat finished');
      resolve();
    });
  });
}

app.whenReady().then(async () => {

  setMenu();

  await runInstaller(path.join(appDir, `vs_redist.exe`));

  createWindow();
  // ipcMain.on('start-server', () => startServices(mainWindow));
  // ipcMain.on('stop-server', () => stopServices(mainWindow));
});
let isQuitting = false;

app.on('before-quit', async (e) => {
  if (isQuitting) return;

  e.preventDefault(); // stop default quit
  isQuitting = true;

  logger('Application', 'Stopping services before quitting...');

  try {
    await stopServices(); // MUST return a Promise
  } catch (err) {
    logger('Application', `Stop services error: ${err.message}`);
  }

  app.quit(); // quit AFTER services stop
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});