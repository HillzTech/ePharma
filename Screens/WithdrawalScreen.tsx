import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, StyleSheet, Dimensions, BackHandler, StatusBar } from 'react-native';
import { useAuth } from '../contexts/authContext';
import { db } from '../Components/firebaseConfig';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Picker } from '@react-native-picker/picker'; // Correct import

const WithdrawalScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { user } = useAuth();
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<string>('');  // Store selected bank
  const [bankName, setBankName] = useState<string>('');  // Store custom bank name
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [pharmacyName, setPharmacyName] = useState<string>('');
  const [pharmacyPhone, setPharmacyPhone] = useState<string>('');
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  
  

  const banks = [
    "Access Bank",
"Citibank Nigeria Limited",
"Dot Microfinance Bank",
"Ecobank Nigeria",
"FairMoney Microfinance Bank",
"Fidelity Bank",
"First Bank of Nigeria",
"First City Monument Bank Limited",
"Globus Bank Limited",
"Guaranty Trust Bank",
"Jaiz Bank Plc",
"Keystone Bank Limited",
"Kuda Bank",
"Lotus Bank",
"Mint Finex MFB",
"Mkobo MFB",
"Moniepoint Microfinance Bank",
"Optimum Bank Limited",
"Opay",
"Palmpay",
"Parallex Bank Limited",
"Polaris Bank Limited",
"PremiumTrust Bank Limited",
"Providus Bank Limited",
"Raven Bank",
"Rex Microfinance Bank",
"Rubies Bank",
"Sparkle Bank",
"Stanbic IBTC Bank Plc",
"Standard Chartered",
"Sterling Bank Plc",
"SunTrust Bank Nigeria Limited",
"TAJBank Limited",
"Titan Trust Bank Limited",
"Unity Bank Plc",
"VFD Microfinance Bank",
"Wema Bank Plc",
"Zenith Bank",
    'Others',  // Option for custom bank input
  ];

  useEffect(() => {
    const fetchRevenueAndWithdrawals = async () => {
      if (user) {
        // Fetch total revenue
        const revenueRef = collection(db, `users/${user.uid}/revenue`);
        const revenueDocs = await getDocs(revenueRef);

        let totalRevenue = 0;
        revenueDocs.forEach((doc) => {
          totalRevenue += doc.data().total;
        });

        // Fetch total withdrawn amount
        const withdrawalsRef = collection(db, 'withdrawals');
        const withdrawalsDocs = await getDocs(withdrawalsRef);

        let totalWithdrawn = 0;
        withdrawalsDocs.forEach((doc) => {
          if (doc.data().userId === user.uid) {
            totalWithdrawn += doc.data().amount;
          }
        });

        // Set the total revenue minus total withdrawn
        setTotalRevenue(totalRevenue - totalWithdrawn);
        setTotalWithdrawn(totalWithdrawn);
      }
    };

    const fetchPharmacyName = async () => {
      if (user) {
        const pharmacyRef = query(
          collection(db, 'pharmacy'),
          where('userId', '==', user.uid)
        );
        const pharmacyDocs = await getDocs(pharmacyRef);
        if (!pharmacyDocs.empty) {
          const pharmacyData = pharmacyDocs.docs[0].data();
          setPharmacyName(pharmacyData.pharmacyName || 'Unknown Pharmacy');
          setPharmacyPhone(pharmacyData.pharmacyPhone || 'Unknown Phone');
        } else {
          setPharmacyName('Unknown Pharmacy');
        }
      }
    };

    fetchRevenueAndWithdrawals();
    fetchPharmacyName();
  }, [user]);

  const handleWithdraw = async () => {
    const finalBankName = selectedBank === 'Others' ? bankName : selectedBank;  // Determine the final bank name

    if (user) {
      const newTotal = totalRevenue - withdrawAmount;

      if (newTotal >= 0) {
        setTotalRevenue(newTotal);

        await addDoc(collection(db, 'withdrawals'), {
          userId: user.uid,
          bankName: finalBankName,
          accountNumber,
          accountName,
          amount: withdrawAmount,
          pharmacyName,
          pharmacyPhone,
          status: 'pending',
          date: new Date(),
        });

        Alert.alert("Success", "Your withdrawal request has been submitted.");

        setSelectedBank('');
        setBankName('');
        setAccountNumber('');
        setAccountName('');
        setWithdrawAmount(0);
      } else {
        Alert.alert("Error", "Withdrawal amount exceeds available funds.");
      }
    }
  };

  const handleBack = () => {
    navigation.navigate('RetailerProfile');
  };

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
      <StatusBar backgroundColor="black" barStyle="light-content"/>
      
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={29} color="black" />
        </TouchableOpacity>
        <Text style={windowWidth > 1000 ? styles.lgheaderText: styles.headerText}>Withdrawal</Text>
      </View>
      
      <View style={{justifyContent: 'center', alignItems: 'center',}}>
      <Text style={styles.label}>Total Revenue: N{totalRevenue}</Text>
   
      
      
      <TextInput
        style={styles.input}
        placeholder="Account Name"
        value={accountName}
        onChangeText={setAccountName}
        placeholderTextColor="#999"
      />

      <Picker
        selectedValue={selectedBank}
        style={styles.input}
        onValueChange={(itemValue: string) => setSelectedBank(itemValue)}
      >
        {banks.map((bank, index) => (
          <Picker.Item label={bank} value={bank} key={index} />
        ))}
      </Picker>

      {selectedBank === 'Others' && (
        <TextInput
          style={styles.input}
          placeholder="Enter Your Bank Name"
          value={bankName}
          onChangeText={setBankName}
          placeholderTextColor="#999"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Bank Account Number"
        value={accountNumber}
        onChangeText={setAccountNumber}
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Amount to Withdraw"
        value={withdrawAmount.toString()}
        onChangeText={(value) => setWithdrawAmount(Number(value))}
        placeholderTextColor="#999"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleWithdraw}>
        <Text style={styles.buttonText}>Withdraw</Text>
      </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 17,
    
    
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: wp('1%'),
    marginBottom: hp('4%'),
    
  },
  headerText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: RFValue(18),
    right: wp('27%'),
  },
  lgheaderText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: RFValue(18),
    right: wp('57%'),
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  input: {
    width: 300,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
     justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: 300,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WithdrawalScreen;
