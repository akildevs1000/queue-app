import React, { useState } from "react";

const IpPromptModal = ({ onSubmit }) => {
  const [ip, setIp] = useState("");

  const handleSubmit = () => {
    if (!ip.trim()) return;
    onSubmit(ip.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">
          Enter Server IP
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          IP was not detected automatically. Please enter it manually.
        </p>

        <input
          type="text"
          placeholder="e.g. 192.168.1.100"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default IpPromptModal;
