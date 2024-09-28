import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, Dimensions, BackHandler, Platform, StatusBar, SafeAreaView } from 'react-native';
import { AllProductsContext } from '../contexts/AllProductsContext';
import LoadingOverlay from '../Components/LoadingOverlay';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const AllProductsScreen = ({ navigation }: any) => {
  const { products, isLoading } = useContext(AllProductsContext);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState('');
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;


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

  const handleback = async() => {
    navigation.navigate('CustomerScreen')
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
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity  onPress={handleback}>
    <Ionicons name="chevron-back" size={23} color="black" />
    </TouchableOpacity>
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
          numColumns={windowWidth > 1000 ? 6: 2}
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
                
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No products found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D3D3D3' },
  header: { marginTop:  Platform.OS === 'web' ? 3: 9, alignItems: 'center', justifyContent: 'space-around', flexDirection: 'row', right: wp('12%')  },
  headerText: { fontSize: RFValue(18), color: 'black', fontWeight: 'bold', right: wp('18%') },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  searchInput: { flex: 1, height: 40, paddingHorizontal: 10, fontSize: 15, },
  listContent: { paddingBottom: 20,  width: wp('90%'), left: wp('3%') },
  productContainer: { 
    flex: 1, margin: 8, backgroundColor: 'white', borderRadius: 10, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 
  },
  productImage: { width: 150, height: 95, borderTopLeftRadius: 10 , borderTopRightRadius: 10 },
  productTitle: { fontSize: 15, fontWeight: 'bold', marginVertical: 5, paddingHorizontal: 10 },
  productPrice: { fontSize: 13, color: 'green',paddingHorizontal: 10  },
  discountContainer: { flexDirection: 'row', gap: 5 , paddingHorizontal: 10, paddingBottom: 10},
  discountText: { color: 'red', fontSize: 11 },
  oldPrice: { textDecorationLine: 'line-through', fontSize: 11 },
  productDistance: { fontSize: RFValue(10), color: 'gray' },
  noResults: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noResultsText: { fontSize: 17, color: 'gray' },
});

export default AllProductsScreen;
