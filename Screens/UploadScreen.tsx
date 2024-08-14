import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView, Modal, TouchableHighlight } from 'react-native';
import { db } from '../Components/firebaseConfig';
import { collection, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import LoadingOverlay from '../Components/LoadingOverlay';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../Components/firebaseConfig'; // Make sure you import storage from your Firebase config
import GetLocation from 'react-native-get-location';
import SuccessfulUpload from './SuccessfulUpload';
import { useCategories } from '../contexts/CategoriesContext';


const UploadScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { user } = useAuth();
    const { categories, loading } = useCategories(); 
    const [category, setCategory] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [prescription, setPrescription] = useState<string>('');
    const [pharmacyName, setPharmacyName] = useState<string>('');
    const [productPrice, setProductPrice] = useState<string>('');
    const [productImages, setProductImages] = useState<string[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]); // Replace 'string[]' with the type of your tags
    
const tags = ["OTC", "GSL", "Near Expiry"];

   
  
  
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
  
      if (!category || !title || !prescription || !pharmacyName || !productPrice || productImages.length === 0) {
          Alert.alert('Error', 'Please fill in all fields and select at least one image.');
          return;
      }
  
      setLoading(true);
      try {
          // Get seller's current location
          const sellerLocation = await GetLocation.getCurrentPosition({
              enableHighAccuracy: true,
              timeout: 15000,
          });
  
          const { latitude, longitude } = sellerLocation;
          console.log(`Seller Location - Latitude: ${latitude}, Longitude: ${longitude}`);
  
          // Check if the category exists
          const categoryRef = doc(db, `categories/${category}`);
          const categoryDoc = await getDoc(categoryRef);
  
          if (!categoryDoc.exists()) {
              Alert.alert('Error', 'Selected category does not exist.');
              setLoading(false);
              return;
          }
  
          // Generate a unique product ID
          const productId = doc(collection(db, `categories/${category}/products`)).id;
  
          // Upload images to Firebase Storage
          const imageUrls = await Promise.all(productImages.map(async (uri) => {
              const response = await fetch(uri);
              const blob = await response.blob();
              const filename = uri.substring(uri.lastIndexOf('/') + 1);
              const storageRef = ref(storage, `product_images/${filename}`);
              await uploadBytes(storageRef, blob);
              const url = await getDownloadURL(storageRef);
              return url;
          }));
  
          // Prepare product data with image URLs
          const productData = {
              userId: user.uid,  // Store user ID
              title,
              prescription,
              location: { latitude, longitude },
              pharmacyName,
              price: parseFloat(productPrice),
              imageUrls: imageUrls,
              tags: selectedTags,
              category, // Include the category field
          };
  
          // Add product to category using the generated ID
          const productsInCategoryRef = doc(db, `categories/${category}/products/${productId}`);
          await setDoc(productsInCategoryRef, productData);
  
          // Add product to user's products collection using the same ID
          const userProductsRef = doc(db, `users/${user.uid}/products/${productId}`);
          await setDoc(userProductsRef, productData);
  
          navigation.navigate(SuccessfulUpload);
          setCategory('');
          setTitle('');
          setPrescription('');
          setPharmacyName('');
          setProductPrice('');
          setProductImages([]);
      } catch (error) {
          console.error('Error uploading product: ', error);
          Alert.alert('Error', `Failed to upload product.`);
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
          <FontAwesome name="plus" size={14} color="white" style={{top:hp('1.7%')}}/>
            </TouchableOpacity>

            <ScrollView horizontal>
                {productImages.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.imagePreview} />
                ))}
            </ScrollView>

            </View>

   

            
            <TouchableOpacity onPress={handleUpload} style={{bottom:hp('1%')}} >
            <Text style={{textAlign:'center',top:hp('3%'),backgroundColor:'blue', width:wp('80%'), padding:wp('3.5%'), borderRadius:6, color:'white', fontFamily:'Poppins-Bold', left:wp('5.7%')}}>UPLOAD PRODUCT</Text>
            
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
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Image source={{ uri: cat.imageUrl }} style={styles.categoryImage} />
                  <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(15), left: wp('7%') }}>
                    {cat.name}
                  </Text>
                </View>
                <AntDesign name="right" size={RFValue(16)} color="black" style={{ left: wp('2%') }} />
              </TouchableOpacity>
            ))}
            <TouchableHighlight style={styles.closeButton} onPress={() => setShowModal(false)}>
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
        paddingVertical: hp('3%'),
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
