import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';
import { textStyles } from './styles';


export const FilledButton = ({ text, onPress, small = false, icon = false, disabled = false, destructive = false, primary = false, rightAlign = false, backgroundColor, selected = false }) => {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const [focus, setFocus] = useState(false);
    const textStyle = textStyles();
    const buttonStyle = buttonStyles();

    const disabledFun = () => { };

    const buttonColors = {
        disabled: getHoverColor(colorTheme.onSurface, 0.3),
        default: focus ? getHoverColor(colorTheme.surfaceContainerHigh) : "transparent",
        primary: focus ? getHoverColor(colorTheme.primary) : colorTheme.primary,
        selected: focus ? getHoverColor(colorTheme.secondary) : colorTheme.secondary,
        destructive: focus ? getHoverColor(colorTheme.error, 0.1) : "transparent",
    };

    const textColors = {
        disabled: getHoverColor(colorTheme.surface),
        default: colorTheme.secondary,
        primary: colorTheme.onPrimary,
        selected: colorTheme.onSecondary,
        destructive: colorTheme.error,
    };

    return (
        <View style={[
            buttonStyle.baseContainer,
            small && buttonStyle.smallBaseContainer,
            rightAlign && { alignSelf: 'flex-end', },
            {
                backgroundColor: (selected ? buttonColors.selected : disabled ? buttonColors.disabled : primary ? buttonColors.primary : destructive ? buttonColors.destructive : buttonColors.default),
                outlineStyle: "solid",
                outlineWidth: 2,
                outlineColor: (destructive ? textColors.destructive : disabled ? buttonColors.disabled : primary ? buttonColors.primary : textColors.default),
            },
            backgroundColor && { backgroundColor: backgroundColor }]}>
            <Pressable
                onHoverIn={() => { setFocus(true) }}
                onHoverOut={() => { setFocus(false) }}
                onPress={disabled ? disabledFun : onPress}
                android_ripple={disabled || { color: colorTheme.surfaceContainerHigh }}
                style={[buttonStyle.pressable, small && buttonStyle.smallPressable]}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: "center" }}>
                    {icon && <Ionicons name={icon} size={small ? 16 : 20} color={(disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors.default)} />}
                    <Text style={[
                        textStyle.buttonText,
                        { color: (selected ? textColors.selected : disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors.default) }
                    ]}>{text}</Text>
                </View>
            </Pressable >
        </View >
    );
};

export const SegmentedButtons = ({ items, selected, onPress, noCheck = false, small = false, grow = false, disabled = false, destructive = false, primary = false }) => {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const [focusArray, setFocusArray] = useState(Array(items.length).fill(false));
    const buttonStyle = buttonStyles();
    const textStyle = textStyles();

    const getButtonBGTheme = (focus, colorTheme) => {
        const buttonColors = {
            disabled: getHoverColor(colorTheme.onSurface, 0.3),
            default: focus ? getHoverColor(colorTheme.surfaceContainerHigh) : "transparent",
            primary: focus ? getHoverColor(colorTheme.primary) : colorTheme.primary,
            destructive: focus ? getHoverColor(colorTheme.error, 0.1) : "transparent",
        };

        return ({
            backgroundColor: buttonColors.default
        });
    }

    const textColors = {
        disabled: getHoverColor(colorTheme.secondary, 0.4),
        default: colorTheme.secondary,
        primary: colorTheme.onPrimary,
        destructive: colorTheme.error,
    };

    return (
        <View style={[
            buttonStyle.baseContainer,
            small && buttonStyle.smallBaseContainer,
            {
                flexDirection: "row",
                flexWrap: "wrap",
                outlineStyle: "solid",
                height: "auto",
                outlineWidth: 2,
                outlineColor: disabled ? textColors.disabled : (destructive ? textColors.destructive : textColors.default),
            },
            grow && {
                width: "100%"
            }
        ]}>
            {items.map((item, i) => (
                <Pressable
                    key={item}
                    onHoverIn={() => { disabled ? () => { } : setFocusArray(prev => prev.map((value, x) => (x === i) ? true : value)) }}
                    onHoverOut={() => { disabled ? () => { } : setFocusArray(prev => prev.map((value, x) => (x === i) ? false : value)) }}
                    onPress={disabled ? () => { } : () => onPress(i)}
                    android_ripple={disabled || { color: colorTheme.surfaceContainerHigh }}
                    style={[
                        buttonStyle.pressable,
                        small && buttonStyle.smallPressable,
                        getButtonBGTheme(focusArray[i], colorTheme),
                        (i === selected && { backgroundColor: getHoverColor(colorTheme.secondaryContainer) }),
                        { outlineStyle: "solid", outlineWidth: 1, outlineColor: disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors.default },
                        grow && {
                            flexGrow: 1,
                        }
                    ]}>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: "center" }}>
                        {i === selected && !noCheck && <Ionicons name="checkmark" size={small ? 16 : 20} color={disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors.default} />}
                        <Text style={[
                            textStyle.buttonText,
                            { color: disabled ? textColors.disabled : primary ? textColors.primary : destructive ? textColors.destructive : textColors.default }
                        ]} >{item}</Text>
                    </View>
                </Pressable >
            ))
            }
        </View >
    );
}

const buttonStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    return StyleSheet.create({
        baseContainer: {
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
        },
        smallBaseContainer: {
            height: 34,
            borderRadius: 17,
        },
        pressable: {
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24
        },
        smallPressable: {
            height: 34,
            paddingHorizontal: 16
        },
    });
}