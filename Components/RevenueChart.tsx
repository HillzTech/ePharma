import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BarChart } from 'react-native-chart-kit';
import { db } from './firebaseConfig';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Picker } from '@react-native-picker/picker';
import { RFValue } from 'react-native-responsive-fontsize';
import StrokedText from './StrokedText';
import { useAuth } from '../contexts/authContext';
import { Entypo, FontAwesome, Ionicons } from '@expo/vector-icons';

// Full month names and abbreviations
const fullMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthAbbreviations = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// Dynamically generate years from 2021 to the current year + 5
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2021 + 6 }, (_, i) => (2021 + i).toString());

// Fetch revenue data for all months of a given year
const fetchAnnualRevenueData = async (userId: string, year: string) => {
  const revenueData = [];
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const month = fullMonthNames[monthIndex];
    const revenueDocId = `${year}-${month}`;
    const revenueRef = doc(db, `users/${userId}/revenue/${revenueDocId}`);
    const revenueSnapshot = await getDoc(revenueRef);

    if (revenueSnapshot.exists()) {
      revenueData.push({
        month: monthAbbreviations[monthIndex],
        total: revenueSnapshot.data().total
      });
    } else {
      revenueData.push({
        month: monthAbbreviations[monthIndex],
        total: 0
      });
    }
  }
  return revenueData;
};

// Component to display the revenue chart
const RevenueChart = ({ userId }: { userId: string }) => {
  const [revenueData, setRevenueData] = useState<{ month: string; total: number }[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [allTotalRevenue, setAllTotalRevenue] = useState<number>(0);
  const [tooltipVisible, setTooltipVisible] = useState<{ [key: string]: boolean }>({}); // For tooltips
  const { user } = useAuth();

  // Set default value for the current year
  useEffect(() => {
    const now = new Date();
    setSelectedYear(now.getFullYear().toString());
  }, []);

  useEffect(() => {
    const loadRevenueData = async () => {
      if (selectedYear) {
        const data = await fetchAnnualRevenueData(userId, selectedYear);
        setRevenueData(data);
      }
    };

    loadRevenueData();
  }, [userId, selectedYear]);

  // Prepare data for the chart
  const chartData = {
    labels: revenueData.map(data => data.month),
    datasets: [
      {
        data: revenueData.map(data => data.total),
      },
    ],
    
  };

  // Calculate the total revenue for the selected year
  const totalRevenue = revenueData.reduce((sum, data) => sum + data.total, 0);

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
        setAllTotalRevenue(totalRevenue - totalWithdrawn);
      }
    };

    fetchRevenueAndWithdrawals();
  }, [user]);

  return (
    <View>
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('5%') }}>
          <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginTop: hp('2%') }}>
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={() => setTooltipVisible(prev => ({ ...prev, totalRevenue: !prev.totalRevenue }))}>
                <View style={styles.headerItem}>
                  <Text style={styles.headerText}>Total Balance</Text>
                  <Entypo name="info-with-circle" size={10} color="grey" />
                </View>
              </TouchableOpacity>
              {tooltipVisible.totalRevenue && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>Total balance represents the sum of all income available</Text>
                </View>
              )}
              <View style={styles.totalRevenueContainer}>
                <StrokedText
                  text={` #${allTotalRevenue.toFixed(2)}`}
                  strokeColor="white"
                  strokeWidth={3}
                  fontSize={RFValue(14)}
                />
              </View>
            </View>

            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={() => setTooltipVisible(prev => ({ ...prev, annualRevenue: !prev.annualRevenue }))}>
                <View style={styles.headerItem}>
                  <Text style={styles.headerText}>Annual Revenue</Text>
                  <Entypo name="info-with-circle" size={10} color="grey"/>
                </View>
              </TouchableOpacity>
              {tooltipVisible.annualRevenue && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>Annual revenue represents the total income made in the selected year.</Text>
                </View>
              )}
              <View style={styles.totalRevenueContainer}>
                <StrokedText
                  text={` #${totalRevenue.toFixed(2)}`}
                  strokeColor="white"
                  strokeWidth={3}
                  fontSize={RFValue(14)}
                />
              </View>
            </View>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              onValueChange={(itemValue: string | null) => setSelectedYear(itemValue)}
            >
              <Picker.Item label="Year" value={null} />
              {years.map((year, index) => (
                <Picker.Item key={index} label={year} value={year} />
              ))}
            </Picker>
          </View>
        </View>

        <ScrollView horizontal>
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              width={wp('97%')} // Adjust the width as needed
              height={hp('39%')}
              yAxisLabel="#"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: 'white',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity} )`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                barPercentage: 0.6,
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  fontSize: 10,
                },
                propsForVerticalLabels: {
                  fontSize: 10,
                },
                propsForHorizontalLabels: {
                  fontSize: 10,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 10,
              }}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: wp('9%'),
    bottom: hp('0.4%'),
  },
  picker: {
    height: hp('3%'),
    width: wp('40%'),
  },
  chartContainer: {
    alignItems: 'center', // Center the chart horizontally
    paddingHorizontal: 5,
  },
  headerContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: 'grey',
    fontFamily: 'OpenSans-Bold',
    fontSize: RFValue(10),
    marginRight: wp('0.2%'),
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: wp('2%'),
    borderRadius: 5,
    position: 'absolute',
    top: hp('5%'),
    zIndex: 1000,
  },
  tooltipText: {
    color: 'white',
    fontSize: RFValue(12),
  },
  totalRevenueContainer: {
    bottom: hp('0.3'),
  },
});

export default RevenueChart;
