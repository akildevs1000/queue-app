// Welcome.js
import { useEffect, useState, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
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
  TouchableOpacity,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import FlickerRow from './compoments/FlickerRow';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Welcome() {
  const [tapCount, setTapCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [baseUrl, setBaseUrl] = useState("http://192.168.3.46:8000");
  const [ip, setIp] = useState("192.168.3.46");
  const [port, setPort] = useState("8000");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [youtubeVideoIds, setYoutubeVideoIds] = useState(["LnD70Vk__h0"]);
  const [showModal, setShowModal] = useState(true);
  const [highlightedToken, setHighlightedToken] = useState(null);
  const timeoutRef = useRef(null);
  const ws = useRef(null);


  const handleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount === 3) {
      setShowSettings(true);

      // Hide after 1 minute
      timeoutRef.current = setTimeout(() => {
        setShowSettings(false);
        setTapCount(0); // Reset count if needed
      }, 20000); // 60 seconds
    }
  };

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
      await AsyncStorage.setItem('ip', ip);
      await AsyncStorage.setItem('port', port);
      setIp(ip);
      setPort(port);
      setShowModal(false);
    } catch (e) {
      console.error('Error saving IP and port', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchServingItems = async () => {

    try {
      // let url = `http://${ip}:${port}/api/serving_list`;
      const res = await fetch(`${baseUrl}/api/serving_list`);
      const json = await res.json();
      setTokens(json);
    } catch (e) {
      // console.error('Error saving IP and port', e);
    } finally {
      setLoading(false);
    }
  };

  const announceTheToken = async (token = null, counter = null) => {

    const message = `Token ${token}, please proceed to the ${counter}.`;
    try {
      const { sound } = await Audio.Sound.createAsync(require('./assets/1.wav'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          Speech.speak(message, { language: 'en-US' });
        }
      });
    } catch (error) {
      console.error('Error playing sound or speaking:', error);
      Speech.speak(message, { language: 'en-US' });
    }
  };

  useEffect(() => {

    let isMounted = true;

    ws.current = new WebSocket('ws://192.168.3.46:8080');

    ws.current.onopen = () => {
      if (!isMounted) return;
      console.log('✅ Connected to WS server');
    };

    ws.current.onmessage = (event) => {
      if (!isMounted) return;

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

          setHighlightedToken(tokenData.token); // Highlight it
          announceTheToken(tokenData.token, tokenData.counter);

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
      console.error('❌ WebSocket error:', error.message || error);
    };


    ws.current.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

    return () => {
      isMounted = false;
      if (ws.current) {
        ws.current.close();
        console.log('🔁 WebSocket closed on unmount');
      }
    };

  }, []);

  useEffect(() => {

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    loadIpPort();

    fetchServingItems();


    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

  }, []);

  return (
    <View style={styles.container} onTouchStart={handleTap}>

      <View style={styles.leftSection}>
        {youtubeVideoIds.length > 0 ? (
          <></>
        ) : (
          <Text style={styles.noData}>No video found.</Text>
        )}
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
                  onPress={() => announceTheToken(item.token, item.counter)}
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

      {showSettings && (
        <TouchableOpacity style={styles.settingsIcon} onPress={() => setShowModal(true)}>
          <Icon name="settings-outline" size={28} color="#333" />
        </TouchableOpacity>
      )}


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  tableContainer: {
    paddingHorizontal: 1,
    paddingTop: 28,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4287f5',
    paddingVertical: 16,
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 42,
  },

  noData: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 24,
  },
  settingsIcon: {
    position: 'absolute',
    bottom: 60,
    right: 60,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 5,
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
