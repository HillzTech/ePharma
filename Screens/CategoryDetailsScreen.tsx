import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { db } from "../Components/firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import LoadingOverlay from "../Components/LoadingOverlay";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import GetLocation from 'react-native-get-location';
import haversine from 'haversine-distance';

interface Product {
    id: string;
    title: string;
    price: number;
    costPrice: number;
    percentageDiscount: number;
    imageUrls: string[];
    tags: string[];
    location: { latitude: number; longitude: number };
    distance: number;
}

const CategoryDetailsScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { category } = route.params;
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [tags, setTags] = useState<string[]>(['All']);
    const [selectedTag, setSelectedTag] = useState<string>('All');
    const [isLoading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState<string>('');
    const [userLocation, setUserLocation] = useState({ latitude: 0, longitude: 0 });

    useEffect(() => {
        const fetchUserLocation = async () => {
            try {
                const location = await GetLocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 15000,
                });
                setUserLocation({ latitude: location.latitude, longitude: location.longitude });
                return location; // Return location to ensure it's fetched before products
            } catch (error) {
                console.error('Error fetching user location:', error);
                setLoading(false);
            }
        };

        const fetchCategoryDetails = async (location: any) => {
            try {
                // Fetch the category name
                const categoryRef = doc(db, 'categories', category);
                const categoryDoc = await getDoc(categoryRef);
                if (categoryDoc.exists()) {
                    setCategoryName(categoryDoc.data().name);
                }
        
                // Fetch products under the category
                const productsRef = collection(db, `categories/${category}/products`);
                const querySnapshot = await getDocs(productsRef);
                const productsList: Product[] = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title || '',
                        price: data.price || 0,
                        costPrice: data.costPrice || 0,
                        percentageDiscount: data.percentageDiscount || 0,
                        imageUrls: data.imageUrls || [],
                        tags: data.tags || [],
                        location: data.location || { latitude: 0, longitude: 0 },
                        distance: 0,
                    };
                });
        
                // Calculate distances in miles and sort products by distance
                const productsWithDistance = productsList.map(product => {
                    const distanceInMiles = haversine(
                        { latitude: location.latitude, longitude: location.longitude },
                        product.location
                    ) / 1609.34; // Convert meters to miles
                    return { ...product, distance: Math.round(distanceInMiles) }; // Round to nearest whole number
                }).sort((a, b) => a.distance - b.distance); // Sort by closest distance

                // Fetch unique tags
                const uniqueTags = Array.from(new Set(productsList.flatMap(product => product.tags)));
                setTags(['All', ...uniqueTags]);

                setProducts(productsWithDistance);
                setFilteredProducts(productsWithDistance);
            } catch (error) {
                console.error('Error fetching category details:', error);
            } finally {
                setLoading(false);
            }
        };

        const initializeScreen = async () => {
            const location = await fetchUserLocation(); // Ensure location is fetched first
            if (location) {
                fetchCategoryDetails(location);
            }
        };

        initializeScreen();
    }, [category]);

    const filterProductsByTag = (tag: string) => {
        if (tag === 'All') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(product => product.tags.includes(tag)));
        }
        setSelectedTag(tag);
    };

    const handleBack = () => {
        navigation.navigate('CategoryScreen');
    };

    return (
        <SafeAreaView style={styles.container}>
            {isLoading && <LoadingOverlay />}
            {!isLoading && (
                <>
                   
                        
                    
                    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(18), textAlign:'center', bottom: hp('2.3%') }}> {categoryName} </Text>
                    <View  style={{bottom: hp('6.7%')}}>
                    <TouchableOpacity onPress={handleBack} >
                            <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
                        </TouchableOpacity>
                    </View>
                        

                    <View style={styles.tagsContainer}>
                        {tags.map(tag => (
                            <TouchableOpacity
                                key={tag}
                                style={[styles.tagButton, selectedTag === tag && styles.selectedTag]}
                                onPress={() => filterProductsByTag(tag)}
                            >
                                <Text style={styles.tagText}>{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        key={2}
                        renderItem={({ item }) => (
                            <View style={styles.productContainer}>
                                <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
                                <Text style={styles.productTitle}>{item.title}</Text>
                                <Text style={styles.productPrice}>N{item.price.toFixed(2)}</Text>
                                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', right:wp('8%'), gap:wp('1%'), bottom:hp('1%') }}>
        <Text style={{ fontFamily:'OpenSans-Bold', fontSize:RFValue(9), borderWidth:1, borderColor:'red', borderRadius:10, paddingHorizontal: wp('1.3%')}}>-{item.percentageDiscount}%</Text>
        <Text style={{ fontFamily:'OpenSans-Regular', fontSize:RFValue(10), textDecorationLine:'line-through'}}>N{item.costPrice}</Text>

        </View>
        
                                <Ionicons name="location-outline" size={15} color="black" style={{ right: wp('13%'), bottom: hp('0.8%') }} />
                                <Text style={styles.productDistance}>{item.distance} miles away</Text>
                            </View>
                        )}
                    />
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D3D3',
        padding: hp('2%'),
        
    },
    tagsContainer: {
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: hp('1%'),
        paddingHorizontal: wp('3%'),
        marginTop:hp('-4.5%'),
        marginBottom:hp('2%')
    },
    tagButton: {
        paddingVertical: hp('0.5%'),
        paddingHorizontal: wp('4%'),
        marginHorizontal: wp('0.4%'),
        borderRadius: 10,
        backgroundColor: '#ddd',
        height: hp('5%'),
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedTag: {
        backgroundColor: '#007BFF',
    },
    tagText: {
        fontSize: RFValue(13),
        color: '#000',
        fontFamily: 'Poppins-Bold',
    },
    productContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: hp('1.7%'),
        backgroundColor: 'white',
        borderRadius: 8,
    },
    productImage: {
        width: wp('40%'),
        height: hp('13%'),
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        marginBottom: hp('1%'),
    },
    productTitle: {
        color: 'black',
        fontSize: RFValue(15),
        textAlign: 'center',
        fontFamily: 'OpenSans-Bold',
    },
    productPrice: {
        fontSize: RFValue(13),
        color: 'black',
        fontFamily: 'Poppins-Bold',
    },
    productDistance: {
        fontSize: RFValue(12),
        color: '#666',
        fontFamily: 'Poppins-Regular',
        bottom: hp('3%'),
        left: wp('2%'),
        marginBottom: hp('-2.0%'),
    },
});

export default CategoryDetailsScreen;
