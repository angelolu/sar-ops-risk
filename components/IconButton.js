import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable } from 'react-native';
import { useContext } from 'react';

import { ThemeContext } from '../components/ThemeContext';

const IconButton = ({ ionicons_name, onPress, disabled = false, primary = false, tonal = false, color, size}) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = buttonStyles();
    const textColors = textStyles();

    const disabledFun = () => { };

    return (
        <View style={[styles.baseContainer, disabled && (primary || tonal) && styles.disabled, primary && styles.primary, tonal && styles.tonal]}>
            <Pressable
                onPress={disabled ? disabledFun : onPress}
                android_ripple={disabled || { color: colorTheme.surfaceContainerHighest }}
                style={styles.pressable}>
                <Ionicons name={ionicons_name} size={size || 24} color={color || (disabled && textColors.disabled) ||  (primary && textColors.primary) || tonal && textColors.tonal || textColors.basic} />
            </Pressable >
        </View >
    );
};

const buttonStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    return StyleSheet.create({
    primary: {
        backgroundColor: colorTheme.primary
    },
    disabled: {
        backgroundColor: colorTheme.onSurface,
        opacity: 0.12
    },
    tonal:{
        backgroundColor: colorTheme.secondaryContainer,
    },
    baseContainer: {
        alignSelf: 'flex-end',
        height: 40,
        width: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    pressable: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
}

const textStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    return StyleSheet.create({
    basic: colorTheme.onSurfaceVariant,
    primary: colorTheme.onPrimary,
    disabled: colorTheme.onSurface,
    tonal: colorTheme.onSecondaryContainer,
});
}

export default IconButton;