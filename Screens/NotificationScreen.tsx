import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firebase from 'firebase/compat';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import LoadingOverlay from '../Components/LoadingOverlay';
import { Ionicons } from '@expo/vector-icons';

const NotificationScreen: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return;

    // Real-time listener for messages
    const messagesRef = firebase.firestore().collection('users').doc(currentUser.uid).collection('messages');

    const unsubscribe = messagesRef.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(messagesData);
      setLoading(false);
    }, error => {
      console.error('Error fetching messages:', error);
      setLoading(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  const markAsRead = async (messageId: string) => {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return;

    try {
      await firebase.firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('messages')
        .doc(messageId)
        .update({ unread: false });

      setMessages(messages.map(msg => msg.id === messageId ? { ...msg, unread: false } : msg));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMessageClick = (messageId: string) => {
    markAsRead(messageId);
    // Navigate or perform other actions as needed
  };
 

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay />}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp('1%'), top: hp('3%') , marginBottom: hp('6%')}}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
          <Ionicons name="chevron-back" size={29} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(18), right: wp('25%') }}>Notifications</Text>
      </View>

      {messages.length === 0 ? (
        <Text style={styles.noMessagesText}>No notifications available</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No Notification orders found.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleMessageClick(item.id)}>
              <View style={[styles.messageContainer, item.unread ? styles.unreadMessage : {}]}>
                <Text style={styles.messageTitle}>{item.title}</Text>
                <Text style={styles.messageBody}>{item.message}</Text>
                <Text style={styles.messageTime}>{new Date(item.createdAt.toDate()).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
    backgroundColor: '#F5F5F5',
  },
  messageContainer: {
    paddingHorizontal: wp('7%'),
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: wp('3%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    
  },
  unreadMessage: {
    backgroundColor: '#E8F0FE', // Highlight unread messages
  },
  messageTitle: {
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
    color: 'black',
  },
  messageBody: {
    fontSize: RFValue(13),
    fontFamily: 'Poppins-Regular',
    marginBottom: hp('1%'),
  },
  messageTime: {
    fontSize: RFValue(11),
    fontFamily: 'Poppins-Regular',
    marginBottom: hp('1%'),
    color: 'gray',
  },
  noMessagesText: {
    textAlign: 'center',
    fontSize: RFValue(13),
    fontFamily: 'Poppins-Regular',
    marginTop: hp('8%'),
    color: 'gray',
  },
  productsContainer: {
    borderRadius: 10,
        marginBottom: hp('2%'),
        width: wp('86%'),
        marginLeft: wp('1%'),
        paddingHorizontal: wp('2%'),
        paddingVertical: wp('0.5%'),
        position: 'relative',
},
emptyText: {
  fontSize: RFValue(16),
  fontFamily: 'Poppins-Regular',
  textAlign: 'center',
  marginTop: hp('20%'),
},
});

export default NotificationScreen;
