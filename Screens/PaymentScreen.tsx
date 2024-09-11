import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, TextInput, PermissionsAndroid } from 'react-native';
import { Paystack } from 'react-native-paystack-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import firebase from 'firebase/compat';
import { db } from '../Components/firebaseConfig';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

const PaymentScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { totalAmount, email, orderData, customerId } = route.params as { totalAmount: number; email: string; orderData: any, customerId: any };
  const { clearCart } = useCart();

  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');

  const paystackWebViewRef = useRef<any>(null);
  const referenceNumber = Math.random().toString(36).substring(2); // Generate a unique reference number

  const createOrderInFirestore = async () => {
    try {
      // Prepare the order details
      const orderDetails = {
        customerId,
        email,
        address,
        phoneNumber,
        fullName,
        items: orderData.items.map((item: any) => ({
          productImage: item.imageUrls,
          productId: item.productId,
          pharmacyName: item.pharmacyName,
          productTitle: item.title,
          sellerId: item.userId,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
        status: 'Pending', // Set initial status to 'Pending'
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Save the order in the global orders collection
      await firebase.firestore()
        .collection('orders')
        .doc(referenceNumber) // Use reference number as the document ID
        .set(orderDetails);

      // Save the payment in the admin's payments collection
      const adminUserId = "VdsO9TWkJlS9ItoohfAATFd0wPB3"; // Admin user ID
      await firebase.firestore()
        .collection('users')
        .doc(adminUserId)
        .collection('payments')
        .doc(referenceNumber) // Use reference number as the document ID
        .set({
          ...orderDetails,
          paymentReference: referenceNumber,
          paymentDate: firebase.firestore.FieldValue.serverTimestamp(), // Add payment date
        });

      //Send push notification to the seller
      const sellerToken = await getSellerToken(orderData.items[0].userId);
      if (sellerToken) {
        await sendPushNotification(sellerToken, 'New Order', `You have a new order for ${orderData.items.length} items.`);
      }

      // Send push notification to the admin
      const adminToken = await getAdminToken(adminUserId);
      if (adminToken) {
        await sendPushNotification(adminToken, 'New Payment', `A payment of NGN ${totalAmount} has been made with reference ${referenceNumber}.`);
      }

      // Create a message for the user
      const productNames = orderDetails.items.map((item: { productTitle: any; }) => item.productTitle).join(', ');
      const messageDetails = {
        message: `Your order for ${productNames} with reference number ${referenceNumber} is ${orderDetails.status}.`,
        orderId: referenceNumber,
        status: orderDetails.status,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        unread: true, // Mark the message as unread
      };

      // Save the message in the user's messages collection
      await firebase.firestore()
        .collection('users')
        .doc(customerId)
        .collection('messages')
        .doc(referenceNumber) // Use reference number as the document ID
        .set(messageDetails);

      console.log('Order and message successfully created in Firestore!');
    } catch (error) {
      console.error('Error creating order and message:', error);
    }
  };

  const getSellerToken = async (sellerId: string) => {
    const sellerDoc = await firebase.firestore().collection('users').doc(sellerId).get();
    return sellerDoc.exists ? sellerDoc.data()?.fcmToken : null;
  };

  const getAdminToken = async (adminId: string) => {
    const adminDoc = await firebase.firestore().collection('users').doc(adminId).get();
    return adminDoc.exists ? adminDoc.data()?.fcmToken : null;
  };

  const sendPushNotification = async (token: string, title: string, message: string) => {
    try {
      const messagePayload: FirebaseMessagingTypes.RemoteMessage = {
        to: token,
        notification: {
          title,
          body: message,
          icon: 'https://firebasestorage.googleapis.com/v0/b/epharma-97b49.appspot.com/o/20240711_181052_0000-removebg-preview.png?alt=media&token=844620c9-73c1-43b2-8838-148fd8637e11', 
        },
        fcmOptions: {
          analyticsLabel: 'notification', // Optional: Add an analytics label if needed
        },
      };
  
      await messaging().sendMessage(messagePayload);
      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };
  
  useEffect(() => {
    const requestUserPermission = async () => {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        const token = await messaging().getToken();
        console.log('FCM token', token);
      }
    };
    requestUserPermission();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Paystack
        paystackKey="pk_test_b51549608edae360b126259810507fc3e6537b1a" // Use your actual Paystack public key
        channels={["card", "ussd", "bank", "qr", "mobile_money"]}
        amount={totalAmount}
        currency='NGN'
        billingEmail={email}
        activityIndicatorColor="green"
        refNumber={referenceNumber}
        onCancel={(e: any) => {
          console.log('Payment canceled:', e);  // Handle cancellation
        }}
        onSuccess={async (res: any) => {
          console.log('Payment successful:', res);

          await createOrderInFirestore();
          clearCart();
          navigation.navigate('PurchaseSuccessful');
        }}
        ref={paystackWebViewRef}
      />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Checkout</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter delivery address"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      <TouchableOpacity style={styles.payButton} onPress={() => paystackWebViewRef.current?.startTransaction()}>
        <Text>Pay Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
    backgroundColor: '#D3D3D3',
  },
  inputContainer: {
    marginBottom: hp('2%'),
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: hp('1%'),
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('2.5%'),
    marginBottom: wp('5%'),
  },
  headerText: {
    fontSize: RFValue(19),
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: 'black',
    right: wp('35%'),
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
});

export default PaymentScreen;
