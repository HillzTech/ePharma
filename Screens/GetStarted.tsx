import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

const GetStartedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const { width } = Dimensions.get('window');
  const iconSize = width < 395 ? 24 : 26;

  const handleNextStep = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      await AsyncStorage.setItem('isFirstTime', 'false');
      navigation.replace('Location');
    }
  };
 const signin = async () => {
  navigation.navigate('LoginScreen');
 }
  const handleSkip = async () => {
    setStep(4);
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Image source={require('../assets/map.jpg')} style={{width:wp('70%'), height:hp('40%'), opacity: 0.9}} />
            <Text style={{fontSize:RFValue(23), fontFamily:'OpenSans-ExtraBold', top:hp('11%'), textAlign:'center'}}>Welcome to ePharma</Text>
            <Text style={{fontSize:RFValue(13), fontFamily:'Poppins-Regular', top:hp('14%'), paddingHorizontal: wp('7%'), textAlign: 'center'}}>Fill your prescription from the closest drug stores within your vicinity from the comfort of your home. </Text>
          </>
        );
      case 2:
        return (
          <>
            <Image source={require('../assets/Vector.png')} style={{marginTop:hp('6%'),width:wp('79%'), height:hp('35%')}} />
            <Text style={{fontSize:RFValue(23), fontFamily:'OpenSans-ExtraBold', top:hp('14%'),  textAlign:'center', paddingHorizontal:wp('5%')}}>Source for drugs with just a few clicks.</Text>
            <Text style={{fontSize:RFValue(13), fontFamily:'Poppins-Regular', top:hp('17%'), paddingHorizontal: wp('7%'), textAlign: 'center'}}>Let our customer support help you source for drugs with ease. </Text>
          </>
        );
      case 3:
        return (
          <>
            <Image source={require('../assets/Vector2.png')} style={{marginTop:hp('3.5%'),width:wp('79%'), height:hp('35%'), top:hp('4.5%')}} />
            <Text style={{fontSize:RFValue(23), fontFamily:'OpenSans-ExtraBold', top:hp('15.5%'),  textAlign:'center'}}>Healthier living at your fingertips.</Text>
            <Text style={{fontSize:RFValue(13), fontFamily:'Poppins-Regular', top:hp('18%'), paddingHorizontal: wp('7%'), textAlign: 'center'}}>With the help of our intelligent algorithms you can now locate drugstores around your vicinity at total ease. </Text>
          </>
        );
      case 4:
        return (
          <>
             <Image source={require('../assets/Vector4.png')} style={{marginTop:hp('-9%'),width:wp('79%'), height:hp('35%'), top:hp('9%')}} />
            <Text style={{fontSize:RFValue(23), fontFamily:'OpenSans-ExtraBold', top:hp('19%'),  textAlign:'center'}}>Book face-to-face Appointment</Text>
            <Text style={{fontSize:RFValue(14), fontFamily:'Poppins-Regular', top:hp('21%'), paddingHorizontal: wp('5%'), textAlign: 'center'}}>Can't go to the Pharmacy? Book video call appointments with your pharmacists within the App </Text>
            <View style={{top:hp('36%'), flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={{fontSize:RFValue(15), fontFamily:'Poppins-Regular'}}>ALREADY HAVE AN ACCOUNT? </Text>
                <TouchableOpacity onPress={signin}>
                    <Text style={{fontSize:RFValue(15), fontFamily:'Poppins-Bold', textAlign: 'center'}}>SIGN IN</Text></TouchableOpacity>
            </View>
            
          </>
        );
      default:
        return (
          <>
            <Image source={require('../assets/Logo.png')} style={styles.image} />
            <Text style={styles.contentText}>Welcome to the App! Let's get started.</Text>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
      
      <View style={styles.dashContainer}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.dash}>
            {step === i && <View style={styles.dashActive} />}
          </View>
        ))}
      </View>
      
      <View style={styles.buttonRow}>
        {step > 1 && (
          <TouchableOpacity style={{bottom:hp('55%')}} onPress={handleBackStep}>
            <Entypo name="arrow-long-left" size={iconSize} color="black" />
            
          </TouchableOpacity>
        )}
        
        {step < 4 && (
          <TouchableOpacity style={styles.buttonContainer} onPress={handleNextStep}>
            <Text style={styles.buttonText}>{step === 1 ? 'GET STARTED' : 'CONTINUE'}</Text>
            <Entypo name="arrow-long-right" size={iconSize} color="white" style={styles.icon} />
          </TouchableOpacity>
        )}

        {step >= 2 && step <= 3 && (
          <TouchableOpacity style={styles.skipButtonContainer} onPress={handleSkip}>
            <Text style={{color:'black', textAlign:'center', fontSize:RFValue(18), fontFamily:'Poppins-Bold' }}>Skip</Text>
          </TouchableOpacity>
        )}

      {step >= 4 && (
          <TouchableOpacity style={styles.buttonContainer} onPress={handleNextStep}>
            <Text style={styles.buttonText}>{step === 1 ? 'GET STARTED' : 'GET STARTED'}</Text>
            <Entypo name="login" size={iconSize} color="white" style={styles.icon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: hp('0.3%'),
    backgroundColor: '#ffffff',
    bottom: hp('12%')
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: hp('-6%')
  },
  dashContainer: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
  },
  dash: {
    width: 20,
    height: 6,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  dashActive: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1c96c5',
    borderRadius: 5,
  },
  image: {
    width: wp('74%'),
    height: hp('33%')
  },
  contentText: {
    fontSize: RFValue(17),
    textAlign: 'center',
    marginBottom: hp('5%'),
  },
  buttonRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: wp('83%'),
    marginTop: hp('3%')
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'blue',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    borderRadius: 5,
    top: hp('18%')
  },
  
  skipButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    borderRadius: 5,
    top:hp('20%')
  },
  buttonText: {
    color: 'white',
    fontSize: RFValue(16),
    fontFamily:'OpenSans-Bold',
    left: hp('10%')
  },
  icon: {
    marginLeft: wp('37%'),
  },
});

export default GetStartedScreen;
