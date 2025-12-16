import React from "react";

// Mock Data structure (keeping it simple without TypeScript for this request)
const mockData = {
  nowServingTicket: "B605",
  nowServingType: "Priority Customer",
  nowServingCounter: "08",
  nowServingService: "Reception",
  upNextTicket: "B606",
  upNextCounter: "1",
  estimatedWaitMinutes: 12,
  currentDate: "Wednesday, Oct 24",
  currentTime: "10:42",
  location: "Main Hall",
  announcement:
    "Please have your identification documents ready for verification. • For mortgage inquiries, please take a ticket from Kiosk B. • Operating hours: 09:00 - 17:00. • Thank you for your patience.",
};

// --- Sub-Components ---

// Header Component
const QueueHeader = ({
  location,
  estimatedWaitMinutes,
  currentTime,
  currentDate,
}) => (
  <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-30 relative">
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
        <span className="material-symbols-outlined">dataset</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-900 leading-none">
          City Services
        </h1>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
          {location}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-8">
      <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
        <span className="material-symbols-outlined text-slate-400">
          timelapse
        </span>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Est. Wait
          </span>
          <span className="text-sm font-bold text-slate-700">
            ~{estimatedWaitMinutes} Mins
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-slate-900 leading-none">
          {currentTime}
        </div>
        <div className="text-xs text-slate-500 font-medium uppercase mt-0.5">
          {currentDate}
        </div>
      </div>
    </div>
  </header>
);

// Main Display Component
const MainDisplay = ({
  nowServingTicket,
  nowServingType,
  nowServingCounter,
  nowServingService,
}) => (
  <main className="flex-1 flex flex-col items-center justify-center relative p-8 lg:p-16 z-10">
    {/* Decorative Background Elements */}
    <div className="absolute inset-0 z-0 opacity-50 pointer-events-none overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-3xl opacity-60"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200 rounded-full blur-3xl opacity-40"></div>
    </div>

    <div className="w-full max-w-4xl relative z-10">
      <div className="bg-white rounded-3xl shadow-xl border border-white/50 overflow-hidden backdrop-blur-sm">
        <div className="bg-slate-900 px-8 py-4 flex justify-between items-center">
          <span className="flex items-center gap-2 text-white font-semibold tracking-wider text-sm uppercase">
            <span className="material-symbols-outlined text-[20px] fill-1">
              notifications_active
            </span>
            Now Serving
          </span>
          <span className="text-white/60 text-xs font-mono">TICKET ID</span>
        </div>
        <div className="p-12 lg:p-20 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-accent text-xs font-bold tracking-widest uppercase border border-blue-100">
              {nowServingType}
            </span>
          </div>
          <h2 className="text-[12rem] lg:text-[14rem] font-bold text-slate-900 leading-[0.85] tracking-tighter mb-8 tabular-nums">
            {nowServingTicket}
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mt-12 pt-12 border-t border-slate-100">
            <div className="text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                Counter
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-accent">
                  <span className="material-symbols-outlined text-3xl">
                    storefront
                  </span>
                </div>
                <span className="text-5xl font-bold text-slate-800">
                  {nowServingCounter}
                </span>
              </div>
            </div>
            <div className="hidden md:block w-px h-16 bg-slate-100"></div>
            <div className="text-center">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                Service
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-medium text-slate-600">
                  {nowServingService}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-8 text-slate-500 font-medium flex items-center gap-2 bg-white/50 px-6 py-2 rounded-full border border-white/60 backdrop-blur-sm">
      <span className="material-symbols-outlined text-lg">info</span>
      Please proceed to the indicated counter
    </div>
  </main>
);

// Sidebar Component (Up Next)
const QueueSidebar = ({ tokens }) => (
  <aside className="w-[400px] bg-white border-l border-slate-200 z-20 flex flex-col shadow-2xl">
    <div className="p-6 bg-slate-50 border-b border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <span className="material-symbols-outlined text-accent">
          format_list_bulleted
        </span>
        Up Next
      </h3>
    </div>
    <div className="flex-1 overflow-y-auto no-scrollbar">
      {tokens.map((token,index) => (
        <div
          key={index} // <-- CRITICAL: Unique key for each list item
          className="group p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-center justify-center"
        >
          <div>
            <div className="text-3xl font-bold text-slate-700 group-hover:text-primary transition-colors">
              {token.token}
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">
              Counter {token.counter}
            </div>
          </div>
        </div>
      ))}
    </div>
  </aside>
);

// Footer Component (Scrolling Announcement)
const AnnouncementFooter = ({ announcement }) => (
  <footer className="bg-slate-900 text-white h-12 flex items-center relative z-40 overflow-hidden">
    <div className="bg-accent h-full px-6 flex items-center justify-center font-bold text-sm uppercase tracking-wider relative z-10 shadow-lg">
      Announcement
    </div>
    <div className="flex-1 overflow-hidden">
      {/* The animate-marquee class would typically be defined in a CSS file to handle the animation */}
      <div className="animate-marquee whitespace-nowrap text-sm font-medium text-slate-300">
        {announcement}
      </div>
    </div>
  </footer>
);

// --- Main Component ---
const QueueDisplayNew = ({ title, tokens }) => {
  return (
    <div
      className="bg-surface text-slate-800 font-sans h-screen w-full overflow-hidden flex flex-col"
      // Note: The original HTML body used "bg-surface" which is not a default Tailwind class.
      // Assuming 'bg-surface' is a light background color, but sticking to provided classes.
    >
      <QueueHeader
        location={mockData.location}
        estimatedWaitMinutes={mockData.estimatedWaitMinutes}
        currentTime={mockData.currentTime}
        currentDate={mockData.currentDate}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <MainDisplay
          nowServingTicket={mockData.nowServingTicket}
          nowServingType={mockData.nowServingType}
          nowServingCounter={mockData.nowServingCounter}
          nowServingService={mockData.nowServingService}
        />
        <QueueSidebar tokens={tokens} />
      </div>
      <AnnouncementFooter announcement={mockData.announcement} />
    </div>
  );
};

export default QueueDisplayNew;
