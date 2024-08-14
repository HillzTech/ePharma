import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, Dimensions, TextInput, FlatList, Button, ImageBackground } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import { AntDesign, Entypo, FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationContext } from '../contexts/locationContext'; // Adjust the path as needed
import { useAuth } from '../contexts/authContext';
import { useAvatar } from '../contexts/AvatarContext';
import GetLocation from 'react-native-get-location';
import haversine from 'haversine-distance';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Components/firebaseConfig';
import axios from 'axios';
import { useCart } from '../contexts/CartContext'; 


interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}
interface Pharmacy {
  id: string;
  pharmacyImage: string;
  pharmacyName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string; // Adjust if needed
  };
  distance: number; // Distance in meters
}



const HomeScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { user, logout } = useAuth();
  const { avatar } = useAvatar(); // Use the avatar context

  const { width } = Dimensions.get('window');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const iconSize = width < 395 ?30 : 34;
  const smallSize = width < 395 ?28 : 32;
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [showClose, setShowClose] = useState<boolean>(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('home'); // Default selected icon
  const [role, setRole] = useState<string | null>(null);
  const { setAvatar } = useAvatar();
  const [userAddress, setUserAddress] = useState<string>('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const { addToCart, getCartItemCount } = useCart();

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);



  
  
useEffect(() => {
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    
    fetchUserRole(currentUser.uid);
  }
}, []);

useEffect(() => {
  const user = firebase.auth().currentUser;
  if (user) {
    fetchUserRole(user.uid);
  }
}, []);

useEffect(() => {
  if (user) {
    fetchAvatar(user.uid);
  }
}, [user]);

const fetchAvatar = async (userId: string) => {
  try {
    const url = await firebase.storage().ref(`avatars/${userId}`).getDownloadURL();
    setAvatar(url);
  } catch (error) {
    console.log('No avatar found:', error);
  }
};

  

  
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for user ID:', userId);
      const userDoc = await firebase.firestore().collection('users').doc(userId).get();
      if (userDoc.exists) {
        console.log('User document exists:', userDoc.data());
        const userData = userDoc.data();
        if (userData && userData.role) {
          setRole(userData.role);
          console.log('User role retrieved and set:', userData.role);
        } else {
          console.error('User role is undefined');
        }
      } else {
        console.error('User document does not exist');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };
  


  

  const handleNotificationPress = () => {
    navigation.navigate('NotificationScreen');
  };
  const handleCart = () => {
    navigation.navigate('CartScreen');
  };
  const handleIconPress = (iconName: string, screenName: string) => {
    setSelectedIcon(iconName);
    navigation.navigate(screenName);
  };
  const handleRole = () => {
   
     navigation.navigate('CustomerScreen')
  };
  

  

  useEffect(() => {
    if (searchQuery) {
      const fetchProducts = async () => {
        try {
          const productCollection = await firebase.firestore()
            .collection('products')
            .where('name', '>=', searchQuery)
            .where('name', '<=', searchQuery + '\uf8ff')
            .get();
          
          const productList = productCollection.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(productList);
          setShowSearchResults(true);
          setShowClose(true);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };

      fetchProducts();
    } else {
      setProducts([]);
      setShowSearchResults(false);
      setShowClose(true);
    }
  }, [searchQuery]);

   const handleAddToCart = (product: Product) => {
    setCart([...cart, product]);
    Alert.alert('Success', 'Product added to cart!');
  };

   const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.productInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
      <Button title="Add to Cart" onPress={() => handleAddToCart(item)} />
    </View>
  );

const handleClearSearch = () => {
  setSearchQuery('');
  setProducts([]);
  setShowSearchResults(false);
};
  
const selectedIconStyle = {
  color: 'blue'
};


const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    return response.data.display_name || 'No address found';
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Error fetching address';
  }
};

// Fetch User Location
useEffect(() => {
  const getUserLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      console.log('User location:', location); // Debug log
      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // Fetch address for the user
      const address = await getAddressFromCoordinates(location.latitude, location.longitude);
      console.log('User address:', address);
      setUserAddress(address); // Update state with user's address

    } catch (error) {
      console.error('Error getting user location:', error);
      Alert.alert('Error', 'Failed to get user location. Ensure location services are enabled and permissions are granted.');
    }
  };

  getUserLocation();
}, []);

