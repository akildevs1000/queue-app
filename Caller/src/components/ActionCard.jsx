const ActionCard = ({ toggleDarkMode, isDark, handleLogout }) => {

    const currentTime = new Date();

    const timeStr = currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    const dateStr = currentTime.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                    {timeStr}
                </h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
                    {dateStr}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {/* Theme Toggle Button */}
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-all shadow-sm"
                    onClick={toggleDarkMode}
                    title="Toggle Theme"
                >
                    <span className="material-symbols-outlined">
                        {isDark ? "dark_mode" : "light_mode"}
                    </span>
                </button>

                {/* Logout Button */}
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all shadow-sm"
                    title="Logout"
                    onClick={handleLogout}
                >
                    <span className="material-symbols-outlined">logout</span>
                </button>
            </div>
        </div>
    );
};

export default ActionCard;
