import React, { useState, useEffect } from 'react';

const SmartQueue = () => {
  const [time, setTime] = useState(new Date());

  // Handle Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => date.toLocaleTimeString('en-GB', { hour12: false });
  const formatDate = (date) => date.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
  });

  return (
    <div className="dark bg-background-dark min-h-screen text-text-main flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-surface-dark border-b border-border-dark h-24 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-glow">
            <span className="material-icons text-white text-4xl">grid_view</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white leading-none">Smart Queue</h1>
            <span className="text-sm font-bold text-accent uppercase tracking-widest">Main Hall Display</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-6xl font-mono font-bold tabular-nums leading-none">{formatTime(time)}</div>
          <div className="text-sm font-bold text-text-muted uppercase tracking-widest">{formatDate(time)}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex p-6 gap-6 overflow-hidden">
        {/* Video Side */}
        <div className="w-7/12 relative bg-black rounded-2xl overflow-hidden ring-1 ring-border-dark">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000" 
            alt="Feed" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute top-6 left-6 bg-red-600 px-4 py-2 rounded font-black animate-pulse">LIVE FEED</div>
          <div className="absolute bottom-0 p-8 bg-gradient-to-t from-black to-transparent w-full">
            <h2 className="text-4xl font-bold">Global markets see unprecedented growth in tech today...</h2>
          </div>
        </div>

        {/* Queue Side */}
        <div className="w-5/12 bg-surface-dark rounded-2xl border border-border-dark overflow-hidden flex flex-col">
          <div className="px-8 py-4 bg-black/40 border-b border-border-dark flex justify-between text-xs font-black text-zinc-500 uppercase tracking-widest">
            <span>Ticket Number</span>
            <span>Destination</span>
          </div>
          <div className="flex-1 overflow-y-auto queue-list p-5 space-y-4">
             {/* Current Serving Card */}
             <div className="bg-gradient-to-r from-indigo-600 to-accent p-[2px] rounded-xl shadow-glow">
               <div className="bg-black rounded-[10px] p-6 flex justify-between items-center h-32">
                 <div>
                   <span className="text-xs font-bold text-accent uppercase">Current Ticket</span>
                   <div className="text-7xl font-black italic">A1014</div>
                 </div>
                 <div className="text-right border-l border-zinc-800 pl-6">
                    <div className="flex items-center justify-end gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-green-400">NOW SERVING</span>
                    </div>
                    <div className="text-2xl font-bold">COUNTER 01</div>
                 </div>
               </div>
             </div>
             {/* List items would go here (map over data) */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SmartQueue;