import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  BackHandler,
  StyleSheet,
  StatusBar,
  Animated, Easing
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import styles from './styles';


// IMPORT YOUR HEADER
import Header from './components/Header';
import LiveToken from './components/LiveToken';
import ServingList from './components/ServingList';


export default function Welcome() {

  // --- EXISTING LOGIC ---
  const shouldAnnounceOnConnectRef = useRef(false);
  const tokenSound = useRef(null);
  const ttsWarmedRef = useRef(false);
  const [audioReady, setAudioReady] = useState(false);
  const cachedVoices = useRef({ ar: null, en: null, fr: null, es: null });

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

  const reconnectTimeoutRef = useRef("");
  useKeepAwake();
  const ws = useRef("");
  const [ip, setIp] = useState("192.168.2.88");
  const [port, setPort] = useState("8000");
  const [loading, setLoading] = useState(false);
  // Initialize with dummy data to visualize the design
  const [tokens, setTokens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [wsStatus, setWsStatus] = useState('');
  const [currenToken, setCurrenToken] = useState('');


  // Back Handler
  useEffect(() => {
    const backPressCountRef = { count: 0 };
    let timeoutId = null;
    const handleBackPress = () => {
      backPressCountRef.count += 1;
      if (timeoutId) clearTimeout(timeoutId);
      if (backPressCountRef.count >= 3) {
        setShowModal(true);
        backPressCountRef.count = 0;
        return true;
      }
      timeoutId = setTimeout(() => { backPressCountRef.count = 0; }, 2000);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  // IP/Port Logic
  const loadIpPort = async () => {
    const sIp = await AsyncStorage.getItem('ip');
    const sPort = await AsyncStorage.getItem('port');
    if (sIp) setIp(sIp);
    if (sPort) setPort(sPort);
    if (!sIp) setShowModal(true);
    else getSocketConnection({ ip: sIp, port: sPort });
  };

  const saveIpPort = async () => {
    if (!ip || !port) return;
    setLoading(true);
    try {
      await AsyncStorage.setItem('ip', ip);
      await AsyncStorage.setItem('port', port);
      setShowModal(false);
      shouldAnnounceOnConnectRef.current = true;
      getSocketConnection({ ip, port });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const announceTheToken = (token, counter, language = "en") => {
    if (!token) return;
    const messages = {
      ar: `الرقم ${token}، يرجى التوجه إلى ${counter}.`,
      en: `Token ${token}, please proceed to the ${counter}.`,
    };
    const message = messages[language] || messages["en"];
    const speak = () => Speech.speak(message, { language: language === 'ar' ? 'ar' : 'en-US' });

    if (tokenSound.current) {
      tokenSound.current.replayAsync();
      setTimeout(() => speak(), 1000);
    } else { speak(); }
  };

  const safeReconnect = ({ ip, port }) => {
    if (reconnectTimeoutRef.current) return;
    reconnectTimeoutRef.current = setTimeout(() => {
      setWsStatus('🔄 Reconnecting...');
      getSocketConnection({ ip, port });
      reconnectTimeoutRef.current = null;
    }, 5000);
  };

  const getSocketConnection = ({ ip, port }) => {
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(`ws://${ip}:7777?clientId=tv_display`);

    ws.current.onopen = () => {
      setWsStatus('Connected');
      if (shouldAnnounceOnConnectRef.current) {
        Speech.speak("Connected", { language: 'en-US' });
        shouldAnnounceOnConnectRef.current = false;
      }
      setTimeout(() => setWsStatus(''), 2000);
    };

    ws.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const { event: eventType, data: tokenData } = parsed;

        if (eventType === 'token-serving' && tokenData) {

          setCurrenToken(parsed.data)

          setTokens(prev => {
            const clean = prev.filter(t => t.token !== tokenData.token);
            return [tokenData, ...clean].slice(0, 10); // Keep last 10
          });
          announceTheToken(tokenData.token, tokenData.counter, tokenData.language);
        }
      } catch (e) { console.log(e); }
    };

    ws.current.onerror = () => safeReconnect({ ip, port });
    ws.current.onclose = () => safeReconnect({ ip, port });
  };

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    loadIpPort();
    return () => { if (ws.current) ws.current.close(); }
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar hidden />

      {/* 2. HEADER */}
      <View style={{ zIndex: 10 }}>
        <Header />
      </View>

      {/* 3. MAIN CONTENT GRID */}
      <View style={styles.gridContainer}>

        {/* === LEFT COLUMN (8/12) === */}
        <View style={styles.leftColumn}>
          <LiveToken currentToken={tokens[0]} nextToken={tokens[1]}></LiveToken>
        </View>

        {/* === RIGHT COLUMN (4/12) - SERVING LIST === */}
        <View style={styles.rightColumn}>
          <ServingList tokens={tokens} />
        </View>

      </View>


      {/* 4. SETTINGS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Configuration</Text>
            <TextInput value={ip} onChangeText={setIp} style={styles.modalInput} placeholder="IP Address" placeholderTextColor="#666" />
            <TextInput value={port} onChangeText={setPort} style={styles.modalInput} placeholder="Port" placeholderTextColor="#666" />
            <View style={styles.modalButtons}>
              <Pressable style={styles.btnCancel} onPress={() => setShowModal(false)}><Text style={styles.btnText}>Cancel</Text></Pressable>
              <Pressable style={styles.btnSave} onPress={saveIpPort}><Text style={styles.btnTextBold}>Save</Text></Pressable>
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