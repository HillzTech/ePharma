import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, Alert, BackHandler, StatusBar } from 'react-native';
import { ref, onValue, set, get } from 'firebase/database';
import { realtimeDb } from "../Components/firebaseConfig";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';


const ChatScreen: React.FC<{ route: any }> = ({ route }) => {
  const { userId } = route.params;
  const [messages, setMessages] = useState<Array<any>>([]);
  const [reply, setReply] = useState<string>('');
  const [pharmacyName, setPharmacyName] = useState<string>('');

  useEffect(() => {
    fetchPharmacyName(userId);

    const messagesRef = ref(realtimeDb, `admin/messages/${userId}`);

    const handleData = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);

        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    };

    const unsubscribe = onValue(messagesRef, handleData, {
      onlyOnce: false
    });

    return () => unsubscribe();
  }, [userId]);

  const fetchPharmacyName = async (userId: string) => {
    try {
      const pharmacyRef = ref(realtimeDb, `pharmacy/${userId}`);
      const snapshot = await get(pharmacyRef);

      if (snapshot.exists()) {
        const pharmacyData = snapshot.val();
        setPharmacyName(pharmacyData.pharmacyName || 'Unknown Pharmacy');
      } else {
        setPharmacyName('Unknown Pharmacy');
      }
    } catch (error) {
      console.error('Error fetching pharmacy name:', error);
      setPharmacyName('Unknown Pharmacy');
    }
  };

  const sendReply = async () => {
    if (reply.trim() === '') {
      Alert.alert('Error', 'Please enter a reply.');
      return;
    }

    try {
      const adminMessageRef = ref(realtimeDb, `admin/messages/${userId}/${Date.now()}`);
      const userMessageRef = ref(realtimeDb, `users/${userId}/messages/${Date.now()}`);

      const newMessage = {
        message: reply,
        sender: 'admin',
        timestamp: Date.now(),
      };

      await set(adminMessageRef, newMessage);
      await set(userMessageRef, newMessage);

      setReply('');
    } catch (error) {
      console.error('Error sending reply:', error);
      Alert.alert('Error', 'Failed to send reply.');
    }
  };

  

  return (
    <SafeAreaView style={{ flex: 1, padding: hp('3%'), backgroundColor: '#D3D3D3' }}>
      <StatusBar backgroundColor="black" barStyle="light-content"/>
      <View style={{ flex: 1, marginTop: hp('3%') }}>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: item.sender === 'admin' ? '#DCF8C6' : '#ECECEC',
                alignSelf: item.sender === 'admin' ? 'flex-end' : 'flex-start',
                margin: 10,
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text>{item.message}</Text>
            </View>
          )}
          keyExtractor={item => item.id}
          inverted={true} // Keeps the FlatList layout consistent with the newest messages at the bottom
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        />
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TextInput
            style={{ flex: 1, borderColor: 'gray', borderWidth: 1, borderRadius: 10, height: 70, padding: wp('2%') }}
            placeholder="Type your reply..."
            value={reply}
            onChangeText={setReply}
          />
          <TouchableOpacity onPress={sendReply} style={{ marginLeft: 10, justifyContent: 'center', padding: 10, borderRadius: 10 }}>
            <Ionicons name='send' color={'blue'} size={30} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
