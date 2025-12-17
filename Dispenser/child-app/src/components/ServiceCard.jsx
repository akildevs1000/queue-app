import { ClockIcon, UserGroupIcon } from "@heroicons/react/24/solid";

const ServiceCard = ({ service, darkMode, onSelect }) => {
  if (!service.name) return null;

  const { name, waiting_count, estimated_time, description } = service;

  return (
    <div
      className={`relative flex flex-col rounded-2xl
  p-4 md:p-7 lg:p-16 xl:p-20
  text-white overflow-hidden
  transition-all duration-300 hover:scale-[1.02] hover:shadow-glow
  cursor-pointer bg-blue-500 dark:bg-slate-700
  `}
      onClick={() => onSelect?.(service)}
      style={{ width: "28rem", minHeight: "20rem" }}
    >
      {/* Decorations */}
      {/* <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div> */}

      {/* Title / Content */}
      <div className="flex flex-col items-center justify-center text-center z-10 h-full">
        <h2 className="text-5xl md:text-6xl font-extralight tracking-tight mb-2">
          {name}
        </h2>
        <p className="text-blue-100/80 text-sm font-light">{description}</p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-8 right-8 flex justify-between items-center z-10">
        {/* Left - Waiting */}
        <div className="flex flex-col items-start">
          <div className="flex items-center space-x-2 text-blue-100/80 text-sm">
            <UserGroupIcon className="w-5 h-5" />
            <span>Waiting</span>
          </div>
          <span className="text-2xl ml-1">{waiting_count}</span>
        </div>

        {/* Right - Estimated Time */}
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2 text-blue-100/80 text-sm">
            <ClockIcon className="w-5 h-5" />
            <span>Est Time</span>
          </div>
          <span className="text-2xl ml-1">{estimated_time}</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
