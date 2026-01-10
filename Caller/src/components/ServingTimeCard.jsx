import { useFormatTime } from "../hooks/useFormatDateTime";

const ServingTimeCard = ({ time = 0 }) => {
  return (
    <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
      <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-6xl">timer</span>
      </div>
      <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">
        Serving Time
      </p>
      <h3 className="text-3xl font-mono font-bold tracking-tight">
        {useFormatTime(time)}
      </h3>
    </div>
  );
};

export default ServingTimeCard;
