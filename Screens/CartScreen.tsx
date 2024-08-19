// CartScreen.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/authContext';
import { useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Product } from '../types';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const CartScreen: React.FC = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      Alert.alert('User Not Logged In', 'Please log in to proceed to checkout.');
      return;
    }

    const totalAmount = cart.reduce((sum, product) => sum + (product.price * (product.quantity || 1)), 0);

    const orderData = {
      customerId: user.uid,
      email: user.email,
      totalAmount: totalAmount,
      items: cart.map(item => ({
        productId: item.id,
        title: item.title,
        imageUrls: item.imageUrls,
        price: item.price,
        quantity: item.quantity,
        userId: item.userId,         // Pharmacy userId
        pharmacyName: item.pharmacyName, // Pharmacy name
      })),
      createdAt: new Date().toISOString(),
    };
  

    navigation.navigate('PaymentScreen', {
      totalAmount: totalAmount,
      email: user.email,
      customerId: user.uid,

      
     
        orderData: {
          items: orderData.items.map(item => ({
            productId: item.productId,
            userId: item.userId,
            pharmacyName: item.pharmacyName,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imageUrls: item.imageUrls,
          })),
          // Add other serializable fields if needed
        }
      });
      
    
  };

  const renderItem = ({ item }: { item: Product }) => {
    const imageUri = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://via.placeholder.com/80';
    const quantity = item.quantity || 1;

    return (
      <SafeAreaView style={styles.cartItem}>
        <Image source={{ uri: imageUri }} style={styles.cartItemImage} resizeMode="cover" />
        <View style={styles.cartItemDetails}>
          <Text style={styles.cartItemTitle}>{item.title}</Text>
          <Text style={styles.cartItemQuantity}>Quantity: {quantity}</Text>
          <Text style={styles.cartItemPrice}>Price: N{(item.price * quantity).toFixed(2)}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity onPress={() => increaseQuantity(item.id)} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  const totalPrice = cart.reduce((sum, product) => sum + (product.price * (product.quantity || 1)), 0);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: hp('2.5%'), marginBottom: wp('5%') }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: RFValue(19), fontFamily: 'Poppins-Bold', textAlign: 'center', color: 'black', right: wp('35%') }}> My Cart</Text>
      </View>

      {cart.length > 0 ? (
        <FlatList<Product>
          data={cart}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cartList}
        />
      ) : (
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
      )}

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Price: N{totalPrice.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
    backgroundColor: '#D3D3D3',
  },
  cartList: {
    paddingBottom: hp('10%'),
  },
  cartItem: {
    flexDirection: 'row',
    marginVertical: hp('0.3%'),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: hp('2%'),
    alignItems: 'center',
  },
  cartItemImage: {
    width: wp('30%'),
    height: hp('20%'),
    borderRadius: 5,
  },
  cartItemDetails: {
    marginLeft: wp('6%'),
    flex: 1,
  },
  cartItemTitle: {
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Bold',
  },
  cartItemQuantity: {
    fontSize: RFValue(13),
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  cartItemPrice: {
    fontSize: RFValue(14),
    color: 'black',
    fontFamily: 'Poppins-Bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.4%'),
  },
  quantityButton: {
    
    borderRadius: 5,
    paddingHorizontal: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
     backgroundColor: 'white',
  },
  quantityButtonText: {
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Bold',
  },
  quantityText: {
    marginHorizontal: hp('1.3%'),
    fontSize: RFValue(17),
    color: 'black',
    fontFamily: 'Poppins-Bold',
  },
  removeButton: {
    marginTop: hp('1.5%'),
    backgroundColor: '#FF5733',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('1%'),
    borderRadius: 5,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: RFValue(14),
    fontFamily: 'Poppins-Bold',
  },
  totalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: wp('4%'),
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  totalText: {
    fontSize: RFValue(18),
    fontFamily: 'Poppins-Bold',
  },
  checkoutButton: {
    marginTop: hp('2%'),
    backgroundColor: '#007BFF',
    paddingVertical: hp('1.6%'),
    paddingHorizontal: hp('3%'),
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: RFValue(16),
    fontFamily: 'Poppins-Bold',
  },
  emptyCartText: {
    fontSize: RFValue(16),
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    color: 'black',
  },
});

export default CartScreen;
