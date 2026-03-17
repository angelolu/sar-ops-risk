import { Ionicons } from '@expo/vector-icons';
import { useContext, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { ThemeContext } from './ThemeContext';

/**
 * IconButton
 * A modern icon-only button with MD3 styling and spring animations.
 */
export const IconButton = ({
    ionicons_name,
    onPress,
    small = false,
    destructive = false,
    disabled = false,
    primary = false,
    tonal = false,
    outline = false,
    color,
    size
}) => {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const [hovered, setHovered] = useState(false);
    const styles = buttonStyles();

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (disabled) return;
        Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, speed: 20 }).start();
    };

    const handlePressOut = () => {
        if (disabled) return;
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    // Color Logic
    const colors = {
        primaryBg: colorTheme.primary,
        onPrimary: colorTheme.onPrimary,

        tonalBg: colorTheme.secondaryContainer,
        onTonal: colorTheme.onSecondaryContainer,

        outlineBorder: colorTheme.outline,
        onOutline: colorTheme.onSurfaceVariant,

        destructiveText: colorTheme.error,

        basicText: colorTheme.onSurfaceVariant,
        hoverBg: getHoverColor(colorTheme.onSurface, 0.08),
    };

    let finalBg = 'transparent';
    let finalIconColor = color || colors.basicText;
    let finalBorderColor = 'transparent';
    let finalBorderWidth = 0;

    if (disabled) {
        finalIconColor = getHoverColor(colorTheme.onSurface, 0.38);
        if (primary || tonal) finalBg = getHoverColor(colorTheme.onSurface, 0.12);
    } else if (primary) {
        finalBg = hovered ? getHoverColor(colors.primaryBg, 0.9) : colors.primaryBg;
        finalIconColor = color || colors.onPrimary;
    } else if (tonal) {
        finalBg = hovered ? getHoverColor(colors.tonalBg, 0.9) : colors.tonalBg;
        finalIconColor = color || colors.onTonal;
    } else if (outline) {
        finalBorderColor = colors.outlineBorder;
        finalBorderWidth = 1.5; // Standard MD3 border
        finalIconColor = color || colors.onOutline;
        if (hovered) finalBg = colors.hoverBg;
    } else {
        // Standard icon button
        if (hovered) finalBg = colors.hoverBg;
        if (destructive) finalIconColor = color || colors.destructiveText;
    }

    if (!ionicons_name) {
        return <View style={{ height: small ? 36 : 44, width: small ? 36 : 44 }} />;
    }

    return (
        <Animated.View style={[
            styles.baseContainer,
            small && styles.smallBaseContainer,
            {
                backgroundColor: finalBg,
                borderColor: finalBorderColor,
                borderWidth: finalBorderWidth,
                transform: [{ scale: scaleAnim }],
                opacity: disabled ? 0.6 : 1,
            }
        ]}>
            <Pressable
                onHoverIn={() => setHovered(true)}
                onHoverOut={() => setHovered(false)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={disabled ? () => { } : onPress}
                android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                style={styles.pressable}
            >
                <Ionicons
                    name={ionicons_name}
                    size={small ? 18 : (size || 24)}
                    color={finalIconColor}
                />
            </Pressable >
        </Animated.View >
    );
};

const buttonStyles = () => {
    return StyleSheet.create({
        baseContainer: {
            height: 44,
            width: 44,
            borderRadius: 22,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
        },
        smallBaseContainer: {
            height: 36,
            width: 36,
            borderRadius: 18,
        },
        pressable: {
            flex: 1,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }
    });
}