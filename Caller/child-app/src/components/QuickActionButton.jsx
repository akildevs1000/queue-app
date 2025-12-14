const QuickActionButton = ({ icon, label, colorClass, bgClass, onClick }) => (
    <button
        className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl ${bgClass} hover:shadow-md transition-all`}
        onClick={onClick}
    >
        <span className="material-symbols-outlined text-2xl">{icon}</span>
        <span className="text-sm font-bold">{label}</span>
    </button>
);

export default QuickActionButton;