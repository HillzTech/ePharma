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



interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
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
  const [location, setLocation] = useState<{ address: string } | null>(null);

  const locationContext = useContext(LocationContext);
  if (!locationContext) {
    throw new Error('LocationContext must be used within a LocationContextProvider');
  }

  const { locationDispatch } = locationContext;
 
  
  
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
  const handleCartPress = () => {
    navigation.navigate('CartScreen', { cartItems: cart });
  };

  const handleIconPress = (iconName: string, screenName: string) => {
    setSelectedIcon(iconName);
    navigation.navigate(screenName);
  };
  const handleRole = () => {
   
     navigation.navigate('CustomerScreen')
  };
  

  const fetchLocation = async () => {
    try {
      const locationData = await AsyncStorage.getItem('userLocation');
      if (locationData) {
        const parsedLocation = JSON.parse(locationData);
        setLocation(parsedLocation);
        locationDispatch({ type: 'UPDATE_LOCATION', payload: { location: parsedLocation } });
      }
    } catch (error) {
      console.error('Error fetching location from AsyncStorage:', error);
    }
  };
  useEffect(() => {
    fetchLocation();
  }, []);
  

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




  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', top: hp('5.5%') }}>
          <Ionicons name="location-outline" size={RFValue(20)} color="black" />
          <Text style={{textAlign:'center', fontFamily:'Poppins-Bold'}}>{location?.address || 'Loading location...'}</Text>
        </View>
      <View style={{marginTop:hp('6%'), flexDirection:'row', alignItems:'center', justifyContent:'space-between',paddingHorizontal:wp('6%')}}>

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
        
        <TouchableOpacity onPress={handleCartPress} style={{}}>
          <Ionicons name="cart" size={RFValue(28)} color="black" />
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

    <TouchableOpacity>
    <Ionicons name='close' size={iconSize} style={{opacity:0.6}}/>
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



    <TouchableOpacity onPress={() => handleIconPress('search', 'PharmacyScreen')} style={{ position: 'absolute',justifyContent: 'center', alignItems: 'center', top: hp('93%'), right: wp('1.5%'), left: 0,zIndex: 10 }}>
        <ImageBackground source={require('../assets/Search.png')} style={{ width: wp('20%'), height: wp('18%') }} />
      </TouchableOpacity>

      <View
  style={{
    position: 'absolute', // Fixes the position relative to the screen
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: hp('97.5%'), // Position from the top of the screen
    left: 0,
    right: 0,
    paddingHorizontal: wp('5%'),
    
    zIndex: 10 // Optional: if you need to ensure it's on top of other elements
  }}
>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('6%') }}>
          <TouchableOpacity onPress={() => handleIconPress('home', 'HomeScreen')}>
            <Ionicons name='home' size={iconSize} color={selectedIcon === 'home' ? 'blue' : 'grey'} />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey' }}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleIconPress('help', 'CategoryScreen')}>
          <MaterialIcons name="category" size={iconSize} color={selectedIcon === 'help' ? 'blue' : 'grey'} style={{left:wp('1.5%') }}/>
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey', right:wp('1%') }}>Category</Text>
          </TouchableOpacity>
        </View>


        

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('3%') }}>
        <TouchableOpacity onPress={() => handleIconPress('user','OrderScreen')}>
  <Entypo name='shopping-cart' size={smallSize} color={selectedIcon === 'user' ? 'blue' : 'grey'} style={{ left: wp('1.5%') }} />
  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey', left: wp('1.5%') }}>Order</Text>
</TouchableOpacity>

          <TouchableOpacity onPress={() => handleIconPress('medical', 'AppointmentScreen')}>
            <FontAwesome5 name='briefcase-medical' size={smallSize} color={selectedIcon === 'medical' ? 'blue' : 'grey'} style={{ left: wp('9%') }} />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey', left:wp('2%') }}>Appointment</Text>
          </TouchableOpacity>

          
        </View>
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
});

export default HomeScreen;

