import React, { useEffect } from 'react';
import { View, ImageBackground, StyleSheet, Platform, StatusBar } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAuth } from '../contexts/authContext'; // Import the useAuth hook
import { AvatarProvider, useAvatar } from '../contexts/AvatarContext';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import firebase from 'firebase/compat';


const IntroScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isAuthenticated } = useAuth(); // Use the hook to access the auth state
  const { user } = useAuth();
  const { setAvatar } = useAvatar();


  useEffect(() => {
    // Immediately navigate based on the authentication state and user role
    if (isAuthenticated === true && user) {
      switch (user.role) {
        case 'Customer':
          navigation.replace('HomeScreen');
          break;
        case 'Retailer':
          navigation.replace('RetailerScreen');
          break;
        case 'Wholesaler':
          navigation.replace('AdminDashboard');
          break;
        default:
          navigation.replace('GetStarted'); // Fallback to GetStarted if role is not defined
          break;
      }
    } else if (isAuthenticated === false) {
      navigation.replace( Platform.OS === 'web' ? 'LoginScreen' : 'GetStarted');
    }
  }, [isAuthenticated, user, navigation]); // Add isAuthenticated, user, and navigation to the dependency array

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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content"/>
      <ImageBackground source={require('../assets/splash.png')} style={{ width: wp('80%'), height: hp('20%') }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IntroScreen;