useEffect(() => {
  if (userLocation) {
    fetchPharmacies();
  }
}, [userLocation]);

const fetchPharmacies = async () => {
  try {
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
  }
};

const renderPharmacyItem = ({ item }: { item: Pharmacy }) => (
  <TouchableOpacity style={styles.pharmacyContainer} onPress={() => handlePress(item.id)}>
    <Image
      source={item.pharmacyImage ? { uri: item.pharmacyImage } : require('../assets/Pharmacy.jpg')}
      style={styles.pharmacyImage}
    />
    
    <View style={styles.pharmacyContainer}>
      <Text style={styles.pharmacyName}>{item.pharmacyName}</Text>
      <Text style={styles.pharmacyDistance}>{(item.distance * 0.000621371).toFixed(0)} miles</Text>
      <Text style={styles.pharmacyAddress}>{item.location.address}</Text>
    </View>
  </TouchableOpacity>
);


const handlePress = (pharmacyId: string) => {
  navigation.navigate('PharmacyDetailsScreen', { pharmacyId }); // Navigate to PharmacyDetailsScreen with pharmacyId
};

/*const renderPharmacy = ({ item }: { item: Pharmacy }) => (
  <View style={styles.pharmacyContainer}>
      <TouchableOpacity onPress={() => handlePress(item.id)}>
    <Image
      source={item.pharmacyImage ? { uri: item.pharmacyImage } : require('../assets/Pharmacy.jpg')}
      style={styles.pharmacyImage}
    />
    <Text style={styles.pharmacyName}>{item.pharmacyName}</Text>
  
    <Text style={styles.pharmacyDistance}>{(item.distance * 0.000621371).toFixed(0)} miles away</Text>
    </TouchableOpacity>
  </View>
);
*/



  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', top: hp('4.6%') }}>
          <Ionicons name="location-outline" size={RFValue(16)} color="black" />
          <Text style={{textAlign:'center', fontFamily:'Poppins-Bold', fontSize:RFValue(10)}}>{userAddress}</Text>
        </View>
      <View style={{marginTop:hp('4%'), flexDirection:'row', alignItems:'center', justifyContent:'space-between',paddingHorizontal:wp('6%')}}>

           <TouchableOpacity onPress={handleRole}>
           <Image
              source={avatar ? { uri: avatar } : require('../assets/avatar.png')}
              style={styles.avatar}
            />
          
           </TouchableOpacity>
            
          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:wp('3%')}}>
            <TouchableOpacity onPress={handleNotificationPress} style={{}}>
          <Ionicons name="notifications-outline" size={RFValue(28)} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleCart}>
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={RFValue(24)} color="black" />
            {getCartItemCount() > 0 && (
              <View style={styles.cartItemCount}>
                <Text style={styles.cartItemCountText}>{getCartItemCount()}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        </View>

          

      </View>

      {user && (
        <View style={{paddingHorizontal:wp('6%'), top:wp('2%')}}>
          <Text style={{ fontSize: RFValue(19), fontFamily: 'Poppins-Bold',}}>Hi, {user.username} </Text>
          <Text style={{fontFamily:'Poppins-Regular', bottom:hp('1%'), fontSize:RFValue(9)}}>How Are You Today? </Text>
          
        </View>
      )}

<View style={styles.searchContainer}>
  <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:wp('3%'), top:hp('4%')}}>
    <TouchableOpacity>
    <Ionicons name='search' size={iconSize} style={{opacity:0.6}}/>
    </TouchableOpacity>

    
  
  </View>
 
 
    
      <TextInput
        style={styles.searchInput}
        placeholder="Search medications"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
        <View style={{top:hp('4%'),backgroundColor:'black', height:'auto', borderRadius:10}}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      </View>
    
    </View>

    <View>
    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-around'}}>
      <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(17), color:'black'}}>Pharmacies near you</Text>
      <TouchableOpacity> 
        <Text style={{fontFamily:'Poppins-Regular', fontSize:RFValue(15), color:'blue', top:hp('0.4%')}}>See all</Text>
      </TouchableOpacity>
      

    </View>
    </View>

    <View style={styles.pharmaciesListContainer}>
      
        <FlatList
          data={pharmacies}
          renderItem={renderPharmacyItem}
          keyExtractor={(item) => item.id}
          numColumns={2} // Display two items in a row
                key={2}
        />
      </View>



    <TouchableOpacity onPress={() => handleIconPress('search', 'PharmacyScreen')} style={{ position: 'absolute',justifyContent: 'center', alignItems: 'center', top: hp('93%'), right: wp('1.5%'), left: 0,zIndex: 10 }}>
        <ImageBackground source={require('../assets/Search.png')} style={{ width: wp('20%'), height: wp('18%') }} />
      </TouchableOpacity>

      <View
  style={{
    position: 'absolute', // Fixes the position relative to the screen
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: hp('98.5%'), // Position from the top of the screen
    left: 0,
    right: 0,
    paddingHorizontal: wp('5%'),
    
    zIndex: 10 // Optional: if you need to ensure it's on top of other elements
  }}
