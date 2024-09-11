import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AdminFooter: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { width } = Dimensions.get('window');
  const iconSize = width < 395 ? 30 : 34;
  const smallSize = width < 395 ? 28 : 32;

  const [selectedIcon, setSelectedIcon] = useState<string>('home'); // Default selected icon

  // Update selected icon based on the current route name
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const routeName = route.name;
      switch (routeName) {
        case 'AdminDashboard':
          setSelectedIcon('home');
          break;
          
        case 'AllOrder':
          setSelectedIcon('help');
          break;
          
        case 'AddPharmacist':
          setSelectedIcon('user');
          break;
        case 'AdminMessagingScreen':
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
    <><TouchableOpacity onPress={() => handleIconPress('search', 'AdminPayments')} style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', top: hp('94%'), right: wp('1.5%'), left: 0, zIndex: 10 }}>
          <ImageBackground source={require('../assets/dollar.png')} style={{ width: wp('19%'), height: wp('15%') }} />
      </TouchableOpacity><View style={{
          position: 'absolute', // Fixes the position relative to the screen
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          top: hp('98.5%'), // Position from the top of the screen
          left: 0,
          right: 0,
          paddingHorizontal: wp('5%'),
          zIndex: 10 // Optional: if you need to ensure it's on top of other elements
      }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('6%') }}>
                  <TouchableOpacity onPress={() => handleIconPress('home', 'AdminDashboard')}>
                      <Ionicons name='home' size={iconSize} style={{ left: wp('1.5%') }} color={selectedIcon === 'home' ? 'blue' : 'white'} />
                      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(9), color: 'grey' }}>Revenue</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleIconPress('help', 'AllOrder')} style={{ left: wp('1.5%') }}>
                      <MaterialIcons name="category" size={iconSize} color={selectedIcon === 'help' ? 'blue' : 'white'} />
                      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(9), color: 'grey', right: wp('0.5%') }}>Orders</Text>
                  </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp('3%') }}>
                  <TouchableOpacity onPress={() => handleIconPress('user', 'AddPharmacist')}>
                      <Ionicons name='people' size={smallSize} color={selectedIcon === 'user' ? 'blue' : 'white'} style={{ left: wp('6.5%') }} />
                      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(9), color: 'grey', left: wp('1.5%') }}>Pharmacists</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleIconPress('medical', 'AdminMessagingScreen')}>
                      <Ionicons name='person' size={smallSize} color={selectedIcon === 'medical' ? 'blue' : 'white'} style={{ left: wp('6%') }} />
                      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(9), color: 'grey', left: wp('2%') }}>Complaints</Text>
                  </TouchableOpacity>
              </View>
          </View></>
  );
};

export default AdminFooter;
