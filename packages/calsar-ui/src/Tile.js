import { router } from 'expo-router';
import React, { useContext, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from './ThemeContext';
import { textStyles } from './styles';

/**
 * Helper to calculate position-aware border radius for grouped elements
 */
const getGroupedRadius = (isGrouped, isFirst, isLast, horizontal = false) => {
    if (!isGrouped) return { borderRadius: 12 };

    const big = 26;
    const small = 8;

    if (horizontal) {
        return {
            borderTopLeftRadius: isFirst ? big : small,
            borderBottomLeftRadius: isFirst ? big : small,
            borderTopRightRadius: isLast ? big : small,
            borderBottomRightRadius: isLast ? big : small,
        };
    }

    return {
        borderTopLeftRadius: isFirst ? big : small,
        borderTopRightRadius: isFirst ? big : small,
        borderBottomLeftRadius: isLast ? big : small,
        borderBottomRightRadius: isLast ? big : small,
    };
};

/**
 * Standard Horizontal Tile
 */
export const Tile = ({
    title,
    subtitle,
    children,
    icon,
    href = "",
    onPress,
    width = "auto",
    noRadius = false,
    noShadow = false,
    isGrouped = false,
    isFirst = false,
    isLast = false
}) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = tileStyles();
    const textStyle = textStyles();
    const textColor = textStyle.rowTitleTextPrimary.color;

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();
    };

    const radiusStyles = noRadius ? { borderRadius: 0 } : getGroupedRadius(isGrouped, isFirst, isLast);

    return (
        <Animated.View style={[
            styles.card,
            radiusStyles,
            {
                width: width,
                transform: [{ scale: scaleAnim }],
                // Individual shadows enabled for grouped items
                shadowColor: noShadow ? 'transparent' : colorTheme.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: noShadow || noRadius ? 0 : (isGrouped ? 0.08 : 0.1),
                shadowRadius: 3,
                elevation: noShadow || noRadius ? 0 : 1,
            }
        ]}>
            <Pressable
                accessibilityRole="button"
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => { onPress ? onPress() : href ? router.navigate(href) : null }}
                android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                style={({ pressed }) => [
                    {
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                        gap: 12,
                        backgroundColor: (pressed && Platform.OS !== 'android') ? colorTheme.surfaceContainerHighest : 'transparent',
                        ...radiusStyles
                    }
                ]}>
                <View style={{ flexDirection: "row", gap: 14, alignItems: "center", flex: 1 }}>
                    {icon && React.isValidElement(icon) ? React.cloneElement(icon, { color: textColor }) : icon}
                    <View style={{ flex: 1, gap: 2 }}>
                        {title && <Text style={textStyle.rowTitleTextPrimary}>{title}</Text>}
                        {subtitle && <Text style={textStyle.tertiaryText}>{subtitle}</Text>}
                    </View>
                </View>
                {children}
            </Pressable>
        </Animated.View>
    );
};

/**
 * Vertical Tile Component
 */
export const VerticalTile = ({
    title,
    icon,
    height,
    width,
    href = "",
    onPress,
    selected = false,
    backgroundColor,
    color,
    noRadius = false,
    noShadow = false,
    isGrouped = false,
    isFirst = false,
    isLast = false
}) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = tileStyles();
    const textStyle = textStyles();

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();
    };

    const bgColor = backgroundColor || (selected ? colorTheme.primaryContainer : colorTheme.surfaceContainer);
    const textColor = color || (selected ? colorTheme.onPrimaryContainer : colorTheme.primary);

    // For VerticalTile usually used in HorizontalTileGroup
    const radiusStyles = noRadius ? { borderRadius: 0 } : getGroupedRadius(isGrouped, isFirst, isLast, true);

    return (
        <Animated.View style={[
            styles.card,
            radiusStyles,
            {
                flexBasis: width ? undefined : 0,
                flexGrow: width ? 0 : 1,
                width: width,
                height: height,
                backgroundColor: bgColor,
                transform: [{ scale: scaleAnim }],
                // Individual shadows enabled
                shadowColor: noShadow ? 'transparent' : colorTheme.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: noShadow || noRadius ? 0 : (isGrouped ? 0.08 : 0.1),
                shadowRadius: 3,
                elevation: noShadow || noRadius ? 0 : 1,
            }
        ]}>
            <Pressable
                accessibilityRole="button"
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => { onPress ? onPress() : href ? router.navigate(href) : null }}
                android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                style={({ pressed }) => [
                    {
                        flex: 1,
                        padding: 10,
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: (pressed && Platform.OS !== 'android') ? colorTheme.surfaceContainerHighest : 'transparent',
                        ...radiusStyles
                    }
                ]}>
                <View style={{ minHeight: 40, alignItems: "center", justifyContent: "center" }}>
                    {icon && React.isValidElement(icon) ? React.cloneElement(icon, { color: textColor }) : icon}
                </View>
                {title && (
                    <View style={{ justifyContent: 'center' }}>
                        <Text
                            style={[
                                textStyle.rowTitleTextPrimary,
                                {
                                    textAlign: 'center',
                                    color: textColor,
                                    fontSize: 14,
                                    lineHeight: 18,
                                    fontFamily: selected ? 'Inter_700Bold' : 'Inter_400Regular'
                                },
                            ]}
                            numberOfLines={2}
                        >
                            {title}
                        </Text>
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
};

/**
 * Vertical Tile Group
 */
export const VerticalTileGroup = ({ children, marginHorizontal = 20 }) => {
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

/**
 * Horizontal Tile Group
 */
export const HorizontalTileGroup = ({ children, marginHorizontal = 20, height }) => {
    const count = React.Children.count(children);
    return (
        <View style={{ marginHorizontal }}>
            <View style={{ gap: 2, flexDirection: 'row', height }}>
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

const tileStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        card: {
            backgroundColor: colorTheme.surfaceContainer,
        },
    });
}