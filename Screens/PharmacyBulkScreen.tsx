import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, SafeAreaView, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import LoadingOverlay from '../Components/LoadingOverlay';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../contexts/PharmacyContext';
import { useAuth } from '../contexts/authContext';

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrls: string[];
  tags: string[];
  userId: string;
  pharmacyName: string;
  percentageDiscount: string;
  costPrice: string;
  bulkQuantity: string;
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
const ITEM_WIDTH = (width - 70) / 2; 

const PharmacyBulkScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [pharmacyDetails, setPharmacyDetails] = useState<PharmacyDetails | null>(null);
  const [bulkProducts, setBulkProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setLoading] = useState(false);
  const iconSize = width < 395 ? 30 : 34;
  const { pharmacyName, fetchPharmacyName } = usePharmacy();

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      fetchPharmacyName(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      setLoading(true);
      try {
        const pharmacySnapshot = await firebase.firestore().collection('pharmacy').get();
        const allBulkProducts: Product[] = [];

        for (const pharmacyDoc of pharmacySnapshot.docs) {
          if (pharmacyDoc.exists) {
            const data = pharmacyDoc.data() as PharmacyDetails;
            const address = await fetchAddress(data.location.latitude, data.location.longitude);

            // Update pharmacy details
            setPharmacyDetails({
              ...data,
              location: {
                address,
                latitude: data.location.latitude,
                longitude: data.location.longitude,
              },
            });

            // Fetch products for each pharmacy
            const productsSnapshot = await pharmacyDoc.ref.collection('products').get();
            productsSnapshot.forEach((doc) => {
              const productData = doc.data() as Omit<Product, 'id'>;
              if (productData.tags.includes('Bulk') && productData.userId !== user?.uid) {
                allBulkProducts.push({
                  id: doc.id,
                  ...productData,
                  userId: data.userId,
                  pharmacyName: data.pharmacyName,
                });
              }
            });
          }
        }

        setBulkProducts(allBulkProducts);
      } catch (error) {
        console.error('Error fetching pharmacy details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPharmacyDetails();
  }, [user]);

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
    (navigation as any).navigate('AddToCartScreen', { product });
  };

  const handleBack = async () => {
    navigation.goBack();
  };

  // Filter products based on the search query
  const filteredProducts = bulkProducts.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.pharmacyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productContainer} onPress={() => handleProductPress(item)}>
      <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.title}</Text>
        <Text style={styles.productPrice}>N{item.price.toFixed(2)}</Text>

        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', right:wp('3%'), gap:wp('1%') }}>
          <Text style={{ fontFamily:'OpenSans-Bold', fontSize:RFValue(9), borderWidth:1, borderColor:'red', borderRadius:10, paddingHorizontal: wp('1.3%')}}>-{item.percentageDiscount}%</Text>
          <Text style={{ fontFamily:'OpenSans-Regular', fontSize:RFValue(10), textDecorationLine:'line-through'}}>N{item.costPrice}</Text>
          <Text style={{ fontFamily:'OpenSans-Bold', fontSize:RFValue(10), left:wp('3%')}}>{item.bulkQuantity}pcs</Text>
        </View>
        <Text style={styles.productName}>{item.pharmacyName}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading || !pharmacyDetails) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pharmacyContainer}>
        <View style={{flexDirection: 'row', justifyContent: "space-around", alignItems: 'center', gap: wp('10%'),  marginBottom: hp('2.5%'),  right: wp('5%')}}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.pharmacyName}>{pharmacyName || user?.username}</Text>
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
      </View>
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        key={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
      />
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
    marginTop: wp('2%'),
    marginBottom: wp('3%'),
  },
  productName: {
    fontSize: RFValue(13),
    fontFamily: 'OpenSans-Bold',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: RFValue(12),
    fontFamily: 'OpenSans-SemiBold',
    marginVertical: hp('0.6%'),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: wp('2.5%'),
    marginBottom: hp('2%'),
    height: hp('5%'),
  },
  searchIcon: {
    marginRight: wp('2%'),
  },
  searchInput: {
    flex: 1,
    fontFamily: 'OpenSans-Regular',
    fontSize: RFValue(12),
  },
  tagsList: {
    marginBottom: wp('5%'),
  },
  tag: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    marginHorizontal: wp('1%'),
  },
  row: {
    justifyContent: 'space-between',
  },
  productsList: {
    paddingBottom: wp('7%'),
  },
});

export default PharmacyBulkScreen;