>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('6%') }}>
          <TouchableOpacity onPress={() => handleIconPress('home', 'HomeScreen')}>
            <Ionicons name='home' size={iconSize} color={selectedIcon === 'home' ? 'blue' : 'white'} />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(9), color: 'grey' }}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleIconPress('help', 'CategoryScreen')}>
          <MaterialIcons name="category" size={iconSize} color={selectedIcon === 'help' ? 'blue' : 'white'} style={{left:wp('1.5%') }}/>
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(9), color: 'grey', right:wp('1%') }}>Category</Text>
          </TouchableOpacity>
        </View>


        

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('3%') }}>
        <TouchableOpacity onPress={() => handleIconPress('user','OrderScreen')}>
  <Entypo name='shopping-cart' size={smallSize} color={selectedIcon === 'user' ? 'blue' : 'white'} style={{ left: wp('1.5%') }} />
  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(9), color: 'grey', left: wp('1.5%') }}>Order</Text>
</TouchableOpacity>

          <TouchableOpacity onPress={() => handleIconPress('medical', 'AppointmentScreen')}>
            <FontAwesome5 name='briefcase-medical' size={smallSize} color={selectedIcon === 'medical' ? 'blue' : 'white'} style={{ left: wp('9%') }} />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(9), color: 'grey', left:wp('2%') }}>Appointment</Text>
          </TouchableOpacity>

          
        </View>
      </View>

      <View style={{top:hp('2.5%'), backgroundColor:'black', height:hp('10%')}}>
            <></>
            </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  
  avatar: {
    width: RFValue(40),
    height: RFValue(39),
    borderRadius: RFValue(50),

  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: RFValue(14),
    padding: RFValue(4),
  },

  searchContainer: {
    width: wp('90%'),
    marginLeft:wp('5%'),
    bottom: hp('2%')
    
  },
  
 
 
  searchInput: {
    height: hp('6%'),
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: hp('-1%'),
    paddingHorizontal: wp('2%'),
    borderRadius:10,
    textAlign:'center',
    bottom:hp('1%'),
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Regular',
  
  },
  productContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  
    
   
  
    
  },
  image: {
    width: wp('15%'),
    height: hp('5%'),
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
  },
  name: {
    fontSize: RFValue(15),
  },
  price: {
    fontSize:  RFValue(15),
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: wp('0.1%'),
    top: hp('9%'),
  },
  pharmaciesListContainer: {
    flex: 1,
    padding: wp('5%'),
    paddingBottom: hp('10%'),
  },
  pharmacyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: wp('1%'),
    padding: wp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius:10
  },
  pharmacyImage: {
    width: wp('40%'),
    height: hp('15%'),
    borderTopLeftRadius:10,
    borderTopRightRadius:10
  },
  pharmacyName: {
    fontSize: RFValue(14),
    fontFamily: 'Poppins-Bold',
    marginLeft: wp('1%'),
  },
  
  pharmacyDistance: {
    fontSize: RFValue(12),
    color: '#888',
    right:wp('4%'),
    fontFamily: 'Poppins-Regular',
  },

  pharmacyAddress: {
    fontSize: RFValue(12),
    color: '#888',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartItemCount: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemCountText: {
    color: 'white',
    fontSize: RFValue(12),
    fontWeight: 'bold',
  },

});

export default HomeScreen;

