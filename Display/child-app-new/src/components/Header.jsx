import React, { useState, useEffect } from 'react';

// Utility function to format the time and date
const formatDateTime = (date) => {
  // Time format: HH:mm:ss (e.g., 10:42:00)
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const timeString = date.toLocaleTimeString('en-US', timeOptions);

  // Date format: Weekday, Month Day (e.g., Wednesday, Oct 24)
  const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  const dateString = date.toLocaleDateString('en-US', dateOptions);

  return { timeString, dateString };
};

const Header = ({ title = "Your Organization" }) => {
  // Initialize state with the current time/date
  const [currentDateTime, setCurrentDateTime] = useState(formatDateTime(new Date()));

  useEffect(() => {
    // 1. Set up an interval to update the time every 1000ms (1 second)
    const timerId = setInterval(() => {
      setCurrentDateTime(formatDateTime(new Date()));
    }, 1000);

    // 2. Clear the interval when the component unmounts to prevent memory leaks
    return () => clearInterval(timerId);
  }, []); // The empty dependency array [] ensures this effect runs only once after the initial render

  const { timeString, dateString } = currentDateTime;

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-surface-darker border-b border-white/5 shadow-md relative z-20">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          <span className="material-symbols-outlined">grid_view</span>
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-white">
            {title}
          </h1>
          <p className="text-xs text-text-secondary uppercase tracking-wider font-medium mt-0.5">
            Main Hall
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          {/* Dynamic Time */}
          <div className="text-2xl font-bold leading-none tracking-tight">
            {timeString}
          </div>
          {/* Dynamic Date */}
          <div className="text-xs text-text-secondary uppercase font-semibold mt-1 tracking-wider">
            {dateString}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;