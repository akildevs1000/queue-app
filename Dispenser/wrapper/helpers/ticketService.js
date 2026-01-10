const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { app } = require('electron');
const logger = require('./logger');

let pollingActive = false;
let pollingTimer = null;
let inFlight = false;

/* =======================
   PRINT VIA API (POLLING)
======================= */
async function fetchAndPrint(ip) {
  if (inFlight) {
    logger.log('TicketService | Busy printing, skipping poll tick');
    return;
  }

  inFlight = true;

  const sumatraPath = app.isPackaged
    ? path.join(process.resourcesPath, 'print.exe')
    : path.join(__dirname, '..', 'print.exe');

  const url = `http://${ip}:8000/api/electron/next-ticket`;

  const tempDir = app.getPath('temp');
  const tempFile = path.join(
    tempDir,
    `ticket_${Date.now()}_${Math.floor(Math.random() * 1e6)}.pdf`
  );

  try {
    logger.log(`TicketService | Polling next ticket (${ip})`);

    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      validateStatus: () => true,
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      timeout: 15000,
    });

    if (res.status !== 200 || !res.data?.length) {
      logger.log(`TicketService | No ticket (status=${res.status})`);
      return;
    }

    fs.writeFileSync(tempFile, Buffer.from(res.data));
    logger.log(`TicketService | Ticket PDF saved (${tempFile})`);

    await new Promise((resolve) => {
      exec(
        `"${sumatraPath}" -print-to-default -silent "${tempFile}"`,
        (err, stdout, stderr) => {
          if (err) {
            logger.log(`TicketService | Print failed: ${err.message}`, 'ERROR');
          } else {
            logger.log('TicketService | Ticket printed successfully');
          }
          if (stdout) logger.log(`TicketService | Print stdout: ${stdout}`);
          if (stderr) logger.log(`TicketService | Print stderr: ${stderr}`, 'WARN');
          resolve();
        }
      );
    });

    setTimeout(() => {
      try {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      } catch (_) {}
    }, 3000);
  } catch (err) {
    logger.log(`TicketService | API fetch/print error: ${err.message}`, 'ERROR');
  } finally {
    inFlight = false;
  }
}

/* =======================
   POLLING LOOP
======================= */
function startPolling(ip, intervalMs = 3000) {
  if (pollingActive) {
    logger.log('TicketService | Polling already running');
    return;
  }

  pollingActive = true;
  logger.log(`TicketService | Polling STARTED (${intervalMs / 1000}s interval)`);

  const loop = async () => {
    if (!pollingActive) return;
    await fetchAndPrint(ip);
    pollingTimer = setTimeout(loop, intervalMs);
  };

  loop(); // run immediately
}

function stopPolling() {
  if (!pollingActive) return;

  pollingActive = false;
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }

  logger.log('TicketService | Polling STOPPED');
}

/* =======================
   PUBLIC API
======================= */
function start(ip) {
  logger.log(`TicketService | Starting POLLING ONLY for IP ${ip}`);
  startPolling(ip, 3000);
}

function stop() {
  logger.log('TicketService | Stopping ticket system');
  stopPolling();
}

module.exports = { start, stop };
