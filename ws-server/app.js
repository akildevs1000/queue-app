const WebSocket = require('ws');
const os = require('os');


const WS_PORT = 7777;

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', function connection(ws) {
    console.log('Client connected');

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
