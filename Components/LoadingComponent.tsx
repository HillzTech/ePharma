import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';

const LoadingComponent: React.FC = () => {
  // Create animated value for rotation
  const rotation = new Animated.Value(0);

  // Animate the rotation
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  // Interpolate rotation value
  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </Animated.View>
      <Text style={styles.loadingText}>Loading, please wait...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  
    
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: RFValue(14),
    fontFamily: 'OpenSans-Regular',
    color: '#4A4A4A',
  },
});

export default LoadingComponent;
