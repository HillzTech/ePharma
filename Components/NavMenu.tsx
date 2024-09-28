import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export const NavMenu: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const [nav, setNav] = useState(false);
  

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen);
    setNav(false); // Close the menu after navigation
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setNav(!nav)} style={styles.menuButton}>
        <Ionicons name="menu" size={30} color="black" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={nav}
        animationType="slide"
        onRequestClose={() => setNav(false)}
      >
        <View style={styles.overlay} />
        <View style={styles.drawer}>
          <TouchableOpacity onPress={() => setNav(false)} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.menu}>
            <TouchableOpacity onPress={() => handleNavigate('HomeScreen')} style={styles.menuItem}>
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('CategoryScreen')} style={styles.menuItem}>
              <Text style={styles.menuText}>Category</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('CustomerOrderScreen')} style={styles.menuItem}>
              <Text style={styles.menuText}>Order</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigate('AppointmentScreen')} style={styles.menuItem}>
              <Text style={styles.menuText}>Pharmacists</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
  },
  menuButton: {
    padding: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    backgroundColor: 'black',
    width: width * 0.8,
    height: '100%',
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  menu: {
    marginTop: 60, // Adjusted margin for better layout
    justifyContent: 'center',
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 19,
    color: 'white',
    fontFamily: 'Poppins-Bold',
  },
});
