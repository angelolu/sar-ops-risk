import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from './ThemeContext';

export const Banner = ({ title, icon, backgroundColor, color, pad = false, noRadius = false, onPress, children }) => {
    const { colorTheme } = useContext(ThemeContext);
    if (typeof backgroundColor === 'undefined') backgroundColor = colorTheme.surfaceVariant;
    if (typeof color === 'undefined') color = colorTheme.onSurfaceVariant;

    if (onPress === undefined) return (
        <View style={[styles.card, { backgroundColor: backgroundColor }, pad && { marginLeft: 20, marginRight: 20 }, noRadius && { borderRadius: 0 }, styles.cardContainer]}>
            {icon}
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
                {title && <Text style={{ color: color }}>{title}</Text>}
                {children}
            </View>
        </View>
    );
    return (
        <View style={[styles.card, { backgroundColor: backgroundColor }, pad && { marginLeft: 20, marginRight: 20 }, noRadius && { borderRadius: 0 }]}>
            <Pressable
                onPress={onPress}
                android_ripple={{ color: backgroundColor }}
                style={{ flexGrow: 1 }}>
                <View style={[styles.cardContainer]}>
                    {icon}
                    {title && <Text style={{ color: color, flex: 1 }}>{title}</Text>}
                </View>
            </Pressable>
        </View >

    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 26, // Rounded corners
    },
    cardContainer: {
        flexDirection: 'row',
        columnGap: 12,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        flexShrink: 1
    }
});