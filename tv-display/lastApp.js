import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, Modal, Pressable, StatusBar, AppState } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as ScreenOrientation from 'expo-screen-orientation';

// HOOKS
import { announceTheToken } from './hooks/tts';
import useMultiBackPress from './hooks/useMultiBackPress';
import useSound from "./hooks/useSound";

// STYLES
import styles from './styles';

// COMPONENTS
import Header from './components/Header';
import LiveToken from './components/LiveToken';
import ServingList from './components/ServingList';
import InitialLoader from './components/InitialLoader';
import { Audio } from 'expo-av';


export default function Welcome() {

  // --- 1. REFS ---
  const ws = useRef(null);
  const { soundRef, audioReady } = useSound();
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);     // Fixed: Was missing
  const wsStatusTimeoutRef = useRef(null);  // Fixed: Was missing
  const shouldAnnounceOnConnectRef = useRef(false);
  const isIntentionalClose = useRef(false);
  const tokenSound = useRef(null);

  // --- 2. STATE ---
  const [ip, setIp] = useState("192.168.2.88");
  // const [port, setPort] = useState("7777"); // REMOVED: Port is now static 7777
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [wsStatus, setWsStatus] = useState('');
  const [initialize, setInitialize] = useState(true);

  useKeepAwake();

  // Audio Preload
  useEffect(() => {
    const preloadAudioAndTTS = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(require('./assets/1.wav'));
        tokenSound.current = sound;
        Speech.speak(" ", { language: "en-US", rate: 1.0 });
        setAudioReady(true);
      } catch (err) { console.log(err); }
    };
    preloadAudioAndTTS();
    return () => { if (tokenSound.current) tokenSound.current.unloadAsync(); };
  }, []);

  // --- 3. LIFECYCLE: Orientation ---
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  // --- 4. LIFECYCLE: AppState (Reconnect on Foreground) ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App is active, checking WS...');
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
          safeReconnect(ip);
        }
      }
    });
    return () => subscription.remove();
  }, [ip]);

  // --- 5. LIFECYCLE: Initial Load ---
  useEffect(() => {
    loadIp();
    return () => {
      if (ws.current) ws.current.close();
      cleanupTimers();
    };
  }, []);

  // --- 6. LOGIC: Hidden Menu ---
  useMultiBackPress({
    pressCount: 3,
    timeout: 2000,
    onReached: () => setShowModal(true),
  });

  const cleanupTimers = () => {
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (wsStatusTimeoutRef.current) clearTimeout(wsStatusTimeoutRef.current);
  };

  // --- 7. LOGIC: Storage & IP ---
  const loadIp = async () => {
    const sIp = await AsyncStorage.getItem('ip');
    if (sIp) {
      setIp(sIp);
      getSocketConnection(sIp);
      fetchServingItems(sIp);
    } else {
      setShowModal(true); // Force user to enter IP if none exists
    }
  };

  const saveIp = async () => {
    if (!ip) return;
    setLoading(true);
    try {
      await AsyncStorage.setItem('ip', ip);
      setShowModal(false);
      shouldAnnounceOnConnectRef.current = true;
      getSocketConnection(ip);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const safeReconnect = (ip) => {
    if (reconnectTimeoutRef.current) return;
    reconnectTimeoutRef.current = setTimeout(() => {
      setWsStatus('🔄 Reconnecting...');
      getSocketConnection(ip);
      reconnectTimeoutRef.current = null;
    }, 5000);
  };

  const getSocketConnection = (ip) => {
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(`ws://${ip}:7777?clientId=tv_display`);

    ws.current.onopen = () => {
      setWsStatus('Connected');
      if (shouldAnnounceOnConnectRef.current) {
        announceTheToken("", "", "en");
        shouldAnnounceOnConnectRef.current = false;
      }
      setTimeout(() => setWsStatus(''), 2000);
    };

    ws.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const { event: eventType, data: tokenData } = parsed;

        if (eventType === 'token-serving' && tokenData) {
          try {
            const makeBeepSound = async () => {
              const { sound } = await Audio.Sound.createAsync(
                require("./assets/1.wav")
              );

              await sound.playAsync();
            }

            makeBeepSound();

          }
          catch (error) {
            console.log('Error loading or playing sound:', error);
          }
          
          setTokens(prevTokens => {
            const isDuplicate = prevTokens.some(item => item.token === tokenData.token);
            if (isDuplicate) return prevTokens;
            return [tokenData, ...prevTokens];
          });

          announceTheToken(tokenData.token, tokenData.counter, tokenData.language);
        }
      } catch (e) { console.log(e); }
    };

    ws.current.onerror = () => safeReconnect(ip);
    ws.current.onclose = () => safeReconnect(ip);
  };


  const fetchServingItems = async (ip, port = 8000) => {
    try {
      const res = await fetch(`http://${ip}:${port}/api/serving_list`);
      const json = await res.json();
      setTokens(json);
    } catch (e) {
      // console.error('Error saving IP and port', e);
    } finally {
      setLoading(false);
    }
  };

  // --- 9. RENDER ---
  if (initialize) return <InitialLoader onFinish={() => setInitialize(false)} />;

  return (
    <View style={styles.mainContainer}>
      <StatusBar hidden />

      {/* HEADER */}
      <View style={{ zIndex: 10 }}>
        <Header />
      </View>

      {/* MAIN CONTENT GRID */}
      <View style={styles.gridContainer}>
        {/* LEFT COLUMN (8/12) */}
        <View style={styles.leftColumn}>
          <LiveToken currentToken={tokens[0]} nextToken={tokens[1]} />
        </View>

        {/* RIGHT COLUMN (4/12) - SERVING LIST */}
        <View style={styles.rightColumn}>
          <ServingList tokens={tokens} />
        </View>
      </View>

      {/* CONFIGURATION MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Configuration</Text>

            <Text style={{ color: '#ccc', marginBottom: 5 }}>Server IP Address</Text>
            <TextInput
              value={ip}
              onChangeText={setIp}
              style={styles.modalInput}
              placeholder="192.168.X.X"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />

            <Text style={{ color: '#666', fontSize: 12, marginTop: 5 }}>
              Port is set to static: 7777
            </Text>

            <View style={styles.modalButtons}>
              <Pressable style={styles.btnCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.btnSave} onPress={saveIp}>
                <Text style={styles.btnTextBold}>Save & Connect</Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Status Toast */}
      {wsStatus ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{wsStatus}</Text>
        </View>
      ) : null}

    </View>
  );
}