import { ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const SearchBox = ({ keyboardType, placeholder, initialValue, onChangeText, onConfirm, textStyle, small, grow = false }) => {
    const { colorTheme } = useContext(ThemeContext);

    const [text, setText] = useState(initialValue || "");
    const [focused, setFocused] = useState(false)
    const styles = textBoxStyles(colorTheme);

    const handleChangeText = (newText) => {
        setText(newText);
        if (onChangeText) onChangeText(newText.trim());
    }

    return (
        <TextInput
            style={[textStyle, styles.input, styles.searchInput, small && styles.smallSearchInput, grow && { width: "100%" }, { outlineColor: focused ? colorTheme.secondary : colorTheme.surfaceContainerHigh }]}
            onChangeText={handleChangeText}
            value={text}
            autoFocus={false}
            placeholder={placeholder}
            enterKeyHint="done"
            keyboardType={keyboardType}
            onSubmitEditing={onConfirm}
            onFocus={() => setFocused(true)}
            onBlur={() => {
                setFocused(false);
                onConfirm && onConfirm();
            }
            }
        />
    );
};

export const TextBox = ({
    keyboardType,
    placeholder,
    initialValue,
    value,
    onChangeText,
    onConfirm,
    textStyle,
    containerStyle,
    height,
    maxHeight,
    autofill = [],
    autoFocus = false,
    confirmOnBlur = false,
    limit = false
}) => {
    const [text, setText] = React.useState(initialValue || "");
    const [suggestions, setSuggestions] = React.useState([]);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    const { colorTheme } = useContext(ThemeContext);
    const styles = textBoxStyles(colorTheme);

    const handleChangeText = (newText) => {
        let isValid = true;

        if (keyboardType === "number-pad") {
            isValid = newText === '' || /^\d+$/.test(newText);
        } else if (keyboardType === "email-address") {
            isValid = newText === '' || /^[a-zA-Z0-9.@_-]+$/.test(newText);
        }

        if (isValid && ((limit && newText.length <= limit) || !limit)) {
            setText(newText);
            if (onChangeText) onChangeText(newText);
            updateSuggestions(newText);
        }
    };

    const updateSuggestions = (newText) => {
        // Filter suggestions
        if (autofill && newText) {
            const filteredAutofill = [...new Set(autofill)];
            const filtered = filteredAutofill.filter(item =>
                item.toLowerCase().includes(newText.toLowerCase()) && item.toLowerCase() !== newText.toLowerCase()
            );
            setSuggestions(filtered);
            setSelectedIndex(-1);
        } else if (autofill) {
            // remove duplicates from autofill and set suggestions
            const filtered = [...new Set(autofill)];
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }

    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            handleSelectSuggestion(suggestions[selectedIndex]);
            e.preventDefault();
        }
    };

    const handleSelectSuggestion = (suggestion) => {
        setText(suggestion);
        if (onChangeText) onChangeText(suggestion);
        setSuggestions([]);
        setSelectedIndex(-1);
    };


    return (
        <View style={[{ zIndex: suggestions.length > 0 ? 900 : 0, height: height || "auto", flex: 1 }, containerStyle]}>
            <TextInput
                style={[styles.input, textStyle]}
                onChangeText={handleChangeText}
                value={value || text}
                autoFocus={autoFocus}
                placeholder={placeholder}
                enterKeyHint="done"
                keyboardType={keyboardType}
                onSubmitEditing={onConfirm}
                onFocus={() => updateSuggestions("")}
                onBlur={() => {
                    confirmOnBlur ? onConfirm() : () => { };
                    setTimeout(() => setSuggestions([]), 200); // Delay to allow selection of suggestion
                }}
                onKeyPress={handleKeyDown}
            />
            {suggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { top: height || 36, zIndex: 999 }, maxHeight && { maxHeight: maxHeight }]}>
                    {suggestions.map((suggestion, index) => (
                        <Pressable
                            key={suggestion}
                            style={[
                                styles.suggestionItem,
                                index === selectedIndex && styles.selectedSuggestion
                            ]}
                            onHoverIn={() => setSelectedIndex(index)}
                            onHoverOut={() => setSelectedIndex(-1)}
                            onPress={() => handleSelectSuggestion(suggestion)}
                        >
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
};

export const EditableText = ({ keyboardType, defaultValue, onChangeText, placeholder, height, autofill, value, style, numberOfLines, suffix = "", limit, disabled = false, onEditing = () => { }, containerStyle }) => {
    const { colorTheme, colorScheme, getHoverColor } = useContext(ThemeContext);
    const [editing, setEditing] = React.useState(false);
    const [focused, setFocus] = React.useState(false);
    const [text, setText] = React.useState("");

    const handleSetEditing = (state) => {
        setText(value);
        onEditing(state);
        setEditing(state);
    }

    const handleConfirm = () => {
        handleSetEditing(false);
        setFocus(false);
        if (value !== text) {
            onChangeText(text);
        }
    }

    useEffect(() => {
        if (disabled) {
            handleSetEditing(false);
            setFocus(false);
        }
    }, [disabled]);

    if (editing) {
        return (
            <>
                <TextBox keyboardType={keyboardType} initialValue={value} height={height} autofill={autofill} placeholder={placeholder} onChangeText={setText} onConfirm={handleConfirm} textStyle={style} confirmOnBlur={true} limit={limit} autoFocus containerStyle={containerStyle} />
            </>
        );
    } else {
        return (
            <Pressable
                onHoverIn={() => { disabled ? () => { } : setFocus(true) }}
                onHoverOut={() => { disabled ? () => { } : setFocus(false) }}
                onPress={() => { disabled ? () => { } : handleSetEditing(true) }}
                android_ripple={{ color: getHoverColor(colorTheme.black, colorScheme === "light" ? 0.1 : 0.8) }}
                style={[{ backgroundColor: (focused && !disabled) ? getHoverColor(colorTheme.black, colorScheme === "light" ? 0.1 : 0.8) : "transparent", flexDirection: "row", gap: 6, flexShrink: 1, width: "100%" }, containerStyle]}>
                <Text style={style} numberOfLines={numberOfLines}>{value || defaultValue}</Text>
                {suffix !== "" && <Text style={[style, { fontWeight: "normal" }]} numberOfLines={numberOfLines}>{suffix}</Text>}
            </Pressable >
        );
    }
};

const textBoxStyles = (colorTheme) => {
    return StyleSheet.create({
        input: {
            width: "100%",
            outlineStyle: "solid",
            outlineWidth: 2,
            outlineColor: colorTheme.outline,
            color: colorTheme.onSurface,
            backgroundColor: colorTheme.surfaceContainer
        },
        searchInput: {
            outlineStyle: "solid",
            outlineWidth: 2,
            backgroundColor: colorTheme.surfaceContainerHigh,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
            paddingHorizontal: 24,
        },
        smallSearchInput: {
            height: 34,
            paddingHorizontal: 16
        },
        suggestionsContainer: {
            position: 'absolute',
            top: 36,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderBottomRightRadius: 8,
            borderBottomLeftRadius: 8,
            maxHeight: 150,
            overflow: 'auto',
            outlineStyle: "solid",
            outlineWidth: 2,
            outlineColor: colorTheme.outline,
            backgroundColor: colorTheme.surfaceContainerHigh
        },
        suggestionItem: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colorTheme.surfaceContainerHigh,
            //borderBottomWidth: 1,
            //borderBottomColor: '#eee'
        },
        suggestionText: {
            color: colorTheme.onSurface,
        },
        selectedSuggestion: {
            backgroundColor: colorTheme.surfaceContainerHighest
        }
    });
}