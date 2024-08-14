import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { SignInContextProvider } from './contexts/authContext';
import { LocationContextProvider } from './contexts/locationContext';
import IntroScreen from './Screens/IntroScreen';
import GetStartedScreen from './Screens/GetStarted';
import LoginScreen from './Screens/LoginScreen';
import LocationScreen from './Screens/LocationScreen';
import HomeScreen from './Screens/HomeScreen';
import SignupScreen from './Screens/SignupScreen';
import RetailerScreen from './Screens/RetailerScreen';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { firebaseConfig } from './Components/firebaseConfig';
import CustomerScreen from './Screens/CustomerScreen';
import { AvatarProvider, useAvatar } from './contexts/AvatarContext';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebase from 'firebase/compat/app';
import UploadScreen from './Screens/UploadScreen';
import { CategoriesProvider } from './contexts/CategoriesContext';
import SuccessfulUpload from './Screens/SuccessfulUpload';
import InventoryScreen from './Screens/InventoryScreen';
import CategoryScreen from './Screens/CategoryScreen';
import CategoryDetailsScreen from './Screens/CategoryDetailsScreen';
import EditProductScreen from './Screens/EditProductScreen';
import RetailerProfile from './Screens/RetailerProfile';
import PharmacyInfo from './Screens/PharmacyInfo';
import { CartProvider } from './contexts/CartContext';
import PharmacyDetailsScreen from './Screens/PharmacyDetailsScreen';
import AddToCartScreen from './Screens/AddToCartScreen';
import { ProductProvider } from './contexts/ProductContext';
import CartScreen from './Screens/CartScreen';




const Stack = createStackNavigator();

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase has been initialized.');
} else {
  console.log('Firebase is already initialized.');
}



// App Component
export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.otf'),
    'Poppins-ExtraBold': require('./assets/fonts/Poppins-ExtraBold.otf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.otf'),
    'Poppins-BoldItalic': require('./assets/fonts/Poppins-BoldItalic.otf'),
    'OpenSans-Bold': require('./assets/fonts/OpenSans-Bold.ttf'),
    'OpenSans-ExtraBold': require('./assets/fonts/OpenSans-ExtraBold.ttf'),
  });

  const [splashVisible, setSplashVisible] = useState(true);
  
 

  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        if (fontsLoaded) {
          setSplashVisible(false);
          await SplashScreen.hideAsync();
        }
      }
    };

    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded || splashVisible) {
    return null; // Or a splash screen component
  }

  return (
    <SignInContextProvider>
      <LocationContextProvider>
        <AvatarProvider>
        <CategoriesProvider>
        <CartProvider>
        <ProductProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Intro"
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                cardStyle: { backgroundColor: '#ffffff' },
                animationEnabled: true, // Enable animation
                ...TransitionPresets.ModalSlideFromBottomIOS, // Slide-up transition
              }}
            >
              <Stack.Screen name="Intro" component={IntroScreen} />
              <Stack.Screen name="GetStarted" component={GetStartedScreen} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="Location" component={LocationScreen} />
              <Stack.Screen name="HomeScreen" component={HomeScreen} />
              <Stack.Screen name="SignupScreen" component={SignupScreen} />
              <Stack.Screen name="RetailerScreen" component={RetailerScreen} />
              <Stack.Screen name="CustomerScreen" component={CustomerScreen} />
              <Stack.Screen name="UploadScreen" component={UploadScreen} />
              <Stack.Screen name="SuccessfulUpload" component={SuccessfulUpload} />
              <Stack.Screen name="InventoryScreen" component={InventoryScreen} />
              <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
              <Stack.Screen name="CategoryDetails" component={CategoryDetailsScreen} />
              <Stack.Screen name="EditProductScreen" component={EditProductScreen} />
              <Stack.Screen name="RetailerProfile" component={RetailerProfile} />
              <Stack.Screen name="PharmacyInfo" component={PharmacyInfo} />
              <Stack.Screen name="AddToCartScreen" component={AddToCartScreen} />
              <Stack.Screen name="CartScreen" component={CartScreen} />
              <Stack.Screen name="PharmacyDetailsScreen" component={PharmacyDetailsScreen} options={{ title: 'Pharmacy Details' }}/>
            </Stack.Navigator>
          </NavigationContainer>
          </ProductProvider>
          </CartProvider>
          </CategoriesProvider>
        </AvatarProvider>
      </LocationContextProvider>
    </SignInContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
