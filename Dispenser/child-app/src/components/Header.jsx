import { useEffect, useState } from "react";

import logo from "../assets/icon.png"; // adjust the path according to your project

const Header = ({}) => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [darkMode]);

  const [time, setTime] = useState({
    hhmm: "00:00",
    ss: "00",
  });

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        hhmm: `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`,
        ss: String(now.getSeconds()).padStart(2, "0"),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <header className="w-full px-8 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111a2f] shadow-sm z-20 relative">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Logo" className="w-[150px] object-contain" />
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Current Time
          </p>
          <div className="flex items-baseline justify-end gap-2">
            <p className="text-2xl font-mono font-bold text-slate-800 dark:text-white tracking-widest leading-none mt-1">
              20:56
            </p>
            <span className="text-xs font-mono text-slate-400 font-bold">
              54
            </span>
          </div>
        </div>
        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
          id="theme-toggle"
        >
          <span className="material-icons-round">dark_mode</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
