// src/CallerScreen.jsx
import React, { useState, useEffect } from 'react';

// --- Sub-Components ---

const StatCard = ({ title, value, icon, colorClass, iconBgClass }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden ${colorClass}`}>
    <div className="absolute right-3 top-3 p-2 rounded-lg text-xl" style={{ backgroundColor: iconBgClass }}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
  </div>
);

const ServingTimeCard = ({ time }) => (
  <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
      <span className="material-symbols-outlined text-6xl">timer</span>
    </div>
    <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Serving Time</p>
    <h3 className="text-3xl font-mono font-bold tracking-tight">{time}</h3>
  </div>
);

const QuickActionButton = ({ icon, label, colorClass, bgClass, onClick }) => (
  <button
    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl ${bgClass} hover:shadow-md transition-all`}
    onClick={onClick}
  >
    <span className="material-symbols-outlined text-2xl">{icon}</span>
    <span className="text-sm font-bold">{label}</span>
  </button>
);

// --- Main Component ---

const CallerScreen = () => {
  const [isDark, setIsDark] = useState(true);
  const currentTime = new Date();
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  useEffect(() => {
    // Sync React state with HTML class on initial load and change
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  const handleAction = (action) => {
    console.log(`${action} button clicked`);
    // Implement specific logic for each action here
  };

  return (
    <div className="dark:bg-background-dark bg-background-light text-slate-700 dark:text-slate-200 font-display transition-colors duration-300 min-h-screen flex flex-col overflow-hidden">
      <main className="flex-1 p-4 lg:p-6 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto lg:overflow-visible pr-2 lg:pr-0">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ServingTimeCard time="05:23" />
              <StatCard
                title="Total Served"
                value="142"
                icon="check_circle"
                iconBgClass="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              />
              <StatCard
                title="Pending"
                value="12"
                icon="hourglass_top"
                iconBgClass="bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400"
              />
            </div>

            {/* Now Serving Card */}
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
                  <h1 className="text-7xl lg:text-8xl font-black text-slate-800 dark:text-white tracking-tight leading-none">A-102</h1>
                  <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium">General Enquiry</p>
                </div>
                <div className="pt-10 grid grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-800 w-full mx-auto">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">Customer Category</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">Walk-In Visitor</p>
                  </div>
                  <div className="text-center border-l border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">Ticket Issued</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">10:42 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column (Actions/Controls) */}
          <div className="lg:col-span-4 h-full flex flex-col">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col p-6 overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{timeStr}</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">{dateStr}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Theme Toggle Button */}
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-all shadow-sm"
                    onClick={toggleDarkMode}
                    title="Toggle Theme"
                  >
                    <span className="material-symbols-outlined">{isDark ? 'dark_mode' : 'light_mode'}</span>
                  </button>
                  {/* Logout Button */}
                  <button
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all shadow-sm"
                    title="Logout"
                    onClick={() => handleAction('Logout')}
                  >
                    <span className="material-symbols-outlined">logout</span>
                  </button>
                </div>
              </div>
              
              {/* Next Visitor Button */}
              <button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-6 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-between group transition-all transform hover:-translate-y-1 mb-8"
                onClick={() => handleAction('Next Visitor')}
              >
                <div className="text-left">
                  <span className="block text-2xl font-bold">Next Visitor</span>
                  <span className="text-indigo-200 text-sm font-medium">Proceed to queue</span>
                </div>
                <div className="w-12 h-12 flex items-center justify-center bg-indigo-500 rounded-xl group-hover:bg-indigo-400 transition-colors shadow-inner">
                  <span className="material-symbols-outlined text-3xl">arrow_forward</span>
                </div>
              </button>
              
              {/* Quick Actions */}
              <div className="flex-1 flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</p>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionButton icon="history" label="Recall" bgClass="bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30" onClick={() => handleAction('Recall')} />
                  <QuickActionButton icon="person_off" label="No Show" bgClass="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700" onClick={() => handleAction('No Show')} />
                  <QuickActionButton icon="pause_circle" label="Pause" bgClass="bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30" onClick={() => handleAction('Pause')} />
                  <QuickActionButton icon="dialpad" label="Manual" bgClass="bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30" onClick={() => handleAction('Manual')} />
                </div>
              </div>

              {/* End Session Button */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button 
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-rose-200 dark:border-rose-800 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
                  onClick={() => handleAction('End Session')}
                >
                  <span className="material-symbols-outlined">stop_circle</span>
                  <span className="font-bold text-sm">End Session</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CallerScreen;