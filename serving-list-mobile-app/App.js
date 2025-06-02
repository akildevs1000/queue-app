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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Welcome() {
  const [tapCount, setTapCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [baseUrl, setBaseUrl] = useState("http://192.168.2.6:8000");
  const [ip, setIp] = useState(null);
  const [port, setPort] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [youtubeVideoIds, setYoutubeVideoIds] = useState(["LnD70Vk__h0"]);
  const [showModal, setShowModal] = useState(true);
  const [resetIpAndPort, setResetIpAndPort] = useState(false);
  const timeoutRef = useRef(null);

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

  const announceTheToken = async (token = 'LQ005', counter = 'Counter 1') => {

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
    const ws = new WebSocket('ws://192.168.2.6:8080');

    ws.onopen = () => {
      console.log('✅ Connected to WS server');
    };

    ws.onmessage = async (event) => {
      console.log("🚀 ~ useEffect ~ event:", event);

      try {
        const text = await event.data;
        const data = JSON.parse(text);
        console.log('📩 Received from server:', data.data);
        // setTokens(prevTokens => [...prevTokens, data.data]);

       announceTheToken(data.data.token, data.data.counter);

      } catch (e) {
        console.error('Failed to parse message:', e.message || e);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error.message || error);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

  }, []);

  useEffect(() => {

    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    loadIpPort();

    setTimeout(() => {
      fetchServingItems();
    }, 5000);


    const interval = setInterval(() => {
      fetchServingItems();
    }, 10000);


    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearInterval(interval);
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
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => { announceTheToken(item.token, item.counter) }}
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? '#eaf4fc' : '#fff' },
                  ]}
                >
                  <Text style={styles.tableCell}>{item.token}</Text>
                  <Text style={styles.tableCell}>{item.counter}</Text>
                </TouchableOpacity>
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
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 40,
    color: '#222',
    textAlign: 'center',
  },
  noData: {
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 24,
  },
  settingsIcon: {
    position: 'absolute',
    bottom: 30,
    right: 30,
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
    width: '80%',
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
