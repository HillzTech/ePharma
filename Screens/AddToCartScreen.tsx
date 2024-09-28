// AddToCartScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, Platform, BackHandler, StatusBar } from 'react-native';
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
  userId: string; // Added this line
  pharmacyName: string; // Added this line
}

const { width } = Dimensions.get('window');

const AddToCartScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { addToCart, getCartItemCount } = useCart();
  const { product } = route.params as { product: Product };
  const { imageUrls = [], title = 'Unknown', price = 0 } = product || {};
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const [quantity, setQuantity] = useState<number>(1);

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    const quantityToAdd = quantity || 1; // Default to 1 if quantity is undefined
    addToCart({ ...product, quantity: quantityToAdd });
    (navigation as any).navigate('CartScreen');
  };
  

  const handleNotification = () => {
    navigation.navigate('HomeScreen');
  };

  const handleCart = () => {
    navigation.navigate('CartScreen');
  };
  const handleBack = () => {
    navigation.goBack();
  };


  if (!product) {
    return <Text>No product data available</Text>; // or any placeholder/loading component
  }

    useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [navigation]);


  return (
    <SafeAreaView style={styles.container}>
     <StatusBar backgroundColor="black" barStyle="light-content"/> 
<View style={{ padding: 30, marginTop: windowWidth > 1000 ? -30 : hp('-4%')}}>
<TouchableOpacity onPress={handleBack} style={{  bottom:  Platform.OS === 'web' ? hp('3%') :  hp('-1%'), right:20}}>
            <Ionicons name="chevron-back" size={30} color="black" />
          </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: wp('3%'), bottom:  Platform.OS === 'web' ? wp('12%') : wp('6%') }}>
        <TouchableOpacity onPress={handleNotification}>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCart}>
          <View style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={24} color="black" />
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
          <TouchableOpacity onPress={handleAddToCart} style={{ backgroundColor: 'blue', padding: 11, borderRadius: 7 }}>
            <Text style={{ color: 'white', fontFamily: 'OpenSans-Bold', fontSize: 15 }}>ADD TO CART</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor: '#D3D3D3',
  },
  productContainer: {
    marginTop: wp('6%'),
  },
  productImage: {
    width: 260,
    height: 210,
    borderColor: 'white',
    marginRight: wp('3%'),
  },
  productTitle: {
    fontSize: 17,
     fontFamily: 'Poppins-Bold',
    marginVertical: hp('2%'),
  },
  productPrice: {
    fontSize: 15,
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  prescriptionText: {
    fontSize: 15,
    color: 'black',
    marginVertical: hp('1%'),
    fontFamily: 'Poppins-Regular'
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 9,
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 6,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold'
  },
  quantityText: {
    marginHorizontal: 9,
    fontSize: 18,
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
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default AddToCartScreen;
