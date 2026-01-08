import GBFlag from "../assets/flags/gb.png";
import SAFlag from "../assets/flags/sa.png";
import FRFlag from "../assets/flags/fr.png";
import ESFlag from "../assets/flags/es.png";

const flagMap = {
  en: GBFlag,
  ar: SAFlag,
  fr: FRFlag,
  es: ESFlag,
};

const subtitles = {
  en: "Select English",
  ar: "اختر العربية",
  fr: "Sélectionner Français",
  es: "Seleccionar Español",
};

const LanguageCard = ({
  lang,
  label,
  handleLanguageSelect,
  className = "",
}) => {
  return (
    <button
      onClick={() => handleLanguageSelect(lang)}
      className={`lang-card group relative bg-white dark:bg-surface-dark hover:dark:bg-surface-hover
        border border-white/10 hover:dark:border-primary/50
        rounded-2xl p-10 shadow-soft hover:shadow-card-hover
        transition-all duration-300 flex flex-col items-center justify-center
        text-center focus:outline-none focus:ring-4 focus:ring-primary/20
        transform hover:-translate-y-1  ${className}`}
    >
      <div className="flag-icon">
        <img className="w-[150px]" src={flagMap[lang]} alt="" />
      </div>
      <span className="text-2xl font-bold text-black dark:text-white transition-colors">
        {label}
      </span>
      <span className="mt-2 text-sm text-gray-400 group-hover:text-primary/90 font-medium transition-colors">
        {subtitles[lang]}
      </span>
    </button>
  );
};

export default LanguageCard;
