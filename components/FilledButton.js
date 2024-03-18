import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from '../components/ThemeContext';

const FilledButton = ({ text, onPress, disabled = false, primary = false }) => {
    const { colorTheme } = useContext(ThemeContext);
    const buttonColors = buttonStyles();
    const textColors = textStyles();

    const disabledFun = () => { };

    return (
        <View style={[buttonColors.baseContainer, disabled && buttonColors.disabled, primary && buttonColors.primary]}>
            <Pressable
                onPress={disabled ? disabledFun : onPress}
                android_ripple={disabled || { color: colorTheme.surfaceContainerHighest }}
                style={buttonColors.pressable}>
                <Text style={[buttonColors.text, disabled && textColors.disabled, primary && textColors.primary]}>{text}</Text>
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
        baseContainer: {
            marginTop: 15,
            alignSelf: 'flex-end',
            height: 40,
            backgroundColor: colorTheme.secondaryContainer,
            borderRadius: 20,
            overflow: 'hidden',
        },
        pressable: {
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24
        },
        text: {
            color: colorTheme.onSecondaryContainer
        }
    });
}

const textStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    return StyleSheet.create({
        primary: {
            color: colorTheme.onPrimary
        },
        disabled: {
            color: colorTheme.onSurface,
            opacity: 0.38
        }
    });
}

export default FilledButton;