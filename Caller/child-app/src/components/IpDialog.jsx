import { useEffect, useState } from "react";

const IpDialog = ({
  open,
  ip,
  setIp,
  onClose,
  onLanguagesChange,
  darkMode,
}) => {
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const languages = [
    { lang: "en", label: "English" },
    { lang: "ar", label: "العربية" },
    { lang: "fr", label: "Français" },
    { lang: "es", label: "Español" },
  ];

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) => {
      const updated = prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang];

      // ✅ Call parent after state is updated using useEffect
      return updated;
    });
  };

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 
        bg-black/40 backdrop-blur-sm
        flex items-center justify-center
        z-50
      "
    >
      <div
        className="
          bg-brand-navy-mid/40 
          backdrop-blur-xl
          border border-white/10 
          shadow-2xl
          rounded-2xl
          px-6 py-8
          w-[90%] max-w-md
        "
      >
        {/* Title */}
        <h2
          className="
            text-white text-2xl sm:text-3xl 
            font-light tracking-wider 
            mb-6 text-center
          "
        >
          Enter Server IP
        </h2>

        {/* IP Input */}
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="192.168.x.x"
          className="
            w-full 
            px-4 py-3
            rounded-xl
            bg-white/10 
            text-white
            placeholder-white/40
            border border-white/20
            focus:outline-none focus:ring-2 focus:ring-white/40
            mb-6
          "
        />

        {/* Languages Multi-select */}
        <div className="mb-6">
          <p className="text-white mb-2 font-medium">Select Languages:</p>
          <div className="flex flex-wrap gap-3">
            {languages.map((language) => {
              const isSelected = selectedLanguages.includes(language.lang);
              return (
                <button
                  key={language.lang}
                  type="button"
                  onClick={() => toggleLanguage(language.lang)}
                  className={`
            px-4 py-2 rounded-xl 
            border transition-all duration-200 ease-in-out
            flex items-center justify-center
            text-sm font-medium
            ${
              isSelected
                ? darkMode
                  ? "animate-update-highlight border border-brand-cyan/40 bg-gradient-to-br from-brand-cyan/10 via-transparent to-transparent text-white"
                  : "bg-blue-500 text-white shadow-lg scale-105"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20"
            }
          `}
                >
                  {language.lang.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            // Pass selected languages to parent on button click
            if (onLanguagesChange) {
              const selectedObjects = selectedLanguages.map((code) =>
                languages.find((l) => l.lang === code)
              );
              onLanguagesChange(selectedObjects);
            }

            onClose(); // Close the dialog
          }}
          className="
    w-full 
    bg-white/20 hover:bg-white/30
    text-white
    font-medium tracking-wide
    py-3 rounded-xl
    transition
  "
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default IpDialog;
