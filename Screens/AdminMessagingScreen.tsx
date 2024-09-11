import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { ref, get, onValue } from 'firebase/database';
import { realtimeDb } from "../Components/firebaseConfig";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AdminMessagingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [users, setUsers] = useState<Array<any>>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = ref(realtimeDb, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersWithMessages = Object.keys(usersData).filter(uid => {
          const messagesRef = ref(realtimeDb, `users/${uid}/messages`);
          return onValue(messagesRef, (snapshot) => snapshot.exists());
        }).map(uid => ({ uid }));
        setUsers(usersWithMessages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: hp('2%'), backgroundColor: '#D3D3D3' }}>
      <View style={{ paddingVertical: wp('7%'), left: hp('13%') }}>
        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(19) }}>Complaints</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: wp('2%') }}>
        <FlatList
          data={users}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={{ paddingVertical: wp('3%') }}
              onPress={() => navigation.navigate('ChatScreen', { userId: item.uid })}
            >
              <Text style={{ fontSize: RFValue(16), fontFamily: 'OpenSans-Bold', backgroundColor: 'white', padding: hp('1.3%'), borderRadius: 8 }}>
                {item.uid}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.uid}
        />
      </View>
    </SafeAreaView>
  );
};

export default AdminMessagingScreen;
