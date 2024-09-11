import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, Dimensions, TextInput, StyleSheet,
  FlatList, Image, SafeAreaView
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import LoadingOverlay from "../Components/LoadingOverlay";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/authContext";
import { db } from "../Components/firebaseConfig";
import { collection, getDocs, query, doc, deleteDoc } from "firebase/firestore";
import RetailFooter from "../Components/RetailFooter";
import { deleteObject, getStorage, ref } from "firebase/storage";
import firebase from "firebase/compat";
import { usePharmacy } from "../contexts/PharmacyContext";

interface Product {
  id: string;
  title: string;
  price: number;
  imageUrls: string[];
  tags: string[];
}

const InventoryScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
  const { width } = Dimensions.get('window');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setLoading] = useState(false);
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [tags, setTags] = useState<string[]>(['All']);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const { pharmacyName, fetchPharmacyName } = usePharmacy();

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      fetchPharmacyName(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const productsRef = collection(db, `users/${user.uid}/products`);
        const q = query(productsRef);
        const querySnapshot = await getDocs(q);
        const productsList: Product[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            price: data.price || 0,
            imageUrls: data.imageUrls || [],
            tags: data.tags || [],
          };
        });

        const uniqueTags = Array.from(new Set(productsList.flatMap(product => product.tags)));
        setTags(['All', ...uniqueTags]);

        // Set both products and filteredProducts
        setProducts(productsList);
        setFilteredProducts(productsList);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  // Function to filter products based on both tag and search query
  useEffect(() => {
    const filterProducts = () => {
      let filtered = products;

      // Filter by tag
      if (selectedTag !== 'All') {
        filtered = filtered.filter(product => product.tags.includes(selectedTag));
      }

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(product =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredProducts(filtered);
    };

    filterProducts();
  }, [selectedTag, searchQuery, products]);

  const handleEdit = (productId: string) => {
    setShowOptions(null); // Hide options menu
    navigation.navigate('EditProductScreen', { productId });
  };

  const handleDelete = async (productId: string) => {
    // Deletion code
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>N{item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.optionsButton}
        onPress={() => setShowOptions(item.id)}
      >
        <Ionicons name="ellipsis-vertical" size={RFValue(20)} color="black" />
      </TouchableOpacity>
      {showOptions === item.id && (
        <View style={styles.optionsMenu}>
          <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.optionButton}>
            <Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.optionButton}>
            <Text>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#D3D3D3' }}>
      {isLoading && <LoadingOverlay />}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', padding: wp('1%'), left: wp('3%'), marginTop: hp('4.5%') }}>
        <TouchableOpacity onPress={() => navigation.navigate('RetailerScreen')}>
          <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
        </TouchableOpacity>
        {user && (
          <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(18), left: wp('5%') }}>{pharmacyName || user?.username}</Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search meds here"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View>
        <View style={styles.tagsContainer}>
          {tags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagButton, selectedTag === tag && styles.selectedTag]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        key={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={{ bottom: hp('66%') }}>
        <RetailFooter route={route} navigation={navigation} />
      </View>
      <View style={{ top: hp('3%'), backgroundColor: 'black', height: hp('10%') }}>
        <></>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    searchContainer: {
        width: wp('90%'),
        marginLeft: wp('5%'),
        marginTop: hp('1%'),
    },
    searchInput: {
        height: hp('6%'),
        borderColor: 'grey',
        borderWidth: 1,
        paddingHorizontal: wp('2%'),
        borderRadius: 10,
        textAlign: 'center',
        backgroundColor: 'white',
    },
    tagsContainer: {
        marginVertical: hp('2%'),
        paddingHorizontal: wp('1%'),
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tagButton: {
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('4%'),
        marginHorizontal: wp('2%'),
        borderRadius: 10,
        backgroundColor: '#ddd',
        height: hp('6%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedTag: {
        backgroundColor: '#007BFF',
    },
    tagText: {
        fontSize: RFValue(14),
        color: '#000',
        fontFamily: 'Poppins-Bold',
    },
    productsContainer: {
        paddingHorizontal: wp('5%'),
        paddingBottom: hp('10%'), // Allow space for footer
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    productContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: hp('2%'),
        width: wp('42%'),
        paddingHorizontal: wp('2%'),
        paddingVertical: wp('0.5%'),
        position: 'relative',
    },
    productImage: {
        width: wp('42%'),
        height: hp('15%'),
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        resizeMode: 'cover',
        right: wp('2%'),
        bottom: wp('0.5%')
    },
    productDetails: {
        marginTop: hp('1%'),
    },
    productTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: RFValue(16),
    },
    productPrice: {
        fontFamily: 'Poppins-Regular',
        fontSize: RFValue(14),
        color: '#007BFF',
    },
    optionsButton: {
        position: 'absolute',
        top: hp('1%'),
        right: wp('2%'),
    },
    optionsMenu: {
        position: 'absolute',
        top: hp('4%'),
        right: wp('2%'),
        backgroundColor: 'white',
        padding: wp('2%'),
       
        borderRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    optionButton: {
        paddingVertical: hp('0.5%'),
        paddingHorizontal: wp('2%'),
    },

});

export default InventoryScreen;
