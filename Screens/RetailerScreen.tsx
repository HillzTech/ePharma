import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, Dimensions, TextInput, FlatList, Button, ImageBackground, Platform, BackHandler, StatusBar } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import { AntDesign, Entypo, Feather, FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
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
import RevenueChart from '../Components/RevenueChart';
import RetailFooter from '../Components/RetailFooter';
import { usePharmacy } from '../contexts/PharmacyContext';
import { RetNavMenu } from '../Components/RetNavMenu';


interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}


const RetailerScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { user, logout } = useAuth();
  const { avatar, setAvatar } = useAvatar();
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
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0); // State for total products
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



const navigateToRetailerOrders = (tag: string) => {
  navigation.navigate('RetailerOrderScreen', { tag });
};

const handleLogOut = async ()=>{
  await logout();
  navigation.navigate('LoginScreen');
}

const handleInventory = async ()=>{

  navigation.navigate('InventoryScreen');
}

const [pendingCount, setPendingCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

  useEffect(() => {
    const fetchOrderCounts = async () => {
      try {
        const userId = firebase.auth().currentUser?.uid;
        if (userId) {
          const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .get(); // Fetch all orders
  
          let pending = 0;
          let delivered = 0;
          let cancelled = 0;
          let total = ordersSnapshot.size; // Total number of orders
  
          ordersSnapshot.docs.forEach(doc => {
            const order = doc.data();
            if (order.items.some((item: { sellerId: string; }) => item.sellerId === userId)) {
              if (order.status === 'Pending') pending++;
              if (order.status === 'Delivered') delivered++;
              if (order.status === 'Cancelled') cancelled++;
            }
          });
  
          setPendingCount(pending);
          setDeliveredCount(delivered);
          setCancelledCount(cancelled);
          setTotalOrders(total);
        }
      } catch (error) {
        console.error('Error fetching order counts:', error);
      }
    };
  
    fetchOrderCounts();
  }, []);

  const calculatePercentage = (count: number) => {
    if (totalOrders === 0) return 0;
    return ((count / totalOrders) * 100).toFixed(2);
  };
  
  useEffect(() => {
    const fetchTotalProducts = async () => {
      try {
        setLoading(true);
        const userId = firebase.auth().currentUser?.uid;
        console.log('UserID:', userId); // Debug: check user ID
        if (userId) {
          const productsSnapshot = await firebase.firestore()
            .collection('users')
            .doc(userId)
            .collection('products')
            .get();
          
          console.log('Products Snapshot Size:', productsSnapshot.size); // Debug: check snapshot size
          const count = productsSnapshot.size;
          setTotalProducts(count); // Set the total number of products
        }
      } catch (error) {
        console.error('Error fetching total products:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTotalProducts();
  }, []);
  
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
    <SafeAreaView style={styles.container}>
         {isLoading && <LoadingOverlay />}
      <StatusBar backgroundColor="black" barStyle="light-content"/>
         
   <View style={{marginTop:Platform.OS === 'web' ? 1:  hp('2%'), flexDirection:'row', alignItems:'center', justifyContent:'space-between',paddingHorizontal:wp('6%')}}>

    {user && (
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(18)}}> { pharmacyName || user?.username }</Text>
  )}
  




   <View>


   {windowWidth > 1000 ? (
        
          
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 55}}>   
         <TouchableOpacity  onPress={() => { navigation.navigate('RetailerScreen')}}>  
         <Text style={{fontFamily:'Poppins-Bold', fontSize:15}}>HOME</Text>
         </TouchableOpacity>

         <TouchableOpacity  onPress={() => { navigation.navigate('RetailerOrderScreen')}}>  
         <Text style={{fontFamily:'Poppins-Bold', fontSize:15}}>ORDER</Text>
         </TouchableOpacity>

         <TouchableOpacity  onPress={() => { navigation.navigate('UploadScreen')}}>  
         <Text style={{fontFamily:'Poppins-Bold', fontSize:15}}>ADD PRODUCT</Text>
         </TouchableOpacity>

         <TouchableOpacity  onPress={() => { navigation.navigate('InventoryScreen')}}>  
         <Text style={{fontFamily:'Poppins-Bold', fontSize:15}}>INVENTORY</Text>
         </TouchableOpacity>

         <TouchableOpacity  onPress={() => { navigation.navigate('RetailerProfile')}}>  
         <Text style={{fontFamily:'Poppins-Bold', fontSize:15}}>PROFILE</Text>
         </TouchableOpacity>
        
        </View>
      
    ) : (
      <>
      
      </>
    )}

