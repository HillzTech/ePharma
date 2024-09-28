import React from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

const LoadingOverlay: React.FC = () => {
  // Animated value for rotation
  const rotateValue = new Animated.Value(0);

  // Start the rotation animation
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateValue]);

  // Interpolate rotation value to degrees
  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.spinner,
            {
              transform: [{ rotate }],
            },
          ]}
        />
        <Text style={styles.loadingText}>Loading, please wait...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 5,
    borderTopColor: '#FF5733', // Red-orange
    borderRightColor: '#33FF57', // Green
    borderBottomColor: '#3357FF', // Blue
    borderLeftColor: '#FF33A1', // Pink
    marginBottom: hp('3%'),
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Bold',
    color: '#FFFFFF',
  },
});

export default LoadingOverlay;
