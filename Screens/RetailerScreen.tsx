import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, Dimensions, TextInput, FlatList, Button, ImageBackground } from 'react-native';
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



const handleback = async() => {
  navigation.navigate('LoginScreen')
}

const handleLogOut = async ()=>{
  await logout();
  navigation.navigate('GetStarted');
}


/* const updateRevenue = async (userId: string, month: string, amount: number) => {
  try {
    const revenueDocRef = doc(db, `users/${userId}/revenue/${month}`);
    await updateDoc(revenueDocRef, {
      total: increment(amount),
    });
  } catch (error) {
    console.error('Error updating revenue: ', error);
  }
};


// Example function to handle a sale
const handleSale = async (userId: string, amount: number) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // Format as YYYY-MM

  // Update revenue for the current month
  await updateRevenue(userId, currentMonth, amount);
};


*/




  return (
    <SafeAreaView style={styles.container}>
         {isLoading && <LoadingOverlay />}
   <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:wp('5%'), top:hp('3%')}}>
    <TouchableOpacity  onPress={handleLogOut}>
    <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
    </TouchableOpacity>
    {user && (
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(18), right:wp('45%'), bottom:hp('0.4%')}}>{user.username}</Text>
  )}
   </View>


   <View style={styles.searchContainer}>
  <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:wp('3%'), bottom:hp('1%'), position:'absolute', left:0, right:0, zIndex:10}}>
    <TouchableOpacity>
    <Ionicons name='search' size={iconSize} style={{opacity:0.7}}/>
    </TouchableOpacity>

    <TouchableOpacity>
    <Ionicons name='close' size={iconSize} style={{opacity:0.7}}/>
    </TouchableOpacity>
  
  
  </View>
 
 
    
      <TextInput
        style={styles.searchInput}
        placeholder="Search meds here"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
   
   </View>

   <View>
   {user ? (
      
        <RevenueChart userId={user.uid} /> // Pass the userId prop
      ) : (
        <Text>Loading...</Text>
      )}
   </View>

   <View style={{flexDirection:'row', justifyContent:'space-around',alignItems:'center', flexWrap:'wrap', gap:wp('2%'), padding:wp('3%')}}>
  
    <View style={{width:wp('45%'), paddingVertical:hp('2%'), backgroundColor:'white', borderRadius:5}}>
    <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:wp('5%')}}>
    <Feather name="activity" size={22} color="#FFD700" />
    <FontAwesome name="long-arrow-right" size={17} color="black" />
   </View>

   <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:wp('6%')}}>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(22)}}>0</Text>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(10)}}>0%</Text>
    
   </View>
    
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(10), left:wp('5%'), opacity:0.6, top:hp('0.2%')}}>Cancelled</Text>

    </View>


    <View style={{width:wp('45%'), paddingVertical:hp('2%'), backgroundColor:'white',borderRadius:5}}>
    <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:wp('5%')}}>
    <FontAwesome5 name="user-plus" size={22} color="blue" opacity={0.5}/>
    <FontAwesome name="long-arrow-right" size={17} color="black" />
   </View>

   <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:wp('6%')}}>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(22)}}>0</Text>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(10)}}>0%</Text>
    
   </View>
    
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(10), left:wp('5%'), opacity:0.6, top:hp('0.2%')}}>Pending</Text>
    </View>


    <View style={{width:wp('45%'), paddingVertical:hp('2%'), backgroundColor:'white',borderRadius:5}}>
    <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center',paddingHorizontal:wp('5%')}}>
    <SimpleLineIcons name="layers" size={22} color="red" />
    <FontAwesome name="long-arrow-right" size={17} color="black" />
   </View>

   <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:wp('6%')}}>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(22)}}>0</Text>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(10)}}>0%</Text>
    
   </View>
    
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(10), left:wp('5%'), opacity:0.6, top:hp('0.2%')}}>Delivered</Text>
    </View>


    <View style={{width:wp('45%'), paddingVertical:hp('1.6%'), backgroundColor:'white',borderRadius:5}}>
    <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center',paddingHorizontal:wp('5%')}}>
    <MaterialCommunityIcons name="target" size={28} color="blue" opacity={0.5} style={{right:wp('1%')}}/>
    <FontAwesome name="long-arrow-right" size={17} color="black" />
   </View>

   <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', paddingHorizontal:wp('6%'), bottom:hp('0.45')}}>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(22)}}>0</Text>
    <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(10)}}>0%</Text>
    
   </View>
    
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(10), left:wp('5%'), opacity:0.6, bottom:hp('0.3')}}>Still in stock</Text>
    </View>

    

    
   

   </View>
     

   <View style={{bottom:hp('66%')}}>
            <RetailFooter route={route} navigation={navigation} />
            </View>


            <View style={{top:hp('3%'), backgroundColor:'black', height:hp('10%')}}>
            <></>
            </View>

      

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#D3D3D3'

    
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








