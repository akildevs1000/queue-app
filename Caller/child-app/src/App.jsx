import React, { useState, useCallback, useEffect } from "react";
import CallerScreen from "./CallerScreen";
import StaffPinLogin from "./StaffPinLogin";
import IpPromptModal from "./components/IpPromptModal";
import "./index.css";
import { logout } from "./api/auth";

function App() {
  const [LOCAL_IP, setIp] = useState(null);
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

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleDarkMode = () => setIsDark((p) => !p);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setTimeout(() => {
        setIsLoggedIn(true);
        setIsLoading(false);
      }, 500);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 300);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      {showIpPrompt && !LOCAL_IP && (
        <IpPromptModal onSubmit={handleIpSubmit} />
      )}

      {LOCAL_IP && (
        isLoggedIn ? (
          <CallerScreen
            ip={LOCAL_IP}
            handleLogout={handleLogout}
            toggleDarkMode={toggleDarkMode}
            isDark={isDark}
          />
        ) : (
          <StaffPinLogin
            ip={LOCAL_IP}
            onLoginSuccess={handleLoginSuccess}
          />
        )
      )}
    </>
  );
}

export default App;