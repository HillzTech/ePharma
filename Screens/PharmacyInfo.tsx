import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as ImagePicker from 'expo-image-picker';
import GetLocation from 'react-native-get-location';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from "../Components/firebaseConfig";
import LoadingOverlay from '../Components/LoadingOverlay';
import { useAuth } from '../contexts/authContext';
import RetailFooter from '../Components/RetailFooter';
import { ImageBackground } from 'react-native';

const PharmacyInfo: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [pharmacyName, setPharmacyName] = useState<string>('');
  const [pharmacyPhone, setPharmacyPhone] = useState<string>(''); // New state for phone number
  const [pharmacyImage, setPharmacyImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isLoading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      try {
        const userPharmacyDocRef = doc(collection(db, 'pharmacy'), user?.uid);
        const docSnap = await getDoc(userPharmacyDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPharmacyName(data.pharmacyName || '');
          setPharmacyPhone(data.pharmacyPhone || ''); // Set phone number
          setPharmacyImage(data.pharmacyImage || null);
          setLocation(data.location || null);
        }
      } catch (error) {
        console.error('Error fetching pharmacy details:', error);
        Alert.alert('Error', 'Failed to fetch pharmacy details.');
      }
    };

    fetchPharmacyDetails();
  }, [user]);

  const handleIconPress = (screenName: string) => {
    navigation.navigate(screenName);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPharmacyImage(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      setLocation({ latitude: location.latitude, longitude: location.longitude });
      Alert.alert('Location retrieved.');
    } catch (error) {
      Alert.alert('Error', 'Failed to get location.');
    }
  };

  const handleSave = async () => {
    if (!pharmacyName || !pharmacyImage || !location || !pharmacyPhone) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      // Upload the image to Firebase Storage
      const imageUri = pharmacyImage;
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const imageRef = ref(storage, `pharmacy_images/${user?.uid}`);
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);

      // Save or update the pharmacy details in Firestore
      const userPharmacyDocRef = doc(collection(db, 'pharmacy'), user?.uid);
      await setDoc(userPharmacyDocRef, {
        pharmacyName,
        pharmacyPhone, // Save phone number
        pharmacyImage: imageUrl,
        location,
        userId: user?.uid,
      }, { merge: true });

      Alert.alert('Success', 'Pharmacy details saved successfully.');
      navigation.navigate('RetailerProfile');
    } catch (error) {
      console.error('Error saving pharmacy details:', error);
      Alert.alert('Error', 'Failed to save pharmacy details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isLoading && <LoadingOverlay />}
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp('5%'), top: hp('3%') }}>
        <TouchableOpacity onPress={() => handleIconPress('RetailerProfile')}>
          <Ionicons name="chevron-back" size={29} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(18), right: wp('25%') }}>Pharmacy Details</Text>
      </View>
      <ScrollView >
      <View style={{ padding: wp('5%'), top: hp('3%') }}>
        <TextInput
          placeholder="Pharmacy Name"
          value={pharmacyName}
          onChangeText={setPharmacyName}
          style={{ marginBottom: 20, fontSize: RFValue(16), borderColor: 'black', borderWidth: 1, fontFamily: 'Poppins-Regular', borderRadius: 6, padding: wp('2%') }}
        />

        <TextInput
          placeholder="Pharmacy Phone Number"
          value={pharmacyPhone}
          onChangeText={setPharmacyPhone}
          style={{ marginBottom: 20, fontSize: RFValue(16), borderColor: 'black', borderWidth: 1, fontFamily: 'Poppins-Regular', borderRadius: 6, padding: wp('2%') }}
        />

        <TouchableOpacity onPress={pickImage} style={{ borderRadius: 6, padding: wp('2%'), borderColor: 'black', borderWidth: 1 }}>
          <Text style={{ marginBottom: 10, fontSize: RFValue(16) }}>Select Pharmacy Image</Text>
          {pharmacyImage && <Image source={{ uri: pharmacyImage }} style={{ width: wp('80%'), height: hp('30%') }} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={getLocation} style={{ marginTop: hp('5%') ,  }}>
          <ImageBackground source={require('../assets/map.jpg')} style={{ width: wp("90%"), height: hp("40%") }} />
          <Text style={{ fontSize: RFValue(16), backgroundColor: 'white', padding: hp('1%') , borderRadius: 10,  fontFamily: 'OpenSans-Bold', textAlign: 'center', color: 'blue', bottom: hp('24%'), width: wp('59%'), left: wp('14%')   }}>Get Pharmacy Location</Text>
          {location && (
            <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10), textAlign: 'center', color: 'blue', bottom: hp('19%'),  }}>
              Latitude: {location.latitude}, Longitude: {location.longitude}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={{ marginTop: 30, marginBottom: hp('8%'), backgroundColor: 'blue', padding: hp('2%') , borderRadius: 10 }}>
          <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(18), textAlign: 'center', color: 'white'}}>Save Details</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PharmacyInfo;
