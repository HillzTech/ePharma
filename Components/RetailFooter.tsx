import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert, Dimensions, TextInput, FlatList, Button, ImageBackground } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import { AntDesign, Entypo, Feather, FontAwesome, FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}


const RetailFooter: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
 
  const { width } = Dimensions.get('window');
  const [cart, setCart] = useState<Product[]>([]);
  const iconSize = width < 395 ?30 : 34;
  const smallSize = width < 395 ?28 : 32;
  
  const [selectedIcon, setSelectedIcon] = useState<string>('home'); // Default selected icon
  const [isLoading, setLoading] = useState(false);



  const handleIconPress = (iconName: string, screenName: string) => {
    setSelectedIcon(iconName);
    navigation.navigate(screenName);
  };
  

  return (
    
    
     
        <View>

          <TouchableOpacity onPress={() => handleIconPress('search', 'UploadScreen')} style={{ position: 'absolute',justifyContent: 'center', alignItems: 'center', top: hp('66.5%'), right: wp('1%'), left: 0,zIndex: 10 }}>
        <ImageBackground source={require('../assets/Add.png')} style={{ width: wp('16%'), height: wp('16%') }} />
      </TouchableOpacity>

      <View
  style={{
    position: 'absolute', // Fixes the position relative to the screen
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    top: hp('70%'), // Position from the top of the screen
    left: 0,
    right: 0,
    paddingHorizontal: wp('5%'),
  
    zIndex: 10 // Optional: if you need to ensure it's on top of other elements
  }}
>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('8%') }}>
          <TouchableOpacity onPress={() => handleIconPress('home', 'RetailerScreen')}>
            <Ionicons name='home' size={iconSize} color={selectedIcon === 'home' ? 'blue' : 'white'} opacity={0.8}/>
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey' }}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleIconPress('order', ' RetailOrder')}>
          <MaterialIcons name="category" size={iconSize} color={selectedIcon === 'order' ? 'blue' : 'white'} opacity={0.8}/>
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey' }}>Order</Text>
          </TouchableOpacity>
        </View>


        

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('3%') }}>
        <TouchableOpacity onPress={() => handleIconPress('user','InventoryScreen')}>
  <MaterialIcons name='inventory' size={smallSize} color={selectedIcon === 'user' ? 'blue' : 'white'} style={{ left: wp('3%') }} opacity={0.8}/>
  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey', right: wp('1.5%') }}>Inventory</Text>
</TouchableOpacity>

          <TouchableOpacity onPress={() => handleIconPress('medical', 'RetailerProfile')}>
            <FontAwesome5 name='user' size={smallSize} color={selectedIcon === 'medical' ? 'blue' : 'white'} style={{ left: wp('2%') }} opacity={0.8}/>
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey', left:wp('0.5%') }}>Profile</Text>
          </TouchableOpacity>

          
        </View>
      </View>
     
      

    </View>
  );
};


  
export default RetailFooter;








