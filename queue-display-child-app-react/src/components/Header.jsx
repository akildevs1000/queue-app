import { useEffect, useState } from "react";

const Header = ({ title = "Your Organization",darkMode, setDarkMode }) => {
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
      className="
        flex items-center justify-between
        bg-blue-500 dark:bg-brand-navy-deep/80
        backdrop-blur-lg
        px-4 sm:px-8 lg:px-12 py-4
        border-b border-white/10 dark:border-base-100/10
        shadow-lg whitespace-nowrap
      "
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
            bg-gray-200 dark:bg-gray-700
            text-black dark:text-white
            text-sm md:text-base
            shadow-md
            hover:bg-gray-300 dark:hover:bg-gray-600
            transition
          "
        >
          {darkMode ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
};

export default Header;
