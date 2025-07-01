// Welcome.js
import { useEffect, useState, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Audio, Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Image as ExpoImage } from 'expo-image';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Modal,
  Pressable,
  Image,
  ScrollView,
  TouchableOpacity, Animated,
  BackHandler
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlickerRow from './compoments/FlickerRow';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const videoHeight = screenHeight;
const videoWidth = screenWidth;

export default function Welcome() {

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



  const webViewRef = useRef(null);
  const [isWebViewReady, setWebViewReady] = useState(false);

  useEffect(() => {
    if (isWebViewReady) {
      webViewRef.current.postMessage(JSON.stringify({ type: 'setVolume', volume: 0 }));
    }
  }, [isWebViewReady]);

  const flatListRef = useRef(null);
  const currentIndexRef = useRef(0);

  const [ip, setIp] = useState("192.168.3.245");
  const [port, setPort] = useState("8000");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [info, setInfo] = useState(null);
  const [media, setMedia] = useState({
    media_type: "image",
    media_url: [],
    width: videoWidth / 2,
    height: videoHeight,
  });

  const [showModal, setShowModal] = useState(true);
  const [displayToken, setDisplayToken] = useState(null);

  const timeoutRef = useRef(null);
  const ws = useRef(null);

  const [wsModal, setWsModal] = useState(false);
  const [wsMessage, setWsMessage] = useState('');

  const loadIpPort = async () => {
    const ip = await AsyncStorage.getItem('ip');
    const port = await AsyncStorage.getItem('port');
    setIp(ip);
    setPort(port);
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
      fetchTvSettings(ip, port);
      fetchServingItems(ip, port);
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
      getSocketConnection(json);
    } catch (e) {
      // console.error('Error saving IP and port', e);
    } finally {
      setLoading(false);
    }
  };

  const announceTheToken = async (token = null, counter = null, language = "ar") => {

    // const availableVoices = await Speech.getAvailableVoicesAsync();
    // Log all available voices
    // console.log(availableVoices);

    const message = language === "ar"
      ? `الرقم ${token}، يرجى التوجه إلى ${counter}.`
      : `Token ${token}, please proceed to the ${counter}.`;

    try {
      const { sound } = await Audio.Sound.createAsync(require('./assets/1.wav'));

      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await sound.unloadAsync();

          let voiceOptions = { language: "en-US", voice: "en-us-x-sfg-network" };

          if (language === "ar") {
            const voices = await Speech.getAvailableVoicesAsync();
            const arabicVoice = voices.find(v => v.language.startsWith('ar'));

            if (arabicVoice) {
              voiceOptions = {
                language: "ar",
                voice: arabicVoice.identifier,
              };
            }
          }

          Speech.speak(message, voiceOptions);
        }
      });

    } catch (error) {
      console.error('Error playing sound or speaking:', error);
      // Fallback to speech directly
      Speech.speak(message, { language: language === "ar" ? "ar" : "en-US" });
    }
  };

  const getSocketConnection = async ({ ip, port }) => {

    ws.current = new WebSocket(`ws://${ip}:${port}`);

    ws.current.onopen = () => {
      setWsModal(true);
      setWsMessage('Connected to WS server');
      renderSlider();
    };

    ws.current.onmessage = (event) => {

      try {
        const parsed = JSON.parse(event.data);
        console.log('📩 Parsed Data:', parsed);

        const { event: eventType, data: tokenData } = parsed;

        if (eventType === 'trigger-settings') {
          const newMedia = {
            ...tokenData,
            height: tokenData?.media_height || videoHeight,
            width: tokenData?.media_width || videoWidth,
          };

          setMedia(prev => {
            const hasChanged = JSON.stringify(prev) !== JSON.stringify(newMedia);
            return hasChanged ? newMedia : prev;
          });
        }


        if (tokenData?.token && tokenData?.counter !== undefined && eventType === 'token-serving') {
          setTokens(prevTokens => {
            const isDuplicate = prevTokens.some(item => item.token === tokenData.token);
            if (isDuplicate) return prevTokens;
            return [...prevTokens, tokenData];
          });

          announceTheToken(tokenData.token, tokenData.counter, tokenData.language);

          setDisplayToken(tokenData);

          setTimeout(() => setDisplayToken(null), 10000);
        }

        else if (tokenData?.token && eventType === 'token-serving-end') {
          setTokens(prevTokens => {
            const updatedTokens = prevTokens.filter(item => item.token !== tokenData.token);
            console.log('🗑️ Token Removed:', tokenData.token);
            return updatedTokens;
          });
        }

      } catch (e) {
        console.error('❌ Failed to parse message:', e.message || e);
      }
    };

    ws.current.onerror = (error) => {
      // console.error('❌ WebSocket error:', error.message || error);
      setWsMessage('Failed to connect to server. Please check IP and port.');
      setWsModal(true);
    };

    ws.current.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setWsMessage('WebSocket connection was closed unexpectedly.');
      setWsModal(true);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        console.log('🔁 WebSocket closed on unmount');
      }
    };
  }

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

    // loadIpPort();

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
        <Text style={styles.buttonText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
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
                style={[styles.button, styles.buttonClose]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.buttonSave]}
                onPress={saveIpPort}
              >
                <Text style={styles.textStyle}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={wsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setWsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Connection Status</Text>
            <Text style={{ textAlign: "center", marginBottom: 20 }}>
              {wsMessage}
            </Text>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.button, styles.buttonClose, styles.fullWidth]}
                onPress={() => setWsModal(false)}
              >
                <Text style={styles.textStyle}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    marginTop: 30,

    flexDirection: "row",
    flex: 1,
    backgroundColor: "#1a202c", // dark background
  },
  borderWrapper: {
    position: "absolute",
    padding: 2,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "none",
  },
  animatedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    border: 1,
    height: "100%",
    width: "200%",
  },
  gradient: {
    flex: 1,
    height: 10,
  },
  leftSection: {
    width: "50%",
    backgroundColor: "#111827",
  },
  header: {
    backgroundColor: "#6366f1",
    padding: 16,
  },
  headerText: {
    marginLeft:10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  buttonWrapper: {
    padding: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  button: {
    width: "48%",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  buttonLight: {
    backgroundColor: "#3b82f6",
  },
  buttonDark: {
    backgroundColor: "#1e3a8a",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  divider: {
    width: 1,
    backgroundColor: "#ccc",
  },
  rightSection: {
    width: "50%",
    backgroundColor: "#1e40af",
    alignItems: "center",
    justifyContent: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "50%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#333",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  fullWidth: {
    width: "100%",
  },
  buttonClose: {
    backgroundColor: "#aaa",
  },
  buttonSave: {
    backgroundColor: "#4287f5",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
  },
  rightSection: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },
  ticketBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1e1e1e",
    width: 300,
    height: 200,
    padding: 1,
    zIndex: 1,
    backgroundColor: "none",
  },
  leftTicket: {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rightTicket: {
    backgroundColor: "#3b82f6",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  numberTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  numberValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  proceedText: {
    fontSize: 20,
    textAlign: "center",
    color: "#fff",
  },
  counterNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
});
