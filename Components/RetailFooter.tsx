import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const RetailFooter: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { width } = Dimensions.get('window');
  const iconSize = width < 395 ? 28 : 32;
  const smallSize = width < 395 ? 26 : 30;

  const [selectedIcon, setSelectedIcon] = useState<string>('home'); // Default selected icon

  // Update selected icon based on the current route name
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const routeName = route.name;
      switch (routeName) {
        case 'RetailerScreen':
          setSelectedIcon('home');
          break;
          
        case 'RetailerOrderScreen':
          setSelectedIcon('order');
          
          break;
          case 'UploadScreen':
            setSelectedIcon('search');
            
            break;
            
          
        case 'InventoryScreen':
          setSelectedIcon('user');
          break;
        case 'RetailerProfile':
          setSelectedIcon('medical');
          break;
        default:
          setSelectedIcon('home');
      }
    });

    return unsubscribe; // Cleanup the listener on unmount
  }, [navigation, route.name]);

  const handleIconPress = (iconName: string, screenName: string) => {
    setSelectedIcon(iconName); // Explicitly set the icon as selected
    navigation.navigate(screenName);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => handleIconPress('search', 'UploadScreen')}
        style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', top: hp('66.5%'), right: wp('1%'), left: 0, zIndex: 10 }}
      >
        <ImageBackground source={require('../assets/Add.png')} style={{ width: wp('16%'), height: wp('16%') }} />
      </TouchableOpacity>

      <View
        style={{
          position: 'absolute',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          top: hp('70%'),
          left: 0,
          right: 0,
          paddingHorizontal: wp('5%'),
          zIndex: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('8%') }}>
          <TouchableOpacity onPress={() => handleIconPress('home', 'RetailerScreen')}>
            <Ionicons name="home" size={iconSize} color={selectedIcon === 'home' ? 'blue' : 'white'} opacity={0.8} />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey' }}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleIconPress('order', 'RetailerOrderScreen')}>
            <AntDesign name="appstore-o" size={iconSize} color={selectedIcon === 'order' ? 'blue' : 'white'} opacity={0.8} />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey' }}>Order</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('3%') }}>
          <TouchableOpacity onPress={() => handleIconPress('user', 'InventoryScreen')}>
            <MaterialIcons name="inventory" size={smallSize} color={selectedIcon === 'user' ? 'blue' : 'white'} style={{ left: wp('3%') }} opacity={0.8} />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey', right: wp('1.5%') }}>Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleIconPress('medical', 'RetailerProfile')}>
            <FontAwesome5 name="user" size={smallSize} color={selectedIcon === 'medical' ? 'blue' : 'white'} style={{ left: wp('2%') }} opacity={0.8} />
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(10), color: 'grey', left: wp('0.5%') }}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RetailFooter;
