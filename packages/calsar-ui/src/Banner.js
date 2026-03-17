import React, { useContext, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ThemeContext } from './ThemeContext';
import { textStyles } from './styles';

/**
 * Helper to calculate position-aware border radius for grouped elements
 */
const getGroupedRadius = (isGrouped, isFirst, isLast) => {
    if (!isGrouped) return { borderRadius: 26 };

    const big = 26;
    const small = 8;

    return {
        borderTopLeftRadius: isFirst ? big : small,
        borderTopRightRadius: isFirst ? big : small,
        borderBottomLeftRadius: isLast ? big : small,
        borderBottomRightRadius: isLast ? big : small,
    };
};

/**
 * Banner Component
 * Polished with animations and responsive grouped state support.
 */
export const Banner = ({
    title,
    icon,
    backgroundColor,
    color,
    pad = false,
    noRadius = false,
    noShadow = false,
    isGrouped = false,
    isFirst = false,
    isLast = false,
    onPress,
    children,
    selected
}) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();
    };

    const bgColor = backgroundColor || colorTheme.surfaceVariant;
    const textColor = color || colorTheme.onSurfaceVariant;

    const radiusStyles = noRadius ? { borderRadius: 0 } : getGroupedRadius(isGrouped, isFirst, isLast);

    const shadowStyle = {
        shadowColor: noShadow ? 'transparent' : colorTheme.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: noShadow || noRadius ? 0 : (isGrouped ? 0.08 : 0.15),
        shadowRadius: 3,
        elevation: noShadow || noRadius ? 0 : 1,
    };

    const containerStyle = [
        styles.card,
        radiusStyles,
        {
            backgroundColor: bgColor,
            marginHorizontal: pad ? 20 : 0,
            transform: [{ scale: scaleAnim }],
            ...shadowStyle
        }
    ];

    const Content = () => (
        <View style={styles.cardContent}>
            {icon && (
                <View style={styles.iconContainer}>
                    {React.isValidElement(icon) ? React.cloneElement(icon, { color: textColor }) : icon}
                </View>
            )}
            <View style={{ flexDirection: "column", flex: 1, gap: 2 }}>
                {title && (
                    <Text style={[
                        textStyle.text,
                        { color: textColor },
                        selected && { fontWeight: "bold" }
                    ]}>
                        {title}
                    </Text>
                )}
                {children}
            </View>
        </View>
    );

    return (
        <Animated.View style={containerStyle}>
            <Pressable
                accessibilityRole="button"
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                disabled={!onPress}
                android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                style={({ pressed }) => [
                    {
                        backgroundColor: (pressed && Platform.OS !== 'android') ? colorTheme.surfaceContainerHighest : 'transparent',
                        ...radiusStyles
                    }
                ]}>
                <Content />
            </Pressable>
        </Animated.View>
    );
};

/**
 * Banner Group
 */
export const BannerGroup = ({ children, marginHorizontal = 20 }) => {
    const count = React.Children.count(children);
    return (
        <View style={{ marginHorizontal }}>
            <View style={{ gap: 2 }}>
                {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            isGrouped: true,
                            isFirst: index === 0,
                            isLast: index === count - 1
                        });
                    }
                    return child;
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
    },
    cardContent: {
        flexDirection: 'row',
        columnGap: 14,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
