// hooks/useSound.js
import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";

export default function useSound() {
  const soundRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/1.wav")   // 👈 WAV file loaded here
        );

        if (!isMounted) return;

        soundRef.current = sound;
        setAudioReady(true);
      } catch (err) {
        console.log("Sound preload error:", err);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  return { soundRef, audioReady };
}
