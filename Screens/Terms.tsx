// TermsAndConditionsScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Terms = () => {
  const [isAgreed, setIsAgreed] = useState(false);
  const navigation = useNavigation();

  
  return (
    <><StatusBar backgroundColor="black" barStyle="light-content" />
    <View style={styles.container}>
      <Text style={styles.header}>Terms and Conditions</Text>
      <ScrollView style={styles.content}>
        <Text style={styles.paragraph}>
          Welcome to ePharma. By using our app, you agree to the following terms and conditions.
          This agreement governs your use of the services provided by ePharma, including but not limited
          to purchasing pharmaceutical products, accessing healthcare-related content, receiving medical
          consultations, purchasing medical instruments, and obtaining professional medical advice.
        </Text>

        <Text style={styles.subHeader}>1. General</Text>
        <Text style={styles.paragraph}>
          ePharma provides an online platform for the sale of pharmaceutical products, medical instruments,
          and healthcare-related services. We also offer professional medical consultations and advice from licensed healthcare professionals.
          We strive to ensure accurate and up-to-date information, but we cannot guarantee the completeness or accuracy of product details,
          prices, or service availability.
        </Text>

        <Text style={styles.subHeader}>2. Consultation Services</Text>
        <Text style={styles.paragraph}>
          ePharma allows users to book medical consultations with qualified healthcare professionals.
          These consultations provide guidance and advice based on the information provided by the user.
          However, these consultations are not a replacement for in-person medical visits and examinations
          unless otherwise specified by the healthcare professional.
        </Text>

        <Text style={styles.subHeader}>3. Medical Instruments and Drugs</Text>
        <Text style={styles.paragraph}>
          All pharmaceutical products and medical instruments available on ePharma comply with applicable
          health and safety regulations. However, we do not take responsibility for any misuse or improper
          handling of such products after purchase. Always follow the provided instructions for medical
          instruments and prescriptions for drugs.
        </Text>

        <Text style={styles.subHeader}>4. Health Information Disclaimer</Text>
        <Text style={styles.paragraph}>
          The health information and advice provided through ePharma are for educational and consultative purposes
          only. This information should not be used as a substitute for professional medical treatment or diagnosis.
          Always consult your healthcare provider before making any healthcare decisions based on the information provided.
        </Text>

        <Text style={styles.subHeader}>5. Payments and Refunds</Text>
        <Text style={styles.paragraph}>
          Payments for consultation services, medical instruments, and drugs made via the ePharma platform are secure.
          In case of refunds or cancellations, users must follow the refund policies applicable to the specific service
          or product purchased. Refunds for consultation services are not guaranteed once the service has been rendered.
        </Text>

        <Text style={styles.subHeader}>6. User Responsibility</Text>
        <Text style={styles.paragraph}>
          Users are responsible for providing accurate and truthful information during medical consultations.
          Failure to do so may result in improper medical advice or recommendations. Users are also responsible
          for the confidentiality of their account credentials and any actions taken through their account.
        </Text>

        <Text style={styles.subHeader}>7. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          ePharma reserves the right to modify these terms and conditions at any time. Significant changes will
          be communicated to users through the app. By continuing to use the app after these changes, users
          agree to the updated terms and conditions.
        </Text>

      </ScrollView>


    </View></>
  );
};

export default Terms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: hp('2%'),
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: hp('3%'),
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
