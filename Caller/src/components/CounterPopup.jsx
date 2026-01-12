import { useState, useEffect } from "react";

export default function CounterPopup({
  onSelectCounter,
  localIp = "localhost",
}) {
  const [counters, setCounters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const res = await fetch(`http://${localIp}:8000/api/counter-list`);
        let data = await res.json();
        data.shift();
        setCounters(data);
      } catch (err) {
        console.error("Failed to fetch counters", err);
      }
    };

    fetchCounters();
  }, [localIp]);

  const handleSelect = (counter) => {
    setSelected(counter);
    onSelectCounter(counter.id);
    setDropdownOpen(false);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-80 p-6 relative">
        <h2 className="text-xl font-bold mb-4">Select Counter</h2>

        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-gray-500"
        >
          ✕
        </button>

        {/* Custom Select */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full text-left px-4 py-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-800"
          >
            {selected ? selected.name : "Select a counter"}
          </button>

          {dropdownOpen && (
            <div
              className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto
                                        bg-white dark:bg-slate-900 border rounded shadow dark:border-slate-800"
            >
              {counters.map((counter) => (
                <div
                  key={counter.id}
                  onClick={() => handleSelect(counter)}
                  className="px-4 py-2 cursor-pointer  hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  {counter.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