{Platform.OS === 'web' && width < 1000 && (
        <RetNavMenu route={route} navigation={navigation}/>
      )}
  
  
  </View>
   
  </View>


   {user ? (
      
        <RevenueChart userId={user.uid} /> // Pass the userId prop
      ) : (
        <Text>Loading...</Text>
      )}
   

   <View style={{flexDirection:'row', justifyContent:'space-around',alignItems:'center', flexWrap:'wrap', gap:wp('2%'), padding:wp('3%')}}>

   <TouchableOpacity onPress={() => navigateToRetailerOrders('Cancelled')} >
  
    <View style={{width:160, paddingVertical:hp('2%'), backgroundColor:'white', borderRadius:5}}>
    <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:20}}>
    <Feather name="activity" size={22} color="#FFD700" />
    <FontAwesome name="long-arrow-right" size={17} color="black" />
   </View>

   <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:20}}>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:23}}>{cancelledCount}</Text>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:11}}>{calculatePercentage(cancelledCount)}%</Text>
    
   </View>
    
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:11, left:wp('5%'), opacity:0.6, top:hp('0.2%')}}>Cancelled</Text>

    </View>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => navigateToRetailerOrders('Pending')} >

    <View style={{width:160, paddingVertical:hp('2%'), backgroundColor:'white',borderRadius:5}}>
    <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:20}}>
    <FontAwesome5 name="user-plus" size={22} color="blue" opacity={0.5}/>
    <FontAwesome name="long-arrow-right" size={17} color="black" />
   </View>

   <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:20}}>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:23}}>{pendingCount}</Text>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:11}}>{calculatePercentage(pendingCount)}%</Text>
    
   </View>
    
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:11, left:wp('5%'), opacity:0.6, top:hp('0.2%')}}>Pending</Text>
    </View>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => navigateToRetailerOrders('Delivered')}>

    <View style={{width:160, paddingVertical:hp('2%'), backgroundColor:'white',borderRadius:5}}>
    <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center',paddingHorizontal:20}}>
    <SimpleLineIcons name="layers" size={22} color="red" />
    <FontAwesome name="long-arrow-right" size={17} color="black" />
   </View>

   <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:20}}>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:23}}>{deliveredCount}</Text>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:11}}>{calculatePercentage(deliveredCount)}%</Text>
    
   </View>
    
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:11, left:wp('5%'), opacity:0.6, top:hp('0.2%')}}>Delivered</Text>
    </View>

    </TouchableOpacity>


    <TouchableOpacity onPress={handleInventory} >
    <View style={{width:160, paddingVertical:hp('1.6%'), backgroundColor:'white',borderRadius:5}}>
    <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center',paddingHorizontal:20}}>
    <MaterialCommunityIcons name="target" size={28} color="blue" opacity={0.5} style={{right:wp('1%')}}/>
    <FontAwesome name="long-arrow-right" size={17} color="black" />
   </View>

   <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:20, bottom:hp('0.45')}}>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:23}}>{totalProducts}</Text>

    
   </View>
    
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:11, left:wp('5%'), opacity:0.6, bottom:hp('0.3')}}>Still in stock</Text>
    </View>
    </TouchableOpacity>
    

    
   

   </View>
     
   {Platform.OS === 'web'? (
        <>
          
        </>
      ) : (
        <>
       <View style={{bottom:hp('66%')}}>
      <RetailFooter route={route} navigation={navigation}/>
      <View style={{ backgroundColor: 'black', height: hp('10%'), position: 'absolute', justifyContent: 'center', alignItems: 'center', top: hp('69%'), right: wp('0%'), left: 0, zIndex: 1  }}>
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
    backgroundColor:'#D3D3D3',
    overflow: Platform.OS === 'web' ? 'scroll' : 'visible',
    
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
    marginTop: hp('3%'),
   
    
  },
  
 
 
  searchInput: {
    height: hp('6%'),
    borderColor: 'grey',
    borderWidth: 1,
    marginBottom: hp('-1%'),
    paddingHorizontal: wp('2%'),
    borderRadius:10,
    textAlign:'center',
    bottom:hp('1%'),
    backgroundColor:'white'
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

export default RetailerScreen;








