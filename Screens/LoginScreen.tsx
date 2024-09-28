import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Button, Alert, Dimensions, TouchableOpacity, ScrollView, Keyboard, Platform, ImageBackground, StatusBar } from 'react-native';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';
import { AntDesign, Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { GoogleSignin, GoogleSigninButton, statusCodes } from "@react-native-google-signin/google-signin";
import { SignInContext, useAuth } from '../contexts/authContext';
import { LocationContext } from '../contexts/locationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import LoadingOverlay from '../Components/LoadingOverlay';
import Script from 'next/script';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser'
import { auth, db, usersRef } from '../Components/firebaseConfig';
import { query, where, getDocs, collection } from 'firebase/firestore';


type RouteParams = {
  params: {
    address: string;
  };
};

interface Auth {
  currentUser: any;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  issuedAt: number;
}

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { width } = Dimensions.get('window');
  const iconSize = width < 395 ? 25 : 27;
  const logSize = width < 395 ? 20 : 22;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ address: string } | null>(null);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const { googleSignIn } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [requireRefresh, setRequireRefresh] = useState<boolean>(false);


  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: "28593816693-qab4jcf7i0aiiaa35fge5dsbd1v6i7sf.apps.googleusercontent.com",
    androidClientId: "28593816693-v4c80s5gpt2mq7mlanp6s9uuocqcqleu.apps.googleusercontent.com",
    webClientId: "28593816693-b124120j98nrn22s45vv4soords0u8nt.apps.googleusercontent.com",
    
  });

 
  useEffect(() => {
    console.log(response);
   
    if (response?.type === "success") {
       setLoading(true);
      setAuth(response.authentication as unknown as Auth);
        // Call the function to fetch current user data
     fetchCurrentUserData();
      getUserData();
  
      const persistAuth = async () => {
        await AsyncStorage.setItem("auth", JSON.stringify(response.authentication));
      };
      persistAuth();
  
    
      
    }
    setLoading(false);
  }, [response]);
  
  // Fetch Google user info
  const getUserData = async () => {
    if (auth) {
      try {
        let userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });
  
        const data: UserInfo = await userInfoResponse.json();
        console.log('Google user data:', data);
        setUserInfo(data);
        setEmail(data.email); // Automatically set the email in the input field
  
        // Fetch user data from Firestore based on the email
        const userData = await getFirestoreUserData(data.email);
        console.log('User data from Firestore:', userData);
  
        if (userData) {
          navigateBasedOnRole(userData.role);
        } else {
          console.error("User data not found in Firestore");
          navigation.navigate("HomeScreen");
        }
      } catch (error) {
        console.error("Error fetching Google user data:", error);
      }
    }
  };
  
  
  // Fetch user data from Firestore
  const getFirestoreUserData = async (email: string) => {
    try {
      console.log("Fetching user data for email:", email);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const userSnapshot = await getDocs(q);
  
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data(); // Assuming unique email
        console.log("User data retrieved:", userData);
        return userData;
      } else {
        console.warn("No user found in Firestore for email:", email);
        return null;
      }
    } catch (error) {
      console.error("Error fetching Firestore user data:", error);
      return null;
    }
  };
  
  const fetchCurrentUserData = async () => {
    // Ensure 'auth' is not null
    if (auth) {
      const user = auth.currentUser;
  
      if (user) {
        console.log("Current user is signed in:", user.email);
        const userData = await getFirestoreUserData(user.email);
        
        if (userData) {
          console.log("User data successfully fetched:", userData);
        } else {
          console.log("No user data found in Firestore.");
        }
      } else {
        console.error("No user is currently signed in.");
      }
    } else {
      console.error("Auth is not initialized.");
    }
  };
  

  // Navigate based on user role
  const navigateBasedOnRole = (role: string) => {
    console.log('User role:', role);
    switch (role) {
      case "Customer":
        console.log('Navigating to HomeScreen');
        navigation.navigate("HomeScreen");
        break;
      case "Retailer":
        console.log('Navigating to RetailerScreen');
        navigation.navigate("RetailerScreen");
        break;
      case "WholeSaler":
        console.log('Navigating to AdminDashboard');
        navigation.navigate("AdminDashboard");
        break;
      default:
        console.log('Unknown role, navigating to HomeScreen');
        navigation.navigate("HomeScreen");
        break;
    }
  };
  

  useEffect(() => {
    const getPersistedAuth = async () => {
      const jsonValue = await AsyncStorage.getItem("auth");
      if (jsonValue != null) {
        const authFromJson = JSON.parse(jsonValue) as Auth;
        setAuth(authFromJson);
        console.log(authFromJson);

        setRequireRefresh(!AuthSession.TokenResponse.isTokenFresh({
          expiresIn: authFromJson.expiresIn,
          issuedAt: authFromJson.issuedAt
        }));
      }
    };
    getPersistedAuth();
  }, []);

  

 


  


  const handleGoogleSignIn = async () => {
    const result = await googleSignIn();
    if (result.success) {
      console.log("User signed in successfully.");
    } else {
      console.log(result.msg);
      Alert.alert('Email Not Found. Login with your Email and Password.');
      navigation.navigate('HomeScreen');
    }
  };

 

  
  const locationContext = useContext(LocationContext);
  if (!locationContext) {
    throw new Error('LocationContext must be used within a LocationContextProvider');
  }

  const { locationDispatch } = locationContext;





