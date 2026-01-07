import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import LanguageCard from "./components/Language";
import ServiceCard from "./components/ServiceCard";
import SocketIndicator from "./components/SocketIndicator";
import IpDialog from "./components/IpDialog";
import BootScreen from "./components/BootScreen";
import TicketPrintingIndicator from "./components/TicketPrintingIndicator";
import Back from "./components/Back";
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
      <div className="bg-gray-100 dark:bg-background-dark text-slate-800 dark:text-slate-100 min-h-screen font-sans">
        <IpDialog
          darkMode={darkMode}
          open={showIpDialog}
          ip={ip}
          setIp={setIp}
          onClose={() => setShowIpDialog(false)}
          onLanguagesChange={(langs) => setSelectedLanguages(langs)}
        />

        <Header title={title} darkMode={darkMode} setDarkMode={setDarkMode} />

        <header className="w-full px-8 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111a2f] shadow-sm z-20 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20">
              <span className="material-icons-round text-3xl">
                confirmation_number
              </span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                SmartQueue<span className="text-indigo-500">.</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">
                  System Online
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Current Time
              </p>
              <div className="flex items-baseline justify-end gap-2">
                <p className="text-2xl font-mono font-bold text-slate-800 dark:text-white tracking-widest leading-none mt-1">
                  20:56
                </p>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  54
                </span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
            <button
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
              id="theme-toggle"
            >
              <span className="material-icons-round">dark_mode</span>
            </button>
          </div>
        </header>

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

        <main className="flex-grow flex justify-center p-6 md:p-10 relative">
          {/* Global Background */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-40 dark:opacity-20 mix-blend-screen"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] opacity-40 dark:opacity-20 mix-blend-screen"></div>
          </div>

          {/* LANGUAGE STEP */}
          {step === "language" && (
            <div className="w-full max-w-7xl flex flex-col justify-center min-h-[80vh]">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Language Selection
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
          )}
        </main>

        {/* SERVICE STEP */}
        {step === "service" && <Services services={services} />}
        {/* {step === "service" && (
            <div className="w-full max-w-7xl flex flex-col justify-center min-h-[80vh]">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Service Selection
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl">
                  Monitor real-time status and wait times across all service departments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    index={index}
                    service={service}
                    darkMode={darkMode}
                    onSelect={handleServiceSelect}
                  />
                ))}
              </div>
            </div>
          )} */}

        <footer className="w-full px-8 py-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111a2f] z-20">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Server: <SocketIndicator retrying={retrying} />
              </span>
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
                class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white pl-1 pr-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span class="material-icons-round text-lg">chevron_left</span>
                Back
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
