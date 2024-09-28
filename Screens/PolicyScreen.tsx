import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';

const PolicyScreen: React.FC = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.otf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.otf'),
  });

  if (!fontsLoaded) {
    return null; // You can display a loading screen or an indicator here
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>

        <Text style={styles.text}>
          **Effective Date: September 26, 2024**
        </Text>

        <Text style={styles.text}>
          Welcome to ePharma! This Privacy Policy explains how we collect, use, and protect the personal information you provide when using the ePharma app. We respect your privacy and are committed to safeguarding the data you share with us.
        </Text>

        <Text style={styles.subTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We only collect the minimum information necessary to provide our services. The types of information we collect are:
        </Text>
        <Text style={styles.listItem}>• Name: To identify the user when an order is placed.</Text>
        <Text style={styles.listItem}>• Phone Number: To contact you regarding your orders, deliveries, or any support issues.</Text>
        <Text style={styles.listItem}>• Delivery Address: To ship the products to your specified location.</Text>
        <Text style={styles.text}>
          Please note that we do not collect sensitive personal information such as credit card numbers or payment information. All payments made within ePharma are processed securely by trusted third-party payment providers, and we do not store or have access to any financial data.
        </Text>

        <Text style={styles.subTitle}>2. Use of Information</Text>
        <Text style={styles.text}>
          We use the information we collect for the following purposes:
        </Text>
        <Text style={styles.listItem}>• Processing and delivering your orders efficiently.</Text>
        <Text style={styles.listItem}>• Providing customer service and addressing any inquiries or concerns you may have.</Text>
        <Text style={styles.listItem}>• Improving the app and our services to ensure a seamless user experience.</Text>
        <Text style={styles.listItem}>• Sending important updates about your orders or services through email or phone.</Text>

        <Text style={styles.subTitle}>3. Data Security</Text>
        <Text style={styles.text}>
          We implement reasonable technical and organizational measures to protect your data from unauthorized access, loss, or alteration. Although we strive to use the best security practices, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security. In the event of a data breach, we will notify affected users in compliance with applicable laws.
        </Text>

        <Text style={styles.subTitle}>4. Sharing of Information</Text>
        <Text style={styles.text}>
          ePharma does not sell, rent, or trade your personal information to third parties. We may only share your information with:
        </Text>
        <Text style={styles.listItem}>• Service Providers: Third-party companies or individuals that assist us in processing payments, fulfilling orders, or delivering products.</Text>
        <Text style={styles.listItem}>• Legal Requirements: If required by law, court order, or to protect the rights, property, or safety of ePharma, our users, or others, we may disclose your information in accordance with legal obligations.</Text>

        <Text style={styles.subTitle}>5. Retention of Information</Text>
        <Text style={styles.text}>
          We retain personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law. Once the information is no longer needed, we securely delete or anonymize it to protect your privacy.
        </Text>

        <Text style={styles.subTitle}>6. Cookies and Tracking Technologies</Text>
        <Text style={styles.text}>
          ePharma does not use cookies or tracking technologies to collect information about your browsing behavior or preferences. However, third-party service providers involved in payments or analytics may use cookies. Please review their privacy policies for more information.
        </Text>

        <Text style={styles.subTitle}>7. Your Rights and Choices</Text>
        <Text style={styles.text}>
          You have the right to access, update, or request the deletion of your personal information stored by ePharma. If you wish to exercise these rights, please contact us at support@ePharma.com, and we will respond promptly.
        </Text>

        <Text style={styles.text}>
          Additionally, you can opt out of receiving promotional communications at any time by following the unsubscribe instructions in our emails or contacting us directly.
        </Text>

        <Text style={styles.subTitle}>8. Children's Privacy</Text>
        <Text style={styles.text}>
          ePharma does not knowingly collect personal information from children under the age of 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete it. If you believe your child has provided us with personal information, please contact us immediately.
        </Text>

        <Text style={styles.subTitle}>9. Changes to This Privacy Policy</Text>
        <Text style={styles.text}>
          ePharma reserves the right to update this Privacy Policy at any time. When changes are made, we will post the updated policy on this page with the new effective date. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
        </Text>

        <Text style={styles.subTitle}>10. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions or concerns about this Privacy Policy, or if you wish to exercise your rights regarding your personal information, please contact us at:
        </Text>
        <Text style={styles.text}>
          Email: support@ePharma.com{'\n'}
          Phone: +1234567890
        </Text>

        <Text style={styles.text}>
          Thank you for trusting ePharma. Your privacy is important to us.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    marginBottom: 10,
    color: '#333',
  },
  subTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 5,
    color: '#333',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  listItem: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    marginLeft: 10,
  },
});

export default PolicyScreen;
