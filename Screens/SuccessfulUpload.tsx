import { ImageBackground, View, Text, TouchableOpacity } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const SuccessfulUpload: React.FC<{ navigation: any }> = ({ navigation }) => {

    const goBack = async () => {
        navigation.navigate('RetailerScreen')
    }
 
  return (
    <SafeAreaView style={{flex:1}}>
    <View style={{flexDirection:'column', alignItems:'center', justifyContent:'center', marginBottom:hp('8%'), top:hp('5%')}}>
     <ImageBackground source={require('../assets/Group3645.png')} style={{width:wp('35%'), height:hp('20%'), top:wp('8%')}}>

     </ImageBackground>

     <Text style={{fontFamily:'Poppins-Bold', fontSize:RFValue(20) , top:hp('13%')}}>Successfully Uploaded.</Text>

     <TouchableOpacity onPress={goBack} style={{top:hp('34%')}} >
            <Text style={{textAlign:'center',top:hp('3%'),backgroundColor:'blue', width:wp('70%'), padding:wp('4%'), borderRadius:6, color:'white', fontFamily:'OpenSans-Bold'}}>CONTINUE</Text>

   </TouchableOpacity>
    </View>

    </SafeAreaView>
    
  );
};



export default SuccessfulUpload;

