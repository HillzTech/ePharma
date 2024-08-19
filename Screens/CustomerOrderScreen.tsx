import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import LoadingOverlay from '../Components/LoadingOverlay';

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
  createdAt: firebase.firestore.Timestamp;
}

const CustomerOrderScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<'Pending' | 'Delivered' | 'Cancelled'>('Pending');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const userId = firebase.auth().currentUser?.uid;
        if (userId) {
          const ordersSnapshot = await firebase.firestore()
            .collection('orders')
            .where('customerId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

          const userOrders = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];

          setOrders(userOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderContainer}
    >
      <Text style={styles.orderId}>Order ID: {item.id}</Text>
      {item.items && item.items.map((orderItem, index) => (
        <View key={index} style={styles.itemContainer}>
          {orderItem.productImage && orderItem.productImage[0] ? (
            <Image source={{ uri: orderItem.productImage[0] }} style={styles.itemImage} />
          ) : (
            <Text>No Image Available</Text>
          )}
          <View style={styles.itemDetails}>
            <Text style={styles.itemText}>Product: {orderItem.productTitle || 'N/A'}</Text>
            <Text style={styles.itemText}>Pharmacy: {orderItem.pharmacyName || 'N/A'}</Text>
          </View>
        </View>
      ))}
            <View style={{flexDirection:'row'}}>  
      <Text style={styles.itemText}>Status: </Text> 
      <Text style={[styles.orderStatus, 
        { color: item.status === 'Delivered' ? 'green' : item.status === 'Cancelled' ? 'red' : '#555' }
      ]}>
      {item.status}
      </Text>
      </View>
      <Text style={styles.orderAmount}>Total: #{item.totalAmount?.toFixed(2)}</Text>
      <Text style={styles.orderDate}>
        Date: {item.createdAt?.toDate().toLocaleDateString() || 'N/A'}
      </Text>
    </View>
  );

  // Categorize orders
  const categorizedOrders = {
    Delivered: orders.filter(order => order.status === 'Delivered'),
    Cancelled: orders.filter(order => order.status === 'Cancelled'),
    Pending: orders.filter(order => order.status === 'Pending'),
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tag Row */}
      <View  style={styles.tagContainer}>
        {['Pending', 'Delivered', 'Cancelled'].map(tag => (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, selectedTag === tag && styles.selectedTag]}
            onPress={() => setSelectedTag(tag as 'Pending' | 'Delivered' | 'Cancelled')}
          >
            <Text style={[styles.tagText, selectedTag === tag && styles.selectedTagText]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={categorizedOrders[selectedTag]}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No {selectedTag.toLowerCase()} orders found.</Text>}
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
  tagContainer: {
    
    flexDirection: 'row',
    left: wp('5%'),
    marginBottom: hp('2%'),
    maxHeight: hp('7%'),
    marginTop: hp('4%'),
  },
  tag: {
    backgroundColor: '#fff', 
    paddingVertical: wp('1%'),
    marginBottom: hp('2%'),
    paddingHorizontal: wp('3%'),
    marginRight: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius:10,
    height: hp('5%'),
  },
  selectedTag: {
    backgroundColor: '#007bff',
  },
  tagText: {
    fontSize: RFValue(14),
    fontFamily: 'Poppins-Regular',
    color: '#000',
    
   
  },
  selectedTagText: {
    color: '#fff',
  },
  list: {
    
    paddingBottom: hp('4%'),
  },
 
  orderId: {
    fontSize: RFValue(14),
    fontFamily: 'Poppins-Bold',
  },
  orderStatus: {
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
    flexDirection: 'row',
    marginTop: hp('1%'),
    alignItems: 'center',
  },
  itemImage: {
    width: wp('15%'),
    height: hp('10%'),
    borderRadius: 8,
  },
  itemDetails: {
    marginLeft: wp('4%'),
  },
  itemText: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  orderContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: wp('5%'),
    marginBottom: hp('2%'),
    
    
  },
});

export default CustomerOrderScreen;
