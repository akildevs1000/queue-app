import { useEffect, useState } from "react";
import QueueDisplay from "./components/QueueDisplay";

function App() {

  const [title, setTitle] = useState("App Name");
  const [ip, setIp] = useState("");

  const fetchAppDetails = async () => {
    try {
      const res = await fetch(`http://${ip}:8000/api/app-details`);
      const json = await res.json();
      setTitle(json?.name);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  useEffect(() => {
    if (ip) {
      fetchAppDetails();
    }
  }, [ip]);

  return (
    <div style={styles.appContainer}>
      <QueueDisplay title={title} />
    </div>
  );
}

const styles = {
 
  appContainer: {
    height: "100vh",
  },
};

export default App;
