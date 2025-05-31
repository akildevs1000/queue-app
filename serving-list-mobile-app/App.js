import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Button,
  Modal, Pressable
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const videoHeight = screenHeight;
const videoWidth = screenWidth;

export default function Welcome() {
  const [ip, setIp] = useState('192.168.3.46');
  const [port, setPort] = useState('8000');
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([
    // {
    //   "id": 175,
    //   "language": "en",
    //   "service_id": 4,
    //   "token_number": 14,
    //   "status": "2",
    //   "counter_id": 9,
    //   "user_id": null,
    //   "created_at": "2025-05-31T11:15:02.000000Z",
    //   "updated_at": "2025-05-31T11:15:27.000000Z",
    //   "token_number_display": "LQ0014",
    //   "start_serving": null,
    //   "end_serving": null,
    //   "total_serving_time": null,
    //   "total_serving_time_display": null,
    //   "pause_time_display": null,
    //   "counter": {
    //     "id": 9,
    //     "service_id": 4,
    //     "name": "Counter 1",
    //     "description": "Counter 1",
    //     "created_at": "2025-05-26T03:15:52.000000Z",
    //     "updated_at": "2025-05-26T03:15:52.000000Z"
    //   }
    // },
    // {
    //   "id": 174,
    //   "language": "en",
    //   "service_id": 4,
    //   "token_number": 13,
    //   "status": "2",
    //   "counter_id": 9,
    //   "user_id": null,
    //   "created_at": "2025-05-31T11:10:56.000000Z",
    //   "updated_at": "2025-05-31T11:11:02.000000Z",
    //   "token_number_display": "LQ0013",
    //   "start_serving": "2025-05-31 15:11:02",
    //   "end_serving": null,
    //   "total_serving_time": null,
    //   "total_serving_time_display": null,
    //   "pause_time_display": null,
    //   "counter": {
    //     "id": 9,
    //     "service_id": 4,
    //     "name": "Counter 1",
    //     "description": "Counter 1",
    //     "created_at": "2025-05-26T03:15:52.000000Z",
    //     "updated_at": "2025-05-26T03:15:52.000000Z"
    //   }
    // }
  ]);
  const [youtubeVideoIds, setYoutubeVideoIds] = useState(["LnD70Vk__h0"]);
  const [showModal, setShowModal] = useState(true);
  const [resetIpAndPort, setResetIpAndPort] = useState(false);
  const playerRef = useRef(null);

  const resetIpPort = async () => {
    await AsyncStorage.removeItem('ip');
    await AsyncStorage.removeItem('port');
    setIp('');
    setPort('');
    setShowIpPortInput(true);
  };

  // useEffect(() => {

  //   if (resetIpAndPort) {
  //     (async () => {
  //       resetIpPort()
  //     })()
  //   }

  //   const loadStoredIpPort = async () => {
  //     try {
  //       const storedIp = await AsyncStorage.getItem('ip');
  //       const storedPort = await AsyncStorage.getItem('port');

  //       if (storedIp && storedPort) {
  //         setIp(storedIp);
  //         setPort(storedPort);
  //         setShowModal(false);
  //       }
  //     } catch (err) {
  //       console.error('Error loading IP/Port:', err);
  //     }
  //   };

  //   loadStoredIpPort();

  // }, []);

  // useEffect(() => {
  //   if (!showModal && ip && port) {
  //     getYoutubeVideoIds(ip, port);
  //     getServingList(ip, port);

  //     const interval = setInterval(() => {
  //       getServingList(ip, port);
  //     }, 5000);

  //     return () => clearInterval(interval);
  //   }
  // }, [showModal, ip, port]);

  // const saveConfig = async () => {
  //   try {
  //     await AsyncStorage.setItem('ip', ip);
  //     await AsyncStorage.setItem('port', port);

  //     // Ensure state is up-to-date (if coming from a modal input)
  //     console.log('Saved IP:', ip);
  //     console.log('Saved Port:', port);

  //     getYoutubeVideoIds(ip, port);
  //     getServingList(ip, port);

  //     setShowModal(false);
  //   } catch (e) {
  //     console.log('Error saving IP/Port:', e);
  //   }
  // };


  const getServingList = async () => {
    try {
      const res = await fetch(`http://${ip}:${port}/api/serving_list`);
      const json = await res.json();
      setTokens(json.data || []);
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
    }
  };

  const getYoutubeVideoIds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://${ip}:${port}/api/get-youtube-video-ids`);
      const json = await res.json();
      setYoutubeVideoIds(json || []);
    } catch (err) {
      console.error('Failed to fetch video IDs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // getYoutubeVideoIds();
    // getServingList();

    const interval = setInterval(() => {
      getServingList();
    }, 5000);

    return () => clearInterval(interval);

  }, []);

  // if (showModal) {

  //   if (!ip || !port) {
  //     Alert.alert('Error', 'IP and Port must be provided.');
  //     return;
  //   }


  //   return (
  //     <Modal visible={showModal} transparent animationType="fade">
  //       <View style={styles.modalOverlay}>
  //         <View style={styles.modalBox}>
  //           <Text style={styles.modalTitle}>Setup IP & Port</Text>

  //           <Text style={styles.label}>IP Address</Text>
  //           <TextInput
  //             style={styles.modalInput}
  //             value={ip}
  //             onChangeText={setIp}
  //             placeholder="e.g., 192.168.1.100"
  //             keyboardType="numbers-and-punctuation"
  //             placeholderTextColor="#999"
  //           />

  //           <Text style={styles.label}>Port</Text>
  //           <TextInput
  //             style={styles.modalInput}
  //             value={port}
  //             onChangeText={setPort}
  //             placeholder="e.g., 8000"
  //             keyboardType="numeric"
  //             placeholderTextColor="#999"
  //           />


  //           <View style={styles.modalButtonContainer}>
  //             <Button title="Save & Start" color="#007bff" onPress={saveConfig} />
  //           </View>

  //         </View>
  //       </View>
  //     </Modal>
  //   );
  // }

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {loading ? (
          <ActivityIndicator size="large" color="#666" />
        ) : youtubeVideoIds.length > 0 ? (
          <YoutubePlayer
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
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? '#eaf4fc' : '#ffffff' },
                  ]}
                >
                  <Text style={styles.tableCell}>{item.token_number_display}</Text>
                  <Text style={styles.tableCell}>{item.counter.name}</Text>
                </View>
              )}
            />
          </View>
        ) : (
          <Text style={styles.noData}>No customers found.</Text>
        )}

        {/* <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowModal(true)}
        >
          <Icon name="settings-outline" size={32} color="#333" />
        </TouchableOpacity> */}
      </View>


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

  video: {
    width: '100%',
    height: '100%',
  },

  videoText: {
    color: '#fff',
    position: 'absolute',
    bottom: 10,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '30%',
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
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#555',
  },
  modalButtonContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },

  settingsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

});
