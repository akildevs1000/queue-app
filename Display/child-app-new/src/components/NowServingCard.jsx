const NowServingCard = ({ token }) => {
  return (
    <>
      <div className="w-full h-full min-h-[400px] bg-surface-dark rounded-2xl shadow-card overflow-hidden border border-white/5 flex flex-col relative group">
        <div className="absolute inset-0 bg-card-sheen pointer-events-none"></div>
        <div className="bg-surface-darker/40 backdrop-blur-sm px-6 py-3 flex justify-between items-center border-b border-white/5 relative z-10 shrink-0 h-14">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green"></span>
            </span>
            <span className="uppercase text-xs font-bold tracking-widest text-primary-glow">
              Now Serving
            </span>
          </div>
          <div className="text-[10px] font-mono text-white font-medium tracking-wider">
            TICKET ID
          </div>
        </div>
        <div className="p-6 md:p-10 flex flex-col items-center justify-center text-center flex-grow relative z-10">
          <h2 className="text-[70px] font-display font-bold leading-none tracking-tight text-white drop-shadow-2xl mb-2">
            {token?.token || "----"}
          </h2>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6 max-w-2xl shrink-0"></div>
          <div className="flex w-full justify-center gap-16 md:gap-32 items-end shrink-0">
            <div className="text-center group/counter">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 opacity-70">
                {/* Counter */}
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-light text-gray-100 tracking-tight leading-none">
                  {/* {String(("" + token?.counter ?? 0).replace(/\D/g, '') || 0).padStart(2, '0')} */}
                  {token?.counter}
                </span>
              </div>
            </div>
            <div className="w-px bg-gradient-to-b from-transparent via-white/10 to-transparent h-16 hidden md:block opacity-50"></div>
            <div className="text-center pb-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2 opacity-70">
                Service
              </p>
              <span className="text-3xl font-light text-gray-100 tracking-tight leading-none">
                {token?.service || "No Service"}
              </span>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default NowServingCard;
