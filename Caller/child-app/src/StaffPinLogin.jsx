import React, { useState, useRef, useEffect } from "react";

// --- Reused Helper Components (Define these outside the main component) ---

const PinInputBox = React.forwardRef(({ value, isFocused, isError }, ref) => (
  <input
    ref={ref}
    readOnly
    value={value}
    type="password"
    maxLength="1"
    placeholder="•"
    // Classes match the queue app's theme (using dark:bg-surface-dark variations)
    className={`
      w-14 h-16 text-center text-3xl font-bold rounded-lg transition-all shadow-sm
      bg-slate-50 dark:bg-[#111922] 
      text-slate-900 dark:text-white 
      placeholder-slate-300 dark:placeholder-slate-600 
      focus:outline-none focus:ring-0
      ${
        isFocused
          ? "border-2 border-primary focus:border-primary"
          : "border-2 border-slate-200 dark:border-slate-700"
      }
      ${isError ? "border-rose-500 dark:border-rose-400" : ""}
    `}
  />
));

const NumpadButton = ({ value, isDelete, onClick }) => {
  const baseClasses =
    "h-14 w-full rounded-lg transition-all shadow-sm active:scale-95 flex items-center justify-center";

  // Custom dark classes for numpad buttons from original HTML:
  const numberClasses = `
    bg-slate-100 dark:bg-[#252D36] 
    hover:bg-slate-200 dark:hover:bg-[#323D49] 
    hover:text-primary dark:hover:text-primary 
    text-xl font-semibold text-slate-700 dark:text-slate-200
  `;

  // Custom styles for backspace/delete key
  const deleteClasses = `
    bg-slate-100 dark:bg-[#252D36]
    hover:bg-rose-100 dark:hover:bg-rose-900/30 
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

const StaffLoginPage = () => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const pinInputRefs = useRef([]);

  const PIN_LENGTH = 4;
  const currentlyFocusedIndex = pin.findIndex((val) => val === "");
  const isPinComplete = pin.every((val) => val !== "");

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
    setError(false);
    if (!isPinComplete) {
      const newPin = [...pin];
      newPin[currentlyFocusedIndex] = number;
      setPin(newPin);
    }
  };

  // Handle backspace/delete button click
  const handleDelete = () => {
    setError(false);
    // Find the last filled index
    let lastFilledIndex = PIN_LENGTH - 1;
    while (lastFilledIndex >= 0 && pin[lastFilledIndex] === "") {
      lastFilledIndex--;
    }

    if (lastFilledIndex !== -1) {
      const newPin = [...pin];
      newPin[lastFilledIndex] = "";
      setPin(newPin);
    }
  };

  // Handle login
  const handleLogin = () => {
    const fullPin = pin.join("");

    if (fullPin.length === PIN_LENGTH) {
      console.log(`Attempting login with PIN: ${fullPin}`);

      // --- Simulated Authentication ---
      if (fullPin === "1234") {
        console.log("Login Successful!");
        alert("Login Successful! You can now access the queue screen.");
        // In a real app, this would trigger navigation
      } else {
        setError(true);
        setPin(["", "", "", ""]); // Clear PIN on error
      }
      // ---------------------------------------------
    }
  };

  // Numpad layout: 1-9, spacer, 0, backspace
  const numpadKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    // Outer container matching the theme of the original queue screen
    <div className="dark:bg-background-dark bg-background-light text-slate-700 dark:text-slate-200 font-display transition-colors duration-300 min-h-screen flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-surface-dark rounded-xl shadow-2xl overflow-hidden flex flex-col p-8 gap-8 border border-slate-200 dark:border-slate-800 relative z-10">
        {/* Header Section: Profile & Station Info */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full h-24 w-24 border-[3px] border-primary shadow-lg"
              data-alt="Profile picture of the current staff member or generic avatar"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsoZAOZZlo0GAobK6jgwgD9EnZ3S8jLvxnTQUBYoeFsFVduIMh89msfI3X8RXsME61Ms7Ybu4AhNtbquOp44Zyvo42KwGYfIhbs-P8vDziuTlpsHO0E25OL5_nWTN1LZXtv1InfcnKg1X35ryjJV0YJskeppi2iKOceUJi96phDdbx7U_p60JsBBEJCuBnhhEvvbqCXKtrlGdQ5UDZGzC_XiQqTxpoDOex6VPCpk70wpPcF2_lK-GG2l59MIzXAfGg59m5fydfOU0')`,
              }}
            ></div>
          </div>
        </div>

        {/* Instruction Text */}
        <div className="text-center">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Staff Access
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Enter your 4-digit security PIN to access
          </p>
        </div>

        {/* PIN Input Display */}
        <div className="flex gap-4 justify-center w-full px-4">
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
            Invalid PIN. Please try again (Demo PIN: 1234).
          </p>
        )}

        {/* Virtual Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
          {/* Numpad 1-9 */}
          {numpadKeys.map((num) => (
            <NumpadButton
              key={num}
              value={num}
              onClick={() => handlePinEntry(String(num))}
            />
          ))}
          {/* Row 4: Spacer, 0, Backspace */}
          <div className="h-14 w-full"></div> {/* Spacer */}
          <NumpadButton value={0} onClick={() => handlePinEntry("0")} />
          <NumpadButton isDelete onClick={handleDelete} />
        </div>

        {/* Action Area */}
        <div className="flex flex-col gap-4 mt-2">
          <button
            onClick={handleLogin}
            disabled={!isPinComplete}
            className={`
              w-full h-12 text-white text-base font-bold rounded-lg transition-all shadow-md 
              flex items-center justify-center gap-2 active:scale-[0.99]
              ${
                isPinComplete
                  ? "bg-primary hover:bg-indigo-700 shadow-primary/30"
                  : "bg-slate-400 dark:bg-slate-700 cursor-not-allowed shadow-none"
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
