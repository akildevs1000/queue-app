import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import LanguageCard from "./components/Language";
import IpDialog from "./components/IpDialog";
import BootScreen from "./components/BootScreen";
import TicketPrintingIndicator from "./components/TicketPrintingIndicator";
import back from "./assets/back.png";
import Services from "./components/Services";

// Boot sequence duration
const BOOT_DURATION = 2500; // 2.5 seconds

function App() {
  const isElectron = !!window.electronAPI;

  const [darkMode, setDarkMode] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  // Apply dark class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  const [selectedLanguages, setSelectedLanguages] = useState([]);

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
    if (isElectron && window.electronAPI?.onGuest) {
      // Running inside Electron
      window.electronAPI.onGuest((data) => {
        console.log("Received IP from Electron:", data);
        setIp(data.ip);
        setSelectedLanguages(data.languages);
      });
    } else {
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

  const connectSocket = (currentIp) => {
    try {
      setRetrying(false);

      const socket = new WebSocket(`ws://${currentIp}:7777`);
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        console.log("✅ Connected to WS server:", currentIp);
        setRetrying(false);

        if (socketRetryTimeout.current) {
          clearTimeout(socketRetryTimeout.current);
          socketRetryTimeout.current = null;
        }
      });

      const retrySocket = () => {
        setRetrying(true);
        socketRetryTimeout.current = setTimeout(
          () => connectSocket(currentIp),
          SOCKET_RETRY_INTERVAL
        );
      };

      socket.addEventListener("close", retrySocket);
      socket.addEventListener("error", retrySocket);
    } catch (err) {
      console.error("WS connect failed", err);
    }
  };

  useEffect(() => {
    if (!ip) return;

    connectSocket(ip);

    return () => {
      if (socketRetryTimeout.current) {
        clearTimeout(socketRetryTimeout.current);
        socketRetryTimeout.current = null;
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
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
          setIsPrinting(true);

          const socket = socketRef.current;
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ event: "new-ticket" }));
          } else {
            console.warn("WebSocket is not open.");
          }

          // 2. Set the 3-second timer
          setTimeout(() => {
            // 3. Logic executed after 3 seconds (Closing/Reset)

            // A. Hide the printing indicator
            setIsPrinting(false);

            // B. Reset form and return to the starting screen
            setQrCode(null);
            setStep("language");
            setData({
              language: "",
              service_id: 0,
              service_name: "",
              code: "",
              vip_number: null,
            });

            // NOTE: If you need to physically close the browser window or kiosk app:
            // window.close(); // Use with caution, browser permissions apply
          }, 2000); // 3000 milliseconds = 3 seconds
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
  if (!isAppLoaded)
    return <BootScreen title={title} bootProgress={bootProgress} />;

  if (isPrinting) return <TicketPrintingIndicator isPrinting={isPrinting} />;

  const handleQrCodeChange = async (e) => {
    const newValue = e.target.value;
    setQrCode(newValue);
    console.log("✅ QR Code set:", newValue);
  };

  return (
    <div style={styles.appContainer}>
      <div className="bg-gray-100 dark:bg-background-dark text-slate-800 dark:text-slate-100 min-h-screen font-sans flex flex-col">
        <IpDialog
          darkMode={darkMode}
          open={showIpDialog}
          ip={ip}
          setIp={setIp}
          onClose={() => setShowIpDialog(false)}
          onLanguagesChange={(langs) => setSelectedLanguages(langs)}
        />

        <Header />

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
        {/* Global Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-40 dark:opacity-20 mix-blend-screen"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] opacity-40 dark:opacity-20 mix-blend-screen"></div>
        </div>
        {step === "language" && (
          <main className="flex-grow flex justify-center p-6 md:p-10 relative">
            {/* LANGUAGE STEP */}

            <div className="w-full max-w-7xl flex flex-col justify-center min-h-[80vh]">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Welcome To {title || ""}
                </h1>
                <br />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Select Your Language
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl mx-auto">
                  Please select your preferred language to continue
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedLanguages.map((item) => (
                  <LanguageCard
                    key={item.lang}
                    lang={item.lang}
                    label={item.label}
                    darkMode={darkMode}
                    handleLanguageSelect={handleLanguageSelect}
                  />
                ))}
              </div>
            </div>
          </main>
        )}
        {/* SERVICE STEP */}
        {step === "service" && (
          <main className="flex-grow flex justify-center p-6 md:p-10 relative">
            <div className="w-full max-w-7xl flex flex-col justify-center min-h-[80vh]">
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Welcome To {title || ""}
                </h1>
                <br />
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                  Select Your Service
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                  Please choose a department to retrieve your queue ticket.
                </p>
              </div>

              <Services services={services} onSelect={handleServiceSelect} />
            </div>
          </main>
        )}

        <footer className="mt-auto w-full px-8 py-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111a2f] z-20">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Server: {retrying ? "Reconnecting..." : "Connected"}
              </span>
            </div>
            <div className="hidden sm:flex justify-center md:justify-end mt-2">
              <p className="text-[10px] text-slate-400 dark:text-slate-300 uppercase tracking-widest font-medium">
                Powered by{" "}
                <span className="text-slate-600 dark:text-slate-100 font-semibold hover:text-blue-500 transition-colors duration-300">
                  xtremeguard.org
                </span>
              </p>
            </div>
            {step === "service" && (
              <button
                onClick={() => {
                  console.log(selectedLanguages);
                  setStep("language");
                  setData({
                    language: "",
                    service_id: 0,
                    service_name: "",
                    code: "",
                    vip_number: null,
                  });
                }}
              >
                <img className="w-[120px] object-contain" src={back} alt="" />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    height: "100vh",
  },
};

export default App;
