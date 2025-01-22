
import React, { useContext, useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { ThemeContext } from './ThemeContext';

const calsar = require('../assets/calsar_150.png');

var bannerAnimationTimeout;
var bannerHoverTimeout;

export function BrandingBar({ textColor, title, menuButton }) {
    const wordmarkOpacity = useSharedValue(1); // Shared value for opacity
    const titleOpacity = useSharedValue(0);
    const workmarkDisplay = useSharedValue('flex');
    const titleDisplay = useSharedValue('none');

    const styles = brandingStyles();

    const titleAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: titleOpacity.value,
            display: titleDisplay.value
        };
    });

    const wordmarkAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: wordmarkOpacity.value,
            display: workmarkDisplay.value
        };
    });

    const animateBanner = () => {
        clearTimeout(bannerAnimationTimeout);
        wordmarkOpacity.value = 1;
        titleDisplay.value = "none";
        workmarkDisplay.value = "flex";
        titleOpacity.value = 0;

        bannerAnimationTimeout = setTimeout(() => {
            wordmarkOpacity.value = withTiming(0, { duration: 500, easing: Easing.linear });
            setTimeout(() => {
                titleDisplay.value = "flex";
                workmarkDisplay.value = "none";
                titleOpacity.value = withTiming(1, { duration: 500, easing: Easing.linear });
            }, 500);
        }, 2500);
    }

    // Animation on load
    useEffect(() => {
        animateBanner();
        return () => {
            wordmarkOpacity.value = 0;
            titleDisplay.value = "flex";
            workmarkDisplay.value = "none";
            titleOpacity.value = 1;
        };
    }, []);

    const windowWidth = Dimensions.get('window').width;
    if (windowWidth > 600) {
        return (
            <View style={styles.brandingBanner}>
                <View style={styles.webWorkmarkContainer}>
                    <Image
                        source={calsar}
                        style={{ width: 35, height: 35, zIndex: 999 }}
                    />
                    <View style={styles.wordmarkStack}>
                        <Text style={styles.wordmarkLine1}>CALIFORNIA</Text>
                        <Text style={styles.wordmarkLine2}>SEARCH & RESCUE</Text>
                    </View>
                </View>
                <Text style={[styles.title, { color: textColor, flex: 1, textAlign: (windowWidth > 1000 ? "center" : "right") }]}>{title}</Text>
                {windowWidth > 1000 && (menuButton ?
                    <View style={[styles.menuContainer]}>
                        {menuButton}
                    </View>
                    :
                    <View style={{ flex: 1 }} />
                )}
            </View >
        );
    } else {
        // Reanimate the banner if the mouse is hovering for over 500 ms
        // This way it's not too distracting but still a fun easter egg
        const onBannerEnter = () => {
            bannerHoverTimeout = setTimeout(() => {
                animateBanner();
            }, 500);
        }

        const onBannerExit = () => {
            clearInterval(bannerHoverTimeout);
        }
        return (
            <View style={styles.brandingBanner} onTouchEnd={animateBanner} onPointerEnter={onBannerEnter} onPointerLeave={onBannerExit} onPointerUp={animateBanner}>
                <Animated.Image
                    source={calsar}
                    style={{ width: 35, height: 35, zIndex: 999 }}
                />
                <Animated.View style={[wordmarkAnimatedStyle, styles.wordmarkStack]}>
                    <Text style={styles.wordmarkLine1}>CALIFORNIA</Text>
                    <Text style={styles.wordmarkLine2}>SEARCH & RESCUE</Text>
                </Animated.View>
                <Animated.Text style={[styles.title, titleAnimatedStyle, { color: textColor }]}>{title}</Animated.Text>
            </View>
        );
    }
}

const brandingStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        brandingBanner: {
            marginTop: 14,
            marginLeft: 20,
            marginRight: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            height: 32,
        },
        menuContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
            flex: 1,
            alignItems: "flex-end"
        },
        webWorkmarkContainer: {
            flex: 1,
            gap: 12,
            flexDirection: 'row',
            alignItems: 'center',
        },
        title: {
            fontSize: 20,
            zIndex: 5,
            color: colorTheme.white,
            fontWeight: '600'
        },
        wordmarkStack: {
            flex: 1,
            flexDirection: 'column',
        },
        wordmarkLine1: {
            fontSize: 13,
            color: colorTheme.white,
        },
        wordmarkLine2: {
            fontSize: 16,
            color: colorTheme.white,
            fontWeight: 'bold'
        },
    });
}