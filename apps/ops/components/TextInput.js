import React, { useContext, useEffect } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { ThemeContext } from 'calsar-ui';

export const SearchBox = ({ keyboardType, placeholder, initialValue, onChangeText, onConfirm, textStyle, small }) => {
    const [text, setText] = React.useState(initialValue || "");
    const { width } = useWindowDimensions();

    const styles = textBoxStyles();

    const handleChangeText = (newText) => {
        setText(newText);
        if (onChangeText) onChangeText(newText.trim());
    }

    return (
        <TextInput
            style={[textStyle, styles.input, styles.searchInput, small && styles.smallSearchInput]}
            onChangeText={handleChangeText}
            value={text}
            autoFocus={width > 600}
            placeholder={placeholder}
            enterKeyHint="done"
            keyboardType={keyboardType}
            onSubmitEditing={onConfirm}
            onBlur={onConfirm}
        />
    );
};

export const TextBox = ({ keyboardType, placeholder, initialValue, onChangeText, onConfirm, textStyle, autoFocus = true, confirmOnBlur = false, limit = false }) => {
    const [text, setText] = React.useState(initialValue || "");

    const styles = textBoxStyles();
    const handleChangeText = (newText) => {
        if ((limit && newText.length <= limit) || !limit) {
            setText(newText);
            if (onChangeText) onChangeText(newText.trim());
        }
    }

    return (
        <TextInput
            style={[styles.input, textStyle]}
            onChangeText={handleChangeText}
            value={text}
            autoFocus={autoFocus}
            placeholder={placeholder}
            enterKeyHint="done"
            keyboardType={keyboardType}
            onSubmitEditing={onConfirm}
            onBlur={confirmOnBlur ? onConfirm : () => { }}
        />
    );
};

export const EditableText = ({ keyboardType, defaultValue, onChangeText, placeholder, value, style, numberOfLines, suffix = "", limit, disabled = false }) => {
    const { colorTheme, colorScheme, getHoverColor } = useContext(ThemeContext);
    const [editing, setEditing] = React.useState(false);
    const [focused, setFocus] = React.useState(false);
    const [text, setText] = React.useState(value);

    const handleConfirm = () => {
        setEditing(false);
        setFocus(false);
        if (value !== text) {
            onChangeText(text);
        }
    }

    useEffect(() => {
        if (disabled) {
            setEditing(false);
            setFocus(false);
        }
    }, [disabled]);

    if (editing) {
        return (
            <View>
                <TextBox keyboardType={keyboardType} initialValue={value} placeholder={placeholder} onChangeText={setText} onConfirm={handleConfirm} textStyle={style} confirmOnBlur={true} limit={limit} />
            </View>
        );
    } else {
        return (
            <Pressable
                onHoverIn={() => { disabled ? () => { } : setFocus(true) }}
                onHoverOut={() => { disabled ? () => { } : setFocus(false) }}
                onPress={() => { disabled ? () => { } : setEditing(true) }}
                android_ripple={{ color: getHoverColor(colorTheme.black, colorScheme === "light" ? 0.1 : 0.8) }}
                style={[{ backgroundColor: (focused && !disabled) ? getHoverColor(colorTheme.black, colorScheme === "light" ? 0.1 : 0.8) : "transparent", flexDirection: "row", gap: 6, flexShrink: 1 }]}>
                <Text style={style} numberOfLines={numberOfLines}>{value || defaultValue}</Text>
                {suffix !== "" && <Text style={[style, { fontWeight: "normal" }]} numberOfLines={numberOfLines}>{suffix}</Text>}
            </Pressable >
        );
    }
};

const textBoxStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    return StyleSheet.create({
        input: {
            outlineStyle: "solid",
            outlineWidth: 2,
            outlineColor: colorTheme.outline,
            color: colorTheme.onSurface,
            backgroundColor: colorTheme.surfaceContainerHigh
        },
        searchInput: {
            outlineStyle: "solid",
            outlineWidth: 2,
            outlineColor: colorTheme.secondary,
            backgroundColor: colorTheme.surfaceContainerHigh,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
            paddingHorizontal: 24,
        },
        smallSearchInput: {
            height: 34,
            paddingHorizontal: 16
        }
    });
}