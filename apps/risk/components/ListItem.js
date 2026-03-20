import { useContext, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { textStyles, ThemeContext } from 'calsar-ui';

export default function ListItem({ onPress, title, subtitle, score, backgroundColor, color, description = "", round = false, first = false, last = false }) {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }).start();
    };

    const textStyle = textStyles(colorTheme, width);
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
                    (pressed && Platform.OS !== 'android') && { backgroundColor: colorTheme.surfaceContainerHighest },
                    first && { borderTopRightRadius: 20, borderTopLeftRadius: 20, overflow: "hidden" },
                    last && { borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: "hidden" }
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
