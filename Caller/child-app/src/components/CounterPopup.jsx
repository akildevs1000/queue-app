import { useState, useEffect } from "react";

export default function CounterPopup({ onSelectCounter, localIp = "localhost" }) {
    const [counters, setCounters] = useState([]);
    const [selectedCounterId, setSelectedCounterId] = useState(null);
    const [isOpen, setIsOpen] = useState(true); // Auto-open dialog on load

    useEffect(() => {
        const fetchCounters = async () => {
            try {
                const res = await fetch(`http://${localIp}:8000/api/counter-list`);
                let data = await res.json();
                data.shift(); // remove first element
                setCounters(data);
            } catch (err) {
                console.error("Failed to fetch counters", err);
            }
        };

        fetchCounters();
    }, [localIp]);

    const handleSelect = (id) => {
        setSelectedCounterId(id);
        onSelectCounter(id); // send to parent
        setIsOpen(false); // close dialog
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-80 p-6 relative">
                <h2 className="text-xl font-bold mb-4">Select Counter</h2>

                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                <div className="mt-4">
                    <select
                        value={selectedCounterId || ""}
                        onChange={(e) => handleSelect(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled>
                            Select a counter
                        </option>
                        {counters.map((counter) => (
                            <option key={counter.id} value={counter.id}>
                                {counter.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
