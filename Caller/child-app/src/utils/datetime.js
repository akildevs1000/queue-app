// utils/dateTime.js
export function getCurrentDateTime() {
  const currentTime = new Date();

  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dateStr = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return { timeStr, dateStr };
}
