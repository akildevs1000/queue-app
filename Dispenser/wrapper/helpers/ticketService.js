const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { app } = require('electron');
const logger = require('./logger');

let socket = null;
let pollingActive = false;
let pollingTimer = null;

/* =======================
   PRINT VIA API
======================= */
async function fetchAndPrint(ip) {
  logger.log(`TicketService | Checking next ticket from API (${ip})`);

  const tempFile = app.isPackaged
    ? path.join(app.getPath('temp'), 'ticket.pdf')
    : path.join(__dirname, '..', 'ticket.pdf');

  const sumatraPath = app.isPackaged
    ? path.join(process.resourcesPath, 'print.exe')
    : path.join(__dirname, '..', 'print.exe');

  const url = `http://${ip}:8000/api/electron/next-ticket`;

  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });

    if (res.status !== 200 || !res.data?.length) {
      logger.log('TicketService | No ticket available');
      return;
    }

    fs.writeFileSync(tempFile, res.data);
    logger.log(`TicketService | Ticket PDF saved (${tempFile})`);

    exec(`"${sumatraPath}" -print-to-default -silent "${tempFile}"`, (err) => {
      if (err) {
        logger.log(`TicketService | Print failed: ${err.message}`, 'ERROR');
      } else {
        logger.log('TicketService | Ticket printed successfully');
      }
    });
  } catch (err) {
    logger.log(`TicketService | API fetch/print error: ${err.message}`, 'ERROR');
  }
}

/* =======================
   FALLBACK POLLING
======================= */
function startFallbackPolling(ip) {
  if (pollingActive) {
    logger.log('TicketService | Fallback polling already running');
    return;
  }

  pollingActive = true;
  logger.log('TicketService | Fallback polling STARTED (15s interval)');

  const poll = async () => {
    if (!pollingActive) return;
    await fetchAndPrint(ip);
    pollingTimer = setTimeout(poll, 15000);
  };

  poll();
}

function stopFallbackPolling() {
  if (!pollingActive) return;

  pollingActive = false;
  if (pollingTimer) {
    clearTimeout(pollingTimer);
    pollingTimer = null;
  }

  logger.log('TicketService | Fallback polling STOPPED');
}

/* =======================
   WEBSOCKET
======================= */
function connectSocket(ip) {
  const wsUrl = `ws://${ip}:7777`;
  logger.log(`TicketService | Connecting WebSocket (${wsUrl})`);

  socket = new WebSocket(wsUrl);

  socket.on('open', async () => {
    logger.log('TicketService | WebSocket CONNECTED');

    // Socket is primary → stop polling
    stopFallbackPolling();

    // Catch missed tickets
    await fetchAndPrint(ip);
  });

  socket.on('message', async (msg) => {
    try {
      const payload = JSON.parse(msg.toString());

      if (payload.event === 'new-ticket') {
        logger.log('TicketService | new-ticket event received');
        await fetchAndPrint(ip);
      } else {
        logger.log(`TicketService | Unknown WS message: ${msg.toString()}`);
      }
    } catch (err) {
      logger.log(`TicketService | WS parse error: ${err.message}`, 'ERROR');
    }
  });

  socket.on('close', () => {
    logger.log('TicketService | WebSocket CLOSED → enabling fallback polling', 'WARN');
    startFallbackPolling(ip);
    retrySocket(ip);
  });

  socket.on('error', (err) => {
    logger.log(`TicketService | WebSocket ERROR: ${err.message}`, 'ERROR');
    socket.close();
  });
}

function retrySocket(ip) {
  logger.log('TicketService | Retrying WebSocket connection in 3s');
  setTimeout(() => connectSocket(ip), 3000);
}

/* =======================
   PUBLIC API
======================= */
function start(ip) {
  logger.log(`TicketService | Starting ticket system for IP ${ip}`);

  // Safety net: polling starts first, stops automatically on WS connect
  startFallbackPolling(ip);

  // Primary trigger
  connectSocket(ip);
}

function stop() {
  logger.log('TicketService | Stopping ticket system');

  stopFallbackPolling();

  if (socket) {
    socket.close();
    socket = null;
  }
}

module.exports = {
  start,
  stop,
};
