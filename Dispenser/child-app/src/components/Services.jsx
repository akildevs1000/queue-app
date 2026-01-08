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
    let newArray = services.map((e, index) => {
      // Added console log for the current index
      console.log("Processing service at index:", index);

      return {
        ...e,
        icon: e.icon || iconAndColors[index]?.icon || "star",
        color: e.color || iconAndColors[index]?.color || "teal",
      };
    });

    console.log("Final Array:", newArray);
    setNewServices(newArray);
  }, [services]);

  return (
    <>
      {newServices.length === 1 ? (
        <div className="flex justify-center">
          <ServiceCard
            onClick={() => onSelect?.(newServices[0])}
            index={0}
            title={newServices[0].name}
            description={
              newServices[0].name || "General inquiries and cashier services"
            }
            queueCount={newServices[0].waiting_count || 0}
            waitTime={newServices[0].estimated_time}
            icon={newServices[0].icon}
            color={newServices[0].color}
            status={newServices[0].status ? "Active" : "InActive"}
            className="w-[460px] flex-shrink-0"
          />
        </div>
      ) : (
        <div
          className={`grid gap-8 ${
            newServices.length === 2 || newServices.length === 4
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {newServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              onClick={() => onSelect?.(service)}
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
      )}
    </>
  );
};

export default Services;
