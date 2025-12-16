import { useState, useEffect, useCallback } from "react";
import IpPromptModal from "./components/IpPromptModal";
import "./index.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NowServingCard from "./components/NowServingCard";
import ServingList from "./components/ServingList";
import YouTubePlayer from "./components/YouTubePlayer";

// Initial list of tokens for the ServingList display
const initialTokens = [
  // { number: "A215", counter: "Counter 3", status: "Waiting..." },
  // { number: "C001", counter: "Counter 2", status: "Waiting..." },
];

// Helper function to generate the next incremental token number
const generateNextTokenNumber = (lastToken) => {
  const prefix = "B";
  let num;
  if (lastToken) {
    num = parseInt(lastToken.substring(1)) + 1;
  } else {
    // Starting number if state is empty
    num = 606;
  }
  return `${prefix}${num}`;
};

function App() {
  const [LOCAL_IP, setIp] = useState(null);
  const [title, setTitle] = useState("");
  const [showIpPrompt, setShowIpPrompt] = useState(false);

  // 1. State for Token Simulation and Display
  const [currentTokens, setCurrentTokens] = useState(initialTokens);
  // NEW STATE: Track the absolute last generated token number for perfect sequence
  const [lastTokenNumber, setLastTokenNumber] = useState("B605");
  const [nowServingToken, setNowServingToken] = useState(null);
  const [showNowServing, setShowNowServing] = useState(false);

  // --- IP Prompt and Fetching App Details Logic (Unchanged) ---
  useEffect(() => {
    // ... (IP prompt logic)
    const handleMessage = (event) => {
      if (!event.data) return;
      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
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

  const fetchAppDetails = useCallback(async (LOCAL_IP) => {
    try {
      const res = await fetch(`http://${LOCAL_IP}:8000/api/app-details`);
      const json = await res.json();
      setTitle(json?.name);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  }, []);

  useEffect(() => {
    if (LOCAL_IP) {
      fetchAppDetails(LOCAL_IP);
    }
  }, [LOCAL_IP, fetchAppDetails]);

  const [isDark, setIsDark] = useState(true);
  const [youtubeVideoId, setYoutubeVideoId] = useState("84BNaEVxLd8");
  const [footerContent, setFooterContent] = useState(
    " • For ticket verification, please present your ID at Counter 1. • Mortgage inquiries, please take a ticket from Kiosk B. • Operating hours: 09:00 - 17:00. • Thank you for your patience. • Please keep your mask on at all times."
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);


  // 2. Token Simulation: Add a new incremental token every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {

      // Use setLastTokenNumber to safely get and set the next incremental number
      setLastTokenNumber(prevNumber => {
        const nextNumber = generateNextTokenNumber(prevNumber);

        // Add the new token to the queue
        setCurrentTokens((prevTokens) => {
          // Define possible counters and services
          const counters = ["Counter 1", "Counter 2", "Counter 3", "Counter 4"];
          const services = ["General", "Priority", "Inquiries", "Mortgage"];

          const newToken = {
            number: nextNumber,
            counter: counters[Math.floor(Math.random() * counters.length)],
            service: services[Math.floor(Math.random() * services.length)],
            status: "Waiting...",
          };

          // Add the new token to the front, keep the list size small for display
          return [newToken, ...prevTokens.slice(0, 4)];
        });

        return nextNumber; // Return the new, incremental number to update the state
      });

    }, 5000); // Add a new token every 5000ms (5 seconds)

    return () => clearInterval(interval);
  }, []); // Empty dependency array as required for setInterval/clearInterval


  // 3. Display Logic: Switch between NowServingCard and YouTubePlayer (Unchanged)
  useEffect(() => {
    let timer;

    if (!showNowServing && currentTokens.length > 0) {
      const nextToken = currentTokens[0];

      setNowServingToken({
        token: nextToken.number,
        counter: nextToken.counter.replace('Counter ', ''),
        service: nextToken.service,
      });

      setShowNowServing(true);

      timer = setTimeout(() => {
        setCurrentTokens((prevTokens) => prevTokens.slice(1));
        setShowNowServing(false);
      }, 5000); // Show card for 5 seconds

    } else if (!showNowServing && currentTokens.length === 0) {
      timer = setTimeout(() => {
        // Stays on video, effect re-runs after timeout
      }, 25000); // Show video for 25 seconds
    }

    return () => clearTimeout(timer);

  }, [showNowServing, currentTokens]);


  return (
    <>
      {showIpPrompt && !LOCAL_IP && <IpPromptModal onSubmit={handleIpSubmit} />}

      {LOCAL_IP && (
        <div className="bg-background-dark text-white transition-colors duration-300 min-h-screen flex flex-col font-sans dark selection:bg-primary selection:text-white">
          <Header title={title} />
          <main className="flex-grow flex flex-row h-[calc(100vh-104px)] relative">
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

            <div className="flex p-4 w-[70%]">
              {showNowServing && nowServingToken ? (
                <NowServingCard token={nowServingToken} />
              ) : (
                <YouTubePlayer videoId={youtubeVideoId} />
              )}
              {/* <YouTubePlayer videoId={youtubeVideoId} /> */}
            </div>

            <div className="w-[30%] bg-surface-darker">
              <ServingList tokens={currentTokens} />
            </div>
          </main>
          <Footer content={footerContent} />
        </div>
      )}
    </>
  );
}

export default App;