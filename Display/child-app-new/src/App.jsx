import { useState, useEffect } from "react";
import IpPromptModal from "./components/IpPromptModal";
import "./index.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import NowServingCard from "./components/NowServingCard";
import ServingList from "./components/ServingList";
import YouTubePlayer from "./components/YouTubePlayer";

const tokens = [
  { number: "B606", counter: "Counter 1", status: "Waiting..." },
  { number: "A215", counter: "Counter 3", status: "Waiting..." },
  { number: "C001", counter: "Counter 2", status: "Calling" },
  // ... more token objects
];

function App() {
  const [LOCAL_IP, setIp] = useState(null);
  const [title, setTitle] = useState("");
  const [showIpPrompt, setShowIpPrompt] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data?.ipUrl) {
          setIp(data.ipUrl);
        }
      } catch (e) {}
    };

    window.addEventListener("message", handleMessage);

    // ⏱ if IP not received, show popup
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

  const fetchAppDetails = async (LOCAL_IP) => {
    try {
      const res = await fetch(`http://${LOCAL_IP}:8000/api/app-details`);
      const json = await res.json();
      setTitle(json?.name);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  useEffect(() => {
    if (LOCAL_IP) {
      fetchAppDetails(LOCAL_IP);
    }
  }, [LOCAL_IP]);

  const [isDark, setIsDark] = useState(true);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const [footerContent, setFooterContent] = useState(
    " • For ticket verification, please present your ID at Counter 1. • Mortgage inquiries, please take a ticket from Kiosk B. • Operating hours: 09:00 - 17:00. • Thank you for your patience. • Please keep your mask on at all times."
  );

  const [showNowServing, setShowNowServing] = useState(true);

  // 2. useEffect to manage the 5-second timer
  useEffect(() => {
    // Set a timer to switch to the video after 5000 milliseconds (5 seconds)
    const timer = setTimeout(() => {
      setShowNowServing(false);
    }, 5000);

    // Cleanup function: Clear the timeout if the component unmounts or state changes
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this effect runs once after the initial render

  // --- Optional: Add a timer to loop back to the card after the video plays ---
  // You might want the card to show up again later. Let's say video shows for 25 seconds.
  useEffect(() => {
    if (!showNowServing) {
      const resetTimer = setTimeout(() => {
        setShowNowServing(true);
      }, 25000); // Show video for 25 seconds, then switch back to the card

      return () => clearTimeout(resetTimer);
    }
  }, [showNowServing]); // Reruns when showNowServing changes

  return (
    <>
      {showIpPrompt && !LOCAL_IP && <IpPromptModal onSubmit={handleIpSubmit} />}

      {LOCAL_IP && (
        <div className="bg-background-dark text-white transition-colors duration-300 min-h-screen flex flex-col font-sans dark selection:bg-primary selection:text-white">
          <Header title={title} />
          <main className="flex-grow flex flex-row h-[calc(100vh-104px)] relative">
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
            <div className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col justify-center items-center relative z-10 w-2/3">
              {showNowServing ? (
                <NowServingCard
                  token={{
                    token: `B605`,
                    counter: `08`,
                    service: `Reception`,
                  }}
                />
              ) : (
                <YouTubePlayer videoId={youtubeVideoId || "84BNaEVxLd8"} />
              )}
            </div>
            <ServingList tokens={tokens} />
          </main>
          <Footer content={footerContent} />
        </div>
      )}
    </>
  );
}

export default App;
