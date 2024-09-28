import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Image, Button, Alert, TouchableOpacity, SafeAreaView, ScrollView, BackHandler, Platform, StatusBar } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { db } from "../Components/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/authContext";
import LoadingOverlay from "../Components/LoadingOverlay";
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from "@expo/vector-icons";
import DraggableFlatList from 'react-native-draggable-flatlist';
import { deleteObject, getStorage, ref } from "firebase/storage";

const EditProductScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { productId } = route.params;
    const [product, setProduct] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [percentageDiscount, setPercentageDiscount] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [prescription, setPrescription] = useState('');
    const { user } = useAuth();
    const [isLoading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!user) {
                Alert.alert("Error", "User is not authenticated. Please log in.");
                navigation.navigate('LoginScreen');
                return;
            }

            try {
                const docRef = doc(db, `users/${user.uid}/products`, productId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProduct(data);
                    setTitle(data.title);
                    setPrice(data.price.toString());
                    setCostPrice(data.costPrice.toString());
                    setPercentageDiscount(data.percentageDiscount.toString());
                    setImages(data.imageUrls || []);
                    setPrescription(data.prescription || '');
                } else {
                    Alert.alert("Error", "Product not found.");
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                Alert.alert("Error", "Failed to fetch product.");
            }
        };

        fetchProduct();
    }, [productId, user, navigation]);

    const handleSave = async () => {
        if (!user) {
            Alert.alert("Error", "User is not authenticated. Please log in.");
            navigation.navigate('LoginScreen');
            return;
        }
        setLoading(true);
        try {
            // Retrieve the current product data from the user's collection
            const userDocRef = doc(db, `users/${user.uid}/products`, productId);
            const userDocSnap = await getDoc(userDocRef);
            
            if (!userDocSnap.exists()) {
                Alert.alert("Error", "Product not found.");
                setLoading(false);
                return;
            }
    
            const productData = userDocSnap.data();
            const category = productData?.category;

            const productPriceNum = parseFloat(price);
          const costPriceNum = parseFloat(costPrice);
          const percentageDiscount = Math.ceil(((costPriceNum - productPriceNum) / costPriceNum) * 100);
          
    
            if (!category) {
                Alert.alert("Error", "Product category is missing.");
                setLoading(false);
                return;
            }
    
            // Update the product in the user's collection
            await updateDoc(userDocRef, {
                title,
                price: parseFloat(price),
                costPrice: parseFloat(costPrice),
                percentageDiscount: percentageDiscount,
                imageUrls: images,
                prescription,
                
            });
    
            // Update the product in the category's collection
            const categoryDocRef = doc(db, `categories/${category}/products/${productId}`);
            await updateDoc(categoryDocRef, {
                title,
                price: parseFloat(price),
                 costPrice: parseFloat(costPrice),
                percentageDiscount: percentageDiscount,
                imageUrls: images,
                prescription,
            });

            // Update the product in the pharmacy's collection
            const pharmacyDocRef = doc(db, `pharmacy/${user?.uid}/products/${productId}`);
            await updateDoc(pharmacyDocRef, {
                title,
                price: parseFloat(price),
                 costPrice: parseFloat(costPrice),
                percentageDiscount: percentageDiscount,
                imageUrls: images,
                prescription,
            });

            
            navigation.goBack();
        } catch (error) {
            console.error('Error updating product:', error);
            Alert.alert("Error", "Failed to update product.");
        } finally {
            setLoading(false);
        }
    };
    

    const handleAddImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.map((asset: any) => asset.uri);
            setImages(prevImages => [...prevImages, ...newImages]);
        }
    };

    const handleDragEnd = ({ data }: any) => {
        setImages(data.map((item: any) => item.image)); // Update the order of images
    };



    const handleDeleteImage = async (index: number) => {
        try {
            const imageUrl = images[index];
            if (!imageUrl) {
                console.error('Image URL not found.');
                return;
            }
    
            const storage = getStorage();
            const imageRef = ref(storage, imageUrl);
    
            // Delete the image from Firebase Storage
            await deleteObject(imageRef);
    
            // Remove the image from local state
            setImages(images.filter((_, i) => i !== index));
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };
    

    if (!product) {
        return <View style={{ flex: 1 }}><LoadingOverlay /></View>;
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#D3D3D3' }}>
            {isLoading && <LoadingOverlay />}
            <StatusBar backgroundColor="black" barStyle="light-content"/>
            <ScrollView showsVerticalScrollIndicator={ false}>
            <View style={styles.container}>
                <Text style={styles.title}>Edit Product</Text>
                <View style={{justifyContent: 'center', alignItems: 'center',}}>
                
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Title*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter title"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Price*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter price"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />
                </View>
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Cost Price*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter cost price"
                        keyboardType="numeric"
                        value={costPrice}
                        onChangeText={setCostPrice}
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Prescription*</Text>
                    <TextInput
                        style={[styles.input, { height: hp('10%') }]}
                        placeholder="Enter prescription"
                        value={prescription}
                        onChangeText={setPrescription}
                        multiline={true}
                    />
                </View>
                 
                

             <View style={{flexDirection:'row', alignItems:'center', marginTop:hp('2%'), marginBottom:hp('20%'), paddingRight:wp('25%')}}>

             <TouchableOpacity onPress={handleAddImage} style={styles.imagePicker}>
                    <FontAwesome name="plus" size={17} color="white" style={{top:hp('1.5%')}}/>
                </TouchableOpacity>

             <View style={styles.imagesContainer}>
                    <DraggableFlatList
                        data={images.map((image, index) => ({ key: String(index), image }))}
                        renderItem={({ item, drag }) => (
                            <View style={styles.imageWrapper}>
                                <TouchableOpacity
                                    onLongPress={drag}
                                    style={styles.imageContainer}
                                >
                                    <Image source={{ uri: item.image }} style={styles.image} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteImage(parseInt(item.key))} style={styles.deleteButton}>
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        keyExtractor={item => item.key}
                        onDragEnd={handleDragEnd}
                        horizontal={true}
                        contentContainerStyle={styles.flatListContentContainer}
                    />
                </View>



             </View>






                <TouchableOpacity onPress={handleSave} style={{ bottom: hp('1%') }}>
                    <Text style={{
                        textAlign: 'center',
                        bottom: hp('12%'),
                        backgroundColor: 'blue',
                        width: 310,
                        padding: 12,
                        borderRadius: 6,
                        color: 'white',
                        fontFamily: 'Poppins-Bold',
                        
                    }}>
                        Save
                    </Text>
                </TouchableOpacity>
            </View>
            </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: wp('4%'),
        marginTop:  Platform.OS === 'web' ? 1: hp('3%'),
       
    },
    title: {
        fontSize: RFValue(24),
        fontWeight: 'bold',
        marginBottom: hp('2%'),
    },
    fieldContainer: {
        marginBottom: hp('2%'),
    },
    label: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: hp('1%'),
    },
    input: {
        width: 320,
        height: hp('6%'),
        borderColor: 'grey',
        borderWidth: 1,
        paddingHorizontal: wp('2%'),
        borderRadius: 10,
    },
    imagesContainer: {
        flexDirection: 'row',
    },
    imageWrapper: {
        position: 'relative',
        margin: wp('1%'),
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    imagePicker: {
        paddingVertical: hp('3%'),
        width: 100,
        height: 100,
        backgroundColor: '#272727',
        borderRadius: 9,
        alignItems: 'center',
        marginLeft: 80,
    },
    deleteButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'red',
        padding: 2,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#fff',
        fontFamily:'OpenSans-Bold',
        fontSize:RFValue(10)
    },
    imageContainer: {
        borderRadius: 8,
    },
    flatListContentContainer: {
        alignItems: 'center',
    },
});

export default EditProductScreen;
