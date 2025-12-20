import React from "react";

const ServiceCard = ({ service, index, onSelect }) => {
  let { name, description, waiting_count, estimated_time } = service;
  let isActive = true;
  const services = [
    {
      id: 1,
      name: "General Consultation",
      description:
        "Standard check-ups and general health inquiries for walk-in patients.",
      icon: "medical_services",
      status: "active",
      waiting: 12,
      waitTime: "00:45:00",
      gradient: "from-emerald-500 to-teal-400",
      color: "emerald",
    },
    {
      id: 2,
      name: "Billing & Payments",
      description:
        "Invoices, payment processing and insurance claims handling.",
      icon: "payments",
      status: "active",
      waiting: 5,
      waitTime: "00:12:30",
      gradient: "from-blue-500 to-indigo-400",
      color: "blue",
    },
    {
      id: 3,
      name: "Laboratory",
      description:
        "Blood tests, sample collection, and results distribution center.",
      icon: "biotech",
      status: "idle",
      waiting: 0,
      waitTime: "00:00:00",
      gradient: "from-purple-500 to-fuchsia-400",
      color: "purple",
    },
    {
      id: 4,
      name: "Pharmacy",
      description: "Medicine dispensing and prescription verification counter.",
      icon: "medication",
      status: "idle",
      waiting: 0,
      waitTime: "00:00:00",
      gradient: "from-orange-500 to-amber-400",
      color: "orange",
    },
  ];

  return (
    <div onClick={() => onSelect?.(service)} className="group relative bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-slate-700/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Top Gradient */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${services[index]?.gradient}`}
      ></div>

      {/* Content */}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-5">
          <div
            className={`w-14 h-14 rounded-2xl bg-${services[index]?.color}-50 dark:bg-${services[index]?.color}-500/10 flex items-center justify-center text-${services[index]?.color}-600 dark:text-${services[index]?.color}-400 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
          >
            <span className="material-symbols-outlined text-[32px] icon-filled">
              {services[index]?.icon}
            </span>
          </div>

          {/* Status */}
          {isActive ? (
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-${services[index]?.color}-100 text-${services[index]?.color}-800 dark:bg-${services[index]?.color}-500/20 dark:text-${services[index]?.color}-300 border border-${services[index]?.color}-200 dark:border-${services[index]?.color}-500/30`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${services[index]?.color}-400 opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 bg-${services[index]?.color}-500`}
                ></span>
              </span>
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
              <span className="inline-flex h-2 w-2 rounded-full bg-gray-400 dark:bg-slate-600"></span>
              Idle
            </span>
          )}
        </div>

        <h3
          className={`text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-${services[index]?.color}-600 dark:group-hover:text-${services[index]?.color}-400 transition-colors`}
        >
          {name}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {description ||
            "Standard check-ups and general health inquiries for"}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 mt-auto">
        <div className="bg-gray-50 dark:bg-[#0B1120]/60 rounded-xl p-4 border border-gray-100 dark:border-slate-800 flex divide-x divide-gray-200 dark:divide-slate-800">
          <div className="flex-1 pr-4">
            <div className="text-[11px] uppercase font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                groups
              </span>
              Waiting
            </div>
            <div className="text-2xl font-bold">
              {waiting_count}
              <span className="text-xs text-slate-500 ml-1">ppl</span>
            </div>
          </div>

          <div className="flex-1 pl-4">
            <div className="text-[11px] uppercase font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                schedule
              </span>
              Est. Wait
            </div>
            <div className="text-2xl font-mono font-bold">
              {estimated_time?.includes(":")
                ? estimated_time.split(":").slice(-2).join(":")
                : estimated_time || "--:--"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
