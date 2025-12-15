import QuickActionButton from "./QuickActionButton";
import { useState } from "react";

export default function ManualCall({ onTokenSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState("");

  const handleSubmit = () => {
    if (token.trim()) {
      onTokenSubmit(token); // Pass token to parent
      setToken(""); // Reset input
      setIsOpen(false); // Close modal
    }
  };

  return (
    <>
      <QuickActionButton
        onClick={() => setIsOpen(true)}
        icon="dialpad"
        label="Manual"
        bgClass="bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30"
      />

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-80 p-6 relative border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              Enter Token
            </h2>

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white"
            >
              ✕
            </button>

            <div className="mt-4">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter token"
                className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded shadow-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="mt-4 w-full px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  );
}
