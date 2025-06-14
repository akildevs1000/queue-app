const WebSocket = require('ws');

// Get IP and port from command-line args or use defaults
const IP = process.argv[2] || '192.168.3.245';
const PORT = process.argv[3] || 7777;

const ws = new WebSocket(`ws://${IP}:${PORT}`, {
  rejectUnauthorized: false // ⚠️ Only for development
});

ws.on('open', function open() {
  console.log(`✅ Connected to WebSocket server at ws://${IP}:${PORT}`);

  const message = {
    event: 'token-serving',
    data: {
      token: 'LQ0005',
      counter: 'Counter 1'
    }
  };

  ws.send(JSON.stringify(message));
});

ws.on('message', function incoming(data) {
  console.log('📩 Received from server:', data.toString());
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', () => {
  console.log('🔌 Disconnected from server');
});
