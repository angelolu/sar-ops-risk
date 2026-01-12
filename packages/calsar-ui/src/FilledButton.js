import { useContext, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';
import { textStyles } from './styles';

export const FilledButton = ({
    text,
    onPress,
    small = false,
    icon = false,
    disabled = false,
    destructive = false,
    primary = false,
    rightAlign = false,
    backgroundColor,
    selected = false
}) => {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const [hovered, setHovered] = useState(false);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);
    const buttonStyle = buttonStyles();

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (disabled) return;
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 20 }).start();
    };

    const handlePressOut = () => {
        if (disabled) return;
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    // Standard MD3 Dynamic Color Logic
    const colors = {
        // Sharpened disabled state: Use higher contrast, less blur (no opacity)
        disabledBg: colorTheme.surfaceContainerLow,
        disabledText: colorTheme.outline,

        primaryBg: hovered ? getHoverColor(colorTheme.primary, 0.9) : colorTheme.primary,
        onPrimary: colorTheme.onPrimary,

        tonalBg: hovered ? colorTheme.secondaryContainer : colorTheme.surfaceContainerHigh,
        onTonal: colorTheme.onSecondaryContainer,

        selectedBg: colorTheme.secondary,
        onSelected: colorTheme.onSecondary,

        destructiveText: colorTheme.error,
        destructiveBg: hovered ? getHoverColor(colorTheme.error, 0.1) : 'transparent',
    };

    let finalBg = backgroundColor || colors.tonalBg;
    let finalTextColor = colors.onTonal;
    let finalBorderColor = 'transparent';
    let finalBorderWidth = 0;

    if (disabled) {
        finalBg = colors.disabledBg;
        finalTextColor = colors.disabledText;
    } else if (selected) {
        finalBg = colors.selectedBg;
        finalTextColor = colors.onSelected;
    } else if (primary) {
        finalBg = colors.primaryBg;
        finalTextColor = colors.onPrimary;
    } else if (destructive) {
        finalBg = colors.destructiveBg;
        finalTextColor = colors.destructiveText;
        finalBorderColor = colorTheme.error;
        finalBorderWidth = 1;
    } else {
        finalBg = colors.tonalBg;
        finalTextColor = colors.onTonal;
    }

    return (
        <Animated.View style={[
            buttonStyle.baseContainer,
            small && buttonStyle.smallBaseContainer,
            rightAlign && { alignSelf: 'flex-end' },
            {
                backgroundColor: finalBg,
                borderColor: finalBorderColor,
                borderWidth: finalBorderWidth,
                transform: [{ scale: scaleAnim }],
                flexShrink: 0,
            }
        ]}>
            <Pressable
                onHoverIn={() => setHovered(true)}
                onHoverOut={() => setHovered(false)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={disabled ? () => { } : onPress}
                android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                style={[buttonStyle.pressable, small && buttonStyle.smallPressable]}
            >
                <View style={{ flexDirection: 'row', gap: 8, alignItems: "center" }}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={small ? 16 : 18}
                            color={finalTextColor}
                        />
                    )}
                    <Text style={[
                        textStyle.buttonText,
                        {
                            color: finalTextColor,
                            fontWeight: '500', // REDUCED weight as requested
                            // Flair: Extremely subtle text shadow for depth
                            textShadowColor: 'rgba(0, 0, 0, 0.05)',
                            textShadowOffset: { width: 0, height: 0.5 },
                            textShadowRadius: 0.5,
                        }
                    ]}>
                        {text}
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
    );
};

export const SegmentedButtons = ({
    items,
    selected,
    onPress,
    noCheck = false,
    small = false,
    grow = false,
    disabled = false,
    destructive = false,
    primary = false
}) => {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const buttonStyle = buttonStyles();
    const textStyle = textStyles(colorTheme, width);

    const borderColor = disabled ? getHoverColor(colorTheme.onSurface, 0.12) : colorTheme.outline;

    return (
        <View style={[
            buttonStyle.segmentedContainer,
            small && buttonStyle.smallBaseContainer,
            grow && { width: "100%" },
            { borderColor, borderWidth: 1 }
        ]}>
            {items.map((item, i) => {
                const isSelected = i === selected;
                const isFirst = i === 0;

                const itemBg = isSelected
                    ? colorTheme.secondaryContainer
                    : 'transparent';

                const itemTextColor = isSelected
                    ? colorTheme.onSecondaryContainer
                    : (disabled ? colorTheme.outline : colorTheme.onSurface);

                return (
                    <Pressable
                        key={item}
                        onPress={disabled ? () => { } : () => onPress(i)}
                        android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                        style={({ pressed }) => [
                            buttonStyle.segmentedItem,
                            grow && { flex: 1 },
                            {
                                backgroundColor: isSelected ? itemBg : (pressed ? colorTheme.surfaceContainerLow : 'transparent'),
                                borderLeftWidth: isFirst ? 0 : 0.5,
                                borderColor: colorTheme.outlineVariant,
                            }
                        ]}
                    >
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: "center", justifyContent: 'center' }}>
                            {isSelected && !noCheck && (
                                <Ionicons
                                    name="checkmark"
                                    size={small ? 16 : 18}
                                    color={itemTextColor}
                                />
                            )}
                            <Text style={[
                                textStyle.buttonText,
                                {
                                    color: itemTextColor,
                                    fontWeight: isSelected ? '500' : '400', // REDUCED
                                    fontSize: small ? 12 : 14
                                }
                            ]}>
                                {item}
                            </Text>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
};

const buttonStyles = () => {
    return StyleSheet.create({
        baseContainer: {
            height: 48,
            borderRadius: 24,
            overflow: 'hidden',
            justifyContent: 'center',
            ...Platform.select({
                ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                },
                android: {
                    elevation: 1,
                }
            })
        },
        smallBaseContainer: {
            height: 38,
            borderRadius: 19,
        },
        segmentedContainer: {
            height: 48,
            borderRadius: 24,
            flexDirection: 'row',
            overflow: 'hidden',
        },
        segmentedItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 12,
            height: '100%',
        },
        pressable: {
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
        },
        smallPressable: {
            paddingHorizontal: 16,
        },
    });
};