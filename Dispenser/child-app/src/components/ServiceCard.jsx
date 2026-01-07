import React from "react";

const ServiceCard = ({
  title = "Reception",
  description = "General inquiries and cashier services",
  icon = "payments",
  queueCount = 4,
  waitTime = "04:40",
  isActive = true,
  color = "teal", // dynamic color key: 'teal', 'blue', 'rose', etc.
  onClick,
}) => {
  let colors = ["teal", "orange", "blue", "purple", "orange", "pink","cyan"];

  const colorMap = {};

  colors.forEach((color) => {
    colorMap[color] = {
      border: `border-${color}-100 dark:border-${color}-500/30`,
      hoverBorder: `hover:border-${color}-500 dark:hover:border-${color}-400`,
      glow: `dark:hover:shadow-glow-${color}`,
      badgeBg: `bg-${color}-100 dark:bg-${color}-500/20`,
      badgeText: `text-${color}-700 dark:text-${color}-300`,
      badgeBorder: `border-${color}-200 dark:border-${color}-500/50`,
      ping: `bg-${color}-400`,
      dot: `bg-${color}-500`,
      iconBg: `bg-${color}-50 dark:bg-${color}-500/10`,
      iconText: `text-${color}-600 dark:text-${color}-400`,
      iconHoverBg: `group-hover:bg-${color}-100 dark:group-hover:bg-${color}-500/20`,
      ring: `ring-${color}-200 dark:ring-${color}-500/30`,
      titleHover: `group-hover:text-${color}-600 dark:group-hover:text-${color}-400`,
      waitText: `text-${color}-600 dark:text-${color}-400`,
    };
  });

  const c = colorMap[color] || colorMap.teal;

  console.log(c);

  return (
    <button
      onClick={onClick}
      className={`group relative bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 border-[3px] ${c.border} ${c.hoverBorder} shadow-xl shadow-slate-200/50 dark:shadow-none ${c.glow} transition-all duration-300 flex flex-col items-center text-center`}
    >
      {/* Active Badge */}
      {isActive && (
        <div
          className={`absolute top-6 right-6 flex items-center gap-1.5 ${c.badgeBg} ${c.badgeText} border ${c.badgeBorder} px-3 py-1.5 rounded-full backdrop-blur-md`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.ping} opacity-75`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${c.dot}`}
            ></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Active
          </span>
        </div>
      )}

      {/* Icon Circle */}
      <div
        className={`w-24 h-24 rounded-full ${c.iconBg} flex items-center justify-center ${c.iconText} mb-6 group-hover:scale-110 ${c.iconHoverBg} transition-all duration-300 ring-1 ${c.ring}`}
      >
        <span className="material-icons-round text-5xl">{icon}</span>
      </div>

      {/* Header */}
      <h3
        className={`text-3xl font-black text-slate-900 dark:text-white mb-2 ${c.titleHover} transition-colors`}
      >
        {title}
      </h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-[80%] mx-auto">
        {description}
      </p>

      {/* Bottom Stats Card */}
      <div className="w-full mt-auto bg-slate-50 dark:bg-[#0f172a] rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1 flex items-center gap-1">
            <span className="material-icons-round text-xs">groups</span> In
            Queue
          </span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {queueCount}
            <span className="text-xs font-normal text-slate-400 ml-1">ppl</span>
          </span>
        </div>

        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1 flex items-center gap-1">
            Wait Time{" "}
            <span className="material-icons-round text-xs">schedule</span>
          </span>
          <span className={`text-2xl font-mono font-bold ${c.waitText}`}>
            {waitTime}
          </span>
        </div>
      </div>
    </button>
  );
};

export default ServiceCard;
