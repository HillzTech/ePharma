import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { AllProductsContext } from '../contexts/AllProductsContext';
import LoadingOverlay from '../Components/LoadingOverlay';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const AllProductsScreen = ({ navigation }: any) => {
  const { products, isLoading } = useContext(AllProductsContext);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on the search query
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleProductPress = (product: any) => {
    navigation.navigate('AddToCartScreen', { product });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>All Products</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
      </View>

      {isLoading ? (
        <LoadingOverlay />
      ) : filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleProductPress(item)}>
              <View style={styles.productContainer}>
                <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
                <Text style={styles.productTitle}>{item.title}</Text>
                <Text style={styles.productPrice}>N{item.price.toFixed(2)}</Text>
                <View style={styles.discountContainer}>
                  <Text style={styles.discountText}>-{item.percentageDiscount}%</Text>
                  <Text style={styles.oldPrice}>N{item.costPrice}</Text>
                </View>
                <View style={{flexDirection: 'row',}}>
                <Ionicons name="location-outline" size={15} color="black" />
                <Text style={styles.productDistance}>{item.distance} miles away</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No products found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D3D3D3' },
  header: { marginTop:  hp('5%'), alignItems: 'center' },
  headerText: { fontSize: RFValue(18), color: 'black', fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  searchInput: { flex: 1, height: 40, paddingHorizontal: 10, fontSize: RFValue(14) },
  listContent: { paddingBottom: 20,  width: wp('90%'), left: wp('3%') },
  productContainer: { 
    flex: 1, margin: 10, backgroundColor: 'white', borderRadius: 10, padding: 10, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 
  },
  productImage: { width: wp('35%'), height: hp('14%'), borderRadius: 10 },
  productTitle: { fontSize: RFValue(14), fontWeight: 'bold', marginVertical: 5 },
  productPrice: { fontSize: RFValue(12), color: 'green' },
  discountContainer: { flexDirection: 'row', gap: 5 },
  discountText: { color: 'red', fontSize: RFValue(10) },
  oldPrice: { textDecorationLine: 'line-through', fontSize: RFValue(10) },
  productDistance: { fontSize: RFValue(10), color: 'gray' },
  noResults: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noResultsText: { fontSize: RFValue(16), color: 'gray' },
});

export default AllProductsScreen;
