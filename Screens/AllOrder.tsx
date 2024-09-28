import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import LoadingOverlay from '../Components/LoadingOverlay';
import { FlashList } from '@shopify/flash-list';
import RetailFooter from '../Components/RetailFooter';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { db } from '../Components/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import AdminFooter from '../Components/AdminFooter';

interface Order {
  id: string;
  items: Array<{
    productId: string;
    pharmacyName: string;
    productTitle: string;
    sellerId: string;
    price: number;
    quantity: number;
    productImage: string[];
  }>;
  totalAmount: number;
  status: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  email: string;
  createdAt: firebase.firestore.Timestamp;
  customerToken: string; // Assume this field stores the customer's notification token
}

const AllOrder: React.FC<{ route: any }> = ({ route}) => {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('Pending');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersSnapshot = await firebase.firestore()
          .collection('orders')
          .orderBy('createdAt', 'desc')
          .get();
  
        const allOrders = ordersSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];
  
        setOrders(allOrders);
        setFilteredOrders(allOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrders();
  }, []);
  

  useEffect(() => {
    if (selectedTag === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedTag));
    }
  }, [selectedTag, orders]);

  const sendCustomerNotification = async (customerToken: string, message: string) => {
    try {
      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=28593816693-q1ntubhnk0le3obli6kqlv1165gqh00e.apps.googleusercontent.com`, // Replace with your Firebase server key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: customerToken,
          notification: {
            title: 'Order Update',
            body: message,
            sound: 'default',
          },
        }),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

   // Function to update the seller's revenue
   const updateRevenue = async (userId: string, yearMonth: string, amount: number) => {
    try {
      const revenueDocRef = doc(db, `users/${userId}/revenue/${yearMonth}`);
      await updateDoc(revenueDocRef, {
        total: increment(amount - amount * 0.10),
      });
    } catch (error) {
      console.error('Error updating revenue: ', error);
    }
  };


  const updateOrderStatus = async (orderId: string, newStatus: string, customerToken: string) => {
    try {
      await firebase.firestore().collection('orders').doc(orderId).update({
        status: newStatus,
      });

      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);

      if (selectedTag === 'Pending' && newStatus !== 'Pending') {
        setSelectedTag(newStatus);
      } else {
        setFilteredOrders(updatedOrders.filter(order => order.status === selectedTag));
      }

      // Send notification to the customer
      sendCustomerNotification(customerToken, `Your order is now ${newStatus}.`);

      if (newStatus === 'Delivered') {
        const date = new Date();
        const currentMonth = date.toLocaleString('default', { month: 'long' });
        const currentYear = date.getFullYear().toString();
        const yearMonth = `${currentYear}-${currentMonth}`;

        for (const item of updatedOrders.find(order => order.id === orderId)?.items || []) {
          const itemTotalAmount = item.price * item.quantity;
          await updateRevenue(item.sellerId, yearMonth, itemTotalAmount);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderId}>Order ID: {item.id}</Text>
      {item.items && item.items.map((orderItem, index) => (
        <View key={index} style={styles.itemContainer}>
          {orderItem.productImage && orderItem.productImage[0] ? (
            <Image source={{ uri: orderItem.productImage[0] }} style={styles.itemImage} />
          ) : (
            <Text>No Image</Text>
          )}
          <View style={styles.itemDetails}>
            <Text style={styles.itemText}>Product: {orderItem.productTitle || 'N/A'}</Text>
            <Text style={styles.itemText}>Quantity: {orderItem.quantity || 'N/A'}</Text>
            <Text style={styles.itemText}>Price: {orderItem.price || 'N/A'}</Text>
            <Text style={styles.itemText}>Pharmacy: {orderItem.pharmacyName || 'N/A'}</Text>
          </View>
        </View>
      ))}
      <Text style={styles.orderStatus}>Customer's Name: {item.fullName}</Text>
      <Text style={styles.orderStatus}>Delivery Address: {item.address}</Text>
      <Text style={styles.orderStatus}>Phone Number: {item.phoneNumber}</Text>
      <Text style={styles.orderStatus}>Customer's Email: {item.email}</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.orderStatus}>Status: </Text>
        <Text style={[styles.orderCol, 
          { color: item.status === 'Delivered' ? 'green' : item.status === 'Cancelled' ? 'red' : '#555' }
        ]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.orderAmount}>Total: #{item.totalAmount.toFixed(2)}</Text>
      <Text style={styles.orderDate}>
        Date: {item.createdAt.toDate().toLocaleDateString()}
      </Text>

    </View>
  );

  const goBack = async () => {
    navigation.navigate('AdminDashboard');
};

 
  return (
    <SafeAreaView style={styles.container}>
           {isLoading && <LoadingOverlay />}
           <StatusBar backgroundColor="black" barStyle="light-content"/>
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:wp('1%'), marginTop:Platform.OS === 'web'? 0:hp('-1%')}}>
    <TouchableOpacity  onPress={goBack}>
    <Ionicons name="chevron-back" size={29} color="black" />
    </TouchableOpacity>
   
   <Text style={{fontFamily:'OpenSans-Bold', fontSize:RFValue(18), right:wp('38%')}}>All Orders</Text>
   </View>
      <View style={styles.tagsContainer}>
        <TouchableOpacity
          style={[styles.tag, selectedTag === 'Pending' && styles.selectedTag]}
          onPress={() => setSelectedTag('Pending')}
        >
          <Text style={styles.tagText}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tag, selectedTag === 'Processing' && styles.selectedTag]}
          onPress={() => setSelectedTag('Processing')}
        >
          <Text style={styles.tagText}>Processing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tag, selectedTag === 'Delivered' && styles.selectedTag]}
          onPress={() => setSelectedTag('Delivered')}
        >
          <Text style={styles.tagText}>Delivered</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tag, selectedTag === 'Cancelled' && styles.selectedTag]}
          onPress={() => setSelectedTag('Cancelled')}
        >
          <Text style={styles.tagText}>Cancelled</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No {selectedTag.toLowerCase()} orders found.</Text>}
      />


    
      
            
        {Platform.OS === 'web'? (
                <>
                  
                </>
              ) : (
                <>
              <AdminFooter route={route} navigation={navigation}/>
        <View style={{ top: hp('2.4%'), backgroundColor: 'black', height: hp('10%'),  }}>
                      <></>
                  </View>
                
                </>
              )}
    

  
    </SafeAreaView>
  );
};

export default AllOrder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp('1%'),
    backgroundColor: '#fff',
  },
  orderContainer: {
    marginBottom: hp('2%'),
    padding: wp('4%'),
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 2,
    marginHorizontal: wp('1%'),
    position: 'relative',
  },
  orderId: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: hp('1%'),
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 70,
    height:80,
    marginRight: wp('4%'),
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    marginBottom: hp('1%'),
  },
  orderCol: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginBottom: hp('1%'),
  },
  orderAmount: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: hp('1%'),
  },
  orderDate: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    marginBottom: hp('1%'),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
    paddingHorizontal: wp('2%'),
  },
  tag: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedTag: {
    backgroundColor: 'blue',
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  emptyText: {
    fontSize: 17,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: hp('20%'),
  },
  productsContainer: {
    borderRadius: 10,
        marginBottom: hp('2%'),
        width: wp('86%'),
        marginLeft: wp('6%'),
        paddingHorizontal: wp('2%'),
        paddingVertical: wp('0.5%'),
        position: 'relative',
},
});
