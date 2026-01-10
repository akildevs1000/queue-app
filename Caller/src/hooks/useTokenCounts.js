import { useState, useEffect, useRef, useCallback } from "react";
import { fetchTokenCounts } from "../api/actions";

export const useTokenCounts = (counterId, localIp, messages) => {
  const [tokenCounts, setTokenCounts] = useState(null);
  const lastCountsRef = useRef(null);
  const pollingRef = useRef(null);

  const load = useCallback(async () => {
    if (!counterId) return;

    const data = await fetchTokenCounts(counterId, localIp);
    if (data) {
      setTokenCounts(data);
      lastCountsRef.current = data;
    }
  }, [counterId, localIp]);

  // Initial load / counter change
  useEffect(() => {
    load();
  }, [load]);

  // WebSocket-triggered refresh with polling fallback
  useEffect(() => {
    if (!messages.length || !counterId) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.event !== "new-ticket") return;

    let attempts = 0;
    const MAX_ATTEMPTS = 8;
    const INTERVAL = 1000;

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

  return {
    tokenCounts,
    refetch: load,   // ✅ expose manual refresh
  };
};
