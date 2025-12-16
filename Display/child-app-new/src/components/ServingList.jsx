const ServingList = ({ tokens }) => {
  return (
    <div className="flex-grow overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto">
          {/* Check if tokens array is provided and not empty before mapping */}
          {tokens && tokens.length > 0 ? (
            tokens.map((token, index) => (
              <div
                key={index} // Using index as key is acceptable if the list items are static
                className="px-6 py-4  hover:bg-white/[0.02] transition-colors duration-200 group cursor-default relative"
              >

                {/* <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}

                <div className="flex items-center justify-between mb-1">
                  {/* Token Number/Code */}
                  <span className="text-2xl font-bold text-gray-200 group-hover:text-white transition-colors tracking-tight">
                    {token.token}
                  </span>
                  {/* Counter Information */}
                  <span className="text-[16px] font-bold text-white uppercase">
                    {String((""+token?.counter ?? 0).replace(/\D/g, '') || 0).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  {/* Token Number/Code */}
                  <span className="text-1xl text-white font-bold  group-hover:text-white transition-colors tracking-tight">
                    {token.service}
                  </span>
                  {/* Counter Information */}
                  <span className="text-[14px] font-bold text-white uppercase bg-white/5">
                    Counter
                  </span>
                </div>
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
            ))
          ) : (
            // Fallback content when no tokens are available
            <div className="p-6 text-sm text-gray-500">
              No tokens currently in the queue.
            </div>
          )}
        </div>
      </div>
  );
};

export default ServingList;
