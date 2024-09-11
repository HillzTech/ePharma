import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, FlatList } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Components/firebaseConfig';
import haversine from 'haversine-distance';
import { useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import CostumerFooter from '../Components/CostumerFooter'; // Adjust path as needed
import GetLocation from 'react-native-get-location';
import { Ionicons } from '@expo/vector-icons';
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
    distance: number; // Distance in meters
  }
  const SeeAll: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isLoading, setLoading] = useState(false);
    
  
    useEffect(() => {
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
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.location) {
              const location = data.location as {
                latitude: number;
                longitude: number;
                address: string;
              };
  
              const pharmacy: Pharmacy = {
                id: doc.id,
                pharmacyImage: data.pharmacyImage,
                pharmacyName: data.pharmacyName,
                location: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  address: location.address,
                },
                distance: 0, // Initialize distance to 0; will be calculated later
              };
  
              fetchedPharmacies.push(pharmacy);
            }
          });
  
          // If userLocation is available, calculate distances
          if (userLocation) {
            const pharmaciesWithDistance = fetchedPharmacies.map((pharmacy) => {
              const distance = haversine(userLocation, {
                latitude: pharmacy.location.latitude,
                longitude: pharmacy.location.longitude
              });
              return { ...pharmacy, distance };
            });
  
            const sortedPharmacies = pharmaciesWithDistance.sort((a, b) => a.distance - b.distance);
            setPharmacies(sortedPharmacies);
          }
        } catch (error) {
          console.error('Error fetching pharmacies:', error);
        }finally{
        setLoading(false);
    }
      };
  
      fetchPharmacies();
    }, [userLocation]);
  
    // Fetch user location (you can replace this with your own method)
    useEffect(() => {
      const getUserLocation = async () => {
        try {
          // Replace with your method to get user location
          const location = await GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
          });
  
          setUserLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        } catch (error) {
          console.error('Error getting user location:', error);
        }
      };
  
      getUserLocation();
    }, []);

    const handleBack = () => {
      navigation.navigate('HomeScreen');
  };
  
    const handlePress = (pharmacyId: string) => {
      navigation.navigate('PharmacyDetailsScreen', { pharmacyId });
    };
  
    const renderPharmacyItem = ({ item }: { item: Pharmacy }) => (
      <TouchableOpacity style={styles.pharmacyContainer} onPress={() => handlePress(item.id)}>
        <Image
          source={item.pharmacyImage ? { uri: item.pharmacyImage } : require('../assets/Pharmacy.jpg')}
          style={styles.pharmacyImage}
        />
        <View style={styles.pharmacyInfo}>
          <Text style={styles.pharmacyName}>{item.pharmacyName}</Text>
          <Text style={styles.pharmacyDistance}>{(item.distance * 0.000621371).toFixed(0)} miles away</Text>
          <Text style={styles.pharmacyAddress}>{item.location.address}</Text>
        </View>
      </TouchableOpacity>
    );
  
    return (
      <SafeAreaView style={styles.container}>
         {isLoading && <LoadingOverlay />}
         <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: hp('5%'), right: wp('5%') }}>
         <TouchableOpacity onPress={handleBack} >
          <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
          </TouchableOpacity>
          <Text style={{textAlign:'center', fontFamily:'Poppins-Bold', fontSize:RFValue(18), right: wp('9%')}}>Sell All Pharmacies</Text>
        </View>

        <View style={{ padding: wp('0%') }}>
        <FlatList
          data={pharmacies}
          renderItem={renderPharmacyItem}
          keyExtractor={(item) => item.id}
          numColumns={2} // Display two items in a row
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.pharmaciesContainer}
          showsVerticalScrollIndicator={true}
        />
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
        marginVertical: wp('1%'),
        
        borderWidth: 1,
        borderColor:'white',
        marginHorizontal: wp('1%'),
        borderRadius:10
    },
    pharmacyImage: {
        width: wp('45%'),
        height: hp('15%'),
        borderTopLeftRadius:10,
        borderTopRightRadius:10,
        borderColor:'white',
         borderWidth:1
    },
    pharmacyInfo: {
      
    },
    pharmacyName: {
      fontSize: RFValue(14),
      fontWeight: 'bold',
      color:'black'
    },
    pharmacyDistance: {
      fontSize: RFValue(13),
    },
    pharmacyAddress: {
      fontSize: RFValue(12),
      color: 'gray',
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
    pharmaciesContainer: {
      padding: 10,
    },
  });
  
  export default SeeAll;
    