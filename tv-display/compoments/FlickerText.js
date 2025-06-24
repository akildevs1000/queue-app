import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';

const FlickerRow = ({ token, counter, isHighlighted, onPress }) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHighlighted) {
      animation.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
          }),
        ]),
        { iterations: 6 }
      ).start();
    }
  }, [isHighlighted]);

  const flickerColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(34,34,34,1)', 'rgba(34,139,34,1)'], // dark gray to green
  });

  const flickerOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.3], // fully visible to faded
  });

  return (
    <Animated.View style={styles.tableRow}>
      <TouchableOpacity onPress={onPress} style={styles.rowContent}>
        <Animated.Text style={[styles.tableCell, { color: flickerColor, opacity: flickerOpacity }]}>
          {token}
        </Animated.Text>
        <Animated.Text style={[styles.tableCell, { color: flickerColor, opacity: flickerOpacity }]}>
          {counter}
        </Animated.Text>
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
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    fontSize: 30,
    textAlign: 'center',
  },
});

export default FlickerRow;
