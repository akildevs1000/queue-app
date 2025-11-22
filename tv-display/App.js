// Welcome.js
import { useEffect, useState, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Audio, Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import styles from './styles';
import { useKeepAwake } from 'expo-keep-awake';

import {
  AppState,
  View,
  Text,
  FlatList,
  Dimensions,
  TextInput,
  Modal,
  Pressable,
  Image,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  DevSettings,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const videoHeight = screenHeight;
const videoWidth = screenWidth;

export default function Welcome() {

  const shouldAnnounceOnConnectRef = useRef(false);
  const tokenSound = useRef(null);
  const cachedVoices = useRef({ ar: null, en: null, fr: null, es: null });

  useEffect(() => {
    const preloadTTS = async () => {
      try {
        // 1) Preload beep sound
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/1.wav')
        );
        tokenSound.current = sound;

        // 2) Preload voices
        const voices = await Speech.getAvailableVoicesAsync();

        const findVoice = (langPrefix) =>
          voices.find((v) =>
            v.language.toLowerCase().startsWith(langPrefix.toLowerCase())
          );

        // Arabic
        const arVoice = findVoice("ar");
        if (arVoice) {
          cachedVoices.current.ar = {
            language: arVoice.language,
            voice: arVoice.identifier,
          };
        }

        // English
        const enVoice = findVoice("en");
        if (enVoice) {
          cachedVoices.current.en = {
            language: enVoice.language,
            voice: enVoice.identifier,
          };
        }

        // French
        const frVoice = findVoice("fr");
        if (frVoice) {
          cachedVoices.current.fr = {
            language: frVoice.language,
            voice: frVoice.identifier,
          };
        }

        // Spanish
        const esVoice = findVoice("es");
        if (esVoice) {
          cachedVoices.current.es = {
            language: esVoice.language,
            voice: esVoice.identifier,
          };
        }

      } catch (err) {
        console.log("Error preloading TTS:", err);
      }
    };

    preloadTTS();

    return () => {
      if (tokenSound.current) tokenSound.current.unloadAsync();
    };
  }, []);


  const [showReloadBar, setShowReloadBar] = useState(false);
  // Reconnect control
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef("");
  const MAX_RECONNECT_ATTEMPTS = 2;
  const RECONNECT_DELAY = 30000; // 30 seconds
  // Track which modal button is focused for TV remote navigation
  const [focusedButton, setFocusedButton] = useState('cancel');

  useKeepAwake();


  const currentIndexRef = useRef(0);
  const flatListRef = useRef("");
  const timeoutRef = useRef("");
  const ws = useRef("");
  const pingIntervalRef = useRef("");

  const [ip, setIp] = useState("192.168.3.244");
  const [port, setPort] = useState("8000");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [info, setInfo] = useState("");
  const [media, setMedia] = useState({
    media_type: "image",
    media_url: [],
    width: videoWidth / 2,
    height: videoHeight,
  });

  const [showModal, setShowModal] = useState(true);
  const [displayToken, setDisplayToken] = useState(null);

  const [wsStatus, setWsStatus] = useState('');
  const wsStatusTimeoutRef = useRef(null);


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

      timeoutId = setTimeout(() => {
        backPressCountRef.count = 0;
      }, 2000);

      return true; // prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => {
      backHandler.remove(); // ✅ Correct way to clean up
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const loadIpPort = async () => {
    const ip = await AsyncStorage.getItem('ip');
    const port = await AsyncStorage.getItem('port');
    setIp(ip ?? "");
    setPort(port ?? "");
    setShowModal(true);
  };

  const saveIpPort = async () => {
    if (!ip || !port) return;
    setLoading(true);

    try {
      await AsyncStorage.setItem('ip', ip);
      await AsyncStorage.setItem('port', port);

      setIp(ip);
      setPort(port);
      setShowModal(false);

      // Fetch settings & data
      fetchTvSettings(ip, port);
      fetchServingItems(ip, port);

      // ✅ User explicitly pressed Save → announce on next successful connect
      shouldAnnounceOnConnectRef.current = true;
      getSocketConnection({ ip, port });

    } catch (e) {
      console.error('Error saving IP and port', e);
    } finally {
      setLoading(false);
    }
  };


  const fetchServingItems = async (ip, port) => {
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

  const fetchTvSettings = async (ip, port) => {
    try {
      const res = await fetch(`http://${ip}:${port}/api/fetch_tv_settings`);
      const json = await res.json();
      setInfo(json);
      setMedia({
        ...json,
        height: json?.media_height || videoHeight,
        width: json?.media_width / 2 || videoWidth / 2,
      });
    } catch (e) {
      // console.error('Error saving IP and port', e);
    } finally {
      setLoading(false);
    }
  };

  const playConnectAnnouncement = async (language = "en") => {
    const messages = {
      ar: "تم الاتصال بالخادم.",
      en: "Connected to the server.",
      fr: "Connecté au serveur.",
      es: "Conectado al servidor.",
    };

    const message = messages[language] || messages["en"];

    try {
      // Play the same beep sound as token
      if (tokenSound.current) {
        await tokenSound.current.replayAsync();
      }

      tokenSound.current?.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          let voiceOptions =
            cachedVoices.current[language] ||
            cachedVoices.current["en"] ||
            { language: "en-US" };

          Speech.speak(message, voiceOptions);
        }
      });
    } catch (error) {
      console.error("Error in playConnectAnnouncement:", error);
      // Fallback: speak directly if sound failed
      Speech.speak(message, {
        language:
          language === "ar"
            ? "ar"
            : language === "fr"
              ? "fr"
              : language === "es"
                ? "es"
                : "en-US",
      });
    }
  };


  const announceTheToken = async (token = null, counter = null, language = "en") => {
    if (!token || counter === null) return;

    // Multi-language message
    const messages = {
      ar: `الرقم ${token}، يرجى التوجه إلى ${counter}.`,
      en: `Token ${token}, please proceed to the ${counter}.`,
      fr: `Numéro ${token}, veuillez vous diriger vers le ${counter}.`,
      es: `Turno ${token}, por favor diríjase al ${counter}.`,
    };

    const message = messages[language] || messages["en"];

    try {
      // Play preloaded beep sound
      if (tokenSound.current) {
        await tokenSound.current.replayAsync();
      }

      // After beep finishes → speak
      tokenSound.current?.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {

          let voiceOptions =
            cachedVoices.current[language] ||
            cachedVoices.current["en"] ||
            { language: "en-US" };

          Speech.speak(message, voiceOptions);
        }
      });

    } catch (error) {
      console.error("Error playing sound or speaking:", error);

      // fallback
      Speech.speak(message, {
        language:
          language === "ar"
            ? "ar"
            : language === "fr"
              ? "fr"
              : language === "es"
                ? "es"
                : "en-US",
      });
    }
  };


  // Safe reconnect function
  const safeReconnect = ({ ip, port }) => {
    if (reconnectTimeoutRef.current) return; // prevent multiple timers

    const RECONNECT_DELAY = 30 * 1000; // 30 seconds

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Reconnecting WebSocket...');
      setWsStatus('🔄 Reconnecting WebSocket...');
      getSocketConnection({ ip, port });
      reconnectTimeoutRef.current = null; // allow next reconnect
    }, RECONNECT_DELAY);
  };

  const getSocketConnection = ({ ip, port = 7777 }) => {
    // Clear any previous reconnect timer
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    // reconnectAttemptsRef.current = 0;
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    // Create WebSocket
    ws.current = new WebSocket(`ws://${ip}:${7777}?clientId=tv_display`);

    ws.current.onopen = () => {
      console.log('✅ Connected to WS server');
      setWsStatus('Connected to WS server');

      // ✅ Only speak if this connect comes from a user Save action
      if (shouldAnnounceOnConnectRef.current) {
        playConnectAnnouncement("en"); // or "ar"/"fr"/"es" based on your TV language
        shouldAnnounceOnConnectRef.current = false; // reset so auto-reconnects stay silent
      }

      // Hide success after 2 seconds
      if (wsStatusTimeoutRef.current) clearTimeout(wsStatusTimeoutRef.current);
      wsStatusTimeoutRef.current = setTimeout(() => {
        setWsStatus('');
      }, 2000);

      // Start ping interval
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        if (ws.current && ws.current.readyState === 1) {
          ws.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };


    // On Message
    ws.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        console.log('📩 Parsed Data:', parsed);

        const { event: eventType, data: tokenData } = parsed;

        if (tokenData?.token && tokenData?.counter !== undefined && eventType === 'token-serving') {
          setTokens(prevTokens => {
            const isDuplicate = prevTokens.some(item => item.token === tokenData.token);
            if (isDuplicate) return prevTokens;
            return [...prevTokens, tokenData];
          });

          announceTheToken(tokenData.token, tokenData.counter, tokenData.language);
          setDisplayToken(tokenData);
          setTimeout(() => setDisplayToken(null), 10000);
        } else if (tokenData?.token && eventType === 'token-serving-end') {
          setTokens(prevTokens => prevTokens.filter(item => item.token !== tokenData.token));
          console.log('🗑️ Token Removed:', tokenData.token);
        }
      } catch (e) {
        console.error('❌ Failed to parse WS message:', e.message || e);
      }
    };

    ws.current.onerror = () => safeReconnect({ ip, port });
    ws.current.onclose = () => safeReconnect({ ip, port });

    // Cleanup function (call on component unmount)
    return () => {
      if (ws.current) ws.current.close();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App is active, checking WS...');
        if (!ws.current || ws.current.readyState !== 1) {
          safeReconnect({ ip, port });
        }
      }
    });

    return () => subscription.remove();
  }, []);

  const renderSlider = async () => {
    if (
      media?.media_type === "image" &&
      Array.isArray(media.media_url) &&
      media.media_url.length > 0
    ) {
      const interval = setInterval(() => {
        const nextIndex =
          (currentIndexRef.current + 1) % media.media_url.length;

        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });

        currentIndexRef.current = nextIndex;
      }, 4000);

      return () => clearInterval(interval);
    }
  }

  useEffect(() => {
    renderSlider();
  }, [media]);

  useEffect(() => {

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    loadIpPort();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

  }, []);

  function CustomButton({ label, isDark }) {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          isDark ? styles.buttonDark : styles.buttonLight,
        ]}
      >
        <Text style={[styles.buttonText]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Connection Status Banner */}
      {wsStatus ? (
        <View style={styles.wsStatusBanner}>
          <Text style={styles.wsStatusText}>{wsStatus}</Text>
          {/* 
          {showReloadBar && (
            <Pressable style={styles.reloadBar} onPress={async () => {
              if (Platform.OS === 'web') {
                window.location.reload();
              } else if (__DEV__) {
                DevSettings.reload();
              } else {
                DevSettings.reload();
              }
            }}>
              <Text style={styles.reloadBarText}>Reload App</Text>
            </Pressable>
          )}
          */}
        </View>
      ) : null}
      {/* Left Section */}
      <View style={styles.leftSection}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>{info?.name || "Organize Name"}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.buttonWrapper}>
          {/* Heading Row */}
          <View style={styles.buttonRow}>
            <CustomButton label="TOKEN" />
            <CustomButton label="COUNTER" />
          </View>

          {/* Data Rows */}
          {tokens.map((item, index) => (
            <View key={index} style={styles.buttonRow}>
              <CustomButton label={item.token} isDark />
              <CustomButton label={item.counter} isDark />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Right Section */}
      <View style={styles.rightSection}>
        {media?.media_type === "video" ? (
          <Video
            source={{ uri: media.media_url[0] }}
            style={{ width: media.width, height: media.height }}
            resizeMode="cover" // or 'contain' if you want full video visible
            shouldPlay
            isLooping
            isMuted
            useNativeControls={false}
          />
        ) : media?.media_type === "image" ? (
          <FlatList
            ref={flatListRef}
            data={media.media_url}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={{
                  width: media.width,
                  height: media.height,
                  opacity: displayToken ? 0.2 : 1,
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}
            onScrollToIndexFailed={(e) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: e.index,
                  animated: true,
                });
              }, 500);
            }}
            style={{ width: media.width, height: media.height }}
          />
        ) : null}

        {displayToken ? (
          <View style={styles.borderWrapper}>
            <View style={styles.ticketBox}>
              <View style={styles.leftTicket}>
                <Text style={styles.numberTitle}>Number</Text>
                <Text style={styles.numberValue}>{displayToken.token}</Text>
              </View>
              <View style={styles.rightTicket}>
                <Text style={styles.proceedText}>
                  Please proceed to counter
                </Text>
                <Text style={styles.counterNumber}>{displayToken.counter}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Server IP and Port</Text>

            <TextInput
              placeholder="IP Address"
              value={ip}
              onChangeText={setIp}
              style={styles.modalInput}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Port"
              value={port}
              onChangeText={setPort}
              style={styles.modalInput}
              keyboardType="numeric"
            />

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.button, styles.buttonClose, focusedButton === 'cancel' ? styles.buttonActive : null]}
                onPress={() => setShowModal(false)}
                onFocus={() => setFocusedButton('cancel')}
                onBlur={() => setFocusedButton(null)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.buttonSave, focusedButton === 'save' ? styles.buttonActive : null]}
                onPress={saveIpPort}
                onFocus={() => setFocusedButton('save')}
                onBlur={() => setFocusedButton(null)}
              >
                <Text style={styles.textStyle}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
