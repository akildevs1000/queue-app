const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * Get log directory (safe for dev & prod)
 */
function getLogDir() {
  // Use resourcesPath in production, __dirname in development
  const baseDir = app.isPackaged
    ? path.join(process.resourcesPath, 'logs') // production
    : path.join(__dirname, '..', 'logs');     // development

  // Ensure the folder exists
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  return baseDir;
}

/**
 * Get daily log file path
 */
function getLogFile() {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(getLogDir(), `${date}.log`);
}

/**
 * Write log message
 */
function log(message, level = 'INFO') {
  try {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] ${message}\n`;

    fs.appendFileSync(getLogFile(), line, 'utf8');

    // Optional: still show in console
    console.log(line.trim());
  } catch (err) {
    console.error('Logger failed:', err.message);
  }
}

module.exports = {
  log,
};
