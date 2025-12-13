// src/App.jsx
import React, { useState, useCallback } from "react";
import CallerScreen from "./CallerScreen";
import "./index.css"; // Make sure your main CSS is imported
import StaffPinLogin from "./StaffPinLogin";

function App() {
  // 1. Create state to track authentication status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 2. Define the callback function to update the state
  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {/* 3. Conditionally render components based on state */}
      {isLoggedIn ? (
        // Show CallerScreen if logged in
        <CallerScreen onLogout={handleLogout} />
      ) : (
        // Show StaffPinLogin if not logged in, passing the callback
        <StaffPinLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
