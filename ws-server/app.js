const WebSocket = require('ws');
const url = require('url'); // Import the URL module

const WS_HOST = "0.0.0.0";
const WS_PORT = 7777;

const wss = new WebSocket.Server({ host: WS_HOST, port: WS_PORT });

// A Set to store unique client IDs
const connectedClients = new Set();

// 🟢 Handle new client connection
wss.on('connection', function connection(ws, req) {
    // Parse the URL to get the clientId from the query string
    const parameters = url.parse(req.url, true).query;
    const clientId = parameters.clientId;

    if (clientId) {
        if (connectedClients.has(clientId)) {
            // It's a reconnection from an existing client
            console.log(`🔄 Client reconnected with ID: ${clientId}`);
        } else {
            // It's a brand new client connection
            connectedClients.add(clientId);
            console.log(`✅ New client connected with ID: ${clientId}`);
        }
        // Attach the clientId to the WebSocket object for later reference
        ws.clientId = clientId;
    } else {
        console.log('✅ Client connected without an ID');
    }

    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', function incoming(message) {
        console.log('📩 Received:', message.toString());

        // Broadcast to all clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.once('close', () => {
        console.log('❌ Client disconnected');
        // If the client had an ID, remove it from the set of active connections
        if (ws.clientId) {
            connectedClients.delete(ws.clientId);
            console.log(`🗑️ Removed disconnected client ID: ${ws.clientId}`);
        }
    });
});

// 🔄 Heartbeat check every 30s
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            console.log("💀 Terminating dead client");
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

console.log(`🚀 WebSocket server running at ws://${WS_HOST}:${WS_PORT}`);