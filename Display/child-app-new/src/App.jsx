import React, { useState, useEffect } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import VideoFeed from "./components/VideoFeed";
import QueueList from "./components/QueueList";
import AnnouncementBar from "./components/AnnouncementBar";

const App = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data for the queue
  const queueData = [
    { id: "A1014", destination: "COUNTER 01", current: true },
    { id: "A1013", destination: "COUNTER 01" },
    { id: "A1012", destination: "COUNTER 01" },
    { id: "A1011", destination: "COUNTER 01" },
    { id: "A1010", destination: "COUNTER 01" },
    { id: "A1009", destination: "COUNTER 01" },
    { id: "A1010", destination: "COUNTER 01" },
    { id: "A1011", destination: "COUNTER 01" },
  ];

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-900 dark:text-text-main overflow-hidden flex flex-col font-display">
      <Header time={currentTime} />

      <main className="flex-1 flex p-6 gap-6 h-[calc(100vh-6rem-3rem)] overflow-hidden">
        <VideoFeed />
        <QueueList tickets={queueData} />
      </main>

      <Footer content="Please have your identification documents ready. Counter 05 is now closed for lunch break. Reminder: The office will close at 5:00 PM today. Thank you for your patience." />

      {/* <AnnouncementBar message="Please have your identification documents ready. Counter 05 is now closed for lunch break. Reminder: The office will close at 5:00 PM today. Thank you for your patience." /> */}
    </div>
  );
};

export default App;
