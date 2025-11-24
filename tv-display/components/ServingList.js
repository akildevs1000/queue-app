import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated, Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const COLORS = {
  navyDeep: '#0A1024',
  navyMid: '#101836',
  cyan: '#67E8F9',
  cyanLow: 'rgba(103, 232, 249, 0.1)',
  cyanBorder: 'rgba(103, 232, 249, 0.4)',
  silver: '#C0C0C0',
  white: '#FFFFFF',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  cardBg: 'rgba(16, 24, 54, 0.5)',
};
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.navyDeep,
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 30,
    gap: 30, // Gap between columns
    backgroundColor: COLORS.navyDeep
  },

  // --- LEFT COLUMN ---
  leftColumn: {
    flex: 2, // 8 out of 12 columns approx
    flexDirection: 'column',
    gap: 30,
  },


  cardContentCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  // 2. Next Token Card
  nextTokenCard: {
    flex: 1, // Smaller height
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelTitleGray: {
    color: '#9CA3AF', // gray-400
    fontSize: 20,
    letterSpacing: 4,
    marginBottom: 5,
  },
  bigTokenTextGray: {
    color: '#E5E7EB', // gray-200
    fontSize: 80, // Match text-9xl approx
    lineHeight: 90,
    includeFontPadding: false,
  },
  counterTextMedium: {
    color: '#9CA3AF',
    fontSize: 24,
    letterSpacing: 1,
  },

  // --- RIGHT COLUMN ---
  rightColumn: {
    flex: 1, // 4 out of 12 columns
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
    alignItems: 'center',
    backgroundColor: 'rgba(10, 16, 36, 0.8)', // Slight background for header z-index
    zIndex: 10,
  },
  listHeaderTitle: {
    color: '#D1D5DB', // gray-300
    fontSize: 24,
    letterSpacing: 1,
  },

  // --- MARQUEE STYLES (New) ---
  marqueeMask: {
    flex: 1,
    overflow: 'hidden', // IMPORTANT: Hides the scrolling text
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: COLORS.navyDeep
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // Fades out the bottom 100px
    zIndex: 5,
  },

  // --- LIST ITEMS (Glass Look) ---
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    // bg-white/5
    backgroundColor: 'rgba(255, 255, 255, 0.05)',

    // rounded-lg
    borderRadius: 16,

    // p-4 / p-6 (adjusted)
    paddingVertical: 20,
    paddingHorizontal: 24,

    // Space between items
    marginBottom: 16,

    // Border (hover effect simulation)
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',

    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  listItemToken: {
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  listItemCounter: {
    fontSize: 20,
    color: '#9CA3AF', // Gray-400
    textAlign: 'right',
  },
  emptyListText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});
const ServingList = ({ tokens = [] }) => {

  // --- MARQUEE ANIMATION LOGIC ---
  const scrollY = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentHeight > 0) {
      scrollY.setValue(0);

      const duration = contentHeight * 40; // adjust speed

      const animate = () => {
        Animated.timing(scrollY, {
          toValue: -contentHeight,
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            // Reset scroll to top and restart
            scrollY.setValue(0);
            animate();
          }
        });
      };

      animate(); // start animation
    }
  }, [contentHeight, tokens]);



  return (
    <BlurView intensity={20} tint="dark" style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Serving List</Text>
      </View>

      {/* MARQUEE CONTAINER */}
      <View style={styles.marqueeMask}>
        <Animated.View
          style={{
            transform: [{ translateY: scrollY }]
          }}
        >
          <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
            {tokens.map((item, index) => (
              <View key={`orig-${index}`} style={styles.listItem}>
                <Text style={styles.listItemToken}>{item.token}</Text>
                <Text style={styles.listItemCounter}>Counter {item.counter}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>


      {/* Optional: Bottom Gradient to fade out smoothly */}
      <LinearGradient
        colors={['transparent', COLORS.navyDeep]}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </BlurView>
  );
}

export default ServingList;