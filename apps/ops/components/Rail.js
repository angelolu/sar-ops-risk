import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useEffect, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { ThemeContext } from 'calsar-ui';

const HikerBG = require('../assets/images/hiker.svg');

export function RailButton({ icon, title, active, onClick }) {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const [focus, setFocus] = useState(false);

    let focusColor = active ? getHoverColor(colorTheme.secondaryFixed, 0.8) : getHoverColor(colorTheme.primary, 0.3);
    const focusTheme = (focus) ? {
        backgroundColor: focusColor,
    } : {};

    return (
        <Pressable
            onHoverIn={() => { setFocus(true) }}
            onHoverOut={() => { setFocus(false) }}
            onPress={onClick}
            android_ripple={{ color: colorTheme.surfaceContainerHigh }}
            style={[{
                width: 90,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                paddingVertical: 12
            },

            ]}>
            <View style={[{ backgroundColor: active ? colorTheme.secondaryFixed : "transparent", height: 28, justifyContent: "center", alignItems: "center", width: 50, borderRadius: 14 }, focusTheme]}>
                <Ionicons name={active ? icon : `${icon}-outline`} size={active ? 20 : 22} color={active ? colorTheme.onSecondaryFixed : colorTheme.primary} />
            </View>
            {title && <Text style={{ color: colorTheme.onPrimaryContainer, textAlign: 'center', fontSize: 12, fontWeight: active ? "bold" : "normal" }}>{title}</Text>}
        </Pressable>

    );
}

export default function RailContainer({ tabs, activeTab, setActiveTab, image = false, error = false, warn = false, readOnly = false }) {
    const styles = pageStyles();
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const activeTabContent = tabs.find(tab => tab.name === activeTab)?.content;
    const { width } = useWindowDimensions();
    const [errorSate, setErrorState] = useState(false);
    const [warnState, setWarnState] = useState(false);
    const [currentAB, setCurrentAB] = useState(0); // 0 is A, 1 is B
    const [colorA, setColorA] = useState(colorTheme.background);
    const [colorB, setColorB] = useState(colorTheme.background);

    // Animation stuff
    const bgOpacity = useSharedValue(1); // Shared value for opacity
    const progress = useSharedValue(0); // Shared value for color
    const bgAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: bgOpacity.value,
            backgroundColor: interpolateColor(progress.value, [0, 1], [colorA, colorB])
        };
    });

    const animateBanner = () => {
        if (image > bgOpacity.value) {
            bgOpacity.value = withTiming(image || 0, { duration: 250, easing: Easing.linear });
        } else {
            bgOpacity.value = withTiming(image || 0, { duration: 750, easing: Easing.linear });
        }
        if (image === 1) {
            setColor(colorTheme.background, 250);
        } else {
            setColor(getColor(error, warn))
        }
    }

    const setColor = (color, duration = 500) => {
        if (currentAB === 0) {
            setColorB(color);
            setCurrentAB(1);
            setTimeout(() => {
                progress.value = withTiming(1, { duration: duration, easing: Easing.linear });
            }, 250);
        } else {
            setColorA(color);
            setCurrentAB(0);
            setTimeout(() => {
                progress.value = withTiming(0, { duration: duration, easing: Easing.linear });
            }, 250);
        }
    }

    const getColor = (error, warn) => {
        if (error) {
            return (colorScheme === 'dark' ? "#1A0001" : "#fff0ef");
        } else if (warn) {
            return (colorScheme === 'dark' ? "#261900" : "#fff5e7");
        }
        else {
            return (colorTheme.background);
        }
    }
    useEffect(() => {
        if (error != errorSate || warn != warnState) {
            setColor(getColor(error, warn));
            setErrorState(error);
            setWarnState(warn);
        }
    }, [error, errorSate, warn, warnState]);

    useEffect(() => {
        if (image) animateBanner();
    }, [image]);

    return (
        <View style={{ flexGrow: 1, flexShrink: 1, flexDirection: "row", backgroundColor: colorTheme.primaryContainer }}>
            {!readOnly &&
                <ScrollView
                    style={{ flexGrow: 0, width: 90 }}
                    contentContainerStyle={{ flexGrow: 1, flexDirection: "column", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "column" }}>
                        {tabs.filter(item => !item.bottom).map(item => (
                            <RailButton key={item.name} title={item.name} icon={item.icon} active={item.name === activeTab} onClick={() => { item.function ? item.function() : setActiveTab(item.name) }} bottom={item.bottom} />
                        ))}
                    </View>
                    <View style={{ flexDirection: "column" }}>
                        {tabs.filter(item => item.bottom).map(item => (
                            <RailButton key={item.name} title={item.name} icon={item.icon} active={item.name === activeTab} onClick={() => { item.function ? item.function() : setActiveTab(item.name) }} bottom={item.bottom} />
                        ))}
                    </View>
                </ScrollView>}
            <ImageBackground source={image && HikerBG} resizeMode="cover" style={[styles.image, readOnly && { borderTopLeftRadius: 0 }]}>
                <Animated.View style={[styles.overlayView, bgAnimatedStyle, readOnly && { borderTopLeftRadius: 0 }]} />
                <View style={[styles.container]}>
                    <ScrollView
                        contentContainerStyle={[styles.mainScroll, { width: readOnly ? width - 10 : ((width > 1080 ? 1080 : width) - 90 - 10) }]}>
                        {activeTabContent}
                    </ScrollView>
                </View>
            </ImageBackground>
        </View>
    );
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        mainScroll: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingRight: 10,
            paddingLeft: 20,
            gap: 20,
        },
        image: {
            flex: 1,
            height: '100%',
            alignSelf: 'center',
            backgroundColor: colorTheme.background,
            borderTopLeftRadius: 20,
            width: "100%"
        },
        overlayView: {
            height: "100%",
            width: "100%",
            position: 'absolute',
            borderTopLeftRadius: 20,
            backgroundColor: colorTheme.background
        },
        container: {
            flex: 1,
            height: '100%',
            alignSelf: 'center',
        },
        text: {
            color: colorTheme.onPrimaryContainer
        },
        timerSection: {
            gap: 4,
            borderRadius: 26,
            overflow: 'hidden',
        },
    });
}