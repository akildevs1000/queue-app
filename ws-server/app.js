const WebSocket = require('ws');
const os = require('os');

const WS_PORT = 7777;
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    ws.isAlive = true;

    // Handle pong from client (heartbeat response)
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // Broadcast message to all connected clients
    ws.on('message', function incoming(message) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// 🔑 Heartbeat check every 30s
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            console.log("💀 Terminating dead client");
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(); // send ping, client must reply with pong
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

function getIps(WS_PORT) {
    const interfaces = os.networkInterfaces();
    const privateRanges = [
        /^192\.168\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./
    ];

    let found = false;

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                if (privateRanges.some((regex) => regex.test(iface.address))) {
                    console.log(`✅ WebSocket server is running at ws://${iface.address}:${WS_PORT}`);
                    found = true;
                }
            }
        }
    }

    if (!found) {
        console.log(`⚠️ No private LAN/Wi-Fi IPv4 address found. Use ws://127.0.0.1:${WS_PORT} for local testing.`);
    }
}


getIps(WS_PORT);
