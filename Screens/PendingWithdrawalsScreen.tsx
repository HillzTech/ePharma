import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../Components/firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns'; // Import date-fns for date formatting
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const PendingWithdrawalsScreen = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    const fetchPendingWithdrawals = async () => {
      const withdrawalRef = collection(db, 'withdrawals');
      const withdrawalDocs = await getDocs(withdrawalRef);

      const pendingWithdrawals = withdrawalDocs.docs
        .filter(doc => doc.data().status === 'pending')
        .map(doc => ({ id: doc.id, ...doc.data() }));

      setWithdrawals(pendingWithdrawals);
    };

    fetchPendingWithdrawals();
  }, []);

  const handleCompleteWithdrawal = async (id: string) => {
    const withdrawalDocRef = doc(db, 'withdrawals', id);
    await updateDoc(withdrawalDocRef, { status: 'completed' });

    // Update UI
    setWithdrawals(withdrawals.filter((withdrawal) => withdrawal.id !== id));
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.withdrawalItem}>
      <Text style={styles.label}>Pharmacy Name:</Text>
      <Text style={styles.value}>{item.pharmacyName}</Text>

      <Text style={styles.label}>Phone Number:</Text>
      <Text style={styles.value}>{item.pharmacyPhone}</Text>

      <Text style={styles.label}>Bank Name:</Text>
      <Text style={styles.value}>{item.bankName}</Text>

      <Text style={styles.label}>Account Name:</Text>
      <Text style={styles.value}>{item.accountName}</Text>

      <Text style={styles.label}>Account Number:</Text>
      <Text style={styles.value}>{item.accountNumber}</Text>
      
      <Text style={styles.label}>Amount:</Text>
      <Text style={styles.value}>N{item.amount}</Text>

      <Text style={styles.label}>Date:</Text>
      <Text style={styles.value}>
        {item.date ? format(new Date(item.date.toDate()), 'MMM d, yyyy h:mm a') : 'N/A'}
      </Text>

      <Text style={styles.label}>Status:</Text>
      <Text style={styles.value}>{item.status}</Text>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => handleCompleteWithdrawal(item.id)}
      >
        <Text style={styles.completeButtonText}>Mark as Completed</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pending Withdrawals</Text>
      <FlatList
        data={withdrawals}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D3D3',
    padding: hp('3%'),
  },
  header: {
    fontSize: RFValue(18),
    fontFamily: 'Poppins-Bold',
    marginBottom: hp('3%'),
    marginTop: hp('2%'),
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    paddingBottom: hp('3%'),
  },
  withdrawalItem: {
    backgroundColor: '#fff',
    padding: hp('3%'),
    borderRadius: 8,
    marginBottom: hp('1%'),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    fontSize: RFValue(14),
    fontFamily: 'Poppins-Bold',
    color: '#555',
  },
  value: {
    fontSize: RFValue(13),
    fontFamily: 'Poppins-Regular',
    marginBottom: hp('1%'),
    color: '#333',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: hp('2%'),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  completeButtonText: {
    color: '#fff',
    fontSize: RFValue(15),
    fontFamily: 'Poppins-Bold',
  },
});

export default PendingWithdrawalsScreen;
