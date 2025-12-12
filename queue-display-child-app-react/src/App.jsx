import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import LanguageCard from "./components/Language";

// Boot sequence duration
const BOOT_DURATION = 2500; // 2.5 seconds

function App() {
  const isElectron = !!window.electronAPI;

  const [darkMode, setDarkMode] = useState(true);

  // Apply dark class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);

  const [title, setTitle] = useState("Initializing.....");
  const [ip, setIp] = useState("");
  const [showIpDialog, setShowIpDialog] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const lastQrRef = useRef(null);

  const [step, setStep] = useState("language");
  const [services, setServices] = useState([]);

  const socketRef = useRef(null);
  const [retrying, setRetrying] = useState(false);
  const socketRetryTimeout = useRef(null);

  useEffect(() => {
    if (isElectron && window.electronAPI?.onGuestIP) {
      // Running inside Electron
      window.electronAPI.onGuestIP((ip) => {
        console.log("Received IP from Electron:", ip);
        setIp(ip);
      });
    } else {
      // Running in Browser
      setIp("192.168.x.x");
      setShowIpDialog(true);
    }
  }, []);

  const [data, setData] = useState({
    language: "",
    service_id: 0,
    service_name: "",
    code: "",
    vip_number: null,
  });

  const fetchServices = async (lang) => {
    try {
      const res = await fetch(
        `http://${ip}:8000/api/service-list?language=${lang}`
      );
      const json = await res.json();
      json.shift();
      setServices(json);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  useEffect(() => {
    if (!ip) return;

    const fetchAppDetails = async () => {
      try {
        const res = await fetch(`http://${ip}:8000/api/app-details`);
        const json = await res.json();
        setTitle(json?.name);
      } catch (err) {
        console.error("Failed to fetch app details", err);
      }
    };

    fetchAppDetails();
  }, [ip]);

  const handleLanguageSelect = (lang) => {
    setData((prev) => ({ ...prev, language: lang }));
    setStep("service");
    fetchServices(lang);
  };

  const handleServiceSelect = (service) => {
    const updatedData = {
      language: data.language,
      service_id: service.id,
      code: service.code,
      service_name: service.name,
    };

    if (qrCode) {
      updatedData.vip_number = qrCode;
    }

    setData(updatedData);
  };

  // WebSocket connection logic
  useEffect(() => {
    if (!ip) return; // only connect if IP is set

    const SOCKET_RETRY_INTERVAL = 30000;

    const connectSocket = () => {
      try {
        setRetrying(false);
        const socket = new WebSocket(`ws://${ip}:7777`);
        socketRef.current = socket;

        socket.addEventListener("open", () => {
          console.log("Connected to WS server");
          setRetrying(false);
          if (socketRetryTimeout.current) {
            clearTimeout(socketRetryTimeout.current);
            socketRetryTimeout.current = null;
          }
        });

        const retrySocket = () => {
          setRetrying(true);
          socketRetryTimeout.current = setTimeout(
            connectSocket,
            SOCKET_RETRY_INTERVAL
          );
        };

        socket.addEventListener("close", retrySocket);
        socket.addEventListener("error", retrySocket);
      } catch (err) {
        setRetrying(true);
        socketRetryTimeout.current = setTimeout(
          connectSocket,
          SOCKET_RETRY_INTERVAL
        );
        console.error("Failed to connect WebSocket", err);
      }
    };

    connectSocket();

    return () => {
      if (socketRetryTimeout.current) {
        clearTimeout(socketRetryTimeout.current);
      }
    };
  }, [ip]);

  // Auto-submit when service selected
  useEffect(() => {
    if (data.service_id) {
      console.log("🚀 ~ Welcome ~ data:", data);

      // Prepare payload
      const payload = {
        language: data.language,
        service_id: data.service_id,
        service_name: data.service_name,
        code: data.code,
        vip_number: data.vip_number,
      };

      fetch(`http://${ip}:8000/api/tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to submit token");
          return res.json();
        })
        .then((responseData) => {
          // Success
          setStep("thankyou");

          const socket = socketRef.current;
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ event: "new-ticket" }));
          } else {
            console.warn("WebSocket is not open.");
          }

          // Reset form and QR code
          setQrCode(null);
          setStep("language");
          setData({
            language: "",
            service_id: 0,
            service_name: "",
            code: "",
            vip_number: null,
          });
        })
        .catch((err) => {
          console.error("Form submission failed", err);
        });
    }
  }, [data]);

  // Update VIP number when QR code changes
  useEffect(() => {
    if (qrCode && qrCode !== lastQrRef.current) {
      const timer = setTimeout(() => {
        console.log("🚀 Updating code with QR value:", qrCode);
        setData((prev) => ({ ...prev, vip_number: qrCode }));
        lastQrRef.current = qrCode;
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [qrCode]);

  useEffect(() => {
    // Increment the boot progress smoothly
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / BOOT_DURATION) * 100, 100);
      setBootProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setIsAppLoaded(true), 300); // small fade-out delay
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // BOOT SCREEN
  if (!isAppLoaded) {
    return (
      <div
        style={styles.bootContainer}
        className="
      bg-gradient-to-tr from-brand-navy-deep via-brand-navy-mid to-brand-navy-deep bg-[length:200%_200%] animate-gradient-bg
      "
      >
        <h1 style={styles.title}>{title}</h1>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${bootProgress}%` }} />
        </div>
        <p style={styles.progressText}>
          Loading... {Math.floor(bootProgress)}%
        </p>
      </div>
    );
  }

  const handleQrCodeChange = async (e) => {
    const newValue = e.target.value;
    setQrCode(newValue);
    console.log("✅ QR Code set:", newValue);
  };

  return (
    <div style={styles.appContainer}>
      <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden">
        {/* Background Gradient & Texture */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-tr from-brand-navy-deep via-brand-navy-mid to-brand-navy-deep bg-[length:200%_200%] animate-gradient-bg"></div>
        <div className="absolute inset-0 -z-20 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.02]"></div>

        {showIpDialog && (
          <div
            className="
      fixed inset-0 
      bg-black/40 backdrop-blur-sm
      flex items-center justify-center
      z-50
    "
          >
            <div
              className="
        bg-brand-navy-mid/40 
        backdrop-blur-xl
        border border-white/10 
        shadow-2xl
        rounded-2xl
        px-6 py-8
        w-[90%] max-w-md
      "
            >
              {/* Title */}
              <h2
                className="
          text-white text-2xl sm:text-3xl 
          font-light tracking-wider 
          mb-6 text-center
        "
              >
                Enter Server IP
              </h2>

              {/* Input */}
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.x.x"
                className="
          w-full 
          px-4 py-3
          rounded-xl
          bg-white/10 
          text-white
          placeholder-white/40
          border border-white/20
          focus:outline-none focus:ring-2 focus:ring-white/40
          mb-6
        "
              />

              {/* Button */}
              <button
                onClick={() => setShowIpDialog(false)}
                className="
          w-full 
          bg-white/20 hover:bg-white/30
          text-white
          font-medium tracking-wide
          py-3 rounded-xl
          transition
        "
              >
                Continue
              </button>
            </div>
          </div>
        )}

         <Header title={title} darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* ✅ Added Hidden QR Input — DOES NOT change layout */}
        <div className="absolute left-[-5000px]">
          <input
            type="text"
            value={qrCode || ""}
            onChange={handleQrCodeChange}
            autoFocus
            className="border-none outline-none"
          />
        </div>
        {/* Main Content */}
        {step === "language" && (
          <main className="flex-1 px-10 py-8 flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
              <LanguageCard
                lang="en"
                label="English"
                darkMode={darkMode}
                handleLanguageSelect={handleLanguageSelect}
              />
              <LanguageCard
                lang="ar"
                label="العربية"
                darkMode={darkMode}
                handleLanguageSelect={handleLanguageSelect}
              />
              <LanguageCard
                lang="fr"
                label="Français"
                darkMode={darkMode}
                handleLanguageSelect={handleLanguageSelect}
              />
              <LanguageCard
                lang="es"
                label="Español"
                darkMode={darkMode}
                handleLanguageSelect={handleLanguageSelect}
              />
            </div>
          </main>
        )}

        {step === "service" && (
          <main className="flex-1 px-10 py-8 flex items-center justify-center">
            <div
              className={`
              grid gap-8 w-full
              ${
                services.length === 1
                  ? "grid-cols-1 max-w-xl justify-items-center"
                  : "grid-cols-1 md:grid-cols-2 max-w-5xl"
              }
            `}
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="relative flex flex-col items-center justify-center rounded-2xl p-8 md:p-7 lg:p-16 xl:p-20 border border-brand-cyan/40 text-white animate-update-highlight overflow-hidden bg-gradient-to-br from-brand-cyan/10 via-transparent to-transparent cursor-pointer"
                >
                  <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-brand-cyan/20 via-transparent to-transparent -z-10"></div>
                  <h2 className="text-2xl lg:text-5xl xl:text-6xl font-light tracking-widest text-brand-cyan/80 mb-4 md:mb-6 lg:mb-8">
                    {service.name}
                  </h2>
                </div>
              ))}
            </div>
          </main>
        )}
      </div>

      {/* WebSocket Status Indicator - Bottom Left */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${
            retrying ? "bg-red-500 animate-pulse" : "bg-green-500"
          }`}
        ></span>
        <span className="text-white text-sm">
          {retrying ? "Reconnecting..." : "Connected"}
        </span>
      </div>
    </div>
  );
}

const styles = {
  bootContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#0A0A0A",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "28px",
    marginBottom: "20px",
    letterSpacing: "2px",
  },
  progressBar: {
    width: "300px",
    height: "10px",
    backgroundColor: "#333",
    borderRadius: "5px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6ea8fe",
    transition: "width 0.1s linear",
  },
  progressText: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#bbb",
  },
  appContainer: {
    height: "100vh",
  },
};

export default App;
