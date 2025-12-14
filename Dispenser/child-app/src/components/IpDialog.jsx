import { useState } from "react";

const IpDialog = ({
  open,
  ip,
  setIp, // <-- REAL IP setter (called only once)
  onClose,
  onLanguagesChange,
  darkMode,
}) => {
  const [inputIp, setInputIp] = useState(ip || "");
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const languages = [
    { lang: "en", label: "English" },
    { lang: "ar", label: "العربية" },
    { lang: "fr", label: "Français" },
    { lang: "es", label: "Español" },
  ];

  const isValidIPv4 = (value) =>
    /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/.test(
      value.trim()
    );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-brand-navy-mid/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl px-6 py-8 w-[90%] max-w-md">

        <h2 className="text-white text-2xl sm:text-3xl font-light tracking-wider mb-6 text-center">
          Enter Server IP
        </h2>

        {/* ✅ LOCAL INPUT */}
        <input
          type="text"
          value={inputIp}
          onChange={(e) => setInputIp(e.target.value)}
          placeholder="192.168.x.x"
          className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 mb-6"
        />

        {/* Languages */}
        <div className="mb-6">
          <p className="text-white mb-2 font-medium">Select Languages:</p>
          <div className="flex flex-wrap gap-3">
            {languages.map((language) => {
              const isSelected = selectedLanguages.includes(language.lang);
              return (
                <button
                  key={language.lang}
                  type="button"
                  onClick={() =>
                    setSelectedLanguages((prev) =>
                      prev.includes(language.lang)
                        ? prev.filter((l) => l !== language.lang)
                        : [...prev, language.lang]
                    )
                  }
                  className={`px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
                    isSelected
                      ? darkMode
                        ? "border-brand-cyan/40 bg-brand-cyan/10 text-white"
                        : "bg-blue-500 text-white"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }`}
                >
                  {language.lang.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ CONNECT BUTTON */}
        <button
          onClick={() => {
            if (!isValidIPv4(inputIp)) {
              alert("Please enter a valid IP address");
              return;
            }

            // 🔥 SET IP ONCE
            setIp(inputIp);

            if (onLanguagesChange) {
              const selectedObjects = selectedLanguages.map((code) =>
                languages.find((l) => l.lang === code)
              );
              onLanguagesChange(selectedObjects);
            }

            onClose();
          }}
          className="w-full bg-white/20 hover:bg-white/30 text-white font-medium tracking-wide py-3 rounded-xl transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default IpDialog;
