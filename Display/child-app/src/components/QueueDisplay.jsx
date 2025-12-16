import React, { useEffect, useState } from "react";

import ServingList from "./ServingList";
import Header from "./Header";
import LiveTokenDisaply from "./LiveTokenDisaply";

const QueueDisplay = ({ title }) => {
  const [tokens, setTokens] = useState([]);
  const [ip, setIp] = useState("");

  useEffect(() => {
    // Capture URL from parent React Native app
    if (window.API_URL) {
      setIp(new URL(window.API_URL).hostname);
    }
  }, []);

  useEffect(() => {
    const fetchTokens = async (ip) => {
      try {
        const res = await fetch(`http://${ip}:8000/api/serving_list`);

        const tokens = await res.json();

        setTokens(tokens);
      } catch (e) {
        console.error("Error @ fetchTokens", e);
      } finally {
      }
    };

    fetchTokens();
  }, [ip]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;

      try {
        const data = JSON.parse(event.data);

        // Token messages
        if (data.tokenInfo) {
          setTokens((prev) => {
            const isDuplicate = prev.some(
              (item) => item.token === data.tokenInfo.token
            );
            if (isDuplicate) return prev;
            return [data.tokenInfo, ...prev];
          });
        }

        // IP messages
        if (data.ipUrl) {
          setIp(data.ipUrl);
        }
      } catch (e) {
        console.log("Non-JSON message ignored:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden">
      {/* Background Gradient & Texture */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-tr from-brand-navy-deep via-brand-navy-mid to-brand-navy-deep bg-[length:200%_200%] animate-gradient-bg"></div>
      <div className="absolute inset-0 -z-20 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.02]"></div>

      {/* Header */}
      <Header title={title} />

      {/* Main Content */}
      <main className="flex-1 px-10 py-8">
        <div className="grid h-full grid-cols-12 gap-8">
          {/* Now Serving / Next Token */}
          <div className="col-span-7 flex flex-col gap-8">
            {/* Now Serving */}
            <LiveTokenDisaply tokens={tokens} />
          </div>

          <div className="col-span-5 flex flex-col bg-brand-navy-mid/50 rounded-2xl shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
            {/* Serving List */}
            <ServingList tokens={tokens} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default QueueDisplay;
