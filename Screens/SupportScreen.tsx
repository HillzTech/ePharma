import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, Alert, Dimensions, StatusBar } from 'react-native';
import { ref, set, onValue, remove, get } from 'firebase/database';
import { auth, realtimeDb } from "../Components/firebaseConfig";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

const SupportScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Array<any>>([]);
  const user = auth.currentUser;
  const adminUserId = "VdsO9TWkJlS9ItoohfAATFd0wPB3"; 
  const welcomeMessage = "Hello! How can I assist you today?";
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  

  useEffect(() => {
    if (user?.uid) {
      const messagesRef = ref(realtimeDb, `users/${user.uid}/messages`);

      const handleData = (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
          // Convert the data into an array and sort by timestamp in descending order
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
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      const messagesRef = ref(realtimeDb, `users/${user.uid}/messages`);
      get(messagesRef).then(snapshot => {
        if (!snapshot.exists()) {
          // If no messages exist, send a welcome message
          sendAdminWelcomeMessage();
        }
      });
    }
  }, [user?.uid]);

  const sendMessage = async () => {
    if (message.trim() === '') {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }

    try {
      const messageRef = ref(realtimeDb, `users/${user?.uid}/messages/${Date.now()}`);
      const adminMessageRef = ref(realtimeDb, `admin/messages/${user?.uid}/${Date.now()}`);

      const newMessage = {
        message,
        sender: 'user',
        timestamp: Date.now(),
      };

      await set(messageRef, newMessage);
      await set(adminMessageRef, newMessage);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  const sendAdminWelcomeMessage = async () => {
    try {
      const welcomeMessageRef = ref(realtimeDb, `admin/messages/${user?.uid}/${Date.now()}`);
      const userMessageRef = ref(realtimeDb, `users/${user?.uid}/messages/${Date.now()}`);

      const newMessage = {
        message: welcomeMessage,
        sender: 'admin',
        timestamp: Date.now(),
      };

      await set(welcomeMessageRef, newMessage);
      await set(userMessageRef, newMessage);
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const endConversation = async () => {
    try {
      const userMessagesRef = ref(realtimeDb, `users/${user?.uid}/messages`);
      const adminMessagesRef = ref(realtimeDb, `admin/messages/${user?.uid}`);

      await remove(userMessagesRef);
      await remove(adminMessagesRef);

      Alert.alert('Conversation Ended', 'The conversation has been ended.');
      navigation.goBack();;
    } catch (error) {
      console.error('Error ending conversation:', error);
      Alert.alert('Error', 'Failed to end the conversation.');
    }
  };

 

  return (
    <SafeAreaView style={{ flex: 1, padding: hp('2%'), backgroundColor:'#D3D3D3' }}>
      <StatusBar backgroundColor="black" barStyle="light-content"/>
       
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: windowWidth > 1000 ? hp('2%') : wp('0%'), right: hp('1%') }}>
        
        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(19), left: wp('33%') }}>Support</Text>
        <TouchableOpacity onPress={endConversation} style={{ padding: 10, backgroundColor: 'red', borderRadius: 10 }}>
          <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 13, color: 'white' }}>End Chat</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: item.sender === 'user' ? '#DCF8C6' : '#ECECEC',
              alignSelf: item.sender === 'user' ? 'flex-end' : 'flex-start',
              margin: hp('1%'),
              padding: hp('1%'),
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
      <View style={{ flexDirection: 'row', marginVertical: hp('2%') }}>
        <TextInput
          style={{ flex: 1, backgroundColor: 'white', borderRadius: 10, height: windowWidth > 1000 ? hp('10%') : wp('25%'), padding: wp('2%') }}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline={true}
        />
        <TouchableOpacity onPress={sendMessage} style={{ marginLeft: hp('1%'), justifyContent: 'center', padding: hp('1%'), borderRadius: 10 }}>
          <Ionicons name='send' color={'blue'} size={30} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SupportScreen;
