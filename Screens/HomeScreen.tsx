import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, Dimensions, TextInput, FlatList, Button, ImageBackground } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import { AntDesign, Entypo, EvilIcons, FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
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
import { useFocusEffect } from '@react-navigation/native';
import CostumerFooter from '../Components/CostumerFooter';
import { AllProductsContext } from '../contexts/AllProductsContext';
import LoadingOverlay from '../Components/LoadingOverlay';

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
  const { products, isLoading } = useContext(AllProductsContext);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState('');
  
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
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false);
  
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);


  useFocusEffect(
    React.useCallback(() => {
      const checkUnreadMessages = async () => {
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
          const messagesRef = firebase.firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('messages');
          
          const snapshot = await messagesRef.where('unread', '==', true).get();
          setHasUnreadMessages(!snapshot.empty);
        }
      };
  
      checkUnreadMessages();
  
      return () => {
        // Clean up if needed
      };
    }, [])
  );
  
  
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
useEffect(() => {
  console.log('Unread messages:', hasUnreadMessages);
}, [hasUnreadMessages]);

  

  
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
    setHasUnreadMessages(false);
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
  

  

 

   const handleAddToCart = (product: Product) => {
    setCart([...cart, product]);
    Alert.alert('Success', 'Product added to cart!');
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
    
    <View style={styles.pharmacyInfo}>
      <Text style={styles.pharmacyName}>{item.pharmacyName}</Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap:wp('4%') }}>
          <Ionicons name="location-outline" size={RFValue(15)} color="black" />
          <Text style={styles.pharmacyDistance}>{(item.distance * 0.000621371).toFixed(0)} miles away</Text>
        </View>
      <Text style={styles.pharmacyAddress}>{item.location.address}</Text>
    </View>
  </TouchableOpacity>
);

// Sort products by upload time (assuming 'uploadedAt' is a timestamp field)
useEffect(() => {
  const sortedProducts = [...products].sort((a, b) => b.uploadedAt - a.uploadedAt);
  setFilteredProducts(sortedProducts);
}, [products]);

// Filter products based on the search query
useEffect(() => {
  if (searchQuery === '') {
    setFilteredProducts([...products].sort((a, b) => b.uploadedAt - a.uploadedAt));
  } else {
    const filtered = products
      .filter(product => product.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.uploadedAt - a.uploadedAt); // Sorting the filtered list by upload time
    setFilteredProducts(filtered);
  }
}, [searchQuery, products]);

const handleProductPress = (product: any) => {
  navigation.navigate('AddToCartScreen', { product });
};

const handlePress = (pharmacyId: string) => {
  navigation.navigate('PharmacyDetailsScreen', { pharmacyId }); // Navigate to PharmacyDetailsScreen with pharmacyId
};



  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', top: hp('5%') }}>
          <Ionicons name="location-outline" size={RFValue(14)} color="black" />
          <Text style={{textAlign:'center', fontFamily:'Poppins-Bold', fontSize:RFValue(10)}}>{userAddress}</Text>
        </View>
      <View style={{marginTop:hp('5%'), flexDirection:'row', alignItems:'center', justifyContent:'space-between',paddingHorizontal:wp('6%')}}>

           <TouchableOpacity onPress={handleRole}>
           <Image
              source={avatar ? { uri: avatar } : require('../assets/avatar.png')}
              style={styles.avatar}
            />

          <View  style={{  bottom:hp('2.5%'), left:wp('8.5%'), backgroundColor: 'grey', borderRadius:35, width:wp('4%'), height:wp('3.7%'), borderWidth:1, borderColor:'white' }}>
            <EvilIcons name="navicon" size={RFValue(12)} color="white" />
          </View>
          
           </TouchableOpacity>
            
          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:wp('3%')}}>
          <TouchableOpacity onPress={handleNotificationPress} style={{ position: 'relative' }}>
            <Ionicons name="notifications-outline" size={RFValue(24)} color="black" />
            {hasUnreadMessages && (
              <View style={styles.redDot} />
            )}
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
        <View style={{paddingHorizontal:wp('6%'), marginTop:wp('-2%')}}>
          <Text style={{ fontSize: RFValue(15), fontFamily: 'Poppins-Bold',}}>Hi, {user.username} </Text>
          <Text style={{fontFamily:'Poppins-Regular', bottom:hp('1%'), fontSize:RFValue(9)}}>How Are You Today? </Text>
          
        </View>
      )}


