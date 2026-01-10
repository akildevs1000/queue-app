// src/hooks/useWebSocket.js
import { useEffect, useRef, useState } from "react";

export const useWebSocket = (url, retryInterval = 5000) => {
  const socketRef = useRef(null);
  const retryTimerRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  const connect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected to WS:", url);
      setIsConnected(true);
      clearTimeout(retryTimerRef.current);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch {
        console.warn("Invalid WS data:", event.data);
      }
    };

    ws.onerror = () => console.warn("❌ WS error");

    ws.onclose = () => {
      console.warn("⚠️ WS closed, retrying...");
      setIsConnected(false);
      retryTimerRef.current = setTimeout(connect, retryInterval);
    };
  };

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(retryTimerRef.current);
      socketRef.current?.close();
    };
  }, [url]);

  const sendMessage = (data) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WS not open, cannot send message");
    }
  };

  return { isConnected, messages, sendMessage };
};
