import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BarChart } from 'react-native-chart-kit';
import { db } from './firebaseConfig'; // Ensure this path is correct
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Picker } from '@react-native-picker/picker';
import { RFValue } from 'react-native-responsive-fontsize';
import StrokedText from './StrokedText';
import { Entypo } from '@expo/vector-icons';

// Full month names and abbreviations
const fullMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const monthAbbreviations = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// Dynamically generate years from 2021 to the current year + 5
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2021 + 6 }, (_, i) => (2021 + i).toString());

// Fetch revenue data for all months of a given year for a specific user
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
const AdminChart = () => {
  const [revenueData, setRevenueData] = useState<{ month: string; total: number }[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [tooltipVisible, setTooltipVisible] = useState<{ [key: string]: boolean }>({});

  // Replace this with the actual user ID
  const userId = 'VdsO9TWkJlS9ItoohfAATFd0wPB3';

  useEffect(() => {
    const now = new Date();
    setSelectedYear(now.getFullYear().toString());
  }, []);

  useEffect(() => {
    const loadRevenueData = async () => {
      if (selectedYear && userId) {
        const data = await fetchAnnualRevenueData(userId, selectedYear);
        setRevenueData(data);

        // Calculate the total revenue for the selected year
        const total = data.reduce((sum, data) => sum + data.total, 0);
        setTotalRevenue(total);
      }
    };

    loadRevenueData();
  }, [selectedYear, userId]);

  // Prepare data for the chart
  const chartData = {
    labels: revenueData.map(data => data.month),
    datasets: [
      {
        data: revenueData.map(data => data.total),
      },
    ],
  };

  return (
    <View>
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp('5%') }}>
          <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginTop: hp('2%') }}>
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={() => setTooltipVisible(prev => ({ ...prev, annualRevenue: !prev.annualRevenue }))}>
                <View style={styles.headerItem}>
                  <Text style={styles.headerText}>Annual Revenue</Text>
                  <Entypo name="info-with-circle" size={10} color="grey"/>
                </View>
              </TouchableOpacity>
              {tooltipVisible.annualRevenue && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>Annual revenue represents the total income for the selected year.</Text>
                </View>
              )}
              <View style={styles.totalRevenueContainer}>
                <StrokedText
                  text={` #${totalRevenue.toFixed(2)}`}
                  strokeColor="white"
                  strokeWidth={3}
                  fontSize={15}
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
              width={windowWidth > 1000 ? wp('50%') : wp('97%')} // Adjust the width as needed
              height={windowWidth > 1000 ? hp('50%') : hp('30%')}
              yAxisLabel="#"
              yAxisSuffix="k"
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: 'white',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
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
    width: wp('37%'),
  },
  chartContainer: {
    alignItems: 'center', // Center the chart horizontally
    paddingHorizontal: 5,
    left:windowWidth > 700 ? wp('20%') : wp('0%')
  },
  headerContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: 'grey',
    fontFamily: 'OpenSans-Bold',
    fontSize: 11,
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
    fontSize: 13,
  },
  totalRevenueContainer: {
    bottom: hp('0.3'),
  },
});

export default AdminChart;
