import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Button, Alert, Dimensions, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import firebase from 'firebase/compat/app';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { GoogleSignin, GoogleSigninButton, statusCodes, User } from "@react-native-google-signin/google-signin";
import { SignInContext, useAuth } from '../contexts/authContext';
import { LocationContext } from '../contexts/locationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import LoadingOverlay from '../Components/LoadingOverlay';

type RouteParams = {
  params: {
    address: string;
  };
};

const LoginScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { width } = Dimensions.get('window');
  const iconSize = width < 395 ? 25 : 30;
  const logSize = width < 395 ? 23 : 28;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ address: string } | null>(null);

  const locationContext = useContext(LocationContext);
  if (!locationContext) {
    throw new Error('LocationContext must be used within a LocationContextProvider');
  }

  const { locationDispatch } = locationContext;


const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: "28593816693-qgtuemc9vsmk8933gigv0kd4678a0uv4.apps.googleusercontent.com"
  });


};



useEffect(() => {
  let isMounted = true;

  configureGoogleSignIn();
  const fetchLocation = async () => {
    try {
      const locationData = await AsyncStorage.getItem('userLocation');
      if (locationData && isMounted) {
        const parsedLocation = JSON.parse(locationData);
        setLocation(parsedLocation);
        locationDispatch({ type: 'UPDATE_LOCATION', payload: { location: parsedLocation } });
      }
    } catch (error) {
      console.error('Error fetching location from AsyncStorage:', error);
    }
  };

  fetchLocation();

  return () => {
    isMounted = false;
  };
}, [configureGoogleSignIn, locationDispatch]);


const {login} = useAuth();

const handleLogin = async () => {
  if (email === '' || password === '') {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }
  setLoading(true);
  const response = await login(email, password);
  if (response.success) {
    const user = firebase.auth().currentUser;
    if (user) {
      const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      if (userData) {
        const role = userData.role; // Adjust this according to how you store roles
        if (role === 'Customer') {
          navigation.navigate('HomeScreen');
        } else if (role === 'Retailer') {
          navigation.navigate('RetailerScreen')
          } else if (role === 'Wholesaler') {
            navigation.navigate('AdminDashboard');
        } else {
          Alert.alert('Error', 'Unknown user role');
        }
      }
    }
    setLoading(false);
  } else {
    Alert.alert('Sign In Failed', 'Invalid email or password');
    setLoading(false);
  }
};





const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    
    
  } catch (error) {
    console.error('Error during Google sign-in:', error);
  }
};






  const handleNext = async () => {
    navigation.navigate('SignupScreen');
  };

  const changePassword =  () => {
    firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert('password reset email sent')
    }).catch((error) => {
      Alert.alert('Error reseting password', error.message);
    })
  };


  return (
    <SafeAreaView style={{ flex: 1}}>
        
        <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1}}
      >
            {isLoading && <LoadingOverlay />}
        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginTop:hp('8%'),}}>
        <Ionicons name="location-outline" size={iconSize} color="black" />
        <Text style={{textAlign:'center', fontFamily:'Poppins-Bold'}}>{location?.address || 'Loading location...'}</Text>
        </View>

        
     <View style={{marginTop:hp('3%'), padding:wp('7%')}}>
     <Text style={{fontFamily:'Poppins-ExtraBold', fontSize:RFValue(22)}}>
            Let's Sign You In
        </Text>
        <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(12), opacity:0.6}}>
            Welcome back, you've been missed!
        </Text>
     </View>

      <View style={styles.container}>
       <Text style={{fontFamily:'Poppins-Regular', fontSize:RFValue(12), opacity:0.5, right:wp('35%'), top:hp('2%')}}> Email </Text>
       <Entypo name="email" size={RFValue(18)} color="#777" style={{top:hp('4.7%'), right:wp('36%')}} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <Entypo name="lock" size={RFValue(18)} color="#777" style={{top:hp('7.5%'), right:wp('36%')}} />
        <Text style={{fontFamily:'Poppins-Regular', fontSize:RFValue(12), opacity:0.5, right:wp('32%')}}> password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          secureTextEntry={!isPasswordVisible}
          onChangeText={setPassword}
        />

<TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={RFValue(28)}
              color="#777"
            />
          </TouchableOpacity>
 <TouchableOpacity onPress={changePassword} style={{bottom:hp('4%')}}>
    <Text style={{color:'black', fontFamily:'Poppins-Regular', fontSize:RFValue(12), right:wp('26%')}}>Forgot Passwod</Text>
 </TouchableOpacity>


        <TouchableOpacity onPress={handleLogin} style={{backgroundColor:'blue', padding:wp('3.2%'), width:wp('85%'), borderRadius:12, flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
            <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(16), color:'white', marginLeft:wp('22%')}}>SIGN IN</Text>
            <Entypo name="login" size={logSize} color="white" style={{left:wp('6%')}} />
            </TouchableOpacity>
      </View>

    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginBottom:hp('2%'), bottom:hp('16%')}}>
    <Text style={{fontFamily:'Poppins-Regular', fontSize:RFValue(14), color:'black'}}>Don't have an account? </Text>
    <TouchableOpacity onPress={handleNext}><Text style={{fontFamily:'Poppins-ExtraBold', fontSize:RFValue(14), color:'black'}}>Sign up </Text></TouchableOpacity>
    
    

    </View>
     
    <Text style={{fontFamily:'OpenSans-ExtraBold', fontSize:RFValue(16), color:'black', textAlign:'center', opacity:0.7, bottom:hp('13%')}}>OR </Text>
    

    <View style={{justifyContent:'center', alignItems:'center'}}>
    <GoogleSigninButton
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={handleGoogleSignIn}
                  style={{ marginBottom: hp('10%'), height: hp('7.5%'), bottom: hp('9%')}}
                />
    </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
    marginBottom: hp('18%'),
    marginRight:wp('1%'),
  },
  input: {
    width: wp('85%'),
    padding: wp('3%'),
    marginBottom: hp('0.02%'),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    
    paddingRight: wp('10%'),
  },
  addressText: {
    fontSize: RFValue(13),
    textAlign: 'center',
    fontFamily:'Poppins-Bold'
  },
  eyeIcon: {
    left: wp('33%'),
    marginBottom: hp ('2%'),
    bottom: hp ('5.6%')
  },
});

export default LoginScreen;


