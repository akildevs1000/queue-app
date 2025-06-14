// Welcome.js
import { useEffect, useState, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Audio, Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';

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

  const [ip, setIp] = useState("192.168.3.245");
  const [port, setPort] = useState("7777");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [youtubeVideoIds, setYoutubeVideoIds] = useState(["LnD70Vk__h0"]);
  const [media, setMedia] = useState(null);

  const [showModal, setShowModal] = useState(true);
  const [highlightedToken, setHighlightedToken] = useState(null);
  const timeoutRef = useRef(null);
  const ws = useRef(null);

  const [wsErrorModal, setWsErrorModal] = useState(false);
  const [wsErrorMessage, setWsErrorMessage] = useState('');

  const loadIpPort = async () => {
    const ip = await AsyncStorage.getItem('ip');
    const port = await AsyncStorage.getItem('port');
    if (ip && port) {
      setIp(ip);
      setPort(port);
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  };

  const saveIpPort = async () => {
    if (!ip || !port) return;
    setLoading(true);

    try {

      await getSocketConnection(ip, port);
      await AsyncStorage.setItem('ip', ip);
      await AsyncStorage.setItem('port', port);

      setIp(ip);
      setPort(port);
      setShowModal(false);
      setWsErrorModal(false);
      setWsErrorMessage('');
    } catch (e) {
      // console.error('Error saving IP and port', e);
      setWsErrorMessage(e.message || 'Failed to connect to server.');
      setWsErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchServingItems = async () => {
    try {
      let url = `http://${ip}:8000/api/serving_list`;
      const res = await fetch(url);
      const json = await res.json();
      setTokens(json);
    } catch (e) {
      // console.error('Error saving IP and port', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      let url = `http://${ip}:8000/api/fetch_media`;
      const res = await fetch(url);
      const json = await res.json();
      setMedia(json)
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

  const getSocketConnection = async (ip, port) => {
    let isMounted = true;

    ws.current = new WebSocket(`ws://${ip}:${port}`);

    ws.current.onopen = () => {
      if (!isMounted) return;
      console.log('✅ Connected to WS server');
      // Hide modal on successful connection
      setWsErrorModal(false);
      setWsErrorMessage('');
    };

    ws.current.onmessage = (event) => {
      if (!isMounted) return;

      try {
        const parsed = JSON.parse(event.data);
        console.log('📩 Parsed Data:', parsed);

        const { event: eventType, data: tokenData } = parsed;

        // in onmessage()
        if (eventType === 'trigger-settings') {
          setShowModal(true);
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
      setWsErrorMessage('Failed to connect to server. Please check IP and port.');
      setWsErrorModal(true);
    };

    ws.current.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setWsErrorMessage('WebSocket connection was closed unexpectedly.');
      setWsErrorModal(true);
    };

    return () => {
      isMounted = false;
      if (ws.current) {
        ws.current.close();
        console.log('🔁 WebSocket closed on unmount');
      }
    };
  }
  useEffect(() => {
    getSocketConnection(ip, port);
  }, []);

  useEffect(() => {

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    loadIpPort();

    fetchServingItems();

    fetchMedia();

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
          {media?.type === 'youtube' ? (
            <YoutubePlayer
              onReady={() => {
                playerRef.current?.getInternalPlayer()?.mute();
              }}
              ref={playerRef}
              height={videoHeight}
              width={videoWidth}
              videoId={youtubeVideoIds[0]}
              play={true}
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
                playlist: youtubeVideoIds,
                modestbranding: true,
                rel: false,
                fs: false,
              }}
            />
          ) : media?.type === 'image' ? (
            <Image
              source={{ uri: media?.image }}
              style={{ width: '100%', height: "100%" }}
            />
          ) : media?.type === 'video' ? (
            <Video
              source={{ uri: media?.url }}
              style={{ width: videoWidth, height: videoHeight }}
              resizeMode="contain"
              shouldPlay
              isLooping
              isMuted
              useNativeControls={false}
            />
          ) : null}
        </>

      </View>

      <View style={styles.rightSection}>
        {loading ? (
          <ActivityIndicator size="large" color="#666" />
        ) : tokens.length > 0 ? (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Ticket</Text>
              <Text style={styles.headerCell}>Counter</Text>
            </View>
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
        visible={wsErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setWsErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Connection Error</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              Could not connect to the socket server. Please check your connection.
            </Text>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setWsErrorModal(false)}
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
    paddingHorizontal: 0, marginHorizontal: 0, width: '100%'
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
    backgroundColor: '#4287f5',
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