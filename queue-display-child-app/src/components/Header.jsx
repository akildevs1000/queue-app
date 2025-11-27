import { useEffect, useState } from "react";

const Header = ({ title = "Your Organization" }) => {
  const [now, setNow] = useState(() => new Date());

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
                bg-brand-navy-mid/30 backdrop-blur-lg 
                px-4 sm:px-8 lg:px-12 py-4
                border-b border-white/10 shadow-lg 
                whitespace-nowrap
            "
    >
      {/* Title */}
      <h1
        className=" text-white
                    font-light tracking-wider
                    text-lg sm:text-xl md:text-2xl xl:text-4xl
                "
      >
        {title}
      </h1>

      {/* Date & Time */}
      <div
        className="
                    flex flex-col sm:flex-row
                    items-end sm:items-center 
                    gap-1 sm:gap-4 lg:gap-6
                    text-right
                "
      >
        <span
          className="text-white
                        text-sm sm:text-lg md:text-xl xl:text-3xl
                        font-normal 
                    "
        >
          {formattedDate} {formattedTime}
        </span>
      </div>
    </header>
  );
};

export default Header;
