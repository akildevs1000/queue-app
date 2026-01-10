import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const Header = ({ title = "Your Organization", darkMode, setDarkMode }) => {
  const [now, setNow] = useState(() => new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header
      className={`flex items-center justify-between
        px-4 sm:px-8 lg:px-12 py-4
         whitespace-nowrap
  ${
    darkMode
      ? "dark:bg-brand-navy-deep/80 backdrop-blur-lg border-b border-white/10 dark:border-base-100/10 shadow-lg"
      : "bg-blue-500"
  }`}
    >
      {/* Title */}
      <h1
        className="
          font-display text-white dark:text-base-100
          font-light tracking-wider
          text-lg sm:text-xl md:text-2xl xl:text-4xl
        "
      >
        {title}
      </h1>

      {/* Right section: Date, Time, Dark Mode Toggle */}
      <div className="flex items-center gap-4 sm:gap-6">
        <span
          className="
            text-white dark:text-base-100
            text-sm sm:text-lg md:text-xl xl:text-3xl
            font-normal
          "
        >
          {formattedDate} {formattedTime}
        </span>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="
            px-3 py-1 rounded-xl
            text-white
            text-sm md:text-base
            transition
          "
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
