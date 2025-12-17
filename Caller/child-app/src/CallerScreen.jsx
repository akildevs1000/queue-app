// src/CallerScreen.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import StatCard from "./components/StatCard";
import ServingTimeCard from "./components/ServingTimeCard";
import QuickActionButton from "./components/QuickActionButton";

import CounterPopup from "./components/CounterPopup";
import NowServingCard from "./components/NowServingCard";
import ActionCard from "./components/ActionCard";

import { useWebSocket } from "./hooks/useWebSocket";
import { useTokenCounts } from "./hooks/useTokenCounts";
import { useNextToken } from "./hooks/useNextToken";
import { useFormatTime } from "./hooks/useFormatDateTime";
import {
  endServingToken,
  manuallCall,
  noShowToken,
  startServingToken,
} from "./api/actions";
import ManualCall from "./components/ManualCall";

const CallerScreen = ({ ip, handleLogout, toggleDarkMode, isDark }) => {
  const localIp = ip;

  const WS_URL = useMemo(() => `ws://${ip}:7777`, [ip]);

  const { isConnected, messages, sendMessage } = useWebSocket(WS_URL);
  const [selectedCounterId, setSelectedCounterId] = useState(null);

  const [isServing, setIsServing] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);

  const { tokenCounts, refetch } = useTokenCounts(
    selectedCounterId,
    localIp,
    messages
  );
  const [servingInfo, setServingInfo] = useState(null);

  const nextToken = useNextToken(localIp, selectedCounterId, sendMessage);

  const handleNext = async () => {
    if (servingInfo?.ticket?.id) return;

    const result = await nextToken();

    if (!result) return;

    setServingInfo(result);
    setIsServing(true);
    setStartTime(Date.now());
  };

  const noShowServing = async () => {
    if (!servingInfo?.ticket?.id) return;
    try {
      await noShowToken(localIp, servingInfo?.ticket?.id, selectedCounterId);
      sendMessage({ event: "token-serving-end", data: servingInfo?.serving });
      setTotalElapsed(0);
      setStartTime(null);
      setIsServing(false);
      setDisplayTime(0);
      setServingInfo(null);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  const reCall = async () => {
    if (!servingInfo?.ticket?.id) return;
    sendMessage({ event: "token-serving", data: servingInfo?.serving });
  };

  const pauseServing = () => {
    if (isServing && startTime !== null) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setTotalElapsed((prev) => prev + elapsed);
      setStartTime(null);
      setIsServing(false);
    }
  };

  const resumeServing = () => {
    if (!isServing && servingInfo) {
      setStartTime(Date.now()); // this is the correct point in time from now
      setIsServing(true);
    }
  };

  const toggleServing = () => {
    if (isServing) {
      // Pause if currently serving
      pauseServing();
    } else {
      // Resume if currently paused
      resumeServing();
    }
  };

  const handleEnd = async () => {
    if (!servingInfo?.ticket?.id) return;

    let finalElapsed = totalElapsed;
    if (isServing && startTime !== null) {
      const now = Date.now();
      finalElapsed += Math.floor((now - startTime) / 1000);
    }
    console.log("Total time served:", useFormatTime(finalElapsed));

    try {
      await endServingToken(
        ip,
        servingInfo.ticket.id,
        useFormatTime(finalElapsed),
        selectedCounterId
      );

      setTotalElapsed(0);
      setStartTime(null);
      setIsServing(false);
      setDisplayTime(0);

      setServingInfo(null);

      if (!servingInfo?.serving) return;

      sendMessage({ event: "token-serving-end", data: servingInfo?.serving });

      await refetch();
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  const handleDataFromManualCall = async (token_number_display) => {
    try {
      const ticketInfo = await manuallCall(
        localIp,
        token_number_display,
        selectedCounterId
      );

      if (!ticketInfo?.id) return;

      setStartTime(Date.now()); // timer doest not start sometime
      setIsServing(true);

      const json = await startServingToken(
        localIp,
        ticketInfo?.id,
        selectedCounterId
      );

      if (json && json.counter) {
        setServingInfo({ ticket: ticketInfo, serving: json });
        sendMessage({ event: "token-serving", data: json });
        sendMessage({
          event: "feedback",
          data: {
            counter_id: selectedCounterId || 0,
            token_id: ticketInfo.id,
            ...json,
          },
        });
      }
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  useEffect(() => {
    let interval;

    if (isServing && startTime !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const sessionSeconds = Math.floor((now - startTime) / 1000);
        setDisplayTime(totalElapsed + sessionSeconds);
      }, 1000);
    } else {
      // When paused or stopped, show the saved totalElapsed time
      setDisplayTime(totalElapsed);
    }

    return () => clearInterval(interval);
  }, [isServing, startTime, totalElapsed]);

  const lastHandledRef = useRef(null);

  useEffect(() => {
    if (!messages?.length) return;

    const last = messages[messages.length - 1];
    if (lastHandledRef.current === last) return;

    lastHandledRef.current = last;

    if (last.event === "token-serving-end") {
      refetch();
    }
  }, [messages]);

  return (
    <div className="dark:bg-background-dark bg-background-light text-slate-700 dark:text-slate-200 font-display transition-colors duration-300 min-h-screen flex flex-col overflow-hidden">
      <CounterPopup localIp={localIp} onSelectCounter={setSelectedCounterId} />

      <main className="flex-1 p-4 lg:p-6 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto lg:overflow-visible pr-2 lg:pr-0">
            {/* Stat Cards */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ServingTimeCard time={displayTime} />

              <StatCard
                title="Total Served"
                value={tokenCounts ? tokenCounts.served : "-"}
                icon="check_circle"
                iconBgClass="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              />
              <StatCard
                title="Pending"
                value={tokenCounts ? tokenCounts.pending : "-"}
                icon="hourglass_top"
                iconBgClass="bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400"
              />
            </div>
            <NowServingCard servingInfo={servingInfo} />
          </div>

          {/* Right Column (Actions/Controls) */}
          <div className="lg:col-span-4 h-full flex flex-col">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col p-6 overflow-y-auto">
              {/* Header */}
              <ActionCard
                toggleDarkMode={toggleDarkMode}
                isDark={isDark}
                handleLogout={handleLogout}
              />

              {/* Next Visitor Button */}
              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-6 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-between group transition-all transform hover:-translate-y-1 mb-8"
                onClick={handleNext}
              >
                <div className="text-left">
                  <span className="block text-2xl font-bold">Next Visitor</span>
                  <span className="text-indigo-200 text-sm font-medium">
                    Proceed to queue
                  </span>
                </div>
                <div className="w-12 h-12 flex items-center justify-center bg-indigo-500 rounded-xl group-hover:bg-indigo-400 transition-colors shadow-inner">
                  <span className="material-symbols-outlined text-3xl">
                    arrow_forward
                  </span>
                </div>
              </button>

              {/* Quick Actions */}
              <div className="flex-1 flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionButton
                    icon="history"
                    label="Recall"
                    bgClass="bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                    onClick={reCall}
                  />
                  <QuickActionButton
                    icon="person_off"
                    label="No Show"
                    bgClass="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700"
                    onClick={noShowServing}
                  />
                  <QuickActionButton
                    icon={isServing ? "pause_circle" : "play_circle"}
                    label={isServing ? "Pause" : "Resume"}
                    bgClass="bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                    onClick={toggleServing}
                  />
                  <ManualCall onTokenSubmit={handleDataFromManualCall} />
                </div>
              </div>

              {/* End Session Button */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-rose-200 dark:border-rose-800 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
                  onClick={handleEnd}
                >
                  <span className="material-symbols-outlined">stop_circle</span>
                  <span className="font-bold text-sm">End Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CallerScreen;
