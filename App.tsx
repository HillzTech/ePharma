import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { SignInContextProvider } from './contexts/authContext';
import { LocationContextProvider } from './contexts/locationContext';
import IntroScreen from './Screens/IntroScreen';
import GetStartedScreen from './Screens/GetStarted';
import LoginScreen from './Screens/LoginScreen';
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
import { AllProductsProvider } from './contexts/AllProductsContext';
import CartScreen from './Screens/CartScreen';
import Paystack from 'paystack-react-native';
import PaymentScreen from './Screens/PaymentScreen';
import PurchaseSuccessful from './Screens/PurchaseSuccessful';
import CustomerOrderScreen from './Screens/CustomerOrderScreen';
import RetailerOrderScreen from './Screens/RetailerOrderScreen';
import AppointmentScreen from './Screens/AppointmentScreen';
import { PharmacyProvider } from './contexts/PharmacyContext';
import PharmacyBulkScreen from './Screens/PharmacyBulkScreen';
import AdminDashboard from './Screens/AdminDashboard';
import AdminPayments from './Screens/AdminPayments';
import AllOrder from './Screens/AllOrder';
import AddPharmacist from './Screens/AddPharmacist';
import ChatScreen from './Screens/ChatScreen';
import NotificationScreen from './Screens/NotificationScreen';
import WithdrawalScreen from './Screens/WithdrawalScreen';
import PendingWithdrawalsScreen from './Screens/PendingWithdrawalsScreen';
import CompletedWithdrawalsScreen from './Screens/CompletedWithdrawals';
import SupportScreen from './Screens/SupportScreen';
import AdminMessagingScreen from './Screens/AdminMessagingScreen';
import ProfileSettingsScreen from './Screens/ProfileSettingsScreen';
import ProductScreen from './Screens/ProductScreen';
import SeeAll from './Screens/SeeALL';
import AllProductsScreen from './Screens/AllProductsScreen';
import OtcDrugs from './Screens/OtcDrugs';
import FAQScreen from './Screens/FAQScreen';
import { Platform } from 'react-native';
import Terms from './Screens/Terms';
import { createBrowserHistory } from 'history';
import { LinkingOptions } from '@react-navigation/native';
import PolicyScreen from './Screens/PolicyScreen';

const history = Platform.OS === 'web' ? createBrowserHistory() : undefined;

