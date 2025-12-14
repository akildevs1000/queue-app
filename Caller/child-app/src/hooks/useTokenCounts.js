import { useState, useEffect, useRef } from "react";
import { fetchTokenCounts } from "../api/actions";

export const useTokenCounts = (counterId, localIp, messages) => {
  const [tokenCounts, setTokenCounts] = useState(null);
  const lastCountsRef = useRef(null);
  const pollingRef = useRef(null);

  // Initial load / counter change
  useEffect(() => {
    if (!counterId) return;

    const load = async () => {
      const data = await fetchTokenCounts(counterId, localIp);
      if (data) {
        setTokenCounts(data);
        lastCountsRef.current = data;
      }
    };

    load();
  }, [counterId, localIp]);

  // WebSocket-triggered refresh with polling fallback
  useEffect(() => {
    if (!messages.length || !counterId) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.event !== "new-ticket") return;

    let attempts = 0;
    const MAX_ATTEMPTS = 8;        // ~8 seconds
    const INTERVAL = 1000;         // 1 second

    // Clear existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      attempts++;

      const data = await fetchTokenCounts(counterId, localIp);
      if (!data) return;

      const changed =
        !lastCountsRef.current ||
        data.pending !== lastCountsRef.current.pending ||
        data.served !== lastCountsRef.current.served;

      if (changed) {
        setTokenCounts(data);
        lastCountsRef.current = data;
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      // Safety stop
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [messages, counterId, localIp]);

  return tokenCounts;
};
