import { useEffect, useState } from "react";
import logo from "../assets/image.png"; // Make sure the path is correct

const Header = () => {
  const [time, setTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const formattedTime = time.toLocaleTimeString("en-GB", { hour12: false });
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="bg-surface-light dark:bg-surface-dark shadow-md dark:shadow-none border-b border-gray-200 dark:border-border-dark h-10 flex items-center justify-between px-8 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-[80px]">
          <img
            src={logo}
            alt="Smart Queue Logo"
            className="object-contain"
          />
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-1xl uppercase font-mono font-bold text-gray-900 dark:text-white tracking-tighter tabular-nums leading-none mb-1 drop-shadow-sm">
          {formattedDate} {formattedTime}
        </div>
      </div>
    </header>
  );
};

export default Header;
