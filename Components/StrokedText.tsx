import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface StrokedTextProps {
  text: string;
  strokeColor: string;
  strokeWidth: number;
  fontSize: number;
}

const StrokedText: React.FC<StrokedTextProps> = ({
  text,
  strokeColor,
  strokeWidth,
  fontSize,
}) => {
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          { fontSize: fontSize },
          { textShadowColor: strokeColor, textShadowRadius: strokeWidth },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  text: {
    fontFamily:'OpenSans-Bold',
    color: 'black',
    opacity:0.8
  },
});

export default StrokedText;
