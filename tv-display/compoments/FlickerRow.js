import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';

const FlickerRow = ({ token, counter, isHighlighted, onPress, backgroundColor }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHighlighted) {
      animation.setValue(0);
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isHighlighted]);

  const rowBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [backgroundColor, '#fff9c4'],
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
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 40,
    color: '#222',
    textAlign: 'center',
  },
});

export default FlickerRow;
