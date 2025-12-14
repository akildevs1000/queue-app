import { fetchNextToken, startServingToken } from "../api/actions";

export const useNextToken = (ip, selectedCounterId, sendMessage) => {
  const nextToken = async () => {
    try {
      const ticketInfo = await fetchNextToken(ip);
      if (!ticketInfo?.id) return null;

      const startServingRes = await startServingToken(
        ip,
        ticketInfo.id,
        selectedCounterId
      );

      if (startServingRes?.counter) {
        sendMessage({
          event: "token-serving",
          data: startServingRes,
        });

        sendMessage({
          event: "feedback",
          data: {
            counter_id: selectedCounterId,
            token_id: ticketInfo.id,
            ...startServingRes,
          },
        });
      }

      return {
        ticket: ticketInfo,
        serving: startServingRes,
      };
    } catch (err) {
      console.error("Failed to fetch next token or start serving:", err);
      return null;
    }
  };

  return nextToken;
};
