import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BarChart } from 'react-native-chart-kit';
import { db } from './firebaseConfig';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Picker } from '@react-native-picker/picker';
import { RFValue } from 'react-native-responsive-fontsize';
import StrokedText from './StrokedText';



// Full month names for the picker
const fullMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Abbreviations for the chart labels
const monthAbbreviations = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// Dynamically generate years from 2021 to the current year + 5
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2024 + 12 }, (_, i) => (2024 + i).toString());

// Fetch revenue data from Firestore
const fetchRevenueData = async (userId: string, selectedMonth: string, selectedYear: string) => {
  let revenueQuery;

  if (selectedMonth && selectedYear) {
    revenueQuery = query(
      collection(db, `users/${userId}/revenue`),
      where('month', '==', selectedMonth),
      where('year', '==', selectedYear)
    );
  } else {
    revenueQuery = collection(db, `users/${userId}/revenue`);
  }

  const revenueSnapshot = await getDocs(revenueQuery);
  const revenueData = revenueSnapshot.docs.map(doc => ({
    month: doc.data().month, // Use the 'month' field from Firestore document
    year: doc.data().year, // Use the 'year' field from Firestore document
    total: doc.data().total
  }));

  return revenueData;
};

// Component to display the revenue chart
const RevenueChart = ({ userId }: { userId: string }) => {
  const [revenueData, setRevenueData] = useState<{ month: string; total: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  useEffect(() => {
    const loadRevenueData = async () => {
      const data = await fetchRevenueData(userId, selectedMonth || '', selectedYear || '');
      setRevenueData(data);
    };

    loadRevenueData();
  }, [userId, selectedMonth, selectedYear]);

  // Prepare data for the chart
  const chartData = {
    labels: monthAbbreviations, // Use the month abbreviations for the chart
    datasets: [
      {
        data: monthAbbreviations.map((_, index) => {
          const entry = revenueData.find(data => data.month === fullMonthNames[index]);
          return entry ? entry.total : 0; // Default to 0 if no data for the month
        }),
      },
    ],
  };

  // Calculate the total revenue
const totalRevenue = revenueData.reduce((sum, data) => sum + data.total, 0);


  return (
    <View>
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal:wp('6%')}}>
        <View style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginTop:hp('2%')}}>
          <Text style={{ color: 'blue', fontFamily:'OpenSans-Bold', fontSize:RFValue(15) }}>Revenue</Text>
          <View style={{bottom:hp('0.3')}}>
          <StrokedText
        text={` #${totalRevenue.toFixed(2)}`}
        strokeColor="white"
        strokeWidth={3} 
        fontSize={RFValue(15)}
      
      />

          </View>
          
         
          </View>
          

          <View style={styles.pickerContainer}>
          <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={(itemValue: string | null) => setSelectedMonth(itemValue)}
            >
              <Picker.Item label="Month" value={null} />
              {fullMonthNames.map((month, index) => (
                <Picker.Item key={index} label={month} value={month} />
              ))}
            </Picker>

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
            width={wp('110%')} // Adjust the width as needed
            height={hp('37%')}
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
                fontSize: 9,
              },
              propsForVerticalLabels: {
                fontSize: 9,
              },
              propsForHorizontalLabels: {
                fontSize: 9,
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
    justifyContent: 'space-around',
    paddingHorizontal:wp('9%'),
    bottom:hp('0.4%')
    
  
  },
  picker: {
    height: hp('3%'),
    width: wp('29%'),
  },
 
  chartContainer: {
    alignItems: 'center', // Center the chart horizontally
   paddingHorizontal: 5
  },
});

export default RevenueChart;
