import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { RFValue } from 'react-native-responsive-fontsize';
import { Product } from '../types';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

const CartScreen: React.FC = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const navigation = useNavigation<any>();
  const handleBack = () => {
    navigation.goBack();
};

  const renderItem = ({ item }: { item: Product }) => {
    const imageUri = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://via.placeholder.com/80';
    const quantity = item.quantity || 1;


    return (
    
      <View style={styles.cartItem}>
        <Image
          source={{ uri: imageUri }}
          style={styles.cartItemImage}
          resizeMode="cover"
        />
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
      </View>
    );
  };

  const totalPrice = cart.reduce((sum, product) => sum + (product.price * (product.quantity || 1)), 0);

  return (

    
    <View style={styles.container}>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between',  marginTop: hp('4%'), marginBottom: hp('2%')}}>
        <TouchableOpacity onPress={handleBack} >
                            <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
                        </TouchableOpacity>
       <Text style={{fontSize: RFValue(17), fontFamily: 'Poppins-Bold',textAlign: 'center', color: 'black', right: wp('35%')}}>  CART ITEMS</Text>
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
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('4%'),
    backgroundColor: '#D3D3D3'
  },
  cartList: {
    paddingBottom: hp('19%'), // Space for the total price and checkout button
  },
  cartItem: {
    flexDirection: 'row',
    marginVertical:  hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom:  hp('1%'),
    alignItems: 'center',
  },
  cartItemImage: {
    width:  wp('22%'),
    height:  hp('10%'),
    borderRadius: 5,
  },
  cartItemDetails: {
    marginLeft:  wp('2%'),
    flex: 1,
  },
  cartItemTitle: {
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Bold',
  },
  cartItemQuantity: {
    fontSize: RFValue(14),
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
    marginTop: hp('1%'),
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: hp('1%'),
    width: wp('9%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Bold',
  },
  quantityText: {
    marginHorizontal: hp('2%'),
    fontSize: RFValue(17),
    color: 'black',
    fontFamily: 'Poppins-Bold',
  },
  removeButton: {
    marginTop: hp('1%'),
    backgroundColor: '#FF5733',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('3%'),
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
    padding: hp('2%'),
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  totalText: {
    fontSize: RFValue(18),
    fontFamily: 'Poppins-Bold',
  },
  checkoutButton: {
    marginTop: hp('1%'),
    backgroundColor: '#007BFF',
    paddingVertical: hp('2%'),
    paddingHorizontal: hp('7%'),
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: RFValue(16),
    fontFamily: 'Poppins-Bold',
  },
  emptyCartText: {
    fontSize: RFValue(18),
    color: 'gray',
    textAlign: 'center',
    marginTop: hp('20%'),
    fontFamily: 'Poppins-Regular',
  },
});

export default CartScreen;
