import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, TextInput, StyleSheet, ScrollView, Image } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import LoadingOverlay from "../Components/LoadingOverlay";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/authContext";
import { db } from "../Components/firebaseConfig";
import { collection, getDocs, query } from "firebase/firestore";

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

    useEffect(() => {
        const fetchProducts = async () => {
            if (!user) {
                return;
            }

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

    const filterProductsByTag = (tag: string) => {
        if (tag === 'All') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(product => product.tags.includes(tag)));
        }
    };

   

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#D3D3D3' }}>
            {isLoading && <LoadingOverlay />}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: wp('1%') }}>
                <TouchableOpacity onPress={() => navigation.navigate('RetailerScreen')}>
                    <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
                </TouchableOpacity>
                {user && (
                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(18), right: wp('45%') }}>{user.username}</Text>
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

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
                {tags.map(tag => (
                    <TouchableOpacity
                        key={tag}
                        style={[styles.tagButton, selectedTag === tag && styles.selectedTag]}
                        onPress={() => {
                            setSelectedTag(tag);
                            filterProductsByTag(tag);
                        }}
                    >
                        <Text style={styles.tagText}>{tag}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View  style={styles.productsContainer}>
                {filteredProducts.map(product => (
                    <View key={product.id} style={styles.productContainer}>
                        <Image source={{ uri: product.imageUrls[0] }} style={styles.productImage} />
                        <Text style={styles.productTitle}>{product.title}</Text>
                        <Text style={styles.productPrice}>#{product.price.toFixed(2)}</Text>
                    </View>
                ))}
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
        paddingHorizontal: wp('5%'),
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
        fontSize: RFValue(16),
        color: '#000',
        fontFamily: 'Poppins-Bold',
    },
    productsContainer: {
        flexDirection: 'row',
        flexWrap:'wrap',
        gap:hp('1%'),
        paddingHorizontal: wp('2%'),
        marginBottom: hp('22%'),
        left:wp('2.2%'),
    },
    productContainer: {
        marginHorizontal: wp('2%'),
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        width: wp('42%'),
        height: hp('27%'),
    },
    productImage: {
        width: '100%',
        height: hp('18%'),
        resizeMode: 'cover',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    productTitle: {
        fontSize: RFValue(15),
        fontWeight: 'bold',
        marginVertical: hp('0.7%'),
        paddingHorizontal: wp('2%'),
    },
    productPrice: {
        fontSize: RFValue(15),
        color: '#888',
        paddingHorizontal: wp('2%'),
    },
});

export default InventoryScreen;
