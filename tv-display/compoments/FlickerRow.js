import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';

const FlickerRow = ({ token, counter, isHighlighted, onPress, backgroundColor }) => {
  const [duration] = React.useState(300);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHighlighted) {
      animation.setValue(0);
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: duration,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isHighlighted]);

  const rowBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [backgroundColor, '#39FF14'],
  });

  return (
    <Animated.View style={[styles.tableRow, { backgroundColor: rowBackgroundColor }]}>
      <TouchableOpacity onPress={onPress} style={styles.rowContent}>
        <Text style={styles.tableCell}>{token}</Text>
        <Text style={styles.tableCell}>{counter}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rowContent: {
    flexDirection: 'row',
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderColor: '#ddd',
    paddingVertical: 7,
  },
  tableCell: {
    flex: 1,
    fontSize: 30,
    color: '#222',
    textAlign: 'center',
  },
});

export default FlickerRow;
