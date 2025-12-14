import React, { useState, useCallback, useEffect } from "react";
import CallerScreen from "./CallerScreen";
import StaffPinLogin from "./StaffPinLogin";
import "./index.css";
import { logout } from "./api/auth";

function App() {

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sync React state with HTML class on initial load and change
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // start as true

  // Check if token exists on mount
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Simulate token validation delay if needed
      setTimeout(() => {
        setIsLoggedIn(true);
        setIsLoading(false);
      }, 500); // optional delay
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoading(true);
    // small delay to simulate login process
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
    }, 300);
  }, []);


  const handleLogout = async () => {
    await logout();
    setIsLoading(true);
    // small delay to simulate logout process
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
    }, 300);
  };

  if (isLoading) {
    // You can replace this with any loader/spinner component
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
      {isLoggedIn ? (
        <CallerScreen handleLogout={handleLogout} toggleDarkMode={toggleDarkMode} isDark={isDark} />
      ) : (
        <StaffPinLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
