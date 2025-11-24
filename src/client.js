const WebSocket = require("ws");

// Replace with your server IP and port
const WS_URL = "ws://192.168.2.88:7777?clientId=test_client";

const ws = new WebSocket(WS_URL);

// Set of prefixes
const PREFIXES = ["LQ", "AO", "DM", "RC", "VC"];

// Helper to generate random token like "LQ123"
function randomToken() {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const number = Math.floor(100 + Math.random() * 900); // 100-999
  return `${prefix}${number}`;
}

// Helper to generate random counter 1-20
function randomCounter() {
  return Math.floor(1 + Math.random() * 20);
}

ws.on("open", () => {
  console.log("✅ Connected to WebSocket server");

  // Send a random token-serving event every 10 seconds
  setInterval(() => {
    const testToken = {
      event: "token-serving",
      data: {
        token: randomToken(),
        counter: randomCounter(),
        language: "en"
      }
    };

    console.log("💡 Sending test token:", testToken.data);
    ws.send(JSON.stringify(testToken));
  }, 1000 * 10);
});

ws.on("message", (data) => {
  try {
    const parsed = JSON.parse(data);
    console.log("📨 Message from server:", parsed);
  } catch {
    console.log("📨 Raw message:", data.toString());
  }
});

ws.on("close", () => console.log("❌ Connection closed"));
ws.on("error", (err) => console.log("⚠️ WebSocket error:", err.message));
