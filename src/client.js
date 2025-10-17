const WebSocket = require('ws');

// Get IP and port from command-line args or use defaults
const IP = process.argv[2] || '192.168.2.79';
const PORT = process.argv[3] || 7777;

let ws;
let reconnectTimer;
let heartbeatInterval;
let currentTokenNumber = 1;

function connect() {
  ws = new WebSocket(`ws://${IP}:${PORT}`, {
    rejectUnauthorized: false // ⚠️ Only for development
  });

  ws.on('open', function open() {
    console.log(`✅ Connected to WebSocket server at ws://${IP}:${PORT}`);

    // Reset reconnect attempts
    if (reconnectTimer) clearTimeout(reconnectTimer);

    // Send heartbeat every 25s
    heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: 'ping' }));
        // console.log('📡 Sent heartbeat');
      }
    }, 25000);

    // Send first token message
    sendToken();

    setInterval(() => {
      sendToken();
    }, 1 * 5 * 1000); // 30 minutes in ms
  });

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);

      // Handle heartbeat
      if (parsed.event === 'ping') {
        console.log(`📡 Heartbeat received at ${(new Date()).toLocaleString()}`);
      } else {
        console.log('📩 Message:', parsed);
      }
    } catch (err) {
      console.error('❌ Error parsing message:', err);
    }
  });

  ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err.message);
  });

  ws.on('close', () => {
    console.log('🔌 Disconnected from server');
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    // Try reconnect after 5s
    reconnectTimer = setTimeout(connect, 5000);
  });
}

function getNextToken() {
  // Pad the number to 4 digits (e.g., 1 -> 0001)
  const paddedNumber = String(currentTokenNumber).padStart(4, '0');
  const token = `LQ${paddedNumber}`;
  currentTokenNumber++;
  return token;
}

function sendToken() {
  if (ws.readyState === WebSocket.OPEN) {
    const message = {
      event: 'token-serving',
      data: {
        token: getNextToken(),
        counter: 'Counter 1'
      }
    };

    ws.send(JSON.stringify(message));
    console.log('📤 Sent:', message);
  }
}

connect();
