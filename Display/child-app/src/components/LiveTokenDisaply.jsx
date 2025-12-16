const LiveToken = ({ tokens }) => {
  return (
    <>
      <div className="relative flex flex-col items-center justify-center rounded-2xl p-8 md:p-7 lg:p-16 xl:p-20 border border-brand-cyan/40 text-white animate-update-highlight overflow-hidden bg-gradient-to-br from-brand-cyan/10 via-transparent to-transparent">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-brand-cyan/20 via-transparent to-transparent -z-10"></div>
        <h2 className="text-2xl lg:text-5xl xl:text-6xl font-light tracking-widest text-brand-cyan/80 mb-4 md:mb-6 lg:mb-8">
          NOW SERVING
        </h2>
        <div className="text-center">
          <p className="text-[2.5rem] md:text-[2.5rem] lg:text-[4rem] xl:text-[5rem] leading-none font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-cyan-100 drop-shadow-[0_4px_8px_rgba(103,232,249,0.3)]">
            {tokens[0]?.token || "-----"}
          </p>
          <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium tracking-wider mt-3 md:mt-4 lg:mt-6">
            {tokens[0]?.counter || "-----"}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 md:h-1/2 bg-gradient-to-t from-brand-cyan/10 to-transparent pointer-events-none"></div>
      </div>

      <div className="flex flex-col items-center justify-center bg-brand-navy-mid/50 rounded-2xl shadow-xl p-6 md:p-6 lg:p-12 xl:p-16 border border-white/10 backdrop-blur-sm animate-subtle-glow mt-6 md:mt-1 lg:mt-14">
        <h2 className="text-2xl  lg:text-5xl xl:text-6xl font-light tracking-widest text-gray-400 mb-4 md:mb-6 lg:mb-8">
          PREVIOUS TOKEN
        </h2>
        <div className="text-center">
          <p className="text-2xl md:text-2.5xl lg:text-4xl xl:text-5xl leading-none font-bold text-gray-200">
            {tokens[1]?.token || "-----"}
          </p>
          <p className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-medium text-gray-400 tracking-wider mt-3 md:mt-4 lg:mt-6">
            {tokens[1]?.counter || "-----"}
          </p>
        </div>
      </div>
    </>
  );
};

export default LiveToken;
