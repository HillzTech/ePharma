import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Button, Image } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import LoadingOverlay from '../Components/LoadingOverlay';
import { FlashList } from '@shopify/flash-list';
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
}

const RetailerOrderScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('Pending'); // Default to 'Pending'

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const userId = firebase.auth().currentUser?.uid; // Get the current user's ID
        if (userId) {
          const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .orderBy('createdAt', 'desc')
            .get();

          // Filter orders to include only those where at least one item has sellerId matching the current user
          const userOrders = ordersSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Order[];

          const filteredOrders = userOrders.filter(order =>
            order.items.some(item => item.sellerId === userId)
          );

          setOrders(filteredOrders);
          setFilteredOrders(filteredOrders); // Initially display all orders
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on the selected tag
    if (selectedTag === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedTag));
    }
  }, [selectedTag, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await firebase.firestore().collection('orders').doc(orderId).update({
        status: newStatus,
      });
      // Refresh orders after status update
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);

      // If the current selected tag does not match the new status, filter orders again
      if (selectedTag === 'Pending' && newStatus !== 'Pending') {
        setSelectedTag(newStatus); // Change tag to match the new status
      } else {
        setFilteredOrders(updatedOrders.filter(order => order.status === selectedTag));
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
      <View style={{flexDirection:'row'}}>  
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
      {item.status === 'Pending' && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={() => updateOrderStatus(item.id, 'Delivered')} activeOpacity={0.7}>
            <Text>Mark as Delivered</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => updateOrderStatus(item.id, 'Cancelled')} activeOpacity={0.7}>
            <Text>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
    
      <View style={styles.tagsContainer}>
       
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
        <TouchableOpacity
          style={[styles.tag, selectedTag === 'Pending' && styles.selectedTag]}
          onPress={() => setSelectedTag('Pending')}
        >
          <Text style={styles.tagText}>Pending</Text>
        </TouchableOpacity>
      </View>
      <FlashList
  data={filteredOrders}
  renderItem={renderOrderItem}
  keyExtractor={(item) => item.id}
  contentContainerStyle={styles.list}
  estimatedItemSize={200} // Add this line for performance optimization
  ListEmptyComponent={<Text style={styles.emptyText}>No orders found.</Text>}
/>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
    backgroundColor: '#D3D3D3',
    
    
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    
    marginTop: hp('4%'),
  },
  tag: {
    padding: wp('3%'),
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  selectedTag: {
    backgroundColor: '#007bff',
  },
  tagText: {
    fontSize: RFValue(14),
    color: '#000',
  },
  list: {
    paddingBottom: hp('4%'),
  },
  orderContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: wp('5%'),
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
    
  },
  orderId: {
    fontSize: RFValue(14),
    fontFamily: 'Poppins-Bold',
  },
  orderStatus: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
  orderCol: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-Bold',
    color: '#555',
  },
  orderAmount: {
    fontSize: RFValue(14),
    fontFamily: 'OpenSans-Bold',
    color: '#000',
  },
  orderDate: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-Regular',
    color: '#777',
  },
  emptyText: {
    fontSize: RFValue(16),
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: hp('20%'),
  },
  itemContainer: {
    marginTop: hp('1%'),
    flexDirection:'row'
  },
  itemText: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  buttonsContainer: {
    marginTop: hp('2%'),
  },
  itemDetails: {
    marginLeft: wp('4%'),
  },
  itemImage: {
    width: wp('15%'),
    height: hp('10%'),
    borderRadius: 8,
  },
});

export default RetailerOrderScreen;
