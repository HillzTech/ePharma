import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, LayoutAnimation, Platform, UIManager, Dimensions, BackHandler, StatusBar } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const toggleQuestion = (question: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedQuestion(prevQuestion => (prevQuestion === question ? null : question));
  };

  const faqs = [
    {
      question: 'How do I contact the support team?',
      answer: 'You can contact our support team by emailing support@epharma.com.ng, have a live chat with us by clicking the emergency button on your dashboard or calling +2348161236962.',
    },
    {
      question: 'How can I sell on ePharma?',
      answer: 'To sell on ePharma, register as a pharmacy, upload your pharmacy details, and start listing your products.',
    },
    {
      question: 'How do I buy something on ePharma?',
      answer: 'To buy on ePharma, browse the products, add them to your cart, and proceed to checkout with payment options.',
    },
    {
      question: 'Is delivery available for all products?',
      answer: 'Yes, delivery is available for all products, regardless of location. Delivery charges may vary depending on your distance.',
    },
    {
        question: 'Is delivery fee added to the total cost of products?',
        answer: 'No, the delivery fee is not added to the total cost of products. Delivery charges will be collected by the delivery person from the buyer upon delivery.',
      },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, mobile payments, and bank transfers for all purchases.',
    },
    {
      question: 'How do I track my order?',
      answer: 'You can track your order by going to the "My Orders" section of your account after making a purchase.',
    },
  ];

  const handleback = async() => {
    navigation.goBack()
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
    <ScrollView style={styles.container}>
    <StatusBar backgroundColor="black" barStyle="light-content"/>
<View style={{flexDirection:'row', justifyContent:'space-around', alignItems:'center', padding:wp('1%'), marginTop: Platform.OS === 'web' ? -7:  hp('0%'),  marginBottom:hp('3%'), right:wp('15%')}}>
    <TouchableOpacity  onPress={handleback}>
    <Ionicons name="chevron-back" size={RFValue(25)} color="black" />
    </TouchableOpacity>
   
    <Text style={styles.headerText}>FAQ</Text>
   </View>
      
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqItem}>
          <TouchableOpacity onPress={() => toggleQuestion(faq.question)} style={styles.questionContainer}>
            <Text style={styles.questionText}>{faq.question}</Text>
          </TouchableOpacity>
          {expandedQuestion === faq.question && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>{faq.answer}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('5%'),
     backgroundColor: '#D3D3D3'
  },
  headerText: {
    fontSize: RFValue(17),
    fontFamily: 'Poppins-Bold',
    color: '#333',
    right:wp('9%'),
    letterSpacing: 0.5,
  },
  faqItem: {
    marginBottom: hp('2%'),
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  questionContainer: {
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  questionText: {
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Bold',
    color: '#4A4A4A',
  },
  answerContainer: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  answerText: {
    fontSize: RFValue(12),
    color: '#666',
    lineHeight: hp('2.8%'),
    fontFamily: 'Poppins-Regular',
  },
});

export default FAQScreen;
