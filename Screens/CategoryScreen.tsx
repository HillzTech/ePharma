import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { db, storage } from "../Components/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import LoadingOverlay from "../Components/LoadingOverlay";

interface Category {
    id: string;
    name: string;
    imageUrl: string;
}

const CategoryScreen: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const categoriesRef = collection(db, "categories");
                const querySnapshot = await getDocs(categoriesRef);
                const categoriesList = await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const imageUrl = await getDownloadURL(ref(storage, data.imageUrl));
                    return {
                        id: doc.id,
                        name: data.name || doc.id, // Fallback to doc ID if name isn't available
                        imageUrl: imageUrl || '', // Ensure imageUrl is converted
                    };
                }));
                setCategories(categoriesList);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryPress = (category: string) => {
        navigation.navigate('CategoryDetails', { category });
    };

    return (
        <SafeAreaView style={styles.container}>
            {isLoading && <LoadingOverlay />}
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                numColumns={2} // Display two items in a row
                key={2} // This key ensures FlatList re-renders properly when numColumns is fixed
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => handleCategoryPress(item.id)}
                    >
                        <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
                        <Text style={styles.categoryText}>{item.name}</Text>
                    </TouchableOpacity>
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
    categoryButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
    },
    categoryImage: {
        width: 100,
        height: 100,
        borderRadius: 15,
        marginBottom: 8,
    },
    categoryText: {
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default CategoryScreen;
