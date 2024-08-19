import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, TextInput } from 'react-native';
import { Paystack } from 'react-native-paystack-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import firebase from 'firebase/compat';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '../Components/firebaseConfig';

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

  // Function to update the seller's revenue
  const updateRevenue = async (userId: string, yearMonth: string, amount: number) => {
    try {
      const revenueDocRef = doc(db, `users/${userId}/revenue/${yearMonth}`);
      await updateDoc(revenueDocRef, {
        total: increment(amount),
      });
    } catch (error) {
      console.error('Error updating revenue: ', error);
    }
  };

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
  
      // Update revenue for each seller
      const date = new Date();
      const currentMonth = date.toLocaleString('default', { month: 'long' });
      const currentYear = date.getFullYear().toString();
      const yearMonth = `${currentYear}-${currentMonth}`;
  
      for (const item of orderDetails.items) {
        const itemTotalAmount = item.price * item.quantity;
        await updateRevenue(item.sellerId, yearMonth, itemTotalAmount);
      }
  
      console.log('Order successfully created in Firestore!');
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };
  

  const verifyPaymentOnServer = async (reference: string) => {
    try {
      const response = await fetch('https://backend.epharma.com.ng/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Payment Verification Result:', result);
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

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
          
          // Send res.transactionRef (your referenceNumber) to your backend for verification
          //verifyPaymentOnServer(res.transactionRef);
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
          placeholder="Enter your address"
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
