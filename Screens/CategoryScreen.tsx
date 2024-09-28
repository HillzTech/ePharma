import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, Platform, BackHandler, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { db, storage } from "../Components/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import LoadingOverlay from "../Components/LoadingOverlay";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { useCategories } from "../contexts/CategoriesContext";
import CostumerFooter from "../Components/CostumerFooter";

interface Category {
    id: string;
    name: string;
    imageUrl: string;
}

const CategoryScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { categories, loading } = useCategories(); 
    const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;



    const [isLoading, setLoading] = useState(false);


   
    const handleCategoryPress = (category: string) => {
        navigation.navigate('CategoryDetails', { category });
    };

    const handleBack =  () => {
     navigation.navigate('HomeScreen');
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
        <SafeAreaView style={styles.container}>
            {isLoading && <LoadingOverlay />}
            <StatusBar backgroundColor="black" barStyle="light-content"/>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:wp('1%'), marginBottom:hp('-4%'), bottom:hp('2%'), padding: hp('2%'), left:wp('5%')}}>
    <TouchableOpacity  onPress={handleBack}>
    <Ionicons name="chevron-back" size={33} color="black" />
    </TouchableOpacity>
    
   <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(18), right:wp('40%')}}>Categories</Text>
  
   </View>

   {windowWidth  < 1000 ? (
    <View style={{ padding:hp('1%'),  marginBottom:  hp('10%'),}}>
    <FlatList
                 data={categories}
                 keyExtractor={(item) => item.name}
                 numColumns={2} // Display two items in a row
                 key={2} // This key ensures FlatList re-renders properly when numColumns is fixed
                 renderItem={({ item }) => (
                     <TouchableOpacity
                         style={styles.categoryButton}
                         onPress={() => handleCategoryPress(item.name)}
                     >
                         <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
                         <Text style={styles.categoryText}>{item.name}</Text>
                     </TouchableOpacity>
                 )}
             />
    </View>

) : (
    <View style={{ padding:hp('10%'),  marginBottom:  hp('16%'), justifyContent:'center', alignItems:'center',  marginTop: -40}}>
   <FlatList
                data={categories}
                keyExtractor={(item) => item.name}
                numColumns={4} // Display two items in a row
                key={4} // This key ensures FlatList re-renders properly when numColumns is fixed
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.categoryButton}
                        onPress={() => handleCategoryPress(item.name)}
                    >
                        <Image source={{ uri: item.imageUrl }} style={styles.categoryImage} />
                        <Text style={styles.categoryText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
   </View>

)}
   

   {Platform.OS === 'web'? (
        <>
          
        </>
      ) : (
        <>
        <CostumerFooter route={route} navigation={navigation} />
          <View
            style={{
            
              backgroundColor: 'black',
              height: hp('10%'),
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              top: hp('92.5%'),
              right: wp('0%'),
              left: 0,
              zIndex: 1,
            }}
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
        overflow: Platform.OS === 'web' ? 'scroll' : 'visible'
    },
    categoryButton: {
        
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        marginHorizontal:  hp('1.6%'),
        marginVertical:  hp('1%'),
        borderRadius: 8,
        padding: hp('2%'),
    },
    categoryImage: {
        width:  RFValue(110),
        height:  RFValue(80),
        borderRadius: 15,
        marginBottom:  hp('1%'),
    },
    categoryText: {
        color: 'black',
        fontSize: 16,
        textAlign: 'center',
        fontFamily:'OpenSans-Bold',
        maxWidth:wp('30%')
    },
});

export default CategoryScreen;
