import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, Dimensions, TextInput, FlatList, Button, ImageBackground, ScrollView, Platform, Modal, BackHandler, StatusBar } from 'react-native';
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
import Geolocation from '@react-native-community/geolocation';
import { NavMenu } from '../Components/NavMenu';


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
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [nav, setNav] = useState(false);


  // Toggle menu visibility
  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  

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
  Geolocation.getCurrentPosition(
    async (position) => {
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const address = await getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
      setUserAddress(address);
    },
    (error) => {
      console.error('Error getting user location:', error);
      Alert.alert('Error', 'Failed to get user location.');
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
    }
  );
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
          distance: 0,
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
  <TouchableOpacity style={windowWidth > 1000 ? styles.largePharmacyContainer : styles.pharmacyContainer} onPress={() => handlePress(item.id)}>
    <Image
      source={item.pharmacyImage ? { uri: item.pharmacyImage } : require('../assets/Pharmacy.jpg')}
      style={windowWidth > 1000 ? styles.largePharmacyImage : styles.pharmacyImage}
    />
    
    <View style={styles.pharmacyInfo}>
      <Text style={styles.pharmacyName}>{item.pharmacyName}</Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap:wp('4%') }}>
          <Ionicons name="location-outline" size={15} color="black" />
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

useEffect(() => {
  const backAction = () => {
    
    return true; 
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    backAction
  );

  return () => backHandler.remove();
}, []);




  return (
    <SafeAreaView style={{flex: 1}} >
      <StatusBar backgroundColor="black" barStyle="light-content"/>
      {isLoading && <LoadingOverlay />}
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', top:  Platform.OS === 'web' ? 1: 0, display:windowWidth > 1000 ? 'none' : 'flex' }}>
          <Ionicons name="location-outline" size={RFValue(14)} color="black" />
          <Text style={{textAlign:'center', fontFamily:'Poppins-Bold', fontSize:RFValue(10)}}>{userAddress}</Text>
        </View>
      <View style={{marginTop: Platform.OS === 'web' ? 3 :  hp('0%'), flexDirection:'row', alignItems:'center', justifyContent:'space-between',paddingHorizontal:wp('6%')}}>

           <TouchableOpacity onPress={handleRole}>
           <Image
              source={avatar ? { uri: avatar } : require('../assets/avatar.png')}
              style={styles.avatar}
            />

          
          
           </TouchableOpacity>

           {windowWidth > 1000 ? (
        
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 55, left: 70,}}>   
           <TouchableOpacity  onPress={() => { navigation.navigate('HomeScreen')}}>  
           <Text style={{fontFamily:'Poppins-Bold', fontSize:15}}>HOME</Text>
           </TouchableOpacity>

           <TouchableOpacity  onPress={() => { navigation.navigate('CategoryScreen')}}>  
           <Text style={{fontFamily:'Poppins-Bold', fontSize:15}}>CATEGORY</Text>
           </TouchableOpacity>

           <TouchableOpacity  onPress={() => { navigation.navigate('CustomerOrderScreen')}}>  
           <Text style={{fontFamily:'Poppins-Bold', fontSize:15}}>ORDER</Text>
           </TouchableOpacity>

           <TouchableOpacity  onPress={() => { navigation.navigate('AppointmentScreen')}}>  
           <Text style={{fontFamily:'Poppins-Bold', fontSize:15}}>PHARMACISTS</Text>
           </TouchableOpacity>
          
          </View>
        
      ) : (
        <>
        
        </>
      )}
    

    <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', top:10, display:windowWidth > 1000 ? 'none' : 'flex', right:114, }}>
          <Ionicons name="menu" size={18} color="black" style={{ backgroundColor: 'white', borderRadius:10,   }}/>
        
        </View>

            
          <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:wp('4%')}}>
          <TouchableOpacity onPress={handleNotificationPress} style={{ position: 'relative' }}>
            <Ionicons name="notifications-outline" size={24} color="black" />
            {hasUnreadMessages && (
              <View style={styles.redDot} />
            )}
          </TouchableOpacity>
        
        <TouchableOpacity onPress={handleCart}>
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={24} color="black" />
            {getCartItemCount() > 0 && (
              <View style={styles.cartItemCount}>
                <Text style={styles.cartItemCountText}>{getCartItemCount()}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {Platform.OS === 'web' && width < 1000 && (
          <NavMenu route={route} navigation={navigation}/>
        )}
        </View>

        
          

      </View>

      {user ? (
    // Show username and email if user is signed in
    <View style={{paddingHorizontal: wp('6%'), right: windowWidth > 1000 ? wp('55%') : 0}}>
      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 15 }}>Hi {user.username}</Text>
      <Text style={{fontFamily: 'Poppins-Regular', bottom: hp('1%'), fontSize: 10}}>How Are You Today?</Text>
    </View>
  ) : (
    // Show login button if user is not signed in
    <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} style={{ left: windowWidth > 1000 ? 90 : 23, paddingBottom: 3 }}>
      <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 13, color: 'blue' }}>Login</Text>
    </TouchableOpacity>
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


    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:windowWidth > 1000 ? wp('6%') : wp('6%'), marginTop:windowWidth > 1000 ? 20 : 0}}>
      <Text style={{fontFamily:'Poppins-Bold', fontSize:16, color:'black'}}>Pharmacies near you</Text>
      <TouchableOpacity> 
        <Text onPress={() => navigation.navigate('SeeAll')} style={{fontFamily:'Poppins-Regular', fontSize:15, color:'blue', top:hp('0.4%')}}>See all</Text>
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
  showsHorizontalScrollIndicator={false} // Hide scroll indicator if desired
