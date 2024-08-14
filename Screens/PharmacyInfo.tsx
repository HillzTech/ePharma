import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as ImagePicker from 'expo-image-picker';
import GetLocation from 'react-native-get-location';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from "../Components/firebaseConfig"; // Adjust the import to include storage
import LoadingOverlay from '../Components/LoadingOverlay';
import { useAuth } from '../contexts/authContext';
import RetailFooter from '../Components/RetailFooter';

const PharmacyInfo: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [pharmacyName, setPharmacyName] = useState<string>('');
  const [pharmacyImage, setPharmacyImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isLoading, setLoading] = useState(false);
  const { user } = useAuth();

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
    } catch (error) {
      Alert.alert('Error', 'Failed to get location.');
    }
  };

  const handleSave = async () => {
    if (!pharmacyName || !pharmacyImage || !location) {
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

      <View style={{ padding: wp('5%'), top: hp('3%') }}>
        <TextInput
          placeholder="Pharmacy Name"
          value={pharmacyName}
          onChangeText={setPharmacyName}
          style={{ marginBottom: 20, fontSize: RFValue(16), borderColor: 'black',
            borderWidth: 1, fontFamily: 'Poppins-Regular', borderRadius: 6, padding: wp('2%') }}
        />

        <TouchableOpacity onPress={pickImage} style={{ borderRadius: 6, padding: wp('2%'), borderColor: 'black', borderWidth: 1 }}>
          <Text style={{ marginBottom: 10, fontSize: RFValue(16) }}>Select Pharmacy Image</Text>
          {pharmacyImage && <Image source={{ uri: pharmacyImage }} style={{ width: wp('80%'), height: hp('30%') }} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={getLocation} style={{ marginTop: 20 }}>
          <Text style={{ fontSize: RFValue(16) }}>Get Pharmacy Location</Text>
          {location && (
            <Text style={{ marginTop: 10 }}>
              Latitude: {location.latitude}, Longitude: {location.longitude}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={{ marginTop: 30 }}>
          <Text>Save Details</Text>
        </TouchableOpacity>
      </View>

      <View style={{ bottom: hp('13%') }}>
        <RetailFooter route={route} navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default PharmacyInfo;
