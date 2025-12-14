const StatCard = ({ title, value, icon, colorClass, iconBgClass }) => (
    <div
        className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden ${colorClass}`}
    >
        <div
            className="absolute right-3 top-3 p-2 rounded-lg text-xl"
            style={{ backgroundColor: iconBgClass }}
        >
            <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {title}
        </p>
        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
            {value}
        </h3>
    </div>
);

export default StatCard;