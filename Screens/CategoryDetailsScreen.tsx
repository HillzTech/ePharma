import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { db } from "../Components/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import LoadingOverlay from "../Components/LoadingOverlay";

interface Product {
    id: string;
    title: string;
    price: number;
    imageUrls: string[];
}

const CategoryDetailsScreen: React.FC = () => {
    const route = useRoute<any>();
    const { category } = route.params;
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Navigate to the correct subcollection within the category document
                const productsRef = collection(db, `categories/${category}/products`);
                const querySnapshot = await getDocs(productsRef);
                const productsList: Product[] = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title || '',
                        price: data.price || 0,
                        imageUrls: data.imageUrls || [],
                    };
                });
                setProducts(productsList);
                console.log('Fetched Products:', productsList);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    return (
        <SafeAreaView style={styles.container}>
           {isLoading && <LoadingOverlay />}
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.productContainer}>
                            <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
                            <Text style={styles.productTitle}>{item.title}</Text>
                            <Text style={styles.productPrice}>#{item.price.toFixed(2)}</Text>
                        </View>
                    )}
                />
            
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D3D3',
        padding: 16,
    },
    productContainer: {
        padding: 16,
        backgroundColor: '#fff',
        marginVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    productImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    productTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    productPrice: {
        fontSize: 16,
        color: '#888',
    },
});

export default CategoryDetailsScreen;
