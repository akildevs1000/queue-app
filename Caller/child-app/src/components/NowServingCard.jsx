const NowServingCard = ({ servingInfo }) => {
  console.log("NowServingCard props:", servingInfo);

  const { ticket, serving } = servingInfo || {}; // destructure ticket & serving from servingInfo

  return (
    <div className="flex-1 min-h-[400px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative flex flex-col items-center justify-center p-8 overflow-hidden group">
      {/* Background Glow/Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-50 dark:bg-indigo-500/10 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="absolute -top-32 -left-32 w-99 h-96 bg-purple-50 dark:bg-purple-500/10 rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 w-full max-w-2xl">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Now Serving
        </div>
        <div className="space-y-4">
          <h1 className="text-7xl lg:text-8xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
            {serving?.token}
          </h1>
          <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium">
            Counter: {serving?.counter}
          </p>
        </div>
        <div className="pt-10 grid grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-800 w-full mx-auto">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">
              Customer Category
            </p>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
              Regular Customer
            </p>
          </div>
          <div className="text-center border-l border-slate-100 dark:border-slate-800">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">
              Ticket Issued
            </p>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {ticket?.created_at_formatted}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowServingCard;
