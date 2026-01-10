import React, { useState, useRef, useEffect } from "react";
import { loginWithPin } from "./api/auth";

// --- Reused Helper Components (Define these outside the main component) ---

const PinInputBox = React.forwardRef(({ value, isFocused, isError }, ref) => (
  <input
    ref={ref}
    readOnly
    value={value}
    type="password"
    maxLength="1"
    placeholder="•"
    // Updated classes to match the new theme's surfaces and borders
    className={`
      w-14 h-16 text-center text-3xl font-bold rounded-xl transition-all shadow-md
      bg-slate-50 dark:bg-slate-800 
      text-slate-900 dark:text-white 
      placeholder-slate-300 dark:placeholder-slate-600 
      focus:outline-none focus:ring-0
      ${
        isFocused
          ? "border-2 border-indigo-500 focus:border-indigo-500 shadow-indigo-200 dark:shadow-indigo-900/50"
          : "border-2 border-slate-200 dark:border-slate-700"
      }
      ${isError ? "border-rose-500 dark:border-rose-400" : ""}
    `}
  />
));

const NumpadButton = ({ value, isDelete, onClick }) => {
  // Use a slightly softer shadow and scale on click to match theme feel
  const baseClasses =
    "h-14 w-full rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center justify-center";

  // Updated number classes to match the new theme's secondary buttons/surfaces
  const numberClasses = `
    bg-slate-100 dark:bg-slate-800 
    hover:bg-indigo-50 dark:hover:bg-indigo-900/20 
    hover:text-indigo-600 dark:hover:text-indigo-400 
    text-xl font-semibold text-slate-700 dark:text-slate-200
  `;

  // Updated styles for backspace/delete key
  const deleteClasses = `
    bg-slate-100 dark:bg-slate-800
    hover:bg-rose-50 dark:hover:bg-rose-900/20 
    hover:text-rose-500 dark:hover:text-rose-400 
    text-slate-700 dark:text-slate-200
  `;

  return (
    <button
      className={`${baseClasses} ${isDelete ? deleteClasses : numberClasses}`}
      onClick={onClick}
    >
      {isDelete ? (
        <span className="material-symbols-outlined text-[22px]">backspace</span>
      ) : (
        value
      )}
    </button>
  );
};

// --- Main Page Component ---

const StaffLoginPage = ({ ip, onLoginSuccess }) => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(null);
  const pinInputRefs = useRef([]);

  const PIN_LENGTH = 4;
  const currentPinLength = pin.filter((val) => val !== "").length;
  const currentlyFocusedIndex = pin.findIndex((val) => val === "");
  const isPinComplete = currentPinLength === PIN_LENGTH;

  // Effect to manage focus on the next available input box
  useEffect(() => {
    // Only focus if the PIN isn't complete and there is an input to focus
    if (
      currentlyFocusedIndex >= 0 &&
      pinInputRefs.current[currentlyFocusedIndex]
    ) {
      pinInputRefs.current[currentlyFocusedIndex].focus();
    }
  }, [pin, currentlyFocusedIndex]);

  // Handle number button click
  const handlePinEntry = (number) => {
    setError(null);
    if (!isPinComplete) {
      const newPin = [...pin];
      // Only update if the current position is empty
      if (newPin[currentlyFocusedIndex] === "") {
        newPin[currentlyFocusedIndex] = number;
        setPin(newPin);
      }
    }
  };

  // Handle backspace/delete button click
  const handleDelete = () => {
    setError(null);
    // Find the last filled index
    let indexToClear = PIN_LENGTH - 1;
    // If the PIN is complete, we clear the last one
    if (isPinComplete) {
      indexToClear = PIN_LENGTH - 1;
    } else {
      // If PIN is not complete, we clear the index right before the current focus/empty slot
      indexToClear = currentlyFocusedIndex - 1;
    }

    if (indexToClear >= 0) {
      const newPin = [...pin];
      newPin[indexToClear] = "";
      setPin(newPin);
    }
  };

  const handleLogin = async () => {
    const fullPin = pin.join("");

    if (fullPin.length !== PIN_LENGTH) return;

    try {
      setError(null);
      await loginWithPin(ip, fullPin);
      onLoginSuccess(); // move to next screen
    } catch (err) {
      setError(err.message);
      setPin(["", "", "", ""]);
    }
  };

  // Numpad layout: 1-9, spacer, 0, backspace
  const numpadKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    // Outer container matching the new theme's structure and background
    <div className="dark:bg-background-dark bg-background-light text-slate-700 dark:text-slate-200 font-display transition-colors duration-300 min-h-screen flex items-center justify-center p-4">
      {/* Login Card - Using the new theme's card styling (rounded-3xl, shadow, borders) */}
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col p-8 gap-8 border border-slate-200 dark:border-slate-800 relative z-10">
        {/* Header Section: Profile & Info */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            {/* Profile Picture Styling with new theme colors */}
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full h-24 w-24 border-[4px] border-indigo-500 shadow-xl shadow-indigo-200/50 dark:shadow-indigo-900/50"
              data-alt="Staff Profile Picture"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsoZAOZZlo0GAobK6jgwgD9EnZ3S8jLvxnTQUBYoeFsFVduIMh89msfI3X8RXsME61Ms7Ybu4AhNtbquOp44Zyvo42KwGYfIhbs-P8vDziuTlpsHO0E25OL5_nWTN1LZXtv1InfcnKg1X35ryjJV0YJskeppi2iKOceUJi96phDdbx7U_p60JsBBEJCuBnhhEvvbqCXKtrlGdQ5UDZGzC_XiQqTxpoDOex6VPCpk70wpPcF2_lK-GG2l59MIzXAfGg59m5fydfOU0')`,
              }}
            ></div>
          </div>
        </div>

        {/* Instruction Text */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            Staff Access
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Enter your 4-digit security PIN to access the Queue.
          </p>
        </div>

        {/* PIN Input Display */}
        <div className="flex gap-3 justify-center w-full px-4">
          {pin.map((digit, index) => (
            <PinInputBox
              key={index}
              ref={(el) => (pinInputRefs.current[index] = el)}
              value={digit}
              isFocused={index === currentlyFocusedIndex && !isPinComplete}
              isError={error}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-center font-medium text-rose-500 dark:text-rose-400">
            {error}
          </p>
        )}

        {/* Virtual Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[250px] mx-auto">
          {/* Numpad 1-9 */}
          {numpadKeys.map((num) => (
            <NumpadButton
              key={num}
              value={num}
              onClick={() => handlePinEntry(String(num))}
            />
          ))}
          {/* Row 4: Spacer, 0, Backspace */}
          <div className="h-14 w-full"></div> {/* Spacer for alignment */}
          <NumpadButton value={0} onClick={() => handlePinEntry("0")} />
          <NumpadButton isDelete onClick={handleDelete} />
        </div>

        {/* Action Area */}
        <div className="flex flex-col gap-4 mt-2">
          <button
            onClick={handleLogin}
            disabled={!isPinComplete}
            // Button styling updated to match the primary button style of the new theme
            className={`
              w-full h-12 text-white text-base font-bold rounded-xl transition-all shadow-lg
              flex items-center justify-center gap-2 active:scale-[0.99]
              ${
                isPinComplete
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-300/50 dark:shadow-indigo-900/50"
                  : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none"
              }
            `}
          >
            <span className="material-symbols-outlined text-[20px]">
              lock_open
            </span>
            <span>Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;
