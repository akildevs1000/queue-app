import { useEffect, useState } from "react";
import ServiceCard from "./ServiceCard";

let iconAndColors = [
  { icon: "payments", color: "teal" },
  { icon: "account_balance_wallet", color: "blue" },
  { icon: "devices", color: "purple" },
  { icon: "account_box", color: "orange" },
  { icon: "credit_card", color: "pink" },
  { icon: "house", color: "cyan" },
  { icon: "shopping_cart", color: "green" },
  { icon: "local_shipping", color: "teal" },
  { icon: "notifications", color: "red" },
  { icon: "people", color: "amber" },
  { icon: "analytics", color: "lime" },
  { icon: "flight_takeoff", color: "indigo" },
  { icon: "event", color: "fuchsia" },
  { icon: "support_agent", color: "rose" },
  { icon: "lightbulb", color: "yellow" },
  { icon: "attach_money", color: "emerald" },
  { icon: "security", color: "sky" },
  { icon: "build", color: "violet" },
  { icon: "insights", color: "orange" },
  { icon: "bookmark", color: "purple" },
  { icon: "star", color: "pink" },
];

const Services = ({ services, onSelect }) => {
  const [newServices, setNewServices] = useState([]);
  useEffect(() => {
    let newArray = services.map((e, index) => ({
      icon: iconAndColors[index]?.icon || "star",
      color: iconAndColors[index]?.color || "teal",
      ...e,
    }));

    console.log(newArray);
    

    setNewServices(newArray);
  }, [services]);

  return (
    <main className="flex-grow p-6 lg:p-10 relative overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none z-0"></div>
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="mb-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Select Service
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Please choose a department to retrieve your queue ticket.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {newServices.length > 0 && newServices.map((service, index) => (
            <ServiceCard
              onClick={() => onSelect?.(service)}
              key={service.id}
              index={index}
              title={service.name}
              description={
                service.name || "General inquiries and cashier services"
              }
              queueCount={service.waiting_count || 0}
              waitTime={service.estimated_time}
              icon={service.icon}
              color={service.color}
              status={service.status ? "Active" : "InActive"}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Services;
