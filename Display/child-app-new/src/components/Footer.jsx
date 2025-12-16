import { useEffect, useState } from "react";

const Footer = ({ content = "Your Organization" }) => {
  return (
    
    <footer className="h-12 bottom-[20px] bg-surface-darker text-white flex items-center overflow-hidden relative z-30 border-t border-white/5 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
      <div className="bg-primary h-full px-6 flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.3)]">
        Announcement
      </div>
      <div className="scrolling-text-container w-full h-full flex items-center bg-surface-darker/50">
        <div className="scrolling-text px-4 text-text-secondary font-medium tracking-wide">
          {content}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
