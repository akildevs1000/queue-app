import { Groups, Schedule, Payments } from '@mui/icons-material';

const ServiceCard = ({ service, index, onSelect }) => {
  let { name, description, waiting_count, estimated_time, status } = service;
  let isActive = true;

  const gradients = [
    "from-emerald-500 to-teal-400",
    "from-blue-500 to-indigo-400",
    "from-purple-500 to-fuchsia-400",
    "from-orange-500 to-amber-400",
    "from-pink-500 to-rose-400",
    "from-cyan-500 to-sky-400",
    "from-lime-500 to-green-400",
    "from-red-500 to-orange-400",
    "from-violet-500 to-purple-400",
    "from-yellow-500 to-amber-300",
  ];

  const colors = [
    "emerald",
    "blue",
    "purple",
    "orange",
    "pink",
    "cyan",
    "lime",
    "red",
    "violet",
    "yellow",
  ];

  return (
    <div
      onClick={() => onSelect?.(service)}
      className="group relative bg-white dark:bg-[#151E32] rounded-2xl border border-gray-200 dark:border-slate-700/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Top Gradient Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradients[index]}`}></div>

      <div className="p-6 flex-grow relative">
        <div className="flex justify-between items-start mb-5">
          {/* Icon with same gradient */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${colors[index]}-500/20 text-${colors[index]}-500`}
          >
            <Payments
              sx={{
                fontSize: 32,
                background: 'inherit', // inherit the parent gradient
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            />
          </div>


          {/* Status Badge */}
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isActive
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
              : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400 border-gray-200 dark:border-slate-700"
              }`}
          >
            {isActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            {status || "Active"}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
          {name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 mt-auto">
        <div className="bg-gray-50 dark:bg-[#0B1120]/60 rounded-xl p-4 border border-gray-100 dark:border-slate-800 flex divide-x divide-gray-200 dark:divide-slate-800 backdrop-blur-sm">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5 mb-1 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <Groups sx={{ fontSize: 14 }} />
              <span>Waiting</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl font-bold ${waiting_count > 0
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-600"
                  }`}
              >
                {waiting_count}
              </span>
              {waiting_count > 0 && (
                <span className="text-xs text-slate-500 font-medium">ppl</span>
              )}
            </div>
          </div>
          <div className="flex-1 pl-4">
            <div className="flex items-center gap-1.5 mb-1 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <Schedule sx={{ fontSize: 14 }} />
              <span>Est. Wait</span>
            </div>
            <div
              className={`text-2xl font-mono font-bold tracking-tight ${estimated_time !== "00:00:00"
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 dark:text-slate-600"
                }`}
            >
              {estimated_time}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
