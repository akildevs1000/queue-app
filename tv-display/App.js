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
  Image
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlickerRow from './compoments/FlickerRow';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const videoHeight = screenHeight;
const videoWidth = screenWidth;

export default function Welcome() {

  const playerRef = useRef(null);

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
  const [media, setMedia] = useState(null);

  const [showModal, setShowModal] = useState(true);
  const [highlightedToken, setHighlightedToken] = useState(null);
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
      console.log("🚀 ~ fetchTvSettings ~ json:", json)
      setMedia({
        ...json,
        height: json?.media_height || videoHeight,
        width: json?.media_width || videoWidth,
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

          setHighlightedToken(tokenData.token); // Highlight it
          announceTheToken(tokenData.token, tokenData.counter, tokenData.language);

          // Remove highlight after 1 second
          setTimeout(() => setHighlightedToken(null), 1000);
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
    if (media?.media_type === 'image' && Array.isArray(media.media_url)) {

      const interval = setInterval(() => {
        const nextIndex = (currentIndexRef.current + 1) % media.media_url.length;

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

  return (
    <View style={styles.container}>

      <View style={styles.leftSection}>
        <>
          {media?.media_type === 'youtube' ? (
            <YoutubePlayer
              ref={playerRef}
              videoId={media.media_url[0]}
              height={media.height}
              width={media.width}
              play={true}
              onReady={() => {
                playerRef.current?.getInternalPlayer()?.mute();
              }}
              onChangeState={(state) => {
                if (state === 'ended') {
                  playerRef.current?.seekTo(0, true);
                }
              }}
              initialPlayerParams={{
                controls: true,
                mute: true,
                autoplay: true,
                loop: true,
                playlist: media.media_url,
                modestbranding: true,
                rel: false,
                fs: false,
              }}
            />
          ) : media?.media_type === 'video' ? (
            <Video
              source={{ uri: media.media_url[0] }}
              style={{ width: media.width, height: media.height }}
              resizeMode="cover" // or 'contain' if you want full video visible
              shouldPlay
              isLooping
              isMuted
              useNativeControls={false}
            />
          ) : media?.media_type === 'gif' ? (
            <ExpoImage
              source={{ uri: media.media_url[0] }}
              style={{ width: media.width, height: media.height }}
              contentFit="cover"

            />
          ) : media?.media_type === 'image' ? (
            <FlatList
              ref={flatListRef}
              data={media.media_url}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width: media.width, height: media.height }}
                  resizeMode="cover"
                />
              )}
              onScrollToIndexFailed={(info) => {
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                }, 500);
              }}
              style={{ width: media.width, height: media.height }}
            />
          ) : null}
        </>


      </View>

      <View style={styles.rightSection}>
        {loading ? (
          <ActivityIndicator size="large" color="#666" />
        ) : tokens.length > 0 ? (
          <View style={styles.tableContainer}>
            <LinearGradient
              colors={['#3b82f6', '#7c3aed']} // from blue-500 to purple-600 hex colors
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tableHeader}
            >
              {/* Your header content here */}
              <Text style={styles.headerCell}>Ticket</Text>
              <Text style={styles.headerCell}>Counter</Text>
            </LinearGradient>
            {/* <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Ticket</Text>
              <Text style={styles.headerCell}>Counter</Text>
            </View> */}
            <FlatList
              data={tokens}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <FlickerRow
                  onPress={() => announceTheToken(item.token, item.counter, item.language)}
                  token={item.token}
                  counter={item.counter}
                  isHighlighted={item.token === highlightedToken}
                  backgroundColor={index % 2 === 0 ? '#eaf4fc' : '#fff'}
                />
              )}
            />

          </View>
        ) : (
          <Text style={styles.noData}>No tickets found.</Text>
        )}
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
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              {wsMessage}
            </Text>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
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
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    paddingTop: 10,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0, marginHorizontal: 0, width: '50%'
  },
  rightSection: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  tableContainer: {
    paddingHorizontal: 1,

  },
  tableHeader: {
    flexDirection: 'row',
    // backgroundColor: '#4287f5',
    paddingVertical: 3,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 30,
  },

  noData: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '50%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#aaa',
  },
  buttonSave: {
    backgroundColor: '#4287f5',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
  },
});