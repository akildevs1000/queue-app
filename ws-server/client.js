const WebSocket = require('ws');

// Replace with your actual secure WebSocket server URL
const ws = new WebSocket('ws://192.168.2.6:8080', {
  rejectUnauthorized: false // ⚠️ Only use in development/self-signed certs
});

ws.on('open', function open() {
  console.log('✅ Connected to WSS server');

  const message = {
    event: 'token-serving',
    data: {
      token: 'LQ0004',
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
