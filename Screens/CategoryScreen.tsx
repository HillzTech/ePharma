import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
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

    const [isLoading, setLoading] = useState(false);


   
    const handleCategoryPress = (category: string) => {
        navigation.navigate('CategoryDetails', { category });
    };

    const handleBack =  () => {
     navigation.navigate('HomeScreen');
    }

    return (
        <SafeAreaView style={styles.container}>
            {isLoading && <LoadingOverlay />}
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:wp('1%'), marginBottom:hp('-4%'), bottom:hp('2%'), padding: hp('2%'), left:wp('5%')}}>
    <TouchableOpacity  onPress={handleBack}>
    <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
    </TouchableOpacity>
    
   <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(18), right:wp('40%')}}>Categories</Text>
  
   </View>
   <View style={{ padding:hp('2%'),  marginBottom:  hp('10%'),}}>
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
<CostumerFooter route={route} navigation={navigation}/>
<View style={{ bottom: hp('70.5%'), backgroundColor: 'black', height: hp('10%'), position: 'absolute', justifyContent: 'center', alignItems: 'center', top: hp('97.5%'), right: wp('0%'), left: 0, zIndex: 1  }}>
              <></>
          </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D3D3',
       
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
        width:  wp('30%'),
        height:  hp('11%'),
        borderRadius: 15,
        marginBottom:  hp('1%'),
    },
    categoryText: {
        color: 'black',
        fontSize: RFValue(15),
        textAlign: 'center',
        fontFamily:'OpenSans-Bold',
        maxWidth:wp('30%')
    },
});

export default CategoryScreen;
