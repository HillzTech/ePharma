import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Keyboard, Alert } from 'react-native';
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
      navigation.navigate('LoginScreen'); // Navigate to HomeScreen on successful login
      setLoading(false);
      console.log("get result:", response);
    } else {
      setLoading(false);
      Alert.alert('Sign In Failed', 'Invalid email or password');
    }
    
  
          
  };


  const fetchLocation = async () => {
    try {
      const locationData = await AsyncStorage.getItem('userLocation');
      if (locationData) {
        const parsedLocation = JSON.parse(locationData);
        setLocation(parsedLocation);
        locationDispatch({ type: 'UPDATE_LOCATION', payload: { location: parsedLocation } });
      }
    } catch (error) {
      console.error('Error fetching location from AsyncStorage:', error);
    }
  };
  
  useEffect(() => {
    
    fetchLocation();
  }, []);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
      >
        {isLoading && <LoadingOverlay />}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: hp('6%') }}>
          <Ionicons name="location-outline" size={RFValue(25)} color="black" />
          <Text style={{textAlign:'center', fontFamily:'Poppins-Bold'}}>{location?.address || 'Loading location...'}</Text>
        </View>

        <View style={{ marginTop: hp('-1%'), padding: wp('7%') }}>
          <Text style={{ fontFamily: 'Poppins-ExtraBold', fontSize: RFValue(22) }}>Getting Started</Text>
          <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(12), opacity: 0.6 }}>Create an account to continue!</Text>
        </View>

        <View style={styles.container}>
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: RFValue(12), opacity: 0.5, right: wp('35%'), top: hp('2%') }}> Email</Text>
          <Entypo name="email" size={RFValue(18)} color="#777" style={{ top: hp('4.7%'), right: wp('36%') }} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: RFValue(12), opacity: 0.5, right: wp('31%'), top: hp('2%') }}> Username</Text>
          <Entypo name="user" size={RFValue(18)} color="#777" style={{ top: hp('4.7%'), right: wp('36%') }} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <Entypo name="lock" size={RFValue(18)} color="#777" style={{ top: hp('7.5%'), right: wp('36%') }} />
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: RFValue(12), opacity: 0.5, right: wp('32%') }}> Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            secureTextEntry={!isPasswordVisible}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={RFValue(28)}
              color="#777"
            />
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <TouchableOpacity style={styles.checkbox} onPress={() => setAgreedToTerms(!agreedToTerms)}>
              {agreedToTerms && <Ionicons name="checkmark" size={RFValue(18)} color="black" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By creating an account you agree to our{' '}
              <TouchableOpacity onPress={() => navigation.navigate('TermsAndConditions')}>
                <Text style={styles.termsLink}>terms and conditions</Text>
              </TouchableOpacity>
            </Text>
          </View>
         
           
          


          <TouchableOpacity onPress={handleSignUp} style={{ backgroundColor: 'blue', padding: wp('3.2%'), width: wp('85%'), borderRadius: 12, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', bottom: hp('1%') }}>
            <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(16), color: 'white', marginLeft: wp('22%') }}>SIGN UP</Text>
            <Entypo name="login" size={RFValue(28)} color="white" style={{ left: wp('6%') }} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: hp('2%'), bottom: hp('33%') }}>
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: RFValue(14), color: 'black' }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={{ fontFamily: 'Poppins-ExtraBold', fontSize: RFValue(14), color: 'black' }}>Sign in</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: 'center', color: 'black', bottom: hp('34%'), fontFamily: 'Poppins-Regular', opacity: 0.6 }}>Sign Up As</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setSelectedRole(selectedRole === 'Customer' ? '' : 'Customer')}
          >
            <Text style={styles.roleButtonText}>Customer</Text>
            {selectedRole === 'Customer' && <Ionicons name="checkmark" size={RFValue(18)} color="black" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setSelectedRole(selectedRole === 'Wholesaler' ? '' : 'Wholesaler')}
          >
            <Text style={styles.roleButtonText}>Wholesaler</Text>
            {selectedRole === 'Wholesaler' && <Ionicons name="checkmark" size={RFValue(18)} color="black" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setSelectedRole(selectedRole === 'Retailer' ? '' : 'Retailer')}
          >
            <Text style={styles.roleButtonText}>Retailer</Text>
            {selectedRole === 'Retailer' && <Ionicons name="checkmark" size={RFValue(18)} color="black" />}
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
    width: wp('85%'),
    padding: wp('3%'),
    marginBottom: hp('-1%'),
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('-4%'),
    marginBottom: hp('3%'),
    paddingHorizontal: wp('3%')
  },
  checkbox: {
    width: wp('5%'),
    height: wp('5%'),
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
    borderRadius: 2
  },
  termsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: RFValue(12),
    opacity: 0.6,
    top: hp('1%')
  },
  termsLink: {
    fontFamily: 'Poppins-Bold',
    fontSize: RFValue(12),
    color: 'black',
  },
  roleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: hp('-34%'),
    marginBottom: hp('2%'),
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: wp('85%'),
    padding: wp('3%'),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: hp('1%'),
  },
  roleButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: RFValue(16),
    textAlign: 'center',
    left: wp('29%')
  },
});

export default SignupScreen;
