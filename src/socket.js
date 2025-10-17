// socket.js
const WebSocket = require('ws');
const url = require('url');

if (!global.wss) { // 👈 Prevent reinitialization
    const WS_HOST = "0.0.0.0";
    const WS_PORT = 7777;

    const wss = new WebSocket.Server({ host: WS_HOST, port: WS_PORT });
    global.wss = wss; // store globally to detect re-runs

    const connectedClients = new Set();

    wss.on('connection', function connection(ws, req) {
        const parameters = url.parse(req.url, true).query;
        const clientId = parameters.clientId;

        if (clientId) {
            if (connectedClients.has(clientId)) {
                console.log(`🔄 Client reconnected with ID: ${clientId}`);
            } else {
                connectedClients.add(clientId);
                console.log(`✅ New client connected with ID: ${clientId}`);
            }
            ws.clientId = clientId;
        } else {
            console.log('✅ Client connected without an ID');
        }

        ws.isAlive = true;

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', (message) => {
            console.log('📩 Received:', message.toString());
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        });

        ws.once('close', () => {
            console.log('❌ Client disconnected');
            if (ws.clientId) {
                connectedClients.delete(ws.clientId);
                console.log(`🗑️ Removed disconnected client ID: ${ws.clientId}`);
            }
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach(ws => {
            if (ws.isAlive === false) {
                console.log("💀 Terminating dead client");
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    console.log(`🚀 WebSocket server running at ws://${WS_HOST}:${WS_PORT}`);
} else {
    console.log("⚠️ WebSocket server already running. Skipping initialization.");
}