<View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
      </View>


    <View>
    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-around', gap:10}}>
      <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(17), color:'black'}}>Pharmacies near you</Text>
      <TouchableOpacity> 
        <Text onPress={() => navigation.navigate('SeeAll')} style={{fontFamily:'Poppins-Regular', fontSize:RFValue(15), color:'blue', top:hp('0.4%')}}>See all</Text>
      </TouchableOpacity>
      

    </View>
    </View>

    
    <View>
    <FlatList
  data={pharmacies}
  renderItem={renderPharmacyItem}
  keyExtractor={(item) => item.id}
  horizontal
  contentContainerStyle={styles.pharmaciesContainer} // Use this style to align items properly
  showsHorizontalScrollIndicator={true} // Hide scroll indicator if desired
/>
   </View>

        <View style={{ flexDirection:'row', gap:1, alignItems:'center', padding: wp('1%'), left: wp('6%') }}> 
        <Text style={{ fontSize: RFValue(17), fontFamily: 'Poppins-Bold', }}>Trending </Text>
        <FontAwesome5 name="fire" size={16} color="red" />
        </View>

        {isLoading ? (
        <LoadingOverlay />
      ) : filteredProducts.length > 0 ? (
        <View style={{ paddingBottom: hp('69%')}}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleProductPress(item)}>
              <View style={styles.productContainer}>
                <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productPrice}>N{item.price.toFixed(2)}</Text>
                <View style={styles.discountContainer}>
                  <Text style={styles.discountText}>-{item.percentageDiscount}%</Text>
                  <Text style={styles.oldPrice}>N{item.costPrice}</Text>
                </View>
                <View style={{flexDirection: 'row', paddingBottom: wp('2%'),  left: wp('2.5%')  }}>
                <Ionicons name="location-outline" size={15} color="black" />
                <Text style={styles.productDistance}>{item.distance} miles away</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
        </View>
      ) : (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No products found</Text>
        </View>
      )}
  
  

           
        

      <CostumerFooter route={route} navigation={navigation}/>
      <View style={{ bottom: hp('70.5%'), backgroundColor: 'black', height: hp('10%'), position: 'absolute', justifyContent: 'center', alignItems: 'center', top: hp('97.5%'), right: wp('0%'), left: 0, zIndex: 1  }}>
              <></>
          </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D3D3'
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
    marginTop:hp('-0.4%'),
    marginBottom:hp('2%')
  },
  searchInput: { flex: 1, height: hp('5%'), paddingHorizontal: 10, fontSize: RFValue(14) },
  listContent: {   width: wp('95%'), left: wp('3%')},
  productContainer: { 
     margin:wp('2%'), backgroundColor: 'white', borderRadius: 10, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 
  },
  productImage: { width: wp('43%'), height: hp('14%'), borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  productTitle: { fontSize: RFValue(14), fontWeight: 'bold', marginVertical: 5, paddingHorizontal: wp('3%') },
  productPrice: { fontSize: RFValue(12), color: 'green' , paddingHorizontal: wp('3%')},
  discountContainer: { flexDirection: 'row', gap: 5, paddingHorizontal: wp('3%') },
  discountText: { color: 'red', fontSize: RFValue(10), borderColor: 'black',borderWidth: 1,paddingHorizontal:3,borderRadius: 8},
  oldPrice: { textDecorationLine: 'line-through', fontSize: RFValue(10) },
  productDistance: { fontSize: RFValue(10), color: 'gray' },
  noResults: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp('3%') },
  noResultsText: { fontSize: RFValue(16), color: 'gray',  },
 
 
  pharmaciesContainer: {
    paddingHorizontal: wp('4%'), // Add some padding around the horizontal list
    
  },
  pharmacyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: hp('2%'),
    marginRight: wp('4%'),
  
    marginHorizontal: wp('1%'),
    borderRadius:10,
    height: hp('24%'),
    backgroundColor: 'white'
  },

  pharmacyInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: wp('1%'),
    padding: wp('1%'),
    marginHorizontal: wp('1%'),
    borderRadius:10
  },
  pharmacyImage: {
    width: wp('65%'),
    height: hp('16%'),
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    borderColor:'white',
     borderWidth:1
  },
  pharmacyName: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-Bold',
    textAlign:'center',
    flexWrap:'wrap',
  
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
  redDot: {
    position: 'absolute',
    right: -2,
    top: -3,
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  productsContainer: {
    borderRadius: 10,
        marginBottom: hp('2%'),
        width: wp('90%'),
        marginLeft: wp('3.5%'),
        paddingHorizontal: wp('2%'),
        paddingVertical: wp('9%'),
        position: 'relative',
},
columnWrapper: {
  justifyContent: 'space-between',
  gap: wp('3%')
},

});

export default HomeScreen;

