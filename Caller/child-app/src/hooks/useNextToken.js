import { fetchNextToken, startServingToken } from "../api/actions";

export const useNextToken = (ip, selectedCounterId, sendMessage) => {
  const nextToken = async () => {
    try {
      const ticketInfo = await fetchNextToken(ip);
      if (!ticketInfo?.id) return null;

      const json = await startServingToken(
        ip,
        ticketInfo.id,
        selectedCounterId
      );

      let socketPayload = {};

      if (json?.counter) {

        socketPayload = {
          event: "token-serving",
          data: json,
        };

        sendMessage(socketPayload);

        sendMessage({
          event: "feedback",
          data: {
            counter_id: selectedCounterId,
            token_id: ticketInfo.id,
            ...json,
          },
        });
      }

      return {
        ticket: ticketInfo,
        serving: json
      };
    } catch (err) {
      console.error("Failed to fetch next token or start serving:", err);
      return null;
    }
  };

  return nextToken;
};
