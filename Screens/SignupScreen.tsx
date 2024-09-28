import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Keyboard, Alert, Dimensions, StatusBar } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SignInContext, useAuth } from '../contexts/authContext';
import { LocationContext } from '../contexts/locationContext'; // Adjust the path as needed
import LoadingOverlay from '../Components/LoadingOverlay'; // Adjust the import path as needed




const SignupScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const {register} = useAuth();
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [location, setLocation] = useState<{ address: string } | null>(null);

  const locationContext = useContext(LocationContext);
  if (!locationContext) {
    throw new Error('LocationContext must be used within a LocationContextProvider');
  }

  const { locationDispatch } = locationContext;
 


  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "28593816693-qgtuemc9vsmk8933gigv0kd4678a0uv4.apps.googleusercontent.com"
    });
  }, []);

  const handleSignUp = async() => {
    if (!selectedRole) {
      Alert.alert('Error', 'You must select a role to create an account.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Error', 'You must agree to the terms and conditions to create an account.');
      return;
    }
    Keyboard.dismiss();
    if (!email || !password || !username || !selectedRole) {
      Alert.alert("Sign up", "Please fill all the fields!");
      return;

    }
    setLoading(true);
    
    let response = await register(email, password, username, selectedRole);
    if (response.success) {
      Alert.alert('User signed up successfully!', 'A verification email has been sent to your email address. Please verify your email to activate your account.');
      navigation.navigate('LoginScreen'); 
      setLoading(false);
      console.log("get result:", response);
    } else {
      setLoading(false);
      Alert.alert('Sign In Failed', 'Invalid email or password');
    }
    
  
          
  };


 


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor="black" barStyle="light-content"/>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
      >
        {isLoading && <LoadingOverlay />}
        
        <View style={{ top: windowWidth > 1000 ? 0 : hp('3%'), padding: windowWidth > 1000 ? 25 : wp('7%') }}>
          <Text style={{ fontFamily: 'Poppins-ExtraBold', fontSize: RFValue(22) }}>Getting Started</Text>
          <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(12), opacity: 0.6 }}>Create an account to continue!</Text>
        </View>

        <View style={styles.container}>
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, opacity: 0.5, right: windowWidth > 1000 ? wp('23%') : wp('35%'), top: hp('2%') }}> Email</Text>
          <Entypo name="email" size={17} color="#777" style={{ top: 35, right: windowWidth > 1000 ? wp('23%') : wp('36%') }} />
          <TextInput
            style={windowWidth > 1000 ? styles.largeInput : styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, opacity: 0.5, right: windowWidth > 1000 ? wp('22%') : wp('31%'), top: hp('2%') }}> Username</Text>
          <Entypo name="user" size={16} color="#777" style={{ top: hp('4.7%'), right: windowWidth > 1000 ? wp('22.5%') : wp('36%') }} />
          <TextInput
            style={windowWidth > 1000 ? styles.largeInput : styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <Entypo name="lock" size={16} color="#777" style={{ top: hp('7.5%'), right: windowWidth > 1000 ? wp('22.5%') : wp('36%') }} />
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, opacity: 0.5, right: windowWidth > 1000 ? wp('22%') : wp('32%') }}> Password</Text>
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

          <View style={styles.termsContainer}>
            <TouchableOpacity style={styles.checkbox} onPress={() => setAgreedToTerms(!agreedToTerms)}>
              {agreedToTerms && <Ionicons name="checkmark" size={19} color="black" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By creating an account you agree to our{' '}
              <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
                <Text style={styles.termsLink}>terms and conditions</Text>
              </TouchableOpacity>
            </Text>
          </View>
         
           
          


          <TouchableOpacity onPress={handleSignUp} style={{ backgroundColor: 'blue', padding: 8, width:windowWidth > 1000 ? 600 : 305, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', bottom: hp('1%') }}>
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 17, color: 'white', marginLeft: windowWidth > 1000 ? 180 : 72 }}>SIGN UP</Text>
            <Entypo name="login" size={24} color="white" style={{ left: wp('6%') }} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: hp('2%'), bottom: windowWidth > 1000 ? 190 :hp('36%') }}>
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 15, color: 'black' }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={{ fontFamily: 'Poppins-ExtraBold', fontSize: 15, color: 'black' }}>Sign in</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: 'center', color: 'black', bottom: windowWidth > 1000 ? hp('30%') : hp('37%'), fontFamily: 'Poppins-Regular', opacity: 0.6 }}>Sign Up As</Text>

        <View style={windowWidth > 1000 ? styles.lgroleContainer : styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setSelectedRole(selectedRole === 'Customer' ? '' : 'Customer')}
          >
            <Text style={styles.roleButtonText}>Customer</Text>
            {selectedRole === 'Customer' && <Ionicons name="checkmark" size={19} color="black" />}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setSelectedRole(selectedRole === 'Retailer' ? '' : 'Retailer')}
          >
            <Text style={styles.roleButtonText}>Pharmacy</Text>
            {selectedRole === 'Retailer' && <Ionicons name="checkmark" size={19} color="black" />}
          </TouchableOpacity>
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
    marginBottom: hp('30%'),
    bottom: hp('3%')
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
    fontFamily: 'Poppins-Bold'
  },
  eyeIcon: {
    left: wp('33%'),
    marginBottom: hp('2%'),
    bottom: hp('4.5%')
  },
  largeEyeIcon: {
    left: wp('21%'),
    marginBottom: hp ('2%'),
    bottom: hp ('4%')
  },
  
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: hp('3%'),
    paddingHorizontal: wp('3%')
  },
  checkbox: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 2
  },
  termsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    opacity: 0.6,
    top: hp('1%')
  },
  termsLink: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    color: 'black',
  },
  roleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('-35%'),
    marginBottom: hp('6%'),
    
    
  },
  lgroleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('-29.5%'),
    marginBottom: hp('6%'),
    
    
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    width: 320,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: hp('1%'),
  },
  roleButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 17,
    textAlign: 'center',
    
  },
});

export default SignupScreen;
