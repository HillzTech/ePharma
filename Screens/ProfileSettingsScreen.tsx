import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { getAuth, updatePassword, updateEmail, deleteUser } from 'firebase/auth';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfileSettingsScreen = () => {
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false); // Notification state
  const auth = getAuth();
  const db = getFirestore();

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (user) {
      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password should be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match.');
        return;
      }
      try {
        await updatePassword(user, newPassword);
        Alert.alert('Success', 'Password changed successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to change password.');
      }
    } else {
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  const handleChangeEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateEmail(user, newEmail);
        Alert.alert('Success', 'Email changed successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to change email.');
      }
    } else {
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          { text: 'Cancel' },
          { 
            text: 'Delete', 
            onPress: async () => {
              try {
                // Delete user document from Firestore
                await deleteDoc(doc(db, 'users', user.uid));
                // Delete user account
                await deleteUser(user);
                Alert.alert('Success', 'Account deleted successfully.');
              } catch (error) {
                Alert.alert('Error', 'Failed to delete account.');
              }
            } 
          }
        ]
      );
    } else {
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  const handleBack = async () => {
    navigation.goBack();
  };

  const toggleNotifications = () => {
    setIsNotificationsEnabled(previousState => !previousState);
    Alert.alert('Notification Status', `Notifications have been turned ${isNotificationsEnabled ? 'off' : 'on'}.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{}}>
        <View style={{flexDirection: 'row', justifyContent: "space-around", alignItems: 'center', gap: wp('1%'),  marginBottom: hp('2%'),  right: wp('12%')}}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>

      {/* Notification Toggle */}
      <View style={styles.notificationToggle}>
        <Text style={styles.notificationText}>Enable Notifications</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="New Email"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity onPress={handleChangeEmail}  style={styles.button}>
        <Text style={styles.buttonText}>CHANGE EMAIL</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TextInput
        style={[styles.input]}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={handleChangePassword}  style={styles.button}>
        <Text style={styles.buttonText}>CHANGE PASSWORD</Text>
      </TouchableOpacity>

      <Text style={styles.deleteText}>Delete Account Permanently</Text>
      <TouchableOpacity onPress={handleDeleteAccount}  style={styles.deleteButton}>
        <Text style={styles.buttonText}>DELETE ACCOUNT</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp('4%'),
    backgroundColor:'#D3D3D3'
  },
  title: {
    fontSize: RFValue(19),
    marginBottom: hp('3%'),
    marginTop: hp('3%'),
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    right: wp('12%'),
  },
  input: {
    height: hp('6%'),
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: hp('3%'),
    marginBottom: hp('3%'),
    backgroundColor:'white'
  },
  button: {
    backgroundColor: 'blue',
    padding: wp('3%'),
    borderRadius: 10,
    width: wp('92%'),
    marginBottom: hp('4%'),
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: RFValue(15),
  },
  notificationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('4%'),
    paddingHorizontal: wp('2%'),
  },
  notificationText: {
    fontSize: RFValue(16),
    fontFamily: 'Poppins-Bold',
  },
  deleteText: {
    textAlign: 'center',
    color: 'black',
    fontFamily: 'Poppins-Bold',
    fontSize: RFValue(15),
    marginTop: hp('4%'),
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: wp('3%'),
    borderRadius: 10,
    width: wp('92%'),
    marginBottom: hp('4%'),
  },
});

export default ProfileSettingsScreen;
