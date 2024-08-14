// AddToCartScreen.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext'; 
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrls: string[];
  prescription: string;
}

const { width } = Dimensions.get('window');

const AddToCartScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { addToCart, getCartItemCount } = useCart();
  const { product } = route.params as { product: Product };
  const { imageUrls = [], title = 'Unknown', price = 0 } = product || {};

  const [quantity, setQuantity] = useState<number>(1);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    const quantityToAdd = quantity || 1; // Default to 1 if quantity is undefined
    addToCart({ ...product, quantity: quantityToAdd });
    navigation.navigate('CartScreen');
  };
  

  const handleNotification = () => {
    navigation.navigate('HomeScreen');
  };

  const handleCart = () => {
    navigation.navigate('CartScreen');
  };

  if (!product) {
    return <Text>No product data available</Text>; // or any placeholder/loading component
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: wp('3%'), marginTop: wp('3%') }}>
        <TouchableOpacity onPress={handleNotification}>
          <Ionicons name="notifications-outline" size={RFValue(24)} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCart}>
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={RFValue(24)} color="black" />
            {getCartItemCount() > 0 && (
              <View style={styles.cartItemCount}>
                <Text style={styles.cartItemCountText}>{getCartItemCount()}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.productContainer}>
      <ScrollView horizontal style={{ marginHorizontal: wp('7%') }}>
          {product.imageUrls.map((url) => (
            <Image key={url} source={{ uri: url }} style={styles.productImage} />
          ))}
        </ScrollView>

        <Text style={styles.productTitle}>{product.title}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={handleDecrease} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={handleIncrease} style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: 'black', fontFamily: 'OpenSans-Bold', fontSize: RFValue(13), top: hp('0.4%'), marginTop: hp('2%') }}>Information</Text>
        <Text style={styles.prescriptionText}>
          {product.prescription ? product.prescription : 'No Prescription Required'}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', gap: wp('19%'), borderColor: 'grey', borderWidth: 1, width: wp('100%'), paddingVertical: wp('1%'), marginTop: hp('5%'), right: hp('3.8%') }}>
          <Text style={styles.productPrice}>N{product.price.toFixed(2)}</Text>
          <TouchableOpacity onPress={handleAddToCart} style={{ backgroundColor: 'blue', padding: wp('3.5%'), borderRadius: 7 }}>
            <Text style={{ color: 'white', fontFamily: 'OpenSans-Bold', fontSize: RFValue(14) }}>ADD TO CART</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('8%'),
    backgroundColor: '#D3D3D3',
  },
  productContainer: {
    marginTop: wp('6%'),
  },
  productImage: {
    width: wp('70%'),
    height: hp('29%'),
    borderColor: 'white',
    marginRight: wp('3%'),
  },
  productTitle: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    marginVertical: hp('2%'),
  },
  productPrice: {
    fontSize: RFValue(14),
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  prescriptionText: {
    fontSize: RFValue(14),
    color: 'black',
    marginVertical: hp('1%'),
    fontFamily: 'Poppins-Regular'
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('1%'),
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: hp('1%'),
    width: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Bold'
  },
  quantityText: {
    marginHorizontal: wp('4%'),
    fontSize: RFValue(17),
    color: 'black',
    fontFamily: 'Poppins-Bold'
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartItemCount: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemCountText: {
    color: 'white',
    fontSize: RFValue(12),
    fontWeight: 'bold',
  },
});

export default AddToCartScreen;
