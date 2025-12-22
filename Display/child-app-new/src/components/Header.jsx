const Header = () => {

  const time = new Date();

  const formattedTime = time.toLocaleTimeString("en-GB", { hour12: false });
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="bg-surface-light dark:bg-surface-dark shadow-md dark:shadow-none border-b border-gray-200 dark:border-border-dark h-10 flex items-center justify-between px-8 shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-2 ring-white/10">
          <span className="material-symbols-outlined text-white text-[15px]">
            grid_view
          </span>
        </div>
        <div className="flex item-center justify-center">
          <h1 className="text-[20px] font-black tracking-tight text-gray-900 dark:text-white leading-none">
            Smart Queue
          </h1>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-1xl uppercase font-mono font-bold text-gray-900 dark:text-white tracking-tighter tabular-nums leading-none mb-1 drop-shadow-sm">
          {formattedDate} {formattedTime}
        </div>
      </div>
    </header>
  );
};

export default Header;
