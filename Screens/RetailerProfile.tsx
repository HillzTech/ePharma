import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, Dimensions, TextInput, FlatList, Button, ImageBackground, Platform, BackHandler, StatusBar } from 'react-native';
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
import { usePharmacy } from '../contexts/PharmacyContext';
import RetailFooter from '../Components/RetailFooter';
import PharmacyBulkScreen from './PharmacyBulkScreen';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}


const RetailerProfile: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
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
  const { pharmacyName, fetchPharmacyName } = usePharmacy();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  
  
  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      fetchPharmacyName(currentUser.uid);
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

 

  const handleIconPress = (iconName: string, screenName: string) => {
    setSelectedIcon(iconName);
    navigation.navigate(screenName);
  };

  const handleBulkProducts = () => {
    
    navigation.navigate(PharmacyBulkScreen);
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
  navigation.navigate('RetailerScreen')
}

useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    navigation.goBack();
    return true;
  });

  return () => {
    backHandler.remove();
  };
}, [navigation]);

const handleLogOut = async ()=>{
    await logout();
    navigation.navigate('LoginScreen');
  }
  const handleInfo = async ()=>{
    navigation.navigate('PharmacyInfo');
  }
  const handleWithdrawal = async ()=>{
    navigation.navigate('WithdrawalScreen');
  }
  const handleComplaints = async ()=>{
    navigation.navigate('SupportScreen');
  }
  const handleSettings = async ()=>{
    navigation.navigate('ProfileSettingsScreen');
  }

  const handleFAQ = async ()=>{
    navigation.navigate('FAQScreen');
  }
  return (
    <SafeAreaView style={styles.container}>
        {isLoading && <LoadingOverlay />}
      <StatusBar backgroundColor="black" barStyle="light-content"/>
        
   <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:wp('5%'), top:Platform.OS === 'web' ? 0:hp('3%'),marginTop:Platform.OS === 'web' ? -7:  hp('-4%')}}>
    <TouchableOpacity  onPress={handleback}>
    <Ionicons name="chevron-back" size={29} color="black" />
    </TouchableOpacity>
   
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(18), right:wp('38%')}}>My profile</Text>
   </View>


      <View style={{marginTop:windowWidth > 1000 ? hp('-9%') : hp('1%'), flexDirection:'row', alignItems:'center', justifyContent:'flex-start',paddingHorizontal:wp('6%')}}>
         <TouchableOpacity onPress={handleAvatarChange}  style={{left:wp('1%'), top:hp('1%')}}>
            <Image
              source={avatar ? { uri: avatar } : require('../assets/avatar.png')}
              style={styles.avatar}
            />
            <Ionicons name='camera' size={23} color={'white'} style={{bottom:hp('3.5%'), left:windowWidth > 1000 ? wp('3%') : wp('10%')}}/>
            
            
          </TouchableOpacity>
         
         

{user ? (
    // Show username and email if user is signed in
    <View style={{paddingHorizontal: wp('6%'), flexDirection:'column',justifyContent:'center'}}>
      <Text style={styles.username}>{pharmacyName || user?.username}</Text>
      <Text style={{fontFamily: 'Poppins-Regular', bottom: hp('1%'), fontSize: 10}}>{user.email}</Text>
    </View>
  ) : (
    // Show login button if user is not signed in
    <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} style={{ right: 10}}>
      <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13 }}>Login</Text>
    </TouchableOpacity>
  )}

          

      </View>

      <View style={{flexDirection:'row', margin:hp('1%'), gap: windowWidth > 1000 ? hp('2%') : hp('1%'), justifyContent:'space-around', alignItems:'center', flexWrap: 'wrap', marginTop:windowWidth > 1000 ? hp('7%') : hp('0%')}}>
     
        
        <TouchableOpacity style={{ padding:wp('3%'), backgroundColor:'#FAF9F6',  borderRadius:10,  marginBottom:hp('0.5%'), width: 340}} onPress={handleInfo}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Pharamacy Details</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: 11, opacity:0.6}}>Edit your pharmacy information</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

       

        <TouchableOpacity onPress={handleBulkProducts}  style={{ padding:wp('3%'), backgroundColor:'#FAF9F6',borderRadius:10,  marginBottom:hp('0.5%'), width: 340}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Source for Drugs</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: 11,  opacity:0.6}}>Buy from wholesalers</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

        <TouchableOpacity onPress={handleWithdrawal}  style={{ padding:wp('3%'), backgroundColor:'#FAF9F6',borderRadius:10,  marginBottom:hp('0.5%'), width: 340}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Withdraw Funds</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: 11, opacity:0.6}}>Visa **34</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

        <TouchableOpacity onPress={handleComplaints}  style={{ padding:wp('3%'), backgroundColor:'#FAF9F6',borderRadius:10,  marginBottom:hp('0.5%'), width: 340}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Customer Support</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: 11, opacity:0.6}}>Direct Complaints</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

        

        <TouchableOpacity onPress={handleSettings} style={{ padding:wp('3%'), backgroundColor:'#FAF9F6',borderRadius:10,  marginBottom:hp('0.5%'), width: 340}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Settings</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: 11, opacity:0.6}}>Notifications, password</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFAQ} style={{ padding:wp('3%'), backgroundColor:'#FAF9F6',borderRadius:10, width: 340}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>FAQ</Text>
          <Text style={{fontFamily:'Poppins-Regular',fontSize: 11, opacity:0.6}}>Frequently asked Questions</Text>
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>


        {user ? (
        <TouchableOpacity style={{ padding:wp('3%'), backgroundColor:'#FAF9F6',borderRadius:10,  marginBottom:hp('0.5%'), width: 340}} onPress={handleLogOut}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <View>
          <Text style={styles.content}>Logout</Text>
          
          </View>


          <Ionicons name="chevron-forward" size={23} color="black" style={{left:wp('3%'), opacity:0.5}}/>

          </View>
          
        
        </TouchableOpacity>

           ) : (
            <></>
          )}
       
        
      </View>

      {Platform.OS === 'web'? (
        <>
          
        </>
      ) : (
        <>
       <View style={{bottom:hp('68%')}}>
      <RetailFooter route={route} navigation={navigation}/>
      <View style={{ backgroundColor: 'black', height: hp('10%'), position: 'absolute', justifyContent: 'center', alignItems: 'center', top: hp('69.5%'), right: wp('0%'), left: 0, zIndex: 1  }}>
              <></>
          </View>

            </View>

        
        </>
      )}
      

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D3D3',
  },
  username: {
    fontSize: RFValue(18),
    fontFamily: 'Poppins-Bold',
    
  },
  avatar: {
    width: 60,
    height: 60,
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
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    marginBottom: 7,
  },
});

export default RetailerProfile;
