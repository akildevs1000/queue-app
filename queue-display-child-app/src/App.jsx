import { useEffect, useState } from "react";
import QueueDisplay from "./components/QueueDisplay";

// Boot sequence duration
const BOOT_DURATION = 2500; // 2.5 seconds

function App() {
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [title, setTitle] = useState("EMIRATES ISLAMIC BANK");
  const [bootProgress, setBootProgress] = useState(0);

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
  // if (!isAppLoaded) {
  //   return (
  //     <div style={styles.bootContainer}
  //       className="
  //     bg-gradient-to-tr from-brand-navy-deep via-brand-navy-mid to-brand-navy-deep bg-[length:200%_200%] animate-gradient-bg
  //     "
  //     >
  //       <h1 style={styles.title}>{title}</h1>
  //       <div style={styles.progressBar}>
  //         <div style={{ ...styles.progressFill, width: `${bootProgress}%` }} />
  //       </div>
  //       <p style={styles.progressText}>
  //         Loading... {Math.floor(bootProgress)}%
  //       </p>
  //     </div>
  //   );
  // }

  // MAIN APP
  return (
    <div style={styles.appContainer}>
      <QueueDisplay title={title} />
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




