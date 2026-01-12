import { useEffect, useRef, useState } from "react";

const QueueList = ({ tokens, showNowServing }) => {


  const [displayTokens, setDisplayTokens] = useState(tokens);


  useEffect(() => {
    if (!showNowServing) {
      setDisplayTokens(tokens);
    }
  }, [tokens, showNowServing]);


  const scrollRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {

    const el = scrollRef.current;
    if (!el) return;

    const speed = 0.35;

    const animate = () => {
      el.scrollTop += speed;
      if (el.scrollTop >= el.scrollHeight / 2) el.scrollTop = 0;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [showNowServing]);


  return (
    <div className="w-8/12 flex flex-col h-[400px] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl ring-1 ring-gray-200 dark:ring-border-dark overflow-hidden">
      <div className="flex items-center justify-between px-8 py-2 bg-gray-50 dark:bg-black/40 border-b border-gray-200 dark:border-border-dark shrink-0 backdrop-blur-sm">
        <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Ticket Number</span>
        <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Counter</span>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2 relative bg-surface-light dark:bg-surface-dark">
        <>


          {/* Always render the Now Serving card */}
          <div className="sticky top-0 z-10 mb-2 transform transition-all hover:scale-[1.01]">
            <div className="relative bg-gradient-to-r from-indigo-600 via-primary to-accent rounded-xl p-[2px] shadow-glow overflow-hidden">
              <div className="absolute inset-0 bg-white/20"></div>
              <div className="bg-surface-light dark:bg-black rounded-[10px] p-6 flex items-center justify-between relative overflow-hidden h-16">
                <div className="relative z-10 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-primary dark:text-accent uppercase tracking-widest mb-1">
                    Current Ticket
                  </span>
                  <span className="block text-[30px] font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                    {displayTokens[0]?.token || "—"}
                  </span>
                </div>
                <div className="text-right relative z-10 flex flex-col justify-center h-full border-l border-gray-100 dark:border-gray-800 pl-6">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="block text-[9px] font-bold text-indigo-600 dark:text-green-400 uppercase tracking-wider">
                      Now Serving
                    </span>
                  </div>
                  <span className="block text-[18px] uppercase font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {displayTokens[0]?.counter || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {(displayTokens.length > 6 ? [...displayTokens, ...displayTokens] : displayTokens).slice(1).map((t, idx) => (
              <div key={idx} className={`bg-white dark:bg-card-dark rounded-xl px-6 flex items-center justify-between shadow-sm border border-gray-100 dark:border-border-dark hover:border-gray-300 dark:hover:border-gray-600 transition-all group`}>
                <span className="text-[20px] font-bold text-gray-800 dark:text-gray-200 tabular-nums tracking-tight group-hover:text-primary transition-colors">{t.token}</span>
                <span className="text-[16px] font-bold text-gray-500 dark:text-white uppercase tracking-wide">{t.counter}</span>
              </div>
            ))}
          </div>


        </>
      </div>
      <div className="h-8 bg-gradient-to-t from-surface-light dark:from-surface-dark to-transparent shrink-0 pointer-events-none -mt-8 relative z-10"></div>
    </div>
  );
};

export default QueueList;