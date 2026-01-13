import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { textStyles, ThemeContext } from 'calsar-ui';

export default function ListItem({ onPress, title, subtitle, score, backgroundColor, color, description = "" }) {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

    const [listStyle, setListStyle] = useState(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();
    };

    useEffect(() => {
        // Get language setting used for ORMA
        AsyncStorage.getItem("list-style").then((jsonValue) => {
            jsonValue != null ? setListStyle(JSON.parse(jsonValue)) : setListStyle(null);
        }).catch((e) => {
            // error reading value
        });
    }, []);

    if (listStyle === "legacy") {
        const styles = getStyles(colorTheme);
        return (
            <Animated.View style={[styles.listItemContainer, { transform: [{ scale: scaleAnim }] }]}>
                <Pressable
                    android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={onPress}
                    style={({ pressed }) => [
                        styles.row,
                        { backgroundColor: backgroundColor ? backgroundColor : colorTheme.surface },
                        (pressed && Platform.OS !== 'android') && { backgroundColor: colorTheme.surfaceContainerHighest }
                    ]}>
                    <View style={styles.textColumn}>
                        <Text style={[styles.Title, { color: color ? color : colorTheme.onSurface }]}>{title}</Text>
                        {subtitle && <Text style={{ color: color ? color : colorTheme.onSurfaceVariant }}>{subtitle}</Text>}
                        {description !== "" && <Text style={{ marginTop: 4, marginLeft: 6, color: color ? color : colorTheme.onSurfaceVariant }}>- {description}</Text>}
                    </View>
                    <View>
                        <Text style={[styles.score, { color: color ? color : colorTheme.onSurface }]}>{(score === 0 || score === '') ? "-" : score}</Text>
                    </View>
                </Pressable>
            </Animated.View>
        );
    } else {
        const textStyle = textStyles(colorTheme);
        const styles = itemStyles(colorTheme);
        return (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                    android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={onPress}
                    style={({ pressed }) => [
                        styles.row,
                        (pressed && Platform.OS !== 'android') && { backgroundColor: colorTheme.surfaceContainerHighest }
                    ]}>
                    <View style={[styles.littleBox, { backgroundColor: backgroundColor ? backgroundColor : colorTheme.surfaceVariant }]}>
                        <Text style={[textStyle.headlineSmall, { color: color ? color : colorTheme.white, textAlign: 'center', fontWeight: 'bold' }]}>{(score && score !== 0) ? score : "-"}</Text>
                    </View>
                    <View style={styles.textColumn}>
                        <Text style={textStyle.titleLarge}>{title}</Text>
                        {subtitle && <Text style={textStyle.bodyMedium}>{subtitle}</Text>}
                        {description !== "" && <Text style={[textStyle.bodyMedium, { marginTop: 4, marginLeft: 6, color: colorTheme.onSurfaceVariant }]}>- {description}</Text>}
                    </View>
                </Pressable>
            </Animated.View>
        );
    }
}

const itemStyles = (colorTheme) => {

    return StyleSheet.create({
        row: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            backgroundColor: colorTheme.surface,
            alignItems: 'flex-start'
        },
        textColumn: {
            flex: 1,
            flexShrink: 1,
        },
        littleBox: {
            width: 56,
            height: 56,
            marginTop: 6,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
        }
    });
}

const getStyles = (colorTheme) => {
    return StyleSheet.create({
        listItemContainer: {
        },
        row: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 12,
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 25
        },
        textColumn: {
            flex: 1,
        },
        score: {
            fontSize: 26,
            fontWeight: 'bold',
        },
        Title: {
            fontSize: 22,
        },
        subtitle: {
            color: colorTheme.onSurfaceVariant
        }
    });
}