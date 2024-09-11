import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import GetLocation from 'react-native-get-location';
import haversine from 'haversine-distance';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
import { db } from '../Components/firebaseConfig';
import MapView, { Marker } from 'react-native-maps';
import openMap from 'react-native-open-maps';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CostumerFooter from '../Components/CostumerFooter';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import LoadingOverlay from '../Components/LoadingOverlay';

interface Pharmacy {
  id: string;
  pharmacyImage: string;
  pharmacyName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance: number;
}

const ProductScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentPharmacy, setCurrentPharmacy] = useState<Pharmacy | null>(null);
  const [isLoading, setLoading] = useState(false);

  // Fetch the user's location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        setLoading(true);
        const location = await GetLocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
        setUserLocation({ latitude: location.latitude, longitude: location.longitude });
      } catch (error) {
        Alert.alert('Error', 'Failed to get user location. Ensure location services are enabled.');
      }
    };
    getUserLocation();
  }, []);

  // Fetch pharmacies once the user's location is available
  useEffect(() => {
    if (userLocation) {
      fetchPharmacies();
    }
  }, [userLocation]);

  // Function to fetch pharmacies and reverse geocode their locations
  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const pharmacyCollection = collection(db, 'pharmacy');
      const querySnapshot = await getDocs(pharmacyCollection);

      if (querySnapshot.empty) {
        console.log('No pharmacies found.');
        return;
      }

      const fetchedPharmacies: Pharmacy[] = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.location) {
          // Reverse geocode to get address
          const address = await reverseGeocode(data.location.latitude, data.location.longitude);
          
          const pharmacy: Pharmacy = {
            id: doc.id,
            pharmacyImage: data.pharmacyImage,
            pharmacyName: data.pharmacyName,
            location: {
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              address: address || 'Address not available',
            },
            distance: 0,
          };
          fetchedPharmacies.push(pharmacy);
        }
      }

      if (userLocation) {
        const pharmaciesWithDistance = fetchedPharmacies.map((pharmacy) => {
          const distance = haversine(userLocation, {
            latitude: pharmacy.location.latitude,
            longitude: pharmacy.location.longitude,
          });
          return { ...pharmacy, distance };
        });
        const sortedPharmacies = pharmaciesWithDistance.sort((a, b) => a.distance - b.distance);
        setPharmacies(sortedPharmacies);
        setCurrentPharmacy(sortedPharmacies[0]); // Set the first pharmacy as the default
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
    }
  };

  // Reverse geocoding function to convert lat/lng to address using Nominatim OpenStreetMap API
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Address not available';
    }finally {
      setLoading(false);
    }
  };

  // Function to open directions using the native map app
  const openDirections = (latitude: number, longitude: number) => {
    openMap({ start: `${userLocation?.latitude},${userLocation?.longitude}`, end: `${latitude},${longitude}` });
  };

  // Function triggered when viewable items change in the FlatList
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPharmacy(viewableItems[0].item); // Automatically update the map to the first viewable item
    }
  }).current;

  // Configuration for viewability in FlatList
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Set threshold to ensure at least 50% visibility before triggering change
  };

  // Render each pharmacy item, including the map for the current pharmacy
  const renderPharmacyItem = ({ item }: { item: Pharmacy }) => {
    const distanceInMiles = parseFloat((item.distance * 0.000621371).toFixed(0)); // Convert meters to miles and parse it as a number

// Average speeds (in miles per hour)
    const walkingSpeed = 3.1;  // Walking speed
    const drivingSpeed = 31;   // Driving speed

    // Calculate estimated travel time in minutes
    const walkTimeInMinutes = (distanceInMiles / walkingSpeed) * 60;  // Convert hours to minutes
    const driveTimeInMinutes = (distanceInMiles / drivingSpeed) * 60; // Convert hours to minutes


    return (
      <View style={styles.pharmacyContainer}>
        <TouchableOpacity onPress={() => setCurrentPharmacy(item)}>
          <Image
            source={item.pharmacyImage ? { uri: item.pharmacyImage } : require('../assets/Pharmacy.jpg')}
            style={styles.pharmacyImage}
          />
          <View style={styles.pharmacyInfo}>
            <Text style={styles.pharmacyName}>{item.pharmacyName}</Text>
            <Text style={styles.pharmacyAddress}>{item.location.address}</Text>
            <Text style={styles.pharmacyDistance}>{distanceInMiles} miles away</Text>

            {/* Display walking and driving times */}

            <View style={{flexDirection: 'row', gap: wp('20.5%'),  top: hp('2%')}}>
            <View style={{flexDirection: 'row', gap: wp('2%')}}>
            <FontAwesome5 name="walking" size={RFValue(22)} color="black" />
            <Text style={styles.travelTime}>{walkTimeInMinutes.toFixed(0)} min</Text>
              </View>
              
              <View style={{flexDirection: 'row',  gap: wp('2%')}}>
              <FontAwesome name="bus" size={RFValue(22)} color="black" />
              <Text style={styles.travelTime}>{driveTimeInMinutes.toFixed(0)} min</Text>
            </View>

            </View>
            
          
            
            <View style={{  backgroundColor: 'blue', borderRadius: 50, bottom: hp('7%'),
    left: wp('34%'), width: wp('13%'), height: wp('13%')}}>
            <TouchableOpacity onPress={() => openDirections(item.location.latitude, item.location.longitude)}>
              <FontAwesome name="location-arrow" size={RFValue(28)} color="white" style={styles.directionsButton} />
            </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
        {isLoading && <LoadingOverlay />}
      {currentPharmacy && (
        <MapView
          style={styles.map}
          region={{
            latitude: currentPharmacy.location.latitude,
            longitude: currentPharmacy.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}>
          <Marker
            coordinate={{ latitude: currentPharmacy.location.latitude, longitude: currentPharmacy.location.longitude }}
          />
        </MapView>
      )}
      <View style={{ paddingHorizontal: hp('1%'), padding: wp('2%') }}>
        <FlatList
          data={pharmacies}
          renderItem={renderPharmacyItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          onViewableItemsChanged={onViewableItemsChanged} // Hook to handle viewable items
          viewabilityConfig={viewabilityConfig} // Viewability configuration
        />
      </View>


      <View style={{ bottom: hp('94%'), position: 'absolute', top: hp('0%'), right: wp('0%'), left: 0, zIndex: 10 }}>
        <CostumerFooter route={route} navigation={navigation} />
        <View style={{ top: hp('97%'), backgroundColor: 'black', height: hp('10%') }}>
        <></>
      </View>
      </View>
      
      
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D3D3',
  },
  pharmacyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 20, 
    backgroundColor: 'white',
    marginRight: wp('2.5%'),
  },
  map: {
    width: wp('100%'),
    height: hp('50%'),
  },
  pharmacyImage: {
    width: wp('89%'),
    height: hp('20%'),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  
  },
  pharmacyInfo: {
    alignItems: 'center',
    padding: wp('1%'),
  },
  pharmacyName: {
    fontSize: RFValue(17),
    fontFamily: 'Poppins-Bold',
    paddingHorizontal: wp('2%'),
    top: wp('2.5%'),
  },
  pharmacyDistance: {
    fontSize: RFValue(14),
    color: 'gray',
    paddingHorizontal: wp('2%'),
    right: wp('16%'),
    top: wp('1.5%'),
  },
  pharmacyAddress: {
    fontSize: RFValue(12),
    color: 'gray',
    paddingHorizontal: wp('2%'),
    paddingBottom: hp('1%'),
    width: wp('60%'),
    top: wp('2.5%'),
  },
  travelTime: {
    fontSize: RFValue(12),
    color: '#555',
    
  },
  directionsButton: {
    top: hp('1.1%'),
    left: wp('2.7%'),
  },
});

export default ProductScreen;
