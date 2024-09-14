import React, { useContext } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AllProductsContext } from '../contexts/AllProductsContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

const OtcDrugs: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { products, isLoading } = useContext(AllProductsContext);

  // Filter products based on 'OTC' and 'Near Expiry' tags
  const otcProducts = products.filter(product => product.tags.includes('OTC'));
  const nearExpiryProducts = products.filter(product => product.tags.includes('Near Expiry'));

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleProductPress = (product: any) => {
    navigation.navigate('AddToCartScreen', { product });
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleProductPress(item)}>
    <View style={styles.productContainer}>
      <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>N{item.price.toFixed(2)}</Text>
        <View style={styles.discountContainer}>
                  <Text style={styles.discountText}>-{item.percentageDiscount}%</Text>
                  <Text style={styles.oldPrice}>N{item.costPrice}</Text>
                </View>
        <Text style={styles.productDistance}>{item.distance} miles away</Text>
      </View>
    </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* OTC Section */}
      <Text style={styles.sectionTitle}>OTC Products</Text>
      {otcProducts.length > 0 ? (
        <FlatList
          data={otcProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}  // Adjust the number of columns as needed
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>No OTC products available.</Text>
        </View>
      )}

      {/* Near Expiry Section */}
      <Text style={styles.sectionTitle}>Near Expiry Products</Text>
      {nearExpiryProducts.length > 0 ? (
        <FlatList
          data={nearExpiryProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}  // Adjust the number of columns as needed
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.noProductsContainer}>
          <Text style={styles.noProductsText}>No Near Expiry products available.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('4%'),
     backgroundColor: '#D3D3D3'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontFamily: 'Poppins-Bold',
    marginVertical: hp('2%'),
    marginTop: hp('4%'),
    textAlign: 'center',
  },
  productContainer: {
    flex: 1,
    margin: wp('2%'),
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: wp('4%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: wp('34%'),
    height: hp('10%'),
    borderRadius: 8,
    resizeMode: 'contain',
  },
  productDetails: {
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  productTitle: {
    fontSize: RFValue(16),
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: RFValue(13),
    color: '#888',
    
  },
  productDistance: {
    fontSize: RFValue(12),
    color: '#888',
  },
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: RFValue(16),
    color: '#888',
  },
  list: {
    justifyContent: 'center',
  },
  discountContainer: { flexDirection: 'row', gap: 9 },
  discountText: { color: 'red', fontSize: RFValue(10), borderColor: 'black',borderWidth: 1,paddingHorizontal:3,borderRadius: 8},
  oldPrice: { textDecorationLine: 'line-through', fontSize: RFValue(10) },
});

export default OtcDrugs;
