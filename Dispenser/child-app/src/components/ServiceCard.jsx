
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

  const COLOR_MAP = {
  teal: {
    border: "border-teal-100 dark:border-teal-500/30",
    hoverBorder: "hover:border-teal-500 dark:hover:border-teal-400",
    glow: "dark:hover:shadow-glow-teal",
    badgeBg: "bg-teal-100 dark:bg-teal-500/20",
    badgeText: "text-teal-700 dark:text-teal-300",
    badgeBorder: "border-teal-200 dark:border-teal-500/50",
    ping: "bg-teal-400",
    dot: "bg-teal-500",
    iconBg: "bg-teal-50 dark:bg-teal-500/10",
    iconText: "text-teal-600 dark:text-teal-400",
    iconHoverBg: "group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20",
    ring: "ring-teal-200 dark:ring-teal-500/30",
    titleHover: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
    waitText: "text-teal-600 dark:text-teal-400",
  },

  blue: {
    border: "border-blue-100 dark:border-blue-500/30",
    hoverBorder: "hover:border-blue-500 dark:hover:border-blue-400",
    glow: "dark:hover:shadow-glow-blue",
    badgeBg: "bg-blue-100 dark:bg-blue-500/20",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-200 dark:border-blue-500/50",
    ping: "bg-blue-400",
    dot: "bg-blue-500",
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
    iconHoverBg: "group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20",
    ring: "ring-blue-200 dark:ring-blue-500/30",
    titleHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    waitText: "text-blue-600 dark:text-blue-400",
  },

  orange: {
    border: "border-orange-100 dark:border-orange-500/30",
    hoverBorder: "hover:border-orange-500 dark:hover:border-orange-400",
    glow: "dark:hover:shadow-glow-orange",
    badgeBg: "bg-orange-100 dark:bg-orange-500/20",
    badgeText: "text-orange-700 dark:text-orange-300",
    badgeBorder: "border-orange-200 dark:border-orange-500/50",
    ping: "bg-orange-400",
    dot: "bg-orange-500",
    iconBg: "bg-orange-50 dark:bg-orange-500/10",
    iconText: "text-orange-600 dark:text-orange-400",
    iconHoverBg: "group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20",
    ring: "ring-orange-200 dark:ring-orange-500/30",
    titleHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
    waitText: "text-orange-600 dark:text-orange-400",
  },

  purple: {
    border: "border-purple-100 dark:border-purple-500/30",
    hoverBorder: "hover:border-purple-500 dark:hover:border-purple-400",
    glow: "dark:hover:shadow-glow-purple",
    badgeBg: "bg-purple-100 dark:bg-purple-500/20",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-200 dark:border-purple-500/50",
    ping: "bg-purple-400",
    dot: "bg-purple-500",
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    iconText: "text-purple-600 dark:text-purple-400",
    iconHoverBg: "group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20",
    ring: "ring-purple-200 dark:ring-purple-500/30",
    titleHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    waitText: "text-purple-600 dark:text-purple-400",
  },

  pink: {
    border: "border-pink-100 dark:border-pink-500/30",
    hoverBorder: "hover:border-pink-500 dark:hover:border-pink-400",
    glow: "dark:hover:shadow-glow-pink",
    badgeBg: "bg-pink-100 dark:bg-pink-500/20",
    badgeText: "text-pink-700 dark:text-pink-300",
    badgeBorder: "border-pink-200 dark:border-pink-500/50",
    ping: "bg-pink-400",
    dot: "bg-pink-500",
    iconBg: "bg-pink-50 dark:bg-pink-500/10",
    iconText: "text-pink-600 dark:text-pink-400",
    iconHoverBg: "group-hover:bg-pink-100 dark:group-hover:bg-pink-500/20",
    ring: "ring-pink-200 dark:ring-pink-500/30",
    titleHover: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
    waitText: "text-pink-600 dark:text-pink-400",
  },

  cyan: {
    border: "border-cyan-100 dark:border-cyan-500/30",
    hoverBorder: "hover:border-cyan-500 dark:hover:border-cyan-400",
    glow: "dark:hover:shadow-glow-cyan",
    badgeBg: "bg-cyan-100 dark:bg-cyan-500/20",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    badgeBorder: "border-cyan-200 dark:border-cyan-500/50",
    ping: "bg-cyan-400",
    dot: "bg-cyan-500",
    iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    iconText: "text-cyan-600 dark:text-cyan-400",
    iconHoverBg: "group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20",
    ring: "ring-cyan-200 dark:ring-cyan-500/30",
    titleHover: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
    waitText: "text-cyan-600 dark:text-cyan-400",
  },
};

  const c = COLOR_MAP[color] || COLOR_MAP.teal;

  return (
    <button
      onClick={onClick}
      className={`group relative bg-white dark:bg-[#1e293b] rounded-[2rem] p-8 border-[3px] ${c.border} ${c.hoverBorder}  shadow-xl shadow-slate-200/50 dark:shadow-none ${c.glow} transition-all duration-300 flex flex-col items-center text-center`}
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
