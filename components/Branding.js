
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from 'react-native-reanimated';

export default function BrandingBar({ headerStyle, center = false }) {
    const textOpacity = useSharedValue(1); // Shared value for opacity
    const subtitleTranslateX = useSharedValue(0);
    const subtitleDisplay = useSharedValue('flex');
    const subtitleW = useSharedValue(0);

    const titleAnimatedStyle = useAnimatedStyle(() => {
        if (!center) return {};
        return {
            transform: [
                {
                    translateX: -subtitleTranslateX.value,
                },
            ]
        };
    });

    const subtitleAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: textOpacity.value,
            transform: [
                {
                    translateX: subtitleTranslateX.value,
                },
            ],
            display: subtitleDisplay.value
        };
    });

    // Animation on load
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            textOpacity.value = withTiming(0, { duration: 750, easing: Easing.linear });
            subtitleTranslateX.value = withTiming(-(subtitleW.value / 2), { duration: 750, easing: Easing.back(2) });
        }, 2500);
    });

    return (
        <View
            style={styles.brandingBanner}>
            <Animated.Text style={[styles.Title, { backgroundColor: headerStyle.backgroundColor, color: headerStyle.color }, titleAnimatedStyle]}>OpsRisk</Animated.Text>
            <Animated.Text
                style={[styles.Subtitle, subtitleAnimatedStyle]}
                onLayout={(event) => {
                    const { x, y, width, height } = event.nativeEvent.layout;
                    subtitleW.value = width;
                }}> by CALSAR</Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    brandingBanner: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',
        columnGap: 0,
    },
    Title: {
        fontSize: 26,
        fontWeight: "bold",
        zIndex: 5
    },
    Subtitle: {
        fontSize: 22,
        color: "#44464f",
        marginBottom: 2
    },
});