type RootStackParamList = {
  Intro: undefined;
  GetStarted: undefined;
  LoginScreen: undefined;
  HomeScreen: undefined;
  SignupScreen: undefined;
  RetailerScreen: undefined;
  CustomerScreen: undefined;
  AddPharmacist: undefined;
  AddToCartScreen: undefined;
  AdminDashboard: undefined;
  AdminMessagingScreen: undefined;
  AdminPayments: undefined;
  AllOrder: undefined;
  AllProductsScreen: undefined;
  AppointmentScreen: undefined;
  CartScreen: undefined;
  CategoryDetails: undefined;
  CategoryScreen: undefined;
  ChatScreen: undefined;
  CompletedWithdrawals: undefined;
  CustomerOrder: undefined;
  EditProductScreen: undefined;
  FAQScreen: undefined;
  IntroScreen: undefined;
  InventoryScreen: undefined;
  NotificationScreen: undefined;
  OtcDrugs: undefined;
  PaymentScreen: undefined;
  PendingWithdrawalsScreen: undefined;
  PharmacyBulkScreen: undefined;
  PharmacyDetailsScreen: undefined;
  PharmacyInfo: undefined;
  ProductScreen: undefined;
  ProfileSettingsScreen: undefined;
  PurchaseSuccessful: undefined;
  RetailerOrderScreen: undefined;
  RetailerProfile: undefined;
  SeeAll: undefined;
  SupportScreen: undefined;
  SuccessfulUpload: undefined;
  Terms: undefined;
  UploadScreen: undefined;
  WithdrawalScreen: undefined;
  PolicyScreen: undefined;
  

};



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

  if (Platform.OS === 'web') {
    // Target root elements and override styles using JavaScript
    const rootDiv = document.getElementById('root');
    const body = document.body;

    // Ensure scrolling is enabled on root and body
    if (rootDiv) {
      rootDiv.style.overflowY = 'scroll ';
      rootDiv.style.visibility = 'visible ';
      rootDiv.style.position = 'relative '; 
      rootDiv.style.zIndex = 'auto'; // Change from 'fixed' to 'relative' or 'static'
    }

    
  }


  // Define linking configuration for web navigation
  const linking: LinkingOptions <RootStackParamList> = {
    prefixes: [],
    config: {
      screens: {
        Intro: 'intro',
  GetStarted: 'get-started',
  LoginScreen: 'login',
  HomeScreen: 'home',
  SignupScreen: 'signup',
  RetailerScreen: 'sellerhome',
  CustomerScreen: 'customer-profile',
  AddPharmacist: 'addpharmacist',
  AddToCartScreen: 'addtocart',
  AdminDashboard: 'admindashboard',
  AdminMessagingScreen: 'messaging',
  AdminPayments: 'payments',
  AllOrder: 'admin-order',
  AllProductsScreen: 'products',
  AppointmentScreen: 'appointments',
  CartScreen: 'cart',
  CategoryDetails: 'categoryproducts',
  CategoryScreen: 'category',
  ChatScreen: 'chat',
  CompletedWithdrawals: 'completed-withdrawal',
  CustomerOrder: 'customer-order',
  EditProductScreen: 'editproduct',
  FAQScreen: 'FAQ',
  InventoryScreen: 'inventory',
  NotificationScreen: 'notifications',
  OtcDrugs: 'otcdrugs',
  PaymentScreen: 'payment',
  PendingWithdrawalsScreen: 'pendingwithdrawal',
  PharmacyBulkScreen: 'bulkproducts',
  PharmacyDetailsScreen: 'pharmacyproducts',
  PharmacyInfo: 'pharmacyinfo',
  ProductScreen: 'pharmacy-location',
  ProfileSettingsScreen: 'profile-setting',
  PurchaseSuccessful: 'successful',
  RetailerOrderScreen: 'seller-order',
  RetailerProfile: 'seller-profile',
  SeeAll: 'all-pharms',
  SupportScreen: 'support',
  SuccessfulUpload: 'upload',
  Terms: 'terms',
  UploadScreen: 'seller-upload',
  WithdrawalScreen: 'withdrawal',
  PolicyScreen: 'policy',
  
  
      },
    },
  };



  return (
    <SignInContextProvider>
      <LocationContextProvider>
        <AvatarProvider>
        <CategoriesProvider>
        <CartProvider>
        <AllProductsProvider>
        <PharmacyProvider>
          <NavigationContainer linking={linking}
            fallback={<View style={{ flex: 1 }} />}
            documentTitle={{
              formatter: (options, route) => `${route?.name} - My App`,
            }}>
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
              <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
              <Stack.Screen name="PurchaseSuccessful" component={PurchaseSuccessful} />
              <Stack.Screen name="CustomerOrderScreen" component={CustomerOrderScreen} />
              <Stack.Screen name="RetailerOrderScreen" component={RetailerOrderScreen} />
              <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
              <Stack.Screen name="PharmacyBulkScreen" component={PharmacyBulkScreen} />
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
              <Stack.Screen name="AdminPayments" component={AdminPayments} />
              <Stack.Screen name="AllOrder" component={AllOrder} />
              <Stack.Screen name="AddPharmacist" component={AddPharmacist} />
              <Stack.Screen name="ChatScreen" component={ChatScreen} />
              <Stack.Screen name="WithdrawalScreen" component={WithdrawalScreen} />
              <Stack.Screen name="PendingWithdrawalsScreen" component={PendingWithdrawalsScreen} />
              <Stack.Screen name="CompletedWithdrawalsScreen" component={CompletedWithdrawalsScreen} />
              <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
              <Stack.Screen name="SupportScreen" component={SupportScreen} />
              <Stack.Screen name="AdminMessagingScreen" component={AdminMessagingScreen} />
              <Stack.Screen name="ProfileSettingsScreen" component={ProfileSettingsScreen} />
              <Stack.Screen name="ProductScreen" component={ProductScreen} />
              <Stack.Screen name="SeeAll" component={SeeAll} />
              <Stack.Screen name="FAQScreen" component={FAQScreen} />
              <Stack.Screen name="OtcDrugs" component={OtcDrugs} />
              <Stack.Screen name="Terms" component={Terms} />
              <Stack.Screen name="AllProductsScreen" component={AllProductsScreen} />
              <Stack.Screen name="PolicyScreen" component={PolicyScreen} />
              <Stack.Screen name="PharmacyDetailsScreen" component={PharmacyDetailsScreen} options={{ title: 'Pharmacy Details' }}/>
            </Stack.Navigator>
          </NavigationContainer>
          </PharmacyProvider>
          </AllProductsProvider>
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
