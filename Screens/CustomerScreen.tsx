import React, { useEffect, useState } from 'react';
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
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/authContext';
import LoadingOverlay from '../Components/LoadingOverlay';
import { useAvatar } from '../contexts/AvatarContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}


const CustomerScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { user, logout } = useAuth();
  const { width } = Dimensions.get('window');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const iconSize = width < 395 ?30 : 34;
  const smallSize = width < 395 ?28 : 32;
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [showClose, setShowClose] = useState<boolean>(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('home'); // Default selected icon
  const [isLoading, setLoading] = useState(false);
  const { avatar, setAvatar } = useAvatar();


  
  
  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {

      fetchAvatar(currentUser.uid);
    }
  }, []);

  const fetchAvatar = async (userId: string) => {
    try {
      const url = await firebase.storage().ref(`avatars/${userId}`).getDownloadURL();
      setAvatar(url);
    } catch (error) {
      console.log('No avatar found:', error);
    }
  };

  const handleAvatarChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need permission to access your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
     
    if (!result.canceled) {
      if (result.assets) {
        const uri = result.assets[0].uri;
        uploadAvatar(uri);
      }
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (user) {
      setLoading(true); // Start loading
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const ref = firebase.storage().ref().child(`avatars/${user.uid}`);
        await ref.put(blob);
        fetchAvatar(user.uid);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload avatar.');
        console.error('Upload error:', error);
      } finally {
        setLoading(false); // Stop loading
      }
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

const fetchUserRole = async (userId: string) => {
  try {
    const userDoc = await firebase.firestore().collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData && userData.role) {
        await AsyncStorage.setItem('userRole', userData.role);
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

const handleback = async() => {
  navigation.navigate('HomeScreen')
}

const handleLogOut = async ()=>{
    await logout();
    navigation.navigate('LoginScreen');
  }

  const handleComplaints = async ()=>{
    navigation.navigate('SupportScreen');
  }
  const handleSource = async ()=>{
    navigation.navigate('AllProductsScreen');
  }
  
  const handleSettings = async ()=>{
    navigation.navigate('ProfileSettingsScreen');
  }

  const handleOtc = async ()=>{
    navigation.navigate('OtcDrugs');
  }

  const handleFAQ = async ()=>{
    navigation.navigate('FAQScreen');
  }

  return (
    <SafeAreaView style={styles.container}>
        {isLoading && <LoadingOverlay />}
   <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:wp('5%'), top:hp('3%')}}>
    <TouchableOpacity  onPress={handleback}>
    <Ionicons name="chevron-back" size={23} color="black" />
    </TouchableOpacity>
   
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(18), right:wp('32%')}}>My profile</Text>
   </View>


      <View style={{marginTop:hp('1%'), flexDirection:'row', alignItems:'center', justifyContent:'space-between',paddingHorizontal:wp('6%')}}>
      <TouchableOpacity onPress={handleAvatarChange}  style={{left:wp('1%'), top:hp('1%')}}>
            <Image
              source={avatar ? { uri: avatar } : require('../assets/avatar.png')}
              style={styles.avatar}
            />
            <Ionicons name='camera' size={23} color={'white'} style={{bottom:hp('3.5%'), left:wp('10%')}}/>
            
            
          </TouchableOpacity>
         
          {user && (
        <View style={{paddingHorizontal:wp('6%'), right: wp('15%')}}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={{fontFamily:'Poppins-Regular', bottom:hp('1%'), fontSize:RFValue(9)}}>{user.email}
          </Text>
          
        </View>
      )}

          

      </View>

      <View  style={{flexDirection:'column', margin:hp('1%'), gap: hp('2%')}}>
        <TouchableOpacity onPress={handleOtc} style={{ padding:wp('4%'), backgroundColor:'#FAF9F6',borderRadius:10}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Buy OTC Drugs</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: RFValue(10), opacity:0.6}}>Browse through our otc and new expiry drugs</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleComplaints} style={{ padding:wp('4%'), backgroundColor:'#FAF9F6',borderRadius:10}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Emergency</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: RFValue(10), opacity:0.6}}>Chat with our Customer Support</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSource} style={{ padding:wp('4%'), backgroundColor:'#FAF9F6',borderRadius:10}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Source for Drugs</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: RFValue(10),  opacity:0.6}}>Check out all products available</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

       

        <TouchableOpacity onPress={handleSettings} style={{ padding:wp('4%'), backgroundColor:'#FAF9F6',borderRadius:10}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Settings</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: RFValue(10), opacity:0.6}}>Notifications, password</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFAQ} style={{ padding:wp('4%'), backgroundColor:'#FAF9F6',borderRadius:10}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>FAQ</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: RFValue(10), opacity:0.6}}>Frequently asked Questions</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>


        <TouchableOpacity style={{ padding:wp('5%'), backgroundColor:'#FAF9F6',borderRadius:10}} onPress={handleLogOut}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Logout</Text>
          
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

       
        
      </View>

     
      

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D3D3',
  },
  username: {
    fontSize: RFValue(19),
    fontFamily: 'Poppins-Bold',
    
  },
  avatar: {
    width: wp('18%'),
    height: hp('8%'),
    borderRadius: RFValue(50),

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
    bottom:hp('1%')
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

  content: {
    fontSize: RFValue(17),
    fontFamily: 'OpenSans-Bold',
    
  },
});

export default CustomerScreen;
