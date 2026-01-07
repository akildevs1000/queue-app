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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {newServices.length > 0 &&
        newServices.map((service, index) => (
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
  );
};

export default Services;
