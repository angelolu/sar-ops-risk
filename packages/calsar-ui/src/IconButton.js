import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemeContext } from './ThemeContext';

export const IconButton = ({ ionicons_name, onPress, small = false, destructive = false, disabled = false, primary = false, tonal = false, color, size }) => {
    const { colorTheme, } = useContext(ThemeContext);
    const [focus, setFocus] = useState(false);
    const styles = buttonStyles();
    const disabledFun = () => { };

    const textColors = {
        basic: colorTheme.onSurfaceVariant,
        primary: colorTheme.onPrimary,
        disabled: colorTheme.onSurface,
        destructive: colorTheme.error,
        tonal: colorTheme.onSecondaryContainer,
    };

    const focusTheme = (focus && !disabled) ? { backgroundColor: colorTheme.surfaceContainerHigh } : {};

    if (ionicons_name) {
        return (
            <View style={[styles.baseContainer, small && styles.smallBaseContainer, disabled && styles.disabled, primary && styles.primary, tonal && styles.tonal]}>
                <Pressable
                    onHoverIn={() => { setFocus(true) }}
                    onHoverOut={() => { setFocus(false) }}
                    onPress={disabled ? disabledFun : onPress}
                    android_ripple={disabled || { color: colorTheme.surfaceContainerHighest }}
                    style={[styles.pressable, focusTheme]}>
                    <Ionicons name={ionicons_name} size={small ? 16 : (size || 24)} color={color || (disabled && textColors.disabled) || (destructive && textColors.destructive) || (primary && textColors.primary) || (tonal && textColors.tonal) || textColors.basic} />
                </Pressable >
            </View >
        );
    } else {
        // Just return a space holder
        return <View style={{ height: small ? 32 : 40 }} />
    }
};

const buttonStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    return StyleSheet.create({
        primary: {
            backgroundColor: colorTheme.primary
        },
        disabled: {
            backgroundColor: colorTheme.onSurface,
            opacity: 0.2
        },
        tonal: {
            backgroundColor: colorTheme.secondaryContainer,
        },
        baseContainer: {
            height: 40,
            width: 40,
            borderRadius: 20,
            overflow: 'hidden',
        },
        smallBaseContainer: {
            height: 32,
            width: 32,
            borderRadius: 16,
        },
        pressable: {
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
        }
    });
}