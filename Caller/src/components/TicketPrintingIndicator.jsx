
const TicketPrintingIndicator = () => {

  return (
    // Full screen overlay to block interaction and focus user
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
                 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
    >
      <div
        className="flex flex-col items-center justify-center p-12 md:p-16 lg:p-20 
                   bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform scale-100 
                   transition-transform duration-300 animate-pulse-slow"
      >
        {/* Simple Printer Icon/Animation */}
        <div className="mb-6">
          {/* You can replace this with a real icon library (e.g., Lucide, Heroicons) or an SVG animation */}
          <svg 
            className="w-16 h-16 text-blue-600 dark:text-brand-cyan animate-bounce" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Simple representation of a printer */}
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
        </div>

        {/* Status Message */}
        <h2 
          className="text-3xl md:text-4xl font-semibold mb-3 
                     text-gray-900 dark:text-white text-center"
        >
          Printing Ticket...
        </h2>

        {/* Instruction/Wait Message */}
        <p 
          className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-sm"
        >
          Please wait. Your ticket is being prepared. Do not close this window.
        </p>

        {/* Optional: Simple Progress Bar or Spinner */}
        <div className="mt-6 w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
            <div 
                className="h-full bg-blue-500 dark:bg-brand-cyan transition-all duration-500" 
                style={{ width: '100%' }} // A simple way to represent indeterminate loading
            ></div>
        </div>
      </div>
    </div>
  );
};

export default TicketPrintingIndicator;