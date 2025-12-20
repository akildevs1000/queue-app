import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const Header = ({}) => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dark mode persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white">dns</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">SmartQueue</h1>
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Dashboard V3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right border-r pr-6">
            <div className="text-xs uppercase tracking-wider text-slate-500">
              {currentDate}
            </div>
            <div className="text-sm font-mono font-semibold">{currentTime}</div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">dark_mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