/>
   </View>

        <View style={{ flexDirection:'row', gap:1, alignItems:'center', padding: wp('1%'), left: wp('6%') }}> 
        <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', }}>Trending </Text>
        <FontAwesome5 name="fire" size={15} color="red" />
        </View>



        {windowWidth  < 1000 ? (
        <>
           {filteredProducts.length > 0 ? (
        <View style={{ paddingBottom:Platform.OS === 'web' ? hp('6%') :  hp('63.6%')}}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          key={2}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleProductPress(item)}>
              <View style={styles.productContainer}>
                <Image source={{ uri: item.imageUrls[0] }} style={windowWidth > 1000 ? styles.largeProductImage : styles.productImage} />
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productPrice}>N{item.price.toFixed(2)}</Text>
                <View style={styles.discountContainer}>
                  <Text style={styles.discountText}>-{item.percentageDiscount}%</Text>
                  <Text style={styles.oldPrice}>N{item.costPrice}</Text>
                </View>
                <View style={{flexDirection: 'row', paddingBottom: wp('2%'),  left: wp('2.5%')  }}>
              
                
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
        
        </>
      ) : (
        <>

         {filteredProducts.length > 0 ? (
        <View style={{ paddingBottom: hp('3%')}}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={4}
          key={4}
          contentContainerStyle={styles.listContent}
          
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleProductPress(item)}>
              <View style={styles.largeProductContainer}>
                <Image source={{ uri: item.imageUrls[0] }} style={windowWidth > 1000 ? styles.largeProductImage : styles.productImage} />
                <Text style={windowWidth > 1000 ? styles.largeProductTitle : styles.productTitle}>{item.title}</Text>
                <Text style={styles.productPrice}>N{item.price.toFixed(2)}</Text>
                <View style={styles.discountContainer}>
                  <Text style={styles.discountText}>-{item.percentageDiscount}%</Text>
                  <Text style={styles.oldPrice}>N{item.costPrice}</Text>
                </View>
                <View style={{flexDirection: 'row', paddingBottom: wp('2%'),  left: wp('2.5%')  }}>
              
                
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
        </>
      )}
        
        
  
  

           
  
  
  {Platform.OS === 'web'? (
        <>
          
        </>
      ) : (
        <>
        <CostumerFooter route={route} navigation={navigation} />
          <View
            style={{
            
              backgroundColor: 'black',
              height: hp('10%'),
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              top: hp('92.5%'),
              right: wp('0%'),
              left: 0,
              zIndex: 1,
            }}
          />
        
        </>
      )}
    


          </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D3D3',
    overflow: Platform.OS === 'web' ? 'scroll' : 'visible'
  },

 

 
  avatar: {
    width: RFValue(37),
    height: RFValue(37),
    borderRadius: RFValue(50),
    borderWidth: 1,
    borderColor: 'grey',

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
    marginTop:hp('-0.1%'),
    marginBottom:hp('2%'),
    width: wp('90%'),
    left: wp('2.5%'),
  },
  searchInput: { flex: 1, height: hp('5%'), paddingHorizontal: 50, fontSize:14 },
  listContent: { alignItems: 'center',justifyContent: 'center', },
  productContainer: { 
     margin:wp('2%'), backgroundColor: 'white', borderRadius: 10, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 
  },
  largeProductContainer: { 
    margin:wp('1%'), backgroundColor: 'white', borderRadius: 10, 
   shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 
 },
  productImage: { width: wp('43%'), height: hp('14%'), borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  largeProductImage: { width: wp('20%'), height: hp('20%'), borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  productTitle: { fontSize: 15, fontWeight: 'bold', marginVertical: 5, paddingHorizontal: wp('3%') },
  largeProductTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 5, paddingHorizontal: wp('3%') },
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
  largePharmacyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: hp('2%'),
    marginRight: wp('4%'),
  
    marginHorizontal: wp('1%'),
    borderRadius:10,
    height: hp('40%'),
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
  largePharmacyImage: {
    width: wp('25%'),
    height: hp('25%'),
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
    fontSize: 13,
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
    right: 1,
    top: -2,
    width: 6,
    height: 6,
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

