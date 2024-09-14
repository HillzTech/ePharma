import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Feather, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import firebase from 'firebase/compat';
import AdminChart from '../Components/AdminChart';
import AdminFooter from '../Components/AdminFooter';

const AdminDashboard: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const [selectedIcon, setSelectedIcon] = useState<string>('home');
    const [isLoading, setLoading] = useState(false);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [deliveredCount, setDeliveredCount] = useState(0);
    const [cancelledCount, setCancelledCount] = useState(0);

    const { width } = Dimensions.get('window');
    const iconSize = width < 395 ? 30 : 34;
    const smallSize = width < 395 ? 28 : 32;

    const handleIconPress = (iconName: string, screenName: string) => {
        setSelectedIcon(iconName);
        navigation.navigate(screenName);
    };

    const handleBack = () => {
        navigation.navigate('LoginScreen');
    };
    const handleRequest = () => {
        navigation.navigate('PendingWithdrawalsScreen');
    };
    const handleHistory = () => {
        navigation.navigate('CompletedWithdrawalsScreen');
    };

    useEffect(() => {
        const fetchOrderCounts = async () => {
            try {
                const ordersSnapshot = await firebase.firestore().collection('orders').get();

                let pending = 0;
                let delivered = 0;
                let cancelled = 0;
                let total = ordersSnapshot.size;

                ordersSnapshot.docs.forEach(doc => {
                    const order = doc.data();
                    if (order.status === 'Pending') pending++;
                    if (order.status === 'Delivered') delivered++;
                    if (order.status === 'Cancelled') cancelled++;
                });

                setPendingCount(pending);
                setDeliveredCount(delivered);
                setCancelledCount(cancelled);
                setTotalOrders(total);
            } catch (error) {
                console.error('Error fetching order counts:', error);
            }
        };

        fetchOrderCounts();
    }, []);

    const calculatePercentage = (count: number) => {
        if (totalOrders === 0) return 0;
        return ((count / totalOrders) * 100).toFixed(2);
    };

    useEffect(() => {
        const fetchTotalProducts = async () => {
            try {
                setLoading(true);
                const usersSnapshot = await firebase.firestore().collection('users').get();
                let totalProductsCount = 0;

                for (const userDoc of usersSnapshot.docs) {
                    const productsSnapshot = await userDoc.ref.collection('products').get();
                    totalProductsCount += productsSnapshot.size;
                }

                setTotalProducts(totalProductsCount);
            } catch (error) {
                console.error('Error fetching total products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTotalProducts();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ top: hp('3.5%'), padding: hp('1%'), flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', right: hp('7%'), marginBottom: hp('1.5%') }}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name="chevron-back" size={RFValue(30)} color="black" />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: RFValue(21), color: 'black', right: hp('4%') }}>Admin</Text>
            </View>

            <View>
                <AdminChart />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: wp('2%'), padding: wp('3%') }}>
                <View style={{ width: wp('45%'), paddingVertical: hp('2%'), backgroundColor: 'white', borderRadius: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('5%') }}>
                        <Feather name="activity" size={22} color="#FFD700" />
                        <FontAwesome name="long-arrow-right" size={17} color="black" />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('6%') }}>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(22) }}>{cancelledCount}</Text>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10) }}>{calculatePercentage(cancelledCount)}%</Text>
                    </View>
                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10), left: wp('5%'), opacity: 0.6, top: hp('0.2%') }}>Cancelled</Text>
                </View>

                <View style={{ width: wp('45%'), paddingVertical: hp('2%'), backgroundColor: 'white', borderRadius: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('5%') }}>
                        <FontAwesome5 name="user-plus" size={22} color="blue" opacity={0.5} />
                        <FontAwesome name="long-arrow-right" size={17} color="black" />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('6%') }}>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(22) }}>{pendingCount}</Text>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10) }}>{calculatePercentage(pendingCount)}%</Text>
                    </View>
                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10), left: wp('5%'), opacity: 0.6, top: hp('0.2%') }}>Pending</Text>
                </View>

                <View style={{ width: wp('45%'), paddingVertical: hp('2%'), backgroundColor: 'white', borderRadius: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('5%') }}>
                        <SimpleLineIcons name="layers" size={22} color="red" />
                        <FontAwesome name="long-arrow-right" size={17} color="black" />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('6%') }}>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(22) }}>{deliveredCount}</Text>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10) }}>{calculatePercentage(deliveredCount)}%</Text>
                    </View>
                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10), left: wp('5%'), opacity: 0.6, top: hp('0.2%') }}>Delivered</Text>
                </View>

                <View style={{ width: wp('45%'), paddingVertical: hp('1.6%'), backgroundColor: 'white', borderRadius: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('5%') }}>
                        <MaterialCommunityIcons name="target" size={28} color="blue" opacity={0.5} style={{ right: wp('1%') }} />
                        <FontAwesome name="long-arrow-right" size={17} color="black" />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('6%'), bottom: hp('0.45') }}>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(22) }}>{totalProducts}</Text>
                        
                    </View>
                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10), left: wp('5%'), opacity: 0.6, top: hp('0.2%') }}>Products</Text>
                </View>

                <TouchableOpacity onPress={handleRequest}>
            <View style={{ width: wp('45%'), paddingVertical: hp('2%'), backgroundColor: 'white', borderRadius: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('5%') }}>
                    <FontAwesome5 name="comments-dollar" size={22} color="red" />
                        <FontAwesome name="long-arrow-right" size={17} color="black" />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('6%') }}>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(22) }}></Text>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10) }}></Text>
                    </View>
                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10), left: wp('5%'), opacity: 0.6, top: hp('0.2%') }}>Payout Request</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleHistory}>
            <View style={{ width: wp('45%'), paddingVertical: hp('2%'), backgroundColor: 'white', borderRadius: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('5%') }}>
                    <FontAwesome5 name="comment-dollar" size={22} color="green" />
                        <FontAwesome name="long-arrow-right" size={17} color="black" />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('6%') }}>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(22) }}></Text>
                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10) }}></Text>
                    </View>
                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: RFValue(10), left: wp('5%'), opacity: 0.6, top: hp('0.2%') }}>Payout History</Text>
                </View>
            </TouchableOpacity>


            </View>


            
            <AdminFooter route={route} navigation={navigation}/>
<View style={{ top: hp('5%'), backgroundColor: 'black', height: hp('10%'),  }}>
              <></>
          </View>
           
        </SafeAreaView>
    );
};

export default AdminDashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e1e8e9',
    },
});
