import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView, ImageBackground, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import GetLocation from 'react-native-get-location';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import Background from '../Components/Background';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocationContext } from '../contexts/locationContext'; // Adjust the path as needed
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../Components/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LocationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const locationContext = useContext(LocationContext);
  const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

  
 // Check if context is available
 if (!locationContext) {
  throw new Error('LocationContext must be used within a LocationContextProvider');
}

const { locationDispatch } = locationContext;


const handleUseMyLocation = async () => {
  const permission = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  setLoading(true);

  if (permission === RESULTS.GRANTED) {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(async (location) => {
        const { latitude, longitude } = location;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
          .then(async (response) => response.json())
          .then(async (data) => {
            if (data.address) {
              const address = data.display_name;
              const locationData = { latitude, longitude, address };

              // Dispatch the location data to the context
              locationDispatch?.({
                type: 'UPDATE_LOCATION',
                payload: { location: locationData },
              });

              // Save the location data to AsyncStorage
              try {
                await AsyncStorage.setItem('userLocation', JSON.stringify(locationData));
                console.log('Location saved successfully.');
              } catch (error) {
                console.error('Error saving location: ', error);
              }

              setLoading(false);

              // Navigate to HomeScreen if address is available
              navigation.replace('LoginScreen');
            } else {
              Alert.alert('Error', 'Unable to get address from location.');
              setLoading(false);
            }
          })
          .catch((error) => {
            setLoading(false);
            Alert.alert('Error', `Error fetching address: ${error.message}`);
          });
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert('Error', `Error getting location: ${error.message}`);
      });
  } else {
    setLoading(false);
    const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (result === RESULTS.GRANTED) {
      handleUseMyLocation();
    } else {
      Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
    }
  }
};

  const handleSkip = () => {
    
      navigation.navigate('LoginScreen'); // Navigate to LoginScreen if not logged in
  };

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }}>
      
        <View style={styles.locator}>
          <View style={styles.container}>
            <ImageBackground source={require('../assets/locator2.png')} style={{ width: wp('19%'), height: hp('12%'), bottom: hp('8%') }} />
            <Text style={styles.text}>Enable your location</Text>
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: RFValue(11), paddingHorizontal: wp('9.5%'), bottom: hp('6%'), textAlign: 'center' }}>
              Choose your location to start finding the stores around you.
            </Text>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color="blue" />
                <Text style={styles.loadingText}>Fetching Location...</Text>
              </View>
            )}
            <TouchableOpacity onPress={handleUseMyLocation} style={{ backgroundColor: 'blue', borderRadius: 10, top: hp('1%') }}>
              <Text style={{ fontSize: RFValue(14), paddingVertical: hp('1.5%'), fontFamily: 'OpenSans-Bold', color: 'white', paddingHorizontal: wp('16%') }}>
                Use My Location
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={{ fontSize: RFValue(14), top: hp('4.5%'), fontFamily: 'OpenSans-Bold', color: 'black' }}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      
      </SafeAreaView>
    </Background>
  );
};

const styles = StyleSheet.create({
  locator: {
    justifyContent: 'center',
    alignItems: 'center',
    top: hp('24%'),
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    height: hp('56%'),
    width: wp('85%'),
    borderRadius: 15,
  },
  text: {
    fontSize: RFValue(19),
    marginVertical: hp('2%'),
    fontFamily: 'OpenSans-Bold',
    bottom: hp('6%'),
  },
  loadingContainer: {
    alignItems: 'center',
    top: hp('-29%'),
  },
  loadingText: {
    top: hp('3%'),
    fontFamily: 'OpenSans-Regular',
    fontSize: RFValue(14),
  },
});

export default LocationScreen;
