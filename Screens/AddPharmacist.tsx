import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, doc, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Picker } from '@react-native-picker/picker'; // Correct import

interface Pharmacist {
    id: string;
    name: string;
    contactDetails: string;
    imageUrl: string;
    availability: string;
    daysAvailable: string; // Added for days of the week
}

const AddPharmacist: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const [name, setName] = useState('');
    const [countryCode, setCountryCode] = useState('+234'); // Default to Nigerian country code
    const [phoneNumber, setPhoneNumber] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [startTime, setStartTime] = useState('');
    const [startTimePeriod, setStartTimePeriod] = useState('AM'); // Default to AM
    const [endTime, setEndTime] = useState('');
    const [endTimePeriod, setEndTimePeriod] = useState('AM'); // Default to AM
    const [daysAvailable, setDaysAvailable] = useState<string>('Monday-Friday'); // Default days
    const [startDay, setStartDay] = useState<string>('Monday');
    const [endDay, setEndDay] = useState<string>('Friday');
    const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
    const [editingPharmacist, setEditingPharmacist] = useState<Pharmacist | null>(null);

    const auth = getAuth();
    const storage = getStorage();
    const db = getFirestore();

    useEffect(() => {
        fetchPharmacists();
    }, []);

    const fetchPharmacists = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'pharmacists'));
            const pharmacistList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pharmacist));
            console.log('Fetched pharmacists:', pharmacistList);
            setPharmacists(pharmacistList);
        } catch (error) {
            console.error('Error fetching pharmacists:', error);
        }
    };


    const handleImagePicker = async () => {
        const result = await launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (imageUri) {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const imageRef = ref(storage, `pharmacists/${name}.jpg`);
            await uploadBytes(imageRef, blob);
            const url = await getDownloadURL(imageRef);
            return url;
        }
        return null;
    };

    const handleAddOrUpdatePharmacist = async () => {
        const imageUrl = await uploadImage();
        const availability = `${startTime} ${startTimePeriod} - ${endTime} ${endTimePeriod}`;
        const contactDetails = `${countryCode} ${phoneNumber}`; // Combine country code and phone number
    
        try {
            if (editingPharmacist) {
                // Update existing pharmacist
                const pharmacistRef = doc(db, 'pharmacists', editingPharmacist.id);
                await updateDoc(pharmacistRef, {
                    name,
                    contactDetails,
                    imageUrl: imageUrl || editingPharmacist.imageUrl,
                    availability,
                    daysAvailable: `${startDay} - ${endDay}`, // Update selected days
                });
            } else {
                // Add new pharmacist
                await addDoc(collection(db, 'pharmacists'), {
                    name,
                    contactDetails,
                    imageUrl,
                    availability,
                    daysAvailable: `${startDay} - ${endDay}`, // Set selected days
                });
            }
    
            // Reset fields
            setName('');
            setCountryCode('+234'); // Reset to Nigerian country code
            setPhoneNumber('');
            setImageUri(null);
            setStartTime('');
            setStartTimePeriod('AM'); // Reset to AM
            setEndTime('');
            setEndTimePeriod('AM'); // Reset to AM
            setStartDay('Monday'); // Reset to default start day
            setEndDay('Friday'); // Reset to default end day
            setEditingPharmacist(null);
    
            // Fetch updated list of pharmacists
            await fetchPharmacists();
    
        } catch (error) {
            console.error('Error adding or updating pharmacist:', error); // Log any errors
        }
    };
    

    const handleEditPharmacist = (pharmacist: Pharmacist) => {
        setName(pharmacist.name);
        const [countryCode, phoneNumber] = pharmacist.contactDetails.split(' ');
        setCountryCode(countryCode);
        setPhoneNumber(phoneNumber);
        setImageUri(pharmacist.imageUrl);
        const [start, end] = pharmacist.availability.split(' - ');
        const [startHour, startPeriod] = start.split(' ');
        const [endHour, endPeriod] = end.split(' ');
        setStartTime(startHour);
        setStartTimePeriod(startPeriod);
        setEndTime(endHour);
        setEndTimePeriod(endPeriod);
        const [startDay, endDay] = pharmacist.daysAvailable.split(' - ');
        setStartDay(startDay); // Set start day
        setEndDay(endDay); // Set end day
        setEditingPharmacist(pharmacist);
    };

    const handleDeletePharmacist = async (id: string) => {
        await deleteDoc(doc(db, 'pharmacists', id));
        fetchPharmacists();
    };

    const handleBack = () => {
        navigation.navigate('AdminDashboard');
    };

    return (
        <SafeAreaView style={{ flex: 1, padding: hp('2%'), backgroundColor: '#D3D3D3',  }}>
          <StatusBar backgroundColor="black" barStyle="light-content"/>
            <View style={{ marginTop: Platform.OS === 'web'? 0: hp('-3%'), padding: hp('1%'), flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', right: wp('7%'), marginBottom: hp('3%') }}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name="chevron-back" size={30} color="black" />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(21), color: 'black' }}>Manage Pharmacists</Text>
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center'  }}> 
            <TextInput
                placeholder="Pharmacist Name"
                value={name}
                onChangeText={setName}
                style={{ borderWidth: 1, marginBottom: hp('2%'), padding: hp('1%'), width: 320, borderRadius: 10}}
            />

            {/* Country Code and Phone Number Input */}
            <View style={{ flexDirection: 'row', marginBottom: hp('2%') }}>
            
                <Picker
                    selectedValue={countryCode}
                    style={{ height: hp('5%'), width: 57}}
                    onValueChange={(itemValue: string) => setCountryCode(itemValue)}>
                    <Picker.Item label="+234 (Nigeria)" value="+234" />
                    <Picker.Item label="+1 (USA)" value="+1" />
                    <Picker.Item label="+44 (UK)" value="+44" />
                    <Picker.Item label="+91 (India)" value="+91" />
                    {/* Add more country codes as needed */}
                </Picker>
                <TextInput
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    style={{  borderWidth: 1, paddingHorizontal: hp('1%'), right: hp('0.2%'), width: 270, borderRadius:10 }}
                />
            </View>

           {/* Start Time Input with AM/PM Picker */}
<View style={{ flexDirection: 'row', marginBottom: hp('2%') }}>
    <TextInput
        placeholder="Start Time (e.g., 11:30)"
        value={startTime}
        onChangeText={setStartTime}
        style={{  borderWidth: 1, padding: hp('1%'), width: 250, borderRadius:10 }}
    />
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Picker
            selectedValue={startTimePeriod}
            style={{ width: 40 }}
            onValueChange={(itemValue: string) => setStartTimePeriod(itemValue)}>
            <Picker.Item label="AM" value="AM" />
            <Picker.Item label="PM" value="PM" />
        </Picker>
        <Text style={{ marginLeft: wp('2%') }}>{startTimePeriod}</Text>
    </View>
</View>

{/* End Time Input with AM/PM Picker */}
<View style={{ flexDirection: 'row', marginBottom: hp('0.4%') }}>
    <TextInput
        placeholder="End Time (e.g., 05:30)"
        value={endTime}
        onChangeText={setEndTime}
        style={{  borderWidth: 1, padding: hp('1%'),width: 250, borderRadius:10 }}
    />
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Picker
            selectedValue={endTimePeriod}
            style={{ width: 40 }}
            onValueChange={(itemValue: string) => setEndTimePeriod(itemValue)}>
            <Picker.Item label="AM" value="AM" />
            <Picker.Item label="PM" value="PM" />
        </Picker>
        <Text style={{ marginLeft: wp('2%') }}>{endTimePeriod}</Text>
    </View>
</View>


            {/* Day Picker for Start Day */}
            <Picker
                selectedValue={startDay}
                style={{ marginBottom: hp('0.5%'), borderWidth: 1, width: 150, borderRadius:10 }}
                onValueChange={(itemValue: string) => setStartDay(itemValue)}>
                <Picker.Item label="Monday" value="Monday" />
                <Picker.Item label="Tuesday" value="Tuesday" />
                <Picker.Item label="Wednesday" value="Wednesday" />
                <Picker.Item label="Thursday" value="Thursday" />
                <Picker.Item label="Friday" value="Friday" />
                <Picker.Item label="Saturday" value="Saturday" />
                <Picker.Item label="Sunday" value="Sunday" />
            </Picker>

            {/* Day Picker for End Day */}
            <Picker
                selectedValue={endDay}
                style={{ marginBottom: hp('2%'), borderWidth: 1, width: 150, borderRadius:10 }}
                onValueChange={(itemValue: string) => setEndDay(itemValue)}>
                <Picker.Item label="Monday" value="Monday" />
                <Picker.Item label="Tuesday" value="Tuesday" />
                <Picker.Item label="Wednesday" value="Wednesday" />
                <Picker.Item label="Thursday" value="Thursday" />
                <Picker.Item label="Friday" value="Friday" />
                <Picker.Item label="Saturday" value="Saturday" />
                <Picker.Item label="Sunday" value="Sunday" />
            </Picker>

            <Text style={{ marginBottom: hp('2%') }}>Selected Days: {startDay} - {endDay}</Text>

            {/* Image Picker */}

            <View style={{  marginBottom: hp('2%'), width: 200, borderRadius:10 }} >
            <Button title="Pick Image"  onPress={handleImagePicker} />

            </View>

            {imageUri && <Image source={{ uri: imageUri }} style={{ width: 100, height: 100, marginTop: hp('2%'), marginBottom: hp('2%') }} />}
             
            <View style={{  marginBottom: hp('2%'), width: 200, borderRadius:10 }} >
            <Button title={editingPharmacist ? "Update Pharmacist" : "Add Pharmacist"} onPress={handleAddOrUpdatePharmacist} />
            </View>

            </View> 

            <FlatList
    data={pharmacists}
    renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: hp('2%') }}>
            {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={{ width: 70, height: 70 }} />
            ) : (
                <View style={{ width: wp('20%'), height: hp('10%'), backgroundColor: '#D3D3D3' }} />
            )}
            <View>
                <Text>Name: {item.name}</Text>
                <Text>Contact: {item.contactDetails}</Text>
                <Text>Availability: {item.availability}</Text>
                <Text>Days Available: {item.daysAvailable}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => handleEditPharmacist(item)} style={{ marginRight: wp('2%') }}>
                    <FontAwesome name="edit" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePharmacist(item.id)}>
                    <FontAwesome name="trash" size={24} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    )}
    keyExtractor={(item) => item.id}
/>

        </SafeAreaView>
    );
};

export default AddPharmacist;
