import { useState, useEffect, useRef } from "react";
import IpPromptModal from "./components/IpPromptModal";
import "./index.css";
import Header from "./components/Header";
import QueueList from "./components/QueueList";
import Footer from "./components/Footer";

import NowServingCard from "./components/NowServingCard";
import VideoFeed from "./components/VideoFeed";
import ImageDisplay from "./components/ImageDisplay";

function App() {
  const [LOCAL_IP, setIp] = useState(() => localStorage.getItem("LOCAL_IP"));
  const [showIpPrompt, setShowIpPrompt] = useState(false);

  const [tokens, setTokens] = useState([]);
  const fetchedTokensRef = useRef([]);
  const [nowServingToken, setNowServingToken] = useState(null);
  const [showNowServing, setShowNowServing] = useState(false);
  const nowServingTimerRef = useRef(null);

  const [isDark, setIsDark] = useState(true);
  const [title, setTitle] = useState("Loading...");
  const [appInfo, setAppInfo] = useState("Loading...");

  // Save IP to localStorage
  useEffect(() => {
    if (LOCAL_IP) localStorage.setItem("LOCAL_IP", LOCAL_IP);
  }, [LOCAL_IP]);

  // Handle messages from RN or other source
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;

      let data;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (data.tokenInfo) {
        fetchTokens(LOCAL_IP); // store in ref
        setNowServingToken(data.tokenInfo); // trigger Now Serving
      }

      if (data.tokenInfo?.status === "end") {
        if (nowServingTimerRef.current) clearTimeout(nowServingTimerRef.current);
        nowServingTimerRef.current = null;
        setNowServingToken(null);
        setShowNowServing(false);
      }

      if (data.ipUrl) setIp(data.ipUrl);
    };

    window.addEventListener("message", handleMessage);
    const timeout = setTimeout(() => setShowIpPrompt(true), 2000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeout);
    };
  }, [LOCAL_IP]);

  const handleIpSubmit = (ip) => {
    setIp(ip);
    setShowIpPrompt(false);
    fetchAppDetails(ip);
  };

  const fetchTokens = async (ip) => {
    try {
      const res = await fetch(`http://${ip}:8000/api/serving_list`);
      const fetchedTokens = await res.json();
      fetchedTokensRef.current = fetchedTokens; // store in ref temporarily

      // Only update state if not showing Now Serving
      if (!showNowServing) setTokens(fetchedTokensRef.current);
    } catch (e) {
      console.error("Error fetching tokens:", e);
    }
  };

  // Fetch tokens periodically / on IP change
  useEffect(() => {
    if (!LOCAL_IP) return;
    if (!showNowServing) fetchTokens(LOCAL_IP);
  }, [LOCAL_IP, showNowServing]);

  // After NowServingCard disappears, update QueueList with latest tokens
  useEffect(() => {
    if (!showNowServing && fetchedTokensRef.current.length) {
      setTokens(fetchedTokensRef.current);
      fetchedTokensRef.current = [];
    }
  }, [showNowServing]);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Now Serving timer
  useEffect(() => {
    if (!nowServingToken) return;

    setShowNowServing(true);
    if (nowServingTimerRef.current) clearTimeout(nowServingTimerRef.current);

    nowServingTimerRef.current = setTimeout(() => {
      setShowNowServing(false);
      setNowServingToken(null);
      nowServingTimerRef.current = null;
    }, 10 * 1000);

    return () => {
      if (nowServingTimerRef.current) clearTimeout(nowServingTimerRef.current);
    };
  }, [nowServingToken]);

  const fetchAppDetails = async (ip) => {
    try {
      const res = await fetch(`http://${ip}:8000/api/app-details`);
      const json = await res.json();
      setTitle(json?.name);
      setAppInfo(json);
    } catch (err) {
      console.error("Failed to fetch app details", err);
    }
  };

  useEffect(() => {
    if (LOCAL_IP) fetchAppDetails(LOCAL_IP);
  }, [LOCAL_IP]);

  return (
    <>
      {showIpPrompt && !LOCAL_IP && <IpPromptModal onSubmit={handleIpSubmit} />}

      {LOCAL_IP && (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-900 dark:text-text-main overflow-hidden flex flex-col font-display">
          <Header />

          <main className="flex-1 flex p-6 gap-6 h-[calc(100vh-6rem-3rem)] overflow-hidden">
            {showNowServing && nowServingToken ? (
              <NowServingCard token={nowServingToken} />
            ) : !appInfo?.media_url ? (
              <div className="w-full h-full flex items-center justify-center text-white/60">
                No media configured
              </div>
            ) : appInfo?.media_type === "image" ? (
              <ImageDisplay src={String(appInfo?.media_url)} />
            ) : (
              <VideoFeed videoId={appInfo?.media_url} />
            )}

            <QueueList tokens={tokens} showNowServing={showNowServing} />
          </main>

          <Footer content="Please have your identification documents ready. Counter 05 is now closed for lunch break. Reminder: The office will close at 5:00 PM today. Thank you for your patience." />
        </div>
      )}
    </>
  );
}

export default App;
