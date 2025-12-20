const AnnouncementBar = ({ time }) => {
  const formattedTime = time.toLocaleTimeString("en-GB", { hour12: false });
  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="bg-surface-light dark:bg-surface-dark shadow-md dark:shadow-none border-b border-gray-200 dark:border-border-dark h-24 flex items-center justify-between px-8 shrink-0 z-20">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-2 ring-white/10">
          <span className="material-icons text-white text-4xl">grid_view</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none mb-1">
            Smart Queue
          </h1>
          <span className="text-sm font-bold text-gray-500 dark:text-accent tracking-widest uppercase">
            Main Hall Display
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white tracking-tighter tabular-nums leading-none mb-1 drop-shadow-sm">
          {formattedTime}
        </div>
        <div className="text-sm font-bold text-gray-500 dark:text-text-muted uppercase tracking-[0.2em]">
          {formattedDate}
        </div>
      </div>
    </header>
  );
};

export default AnnouncementBar;
