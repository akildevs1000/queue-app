import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from "expo-blur";

// THEME CONSTANTS
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

export default function LiveToken({ currentToken, nextToken }) {
    // Animation for "Now Serving" Pulse
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Trigger Pulse Animation when top token changes
    useEffect(() => {
        Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.05, duration: 200, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ]).start();
    }, [currentToken, pulseAnim]);

    

    return (
        <>
            <Animated.View style={[styles.nowServingCard, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.cardContentCentered}>
                    <Text style={styles.labelTitleCyan}>NOW SERVING</Text>

                    <View style={styles.tokenWrapper}>
                        <Text style={styles.hugeTokenText}>
                            {currentToken?.token || 'LQ0001'}
                        </Text>
                    </View>

                    <Text style={styles.counterTextLarge}>
                        Counter {currentToken?.counter || '00'}
                    </Text>
                </View>
            </Animated.View>

            <BlurView intensity={20} tint="dark" style={styles.nextTokenCard}>
                <View style={styles.cardContentCentered}>
                    <Text style={styles.labelTitleGray}>Previous TOKEN</Text>

                    <Text style={styles.bigTokenTextGray}>
                        {nextToken?.token || '--'}
                    </Text>

                    <Text style={styles.counterTextMedium}>
                        Counter {nextToken?.counter || '-'}
                    </Text>
                </View>
            </BlurView>
        </>
    );
}

const styles = StyleSheet.create({

    // 1. Now Serving Card
    nowServingCard: {
        flex: 2, // Takes up more space vertically
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.cyanBorder,
        backgroundColor: 'rgba(103, 232, 249, 0.05)', // slight cyan tint
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },

    cardContentCentered: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    labelTitleCyan: {
        color: COLORS.cyan,
        fontSize: 24,
        letterSpacing: 4,
        marginBottom: 10,
        opacity: 0.8,
    },


    tokenWrapper: {
        // Helps center the text and apply shadow
        shadowColor: COLORS.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },


    hugeTokenText: {
        color: COLORS.white,
        fontSize: 140, // Match text-[12rem] approx
        lineHeight: 150,
        includeFontPadding: false,
        textShadowColor: 'rgba(103, 232, 249, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        padding: 20,
        fontWeight: 700
    },
    counterTextLarge: {
        color: COLORS.white,
        fontSize: 36,
        letterSpacing: 1.5,
        marginTop: 10,
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
});
