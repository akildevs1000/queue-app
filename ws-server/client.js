const WebSocket = require('ws');

// Get IP and port from command-line args or use defaults
const IP = process.argv[2] || '192.168.3.245';
const PORT = process.argv[3] || 7777;

const ws = new WebSocket(`ws://${IP}:${PORT}`, {
  rejectUnauthorized: false // ⚠️ Only for development
});

ws.on('open', function open() {

  let currentTokenNumber = 1;

  setInterval(() => {
    console.log(`✅ Connected to WebSocket server at ws://${IP}:${PORT}`);

    function getNextToken() {
      // Pad the number to 4 digits (e.g., 1 -> 0001)
      const paddedNumber = String(currentTokenNumber).padStart(4, '0');
      const token = `LQ${paddedNumber}`;
      currentTokenNumber++;
      return token;
    }

    // Example usage
    const message = {
      event: 'token-serving',
      data: {
        token: getNextToken(),
        counter: 'Counter 1'
      }
    };

    ws.send(JSON.stringify(message));
  }, 5000);
  console.log('🔌 Connected to server');
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
