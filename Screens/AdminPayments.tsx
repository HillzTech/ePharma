import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import LoadingOverlay from '../Components/LoadingOverlay';
import { FlashList } from '@shopify/flash-list';
import RetailFooter from '../Components/RetailFooter';
import { collection, doc, getDocs, increment, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../Components/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const AdminPayments: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Admin user ID
        const adminUserId = "VdsO9TWkJlS9ItoohfAATFd0wPB3";
        
        // Get payments from the admin's payments collection
        const paymentsRef = collection(db, 'users', adminUserId, 'payments');
        const q = query(paymentsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        // Convert snapshot to an array of payment objects
        const paymentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(paymentsList);
      } catch (error) {
        setError('Failed to load payments');
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const renderItem = ({ item }: { item: any}) => (
    
    <View style={styles.paymentItem}>
     
      <Text style={styles.paymentTitle}>Order ID: {item.id}</Text>
      <Text style={styles.paymentDetails}>Total Amount: {item.totalAmount}</Text>
      <Text style={styles.paymentDetails}>Customer: {item.fullName}</Text>
      <Text style={styles.paymentDetails}>Email: {item.email}</Text>
      <Text style={styles.paymentDetails}>Status: {item.status}</Text>
      
      <Text style={styles.paymentDetails}>Date: {item.paymentDate?.toDate().toLocaleDateString() || 'N/A'}</Text>
      {item.items && item.items.map((orderItem: { productImage: any[]; productTitle: any; quantity: any; price: any; pharmacyName: any; }, index: React.Key | null | undefined) => (
        <View key={index}>
         
          <View style={{}}>
          <Text style={styles.paymentDetails}>Product: {orderItem.productTitle || 'N/A'}</Text>
            <Text style={styles.paymentDetails}>Quantity: {orderItem.quantity || 'N/A'}</Text>
            <Text style={styles.paymentDetails}>Price: {orderItem.price || 'N/A'}</Text>
            <Text style={styles.paymentDetails}>Pharmacy: {orderItem.pharmacyName || 'N/A'}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return <LoadingOverlay />;
  }


  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  const handleback = async() => {
    navigation.navigate('AdminDashboard')
  }

  return (
    <SafeAreaView style={styles.container}>
        
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:wp('2%'), top:hp('2%')}}>
    <TouchableOpacity  onPress={handleback}>
    <Ionicons name="chevron-back" size={29} color="black" />
    </TouchableOpacity>
   
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(18), right:wp('29%')}}>Payments</Text>
   </View>
   
    <View style={styles.payments}>
      <FlatList
        data={payments}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },

  payments: {
   
    marginTop: hp('4%'),
  },

  paymentItem: {
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paymentDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AdminPayments;
