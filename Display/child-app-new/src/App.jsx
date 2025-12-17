import { useState, useEffect, useCallback, useRef } from "react";
import IpPromptModal from "./components/IpPromptModal";
import "./index.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NowServingCard from "./components/NowServingCard";
import ServingList from "./components/ServingList";
import YouTubePlayer from "./components/YouTubePlayer";

function App() {
  const [LOCAL_IP, setIp] = useState(() => {
    return localStorage.getItem("LOCAL_IP");
  });

  useEffect(() => {
    if (LOCAL_IP) {
      localStorage.setItem("LOCAL_IP", LOCAL_IP);
    }
  }, [LOCAL_IP]);
  const [showIpPrompt, setShowIpPrompt] = useState(false);
  const nowServingTimerRef = useRef(null);

  // 1. State for Token Simulation and Display
  const [tokens, setTokens] = useState([]);
  const [nowServingToken, setNowServingToken] = useState(null);
  const [showNowServing, setShowNowServing] = useState(false);

  const [isDark, setIsDark] = useState(true);
  const [youtubeVideoId, setYoutubeVideoId] = useState("6jGFVmIZfTY");
  const [footerContent, setFooterContent] = useState(
    " • For ticket verification, please present your ID at Counter 1. • Mortgage inquiries, please take a ticket from Kiosk B. • Operating hours: 09:00 - 17:00. • Thank you for your patience. • Please keep your mask on at all times."
  );

  // --- IP Prompt and Fetching App Details Logic (Unchanged) ---
  useEffect(() => {
    // ... (IP prompt logic)
    const handleMessage = (event) => {
      if (!event.data) return;

      let data;
      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return;
      }

      // Token messages
      if (data.tokenInfo) {
        fetchTokens(LOCAL_IP);
        setNowServingToken(data.tokenInfo);
      }
      // Token end (from React Native sending { status: "end" })
      // Token end
      if (data.tokenInfo && data.tokenInfo.status === "end") {
        // Clear the timer immediately
        if (nowServingTimerRef.current)
          clearTimeout(nowServingTimerRef.current);
        nowServingTimerRef.current = null;

        setNowServingToken(null);
        setShowNowServing(false);
      }

      if (data?.ipUrl) {
        setIp(data.ipUrl);
      }
    };
    window.addEventListener("message", handleMessage);
    const timeout = setTimeout(() => {
      setShowIpPrompt(true);
    }, 2000);
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeout);
    };
  }, []);

  const handleIpSubmit = (ip) => {
    setIp(ip);
    setShowIpPrompt(false);
  };

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

  useEffect(() => {
    if (!LOCAL_IP) return;

    // initial fetch
    fetchTokens(LOCAL_IP);

    const interval = setInterval(() => {
      fetchTokens(LOCAL_IP);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [LOCAL_IP]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    if (!nowServingToken) return;

    // Show Now Serving
    setShowNowServing(true);

    // Clear any existing timer
    if (nowServingTimerRef.current) clearTimeout(nowServingTimerRef.current);

    // Hide after 10 seconds
    nowServingTimerRef.current = setTimeout(() => {
      setShowNowServing(false);
      setNowServingToken(null);
      nowServingTimerRef.current = null;
    }, 10 * 1000);

    return () => {
      if (nowServingTimerRef.current) clearTimeout(nowServingTimerRef.current);
    };
  }, [nowServingToken]);

  return (
    <>
      {showIpPrompt && !LOCAL_IP && <IpPromptModal onSubmit={handleIpSubmit} />}

      {LOCAL_IP && (
        <div className="bg-background-dark text-white transition-colors duration-300 min-h-screen flex flex-col font-sans dark selection:bg-primary selection:text-white">
          <Header ip={LOCAL_IP} />
          <main className="flex-grow flex flex-row h-[calc(100vh-104px)] relative">
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

            <div className="flex p-4 w-[70%]">
              {showNowServing && nowServingToken ? (
                <NowServingCard token={nowServingToken} />
              ) : (
                <YouTubePlayer videoId={youtubeVideoId} />
              )}
            </div>

            <div className="w-[30%] bg-surface-darker">
              <ServingList tokens={tokens} />
            </div>
          </main>
          <Footer content={footerContent} />
        </div>
      )}
    </>
  );
}

export default App;
