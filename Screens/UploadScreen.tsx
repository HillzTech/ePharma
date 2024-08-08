import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView, Modal, TouchableHighlight } from 'react-native';
import { db } from '../Components/firebaseConfig';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import LoadingOverlay from '../Components/LoadingOverlay';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../Components/firebaseConfig'; // Make sure you import storage from your Firebase config

import { useData } from '../contexts/DataContext'; // Import DataContext
import SuccessfulUpload from './SuccessfulUpload';


const UploadScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { user } = useAuth();
    const [category, setCategory] = useState<string>('');
    
    const [title, setTitle] = useState<string>('');
    const [prescription, setPrescription] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [pharmacyName, setPharmacyName] = useState<string>('');
    const [productPrice, setProductPrice] = useState<string>('');
    const [productImages, setProductImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<{ name: string; imageUrl: string }[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]); // Replace 'string[]' with the type of your tags

const tags = ["OTC", "GSL", "Near Expiry"];


    useEffect(() => {
      const fetchCategories = async () => {
        try {
            console.log('Fetching categories from Firestore...');
            
            const categoriesCollection = collection(db, 'categories');
            const categorySnapshot = await getDocs(categoriesCollection);
            
            if (categorySnapshot.empty) {
                console.log('No categories found.');
                return;
            }
            
            const categoryList = await Promise.all(
                categorySnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    
    
                    // Convert gs:// URL to a public URL
                    let imageUrl = data.imageUrl;
                    if (imageUrl && imageUrl.startsWith('gs://')) {
                        const storageRef = ref(storage, imageUrl);
                        try {
                            imageUrl = await getDownloadURL(storageRef);
                        } catch (error) {
                            
                            imageUrl = ''; // Handle error case
                        }
                    }
    
                  
                    return { ...data, imageUrl } as { name: string; imageUrl: string };
                })
            );
    
        
            setCategories(categoryList);
        } catch (error) {
            console.error('Error fetching categories: ', error);
            Alert.alert('Error', 'Failed to fetch categories.');
        }
    };
      fetchCategories();
  }, []);
  
  
    const handleImagePicker = async () => {
        const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!result.granted) {
            Alert.alert('Permission Required', 'Permission to access media library is required!');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
            setProductImages(pickerResult.assets.map((asset) => asset.uri));
        }
    };

  

   const handleUpload = async () => {
  if (!user) {
    Alert.alert('Error', 'You must be logged in to upload products.');
    return;
  }

  if (!category || !title || !prescription || !location || !pharmacyName || !productPrice || productImages.length === 0) {
    Alert.alert('Error', 'Please fill in all fields and select at least one image.');
    return;
  }
  
  setLoading(true);
  try {
    // Check if the category exists
    const categoryRef = doc(db, `categories/${category}`);
    const categoryDoc = await getDoc(categoryRef);

    if (!categoryDoc.exists()) {
      Alert.alert('Error', 'Selected category does not exist.');
      setLoading(false);
      return;
    }

    // Upload the product to the existing category
    const productsInCategoryRef = collection(db, `categories/${category}/products`);
    const productData = {
      userId: user.uid,  // Store user ID
      title,
      prescription,
      location,
      pharmacyName,
      price: parseFloat(productPrice),
      imageUrls: productImages,
      tags: selectedTags,
    };
    
    // Add product to category
    await addDoc(productsInCategoryRef, productData);

    // Add product to user's products collection
    const userProductsRef = collection(db, `users/${user.uid}/products`);
    await addDoc(userProductsRef, productData);

    navigation.navigate(SuccessfulUpload);
    setCategory('');
    setTitle('');
    setPrescription('');
    setLocation('');
    setPharmacyName('');
    setProductPrice('');
    setProductImages([]);
  } catch (error) {
    console.error('Error uploading product: ', error);
    Alert.alert('Error', `Failed to upload product. `);
  } finally {
    setLoading(false); // Ensure loading state is reset on completion
  }
};


  const goBack = async () => {
  
    navigation.navigate('RetailerScreen');
  }
  

    return (
        <SafeAreaView style={styles.container}>
            {isLoading && <LoadingOverlay />}


            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: hp('0.1%'), right: wp('7%'), bottom:hp('2%') }}>
                <TouchableOpacity onPress={goBack}>
                    <Ionicons name="chevron-back" size={RFValue(27)} color="black" />
                </TouchableOpacity>
                <Text style={styles.header}>Upload Product</Text>
            </View>

            

            <TouchableOpacity onPress={() => setShowModal(true)} style={styles.input}>
              <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                <Text>Category*</Text>
                <Entypo name="chevron-small-down" size={24} color="black" />
              </View>
                
                {category && <Text style={{fontFamily:'Poppins-Regular'}}>{category}</Text>}
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Title*"
                placeholderTextColor="black"
                value={title}
                onChangeText={setTitle}
            />
            
            <TextInput
                style={styles.input}
                placeholder="Location*"
                placeholderTextColor="black"
                value={location}
                onChangeText={setLocation}
            />
            <TextInput
                style={styles.input}
                placeholder="Pharmacy Name*"
                placeholderTextColor="black"
                value={pharmacyName}
                onChangeText={setPharmacyName}
            />
            <TextInput
                style={styles.input}
                placeholder="Product Price*"
                placeholderTextColor="black"
                value={productPrice}
                onChangeText={setProductPrice}
                keyboardType="numeric"
            />
            <Text style={{fontFamily:'Poppins-Regular', fontSize:RFValue(9), left:wp('1%')}}>Write details below</Text>
            <TextInput
                style={styles.input}
                placeholder="prescription*"
                placeholderTextColor="black"
                value={prescription}
                onChangeText={setPrescription}
            />

      <View style={styles.tagContainer}>
        <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(15), marginLeft:wp('8%'), marginRight:wp('3%'), marginTop:hp('0.6%')}}>Tags</Text>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tag,
                selectedTags.includes(tag) && styles.tagSelected
              ]}
              onPress={() => {
                setSelectedTags((prevTags) =>
                  prevTags.includes(tag)
                    ? prevTags.filter((t) => t !== tag)
                    : [...prevTags, tag]
                );
              }}
            >
              <Text style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextSelected
              ]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

            <View>
          <Text style={styles.imagePickerText}>Add at least 1 photo</Text>
          <TouchableOpacity onPress={handleImagePicker} style={styles.imagePicker}>
          <FontAwesome name="plus" size={12} color="white" />
            </TouchableOpacity>

            <ScrollView horizontal>
                {productImages.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.imagePreview} />
                ))}
            </ScrollView>

            </View>

   

            
            <TouchableOpacity onPress={handleUpload} style={{bottom:hp('1%')}} >
            <Text style={{textAlign:'center',top:hp('3%'),backgroundColor:'blue', width:wp('70%'), padding:wp('3.5%'), borderRadius:6, color:'white', fontFamily:'Poppins-Bold', left:wp('11%')}}>UPLOAD PRODUCT</Text>
            
            </TouchableOpacity>

            {/* Category Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Select Category</Text>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.name}
                                style={styles.categoryOption}
                                onPress={() => {
                                    setCategory(cat.name);
                                    setShowModal(false);
                                }}
                            >
                              <View style={{flexDirection:'row', justifyContent:'flex-start', alignItems:'center'}}>
                              <Image source={{ uri: cat.imageUrl }} style={styles.categoryImage} />
                              <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(15), left:wp('7%')}}>{cat.name}</Text>
                              </View>
                               
                                <AntDesign name="right" size={RFValue(16)}color="black" style={{left:wp('2%')}}/>
                            </TouchableOpacity>
                        ))}



                        <TouchableHighlight
                            style={styles.closeButton}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#D3D3D3',
    },
    header: {
        fontSize: RFValue(20),
        fontFamily: 'OpenSans-Bold',
        right: wp('10%'),
    
    },
    input: {
        height: hp('6%'),
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: hp('1.5%'),
        paddingHorizontal: wp('3%'),
        borderRadius: 5,
        justifyContent: 'center',
        fontFamily:'Poppins-Regular',
        
        
    },
    imagePicker: {
        marginBottom: hp('2%'),
        paddingVertical: hp('5%'),
        width:wp('24%'),
        height:wp('24%'),
        backgroundColor: '#272727',
        borderRadius: 9,
        alignItems: 'center',
        left:wp('33%')
    },
    imagePickerText: {
        color: 'black',
        fontFamily: 'Poppins-Regular',
        textAlign:'center',
        fontSize:RFValue(10)
      
      
    },
    imagePreview: {
        width: wp('28%'),
        height: wp('28%'),
        marginRight: wp('2%'),
        borderRadius: 5,
        marginBottom:wp('0.1%')
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: wp('100%'),
        padding: wp('9%'),
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalHeader: {
        fontSize: RFValue(18),
        fontFamily: 'OpenSans-Bold',
        marginBottom: hp('1%'),
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
        paddingVertical: hp('1.3%'),
        paddingHorizontal: wp('4%'),
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: wp('100%'),
        
    },
    categoryImage: {
        width: wp('12%'),
        height: hp('4%'),
        borderRadius: 5,
        marginLeft:wp('1%')
        
    },
    closeButton: {
        marginTop: hp('2%'),
        padding: wp('3%'),
        backgroundColor: '#007AFF',
        borderRadius: 5,
        alignItems: 'center',
        width: wp('50%'),
    },
    closeButtonText: {
        color: 'white',
        fontFamily: 'OpenSans-Bold',
        fontSize:RFValue(16)
    },

    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      
    },
    tag: {
      paddingVertical: hp('0.7%'),
      paddingHorizontal:wp('3%') ,
      borderRadius: 5,
      borderWidth: 1,
      backgroundColor: '#272727',
      marginRight: wp('0.8%'),
      marginBottom: hp('1.5%'),
    },
    tagSelected: {
      backgroundColor: 'blue',
      borderColor: 'blue',
    },
    tagText: {
      color: 'white',
      fontFamily:'Poppins-Bold',
      fontSize:RFValue(13)
    },
    tagTextSelected: {
      color: 'white',
    },
  
});

export default UploadScreen;