useEffect(() => {
  let isMounted = true;
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
}, [ locationDispatch]);


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
    
         <View style={styles.container}>
        <StatusBar backgroundColor="black" barStyle="light-content"/>
            {isLoading && <LoadingOverlay />}
       

            
     <View style={{marginTop:windowWidth > 1000 ? hp('-1%') : hp('7%'), padding:windowWidth > 1000 ? wp('4%') : wp('7%')}}>
     <Text style={{fontFamily:'Poppins-ExtraBold', fontSize:RFValue(22)}}>
            Let's Sign You In
        </Text>
        <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(12), opacity:0.6}}>
            Welcome back, you've been missed!
        </Text>
     </View>

      <View style={windowWidth > 1000 ? styles.largeBox : styles.box}>
       <Text style={{fontFamily:'Poppins-Regular', fontSize:12, opacity:0.5, right:windowWidth > 1000 ? wp('23%') : wp('35%'), top:windowWidth > 1000 ? hp('3%') : hp('2.3%')}}> Email </Text>
       <Entypo name="email" size={16} color="#777" style={{top:windowWidth > 1000 ? hp('5%') : hp('4.7%'), right:windowWidth > 1000 ? wp('22%') : wp('36%')}} />
        <TextInput
          style={windowWidth > 1000 ? styles.largeInput : styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <Entypo name="lock" size={16} color="#777" style={{ top: windowWidth > 1000 ? hp('8%') : hp('7%'), right:windowWidth > 1000 ? wp('22%') : wp('36%')}} />
        <Text style={{fontFamily:'Poppins-Regular', fontSize:12, opacity:0.5, right:windowWidth > 1000 ? wp('22.3%') : wp('32%'), top:windowWidth > 1000 ? hp('0%') : hp('0.2%')}}> password</Text>
        <TextInput
          style={windowWidth > 1000 ? styles.largeInput : styles.input}
          placeholder="Password"
          value={password}
          secureTextEntry={!isPasswordVisible}
          onChangeText={setPassword}
        />

<TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={windowWidth > 1000 ? styles.largeEyeIcon : styles.eyeIcon}>
            <Ionicons
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={16}
              color="#777"
            />
          </TouchableOpacity>
 <TouchableOpacity onPress={changePassword} style={{bottom:hp('4%')}}>
    <Text style={{color:'black', fontFamily:'Poppins-Regular', fontSize:13, right:windowWidth > 1000 ? wp('20.5%') : wp('26%')}}>Forgot Password</Text>
 </TouchableOpacity>


        <TouchableOpacity onPress={handleLogin} style={{backgroundColor:'blue', padding:windowWidth > 1000? wp('0.5%') : wp('3.2%'), 
          width: windowWidth > 1000 ? wp('50%') : wp('85%'), 
          borderRadius:12, 
          flexDirection:'row', 
          justifyContent:'space-around',
           alignItems:'center'}}>
            <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(16), color:'white', marginLeft:windowWidth > 1000 ? hp('30%') : wp('22%')}}>SIGN IN</Text>
            <Entypo name="login" size={logSize} color="white" style={{left:windowWidth > 1000 ? wp('4%') : wp('6%')}} />
            </TouchableOpacity>
      </View>

    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', marginBottom:windowWidth > 1000 ? hp('0%') : hp('2%'), bottom: windowWidth > 1000 ? hp('21%') : hp('16%')}}>
    <Text style={{fontFamily:'Poppins-Regular', fontSize:RFValue(14), color:'black'}}>Don't have an account? </Text>
    <TouchableOpacity onPress={handleNext}><Text style={{fontFamily:'Poppins-ExtraBold', fontSize:RFValue(14), color:'black'}}>Sign up </Text></TouchableOpacity>
    
    

    </View>
     
    <Text style={{fontFamily:'OpenSans-ExtraBold', fontSize:16, color:'black', textAlign:'center', opacity:0.7, bottom:windowWidth > 1000 ? hp('20%') : hp('13%')}}>OR </Text>
    


    <View style={{justifyContent:'center', alignItems:'center', bottom:windowWidth > 1000 ? hp('16%') : hp('10%')}}>
    <TouchableOpacity  onPress={Platform.OS === 'web' ? () => promptAsync({  showInRecents: true }) : handleGoogleSignIn }>

      

    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems:  'center'}}>
    <View style={{borderWidth: 1, borderColor: 'blue', padding:  5}}>
    
          <ImageBackground source={require('../assets/glogo.png')} style={styles.icon}/>
      </View>

          <View style={{ backgroundColor: 'blue', padding:  8}}>
    
          <Text style={{fontSize: 16, color: 'white',fontFamily:'Poppins-Bold'}}>Sign in with Google </Text> 
          </View>

          </View>
    </TouchableOpacity>

   
    
    </View>

    
    </View>
  
  );
};

const styles = StyleSheet.create({
  container: {
    
    justifyContent: 'center',
    alignItems: 'center',
    padding: hp('0.3%'),
    backgroundColor: '#ffffff',
    
    
    
    
  },
  
  box: {
    
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
    marginBottom: hp('18%'),
    marginRight:wp('1%'),
    

  },
  largeBox: {
    
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('8%'),
    marginBottom: hp('18%'),
    marginRight:wp('1%'),
    bottom:hp('8%') 

  },

  input: {
    width:  wp('85%'),
    padding: wp('3%'),
    marginBottom:hp('0.2%'),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    
    paddingRight: wp('10%'),
  },
  largeInput: {
    width:wp('50%'),
    padding:  wp('1%'),
    marginBottom:hp('-1%'),
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
    left: wp('37%'),
    marginBottom: hp ('2%'),
    bottom: hp ('4%')
  },
  largeEyeIcon: {
    left: wp('21%'),
    marginBottom: hp ('2%'),
    bottom: hp ('4%')
  },
  
  icon: {
    width: 30,
    height: 30,
    
   

  },
  largeIcon: {
    width: wp('25%'),
    height: hp('9%'),
  },
  userInfo: {
    alignItems: 'center',
    justifyContent: 'center'
  }
 
});

export default LoginScreen;


