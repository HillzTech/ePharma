import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, FlatList, Alert, Linking } from 'react-native';
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../Components/firebaseConfig";
import LoadingOverlay from '../Components/LoadingOverlay';
import { useAuth } from '../contexts/authContext';
import RetailFooter from '../Components/RetailFooter';

// Helper function to get the current day of the week
const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  return days[today];
};

// Helper function to check if current time is within available hours
const isWithinAvailableHours = (availability: string) => {
  // Function to parse time in AM/PM format to minutes since midnight
  const parseTime = (time: string) => {
    const [timePart, modifier] = time.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes) || !modifier) {
      console.error('Invalid time format:', time);
      return NaN;
    }

    let hours24 = hours;
    if (modifier === 'PM' && hours !== 12) {
      hours24 += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours24 = 0;
    }

    return hours24 * 60 + minutes;
  };

  // Split availability string into start and end times
  const [startTime, endTime] = availability.split('-').map(time => time.trim());

  // Ensure that startTime and endTime are not undefined
  if (!startTime || !endTime) {
    console.error('Invalid time format:', availability);
    return false;
  }

  // Get current time
  const now = new Date();
  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();

  // Parse start and end times
  const startMinutesTotal = parseTime(startTime);
  const endMinutesTotal = parseTime(endTime);

  // Check for parsing errors
  if (isNaN(startMinutesTotal) || isNaN(endMinutesTotal)) {
    console.error('Error parsing time:', startTime, endTime);
    return false;
  }

  // Convert current time to minutes
  const currentMinutes = nowHours * 60 + nowMinutes;

  console.log(`Current Time: ${nowHours}:${nowMinutes}`);
  console.log(`Start Time: ${startTime}`);
  console.log(`End Time: ${endTime}`);
  console.log(`Current Minutes: ${currentMinutes}`);
  console.log(`Start Minutes Total: ${startMinutesTotal}`);
  console.log(`End Minutes Total: ${endMinutesTotal}`);

  // Handle the case where end time is before start time (crossing midnight)
  if (endMinutesTotal < startMinutesTotal) {
    return currentMinutes >= startMinutesTotal || currentMinutes <= endMinutesTotal;
  } else {
    return currentMinutes >= startMinutesTotal && currentMinutes <= endMinutesTotal;
  }
};


// Helper function to check if current day is within available days
const isAvailableDay = (availableDays: string) => {
  const daysArray = availableDays.split('-').map(day => day.trim());
  
  // Handle case where availableDays is a range
  if (daysArray.length === 2) {
    const [startDay, endDay] = daysArray;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const startIndex = days.indexOf(startDay);
    const endIndex = days.indexOf(endDay);
    const currentDay = getCurrentDay();
    const currentIndex = days.indexOf(currentDay);
    
    // Check if current day is within the range
    return currentIndex >= startIndex && currentIndex <= endIndex;
  }

  // Handle case where availableDays is a single day
  const currentDay = getCurrentDay();
  return daysArray.includes(currentDay);
};


// Function to determine if pharmacist is available
const isWithinAvailability = (availability: string, daysAvailable: string) => {
  const dayAvailable = isAvailableDay(daysAvailable);
  const timeAvailable = isWithinAvailableHours(availability);

  console.log(`Current Day ${getCurrentDay()} is ${dayAvailable ? '' : 'not '}in Days Available: ${daysAvailable}`);
  console.log(`Current Time is ${timeAvailable ? '' : 'not '}within Available Hours: ${availability}`);

  return dayAvailable && timeAvailable;
};


const AppointmentScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [pharmacists, setPharmacists] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPharmacists = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'pharmacists'));
        const fetchedPharmacists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPharmacists(fetchedPharmacists);
      } catch (error) {
        console.error('Error fetching pharmacists:', error);
        Alert.alert('Error', 'Failed to fetch pharmacists.');
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacists();
  }, []);

  const initiateWhatsAppAction = async (pharmacistId: string, contactDetails: string, action: 'chat' | 'voice' | 'video') => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to contact pharmacists.');
      return;
    }

    const pharmacist = pharmacists.find(p => p.id === pharmacistId);
    if (pharmacist && !isWithinAvailability(pharmacist.availability, pharmacist.daysAvailable)) {
      Alert.alert('Info', 'The pharmacist is not currently available.');
      return;
    }

    let whatsappUrl = `whatsapp://send?phone=${contactDetails}`;
    if (action === 'voice') {
      whatsappUrl += `&text=I would like to start a voice call.`;
    } else if (action === 'video') {
      whatsappUrl += `&text=I would like to start a video call.`;
    }

    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on your device.');
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: wp('6%'), borderBottomWidth: 1, borderBottomColor: 'white',  }}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={{ width: wp('28%'), height: hp('18%'), borderRadius: 10 }} />
      ) : (
        <View style={{ width: wp('20%'), height: hp('10%'), borderRadius: 10, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="person" size={24} color="white" />
        </View>
      )}
      <View style={{ marginLeft: wp('4%'), gap: wp('4%') }}>
        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(16) }}>{item.name}</Text>
        
        <Text>Available: {item.availability}</Text>
        <Text>Days Available: {item.daysAvailable}</Text>
        <View style={{ flexDirection: 'row', marginTop: 5 }}>
          <TouchableOpacity onPress={() => initiateWhatsAppAction(item.id, item.contactDetails, 'chat')}>
            <Ionicons name='chatbox' size={30} color={'blue'} style={{ marginRight: wp('7%') }}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => initiateWhatsAppAction(item.id, item.contactDetails, 'voice')}>
             <Ionicons name='call' size={30} color={'blue'} style={{ marginRight: wp('7%') }}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => initiateWhatsAppAction(item.id, item.contactDetails, 'video')}>
          <Entypo name="video-camera" size={30} color="blue" style={{ marginRight: wp('7%') }}/>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 , backgroundColor: '#D3D3D3'}}>
      {isLoading && <LoadingOverlay />}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp('5%'), top: hp('3%') }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={29} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(18), right: wp('25%') }}>Pharmacists</Text>
      </View>

      <FlatList
        data={pharmacists}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: hp('10%') }}
      />

      
    </SafeAreaView>
  );
};

export default AppointmentScreen;
