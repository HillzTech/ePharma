import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, SafeAreaView, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../Components/firebaseConfig';
import LoadingOverlay from '../Components/LoadingOverlay';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrls: string[];
  tags: string[];
  userId: string; // Add this line
  pharmacyName: string; 
  percentageDiscount: string;
  costPrice: string;
  
}

interface PharmacyDetails {
  pharmacyImage: string;
  pharmacyName: string;
  userId: string; 
  location: {
    address: string;
    latitude: number;  
    longitude: number;
  };
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 70) / 2; // Adjust width based on padding

const PharmacyDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { pharmacyId } = route.params as { pharmacyId: string };
  const [pharmacyDetails, setPharmacyDetails] = useState<PharmacyDetails | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['All']);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isLoading, setLoading] = useState(false);
  const iconSize = width < 395 ? 30 : 34;
  const smallSize = width < 395 ? 28 : 32;
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      setLoading(true);
      try {
        const pharmacyDoc = await firebase.firestore().collection('pharmacy').doc(pharmacyId).get();
        if (pharmacyDoc.exists) {
          const data = pharmacyDoc.data() as PharmacyDetails;
          const address = await fetchAddress(data.location.latitude, data.location.longitude);
          setPharmacyDetails({ ...data, location: { address, latitude: data.location.latitude, longitude: data.location.longitude } });
          setLoading(false);
  
          // Fetch products directly from the pharmacy document
          const productsSnapshot = await pharmacyDoc.ref.collection('products').get();
          const allProducts: Product[] = [];
          const allTags = new Set<string>();
          setLoadingProducts(true);
  
          productsSnapshot.forEach(doc => {
            const productData = doc.data() as Omit<Product, 'id'>;
            allProducts.push({ 
              id: doc.id, 
              ...productData, 
              userId: data.userId, // Include userId in the product
              pharmacyName: data.pharmacyName // Include pharmacyName in the product
            });
            productData.tags.forEach(tag => allTags.add(tag));
          });
  
          setProducts(allProducts);
          setTags(['All', ...Array.from(allTags)]);
          setFilteredProducts(allProducts);
        }
      } catch (error) {
        console.error('Error fetching pharmacy details:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
  
    fetchPharmacyDetails();
  }, [pharmacyId]);
  
    

  useEffect(() => {
    filterProductsByTag(selectedTag);
  }, [selectedTag]);

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error('Error fetching address:', error);
      return '';
    }
  };

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('AddToCartScreen', { product});
  };

  const handleBack = async () => {
    navigation.goBack();
  };

  const filterProductsByTag = (tag: string) => {
    if (tag === 'All') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.tags.includes(tag));
      setFilteredProducts(filtered);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productContainer} onPress={() => handleProductPress(item)}>
      <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.title}</Text>
        <Text style={styles.productPrice}>N{item.price.toFixed(2)}</Text>


        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', right:wp('8%'), gap:wp('1%') }}>
        <Text style={{ fontFamily:'OpenSans-Bold', fontSize:RFValue(9), borderWidth:1, borderColor:'red', borderRadius:10, paddingHorizontal: wp('1.3%')}}>-{item.percentageDiscount}%</Text>
        <Text style={{ fontFamily:'OpenSans-Regular', fontSize:RFValue(10), textDecorationLine:'line-through'}}>N{item.costPrice}</Text>

       

        </View>
        
      </View>
    </TouchableOpacity>
  );

  const renderTagItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.tag,
        selectedTag === item ? styles.selectedTag : null,
      ]}
      onPress={() => setSelectedTag(item)}
    >
      <Text style={styles.tagText}>{item}</Text>
    </TouchableOpacity>
  );

  if (isLoading || !pharmacyDetails) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pharmacyContainer}>
        <View style={{flexDirection: 'row', justifyContent: "space-around", alignItems: 'center', gap: wp('10%'),  marginBottom: hp('2.5%'),  right: wp('10%')}}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.pharmacyName}>{pharmacyDetails.pharmacyName}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: "space-around", alignItems: 'center', marginBottom: hp('2.5%'), marginTop: hp('-2%') }}>
          <Ionicons name="location-outline" size={RFValue(16)} color="black" />
          <Text style={{ fontFamily: 'Poppins-Regular', fontSize: RFValue(12) }}>
            {pharmacyDetails.location.address}
          </Text>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medications"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <FlatList
          data={tags}
          renderItem={renderTagItem}
          keyExtractor={(item) => item}
          key={2}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsList}
        />
      </View>
      {loadingProducts ? (
        <View style={{marginTop: hp('20%'),}}>
          <LoadingOverlay />
          
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          key={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productsList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('7%'),
    backgroundColor:'#D3D3D3'
  },
  pharmacyContainer: {
    alignItems: 'center',
    marginBottom: hp('2%'),
    marginTop: hp('1.6%'),
  },
  pharmacyName: {
    fontSize: RFValue(20),
    fontFamily: 'OpenSans-Bold',
  },
  productContainer: {
    width: ITEM_WIDTH,
    marginBottom: wp('3%'),
    paddingVertical: wp('1.6%'),
    borderRadius: 10,
    backgroundColor: 'white',
  },
  productImage: {
    width: wp('40.3%'),
    height: hp('14%'),
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    bottom: hp('0.8%'),
  },
    
  
  productInfo: {
    alignItems: 'center',
    marginTop: wp('1%'),
  },
  productName: {
    fontSize: RFValue(12),
    fontFamily: 'Poppins-Regular',
    top: hp('0.8%'),
  },
  productPrice: {
    fontSize: RFValue(14),
    color: 'black',
    fontFamily: 'OpenSans-Bold',
  },
  row: {
    justifyContent: 'space-between',
  },
  productsList: {
    paddingBottom: hp('4%'),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  searchInput: {
    flex: 1,
    marginLeft: wp('2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchIcon: {
    marginLeft: wp('2%'),
  },
  tagsList: {
    marginVertical: hp('1%'),
  },
  tag: {
    paddingHorizontal: wp('4.4%'),
    paddingVertical: hp('1%'),
    backgroundColor: '#eee',
    borderRadius: 10,
    marginHorizontal: wp('1%'),
  },
  selectedTag: {
    backgroundColor: '#007bff',
  },
  tagText: {
    fontSize: RFValue(14),
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
});

export default PharmacyDetailsScreen;
