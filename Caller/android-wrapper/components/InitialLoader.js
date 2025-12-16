import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { preloadAudioAndTTS } from "../hooks/tts";

export default function InitialLoader({ onFinish = () => { } }) {

  const [audioReady, setAudioReady] = useState(false);
  // Audio Preload
  useEffect(() => {
    const preloadAudioAndTTSResources = async () => {
      const result = await preloadAudioAndTTS();
      setAudioReady(result);
    };
    preloadAudioAndTTSResources();
  }, []);

  const progress = useRef(new Animated.Value(0)).current;
  const [label] = useState("Initializing display..."); // Fixed label

  useEffect(() => {

    Animated.timing(progress, {
      toValue: 1,
      duration: 3500, // 3.5 seconds
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        onFinish();
      }
    });
  }, []);

  const widthAnim = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.loaderBox}>
        <View style={styles.progressWrapper}>
          <Animated.View style={[styles.progressBar, { width: widthAnim }]} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1024",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderBox: {
    width: "65%",
    alignItems: "center",
  },
  progressWrapper: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 15,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#67E8F9",
    borderRadius: 20,
  },
  label: {
    color: "#E0E0E0",
    fontSize: 18,
    marginTop: 4,
    textAlign: "center",
  },
});