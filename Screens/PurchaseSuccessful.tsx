import { ImageBackground, View, Text, TouchableOpacity, BackHandler, StatusBar } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useEffect } from "react";


const PurchaseSuccessful: React.FC<{ navigation: any }> = ({ navigation }) => {

    const goBack = async () => {
        navigation.navigate('CartScreen')
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
    <SafeAreaView style={{flex:1}}>
      <StatusBar backgroundColor="black" barStyle="light-content"/>

    <View style={{flexDirection:'column', alignItems:'center', justifyContent:'center', marginBottom:hp('8%'), top:hp('5%')}}>
     <ImageBackground source={require('../assets/bags.png')} style={{width:120, height:100, top:wp('8%')}}>

     </ImageBackground>

     <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(20) , top:hp('20%')}}>Payment Successful.</Text>

     <Text style={{fontFamily:'Poppins-Regular', fontSize:RFValue(13) , top:hp('20%')}}>Your order will be delivered soon.</Text>

     <TouchableOpacity onPress={goBack} style={{top:hp('34%')}} >
            <Text style={{textAlign:'center',top:hp('3%'),backgroundColor:'blue', width:wp('70%'), padding:wp('4%'), borderRadius:6, color:'white', fontFamily:'OpenSans-Bold'}}>CONTINUE</Text>

   </TouchableOpacity>
    </View>

    </SafeAreaView>
    
  );
};



export default PurchaseSuccessful;

