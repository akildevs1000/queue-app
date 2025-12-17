const LanguageCard = ({ lang, label, darkMode, handleLanguageSelect }) => {
  return (
    <div
      onClick={() => handleLanguageSelect(lang)}
      className={`relative flex flex-col items-center justify-center rounded-2xl p-8 md:p-7 lg:p-16 xl:p-20
                  text-white overflow-hidden
                  ${darkMode ? "" : "bg-blue-500"}
                  transition-colors cursor-pointer`}
    >
      {darkMode && (
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-white dark:bg-slate-700 -z-10"></div>
      )}
      <h2
        className={`text-2xl lg:text-5xl xl:text-6xl font-light tracking-widest mb-4 md:mb-6 lg:mb-8`}
      >
        {label}
      </h2>
    </div>
  );
};

export default LanguageCard;
