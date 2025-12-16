import { useState, useEffect, useCallback } from "react";
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
  }, [LOCAL_IP]); const [showIpPrompt, setShowIpPrompt] = useState(false);

  // 1. State for Token Simulation and Display
  const [tokens, setTokens] = useState([]);
  const [nowServingToken, setNowServingToken] = useState(null);
  const [showNowServing, setShowNowServing] = useState(false);

  const [isDark, setIsDark] = useState(true);
  const [youtubeVideoId, setYoutubeVideoId] = useState("84BNaEVxLd8");
  const [footerContent, setFooterContent] = useState(
    " • For ticket verification, please present your ID at Counter 1. • Mortgage inquiries, please take a ticket from Kiosk B. • Operating hours: 09:00 - 17:00. • Thank you for your patience. • Please keep your mask on at all times."
  );

  // --- IP Prompt and Fetching App Details Logic (Unchanged) ---
  useEffect(() => {
    // ... (IP prompt logic)
    const handleMessage = (event) => {
      if (!event.data) return;
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        // Token messages
        if (data.tokenInfo) {
          fetchTokens(LOCAL_IP);
          setNowServingToken(data.tokenInfo);
        }
        if (data?.ipUrl) {
          setIp(data.ipUrl);
        }
      } catch (e) { }
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

  return (
    <>
      {showIpPrompt && !LOCAL_IP && <IpPromptModal onSubmit={handleIpSubmit} />}

      {LOCAL_IP && (
        <div className="bg-background-dark text-white transition-colors duration-300 min-h-screen flex flex-col font-sans dark selection:bg-primary selection:text-white">
          <Header ip={LOCAL_IP} />
          <main className="flex-grow flex flex-row h-[calc(100vh-104px)] relative">
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

            <div className="flex p-4 w-[70%]">
              {/* {showNowServing && nowServingToken ? (
                <NowServingCard token={nowServingToken} />
              ) : (
                <YouTubePlayer videoId={youtubeVideoId} />
              )} */}

              <NowServingCard token={nowServingToken} />

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