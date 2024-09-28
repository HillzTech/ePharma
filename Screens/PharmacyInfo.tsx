import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Image, Alert, ScrollView, Dimensions, BackHandler, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as ImagePicker from 'expo-image-picker';
import Geolocation from '@react-native-community/geolocation';

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
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

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

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        Alert.alert('Location retrieved.');
      },
      (error) => {
        console.error('Error fetching location:', error);
        Alert.alert('Error', 'Failed to get location.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
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

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
  
    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#D3D3D3' }}>
      {isLoading && <LoadingOverlay />}
      <StatusBar backgroundColor="black" barStyle="light-content"/>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp('5%'), marginTop: Platform.OS === 'web' ? -7:  hp('0%') }}>
        <TouchableOpacity onPress={() => handleIconPress('RetailerProfile')}>
          <Ionicons name="chevron-back" size={29} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(18), right: windowWidth > 1000 ? wp('50%') :wp('25%') }}>Pharmacy Details</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal:  windowWidth > 1000 ? wp('30%') :wp('5%')}}>
      
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',  borderColor: 'black', borderWidth: 1,  borderRadius: 6, padding: 10, marginBottom: 10,}}>
        <TextInput
        
          placeholder="Pharmacy Name"
          value={pharmacyName}
          onChangeText={setPharmacyName}
          style={{  fontSize: 17, fontFamily: 'Poppins-Regular', }}
        />
        <Ionicons name="chevron-forward" size={23} color="black" style={{ opacity:0.5}}/>
     </View>

        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',  borderColor: 'black', borderWidth: 1,  borderRadius: 6, padding: 10, marginBottom: 10,}}>
       
       
         
        <TextInput
          placeholder="Pharmacy Phone Number"
          value={pharmacyPhone}
          onChangeText={setPharmacyPhone}
          style={{fontSize: 17, fontFamily: 'Poppins-Regular',  }}
        />
           <Ionicons name="chevron-forward" size={23} color="black" style={{ opacity:0.5}}/>
        </View>

        <TouchableOpacity onPress={pickImage} style={{ borderRadius: 6, padding: wp('2%'), borderColor: 'black', borderWidth: 1 }}>
          <Text style={{ marginBottom: 10, fontSize: 17}}>Select Pharmacy Image</Text>
          {pharmacyImage && <Image source={{ uri: pharmacyImage }} style={{ width: windowWidth > 1000 ? 420 : 310, height: windowWidth > 1000 ? 290 : 220 }} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={getLocation} style={{ marginTop: hp('5%') ,  }}>
          <ImageBackground source={require('../assets/map.jpg')} style={{ width: windowWidth > 1000 ? 500 : 320, height: windowWidth > 1000 ? 400 :280 }} />
          <Text style={{ fontSize: 17, backgroundColor: 'white', padding: hp('1%') , borderRadius: 10,  fontFamily: 'OpenSans-Bold', textAlign: 'center', color: 'blue', bottom: hp('24%'), width:windowWidth > 1000 ? wp('20%') :wp('59%'), left: windowWidth > 1000 ? wp('8%') :wp('14%')   }}>Get Pharmacy Location</Text>
          {location && (
            <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 11, textAlign: 'center', color: 'blue', bottom: hp('19%'),  }}>
              Latitude: {location.latitude}, Longitude: {location.longitude}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={{ marginTop: 30, marginBottom: hp('8%'), backgroundColor: 'blue', padding: hp('2%') , borderRadius: 10 }}>
          <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 19, textAlign: 'center', color: 'white'}}>Save Details</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PharmacyInfo;
