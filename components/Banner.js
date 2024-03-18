import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ThemeContext } from '../components/ThemeContext';
import { useContext } from 'react';

const Banner = ({ title, icon, backgroundColor, color, pad = false, noRadius = false, onPress }) => {
    const { colorTheme } = useContext(ThemeContext);
    if (typeof backgroundColor === 'undefined') backgroundColor = colorTheme.surfaceVariant;
    if (typeof color === 'undefined') color = colorTheme.onSurfaceVariant;

    if (onPress === undefined) return (
        <View style={[styles.card, { backgroundColor: backgroundColor }, pad && { marginLeft: 20, marginRight: 20 }, noRadius && { borderRadius: 0 }]}>
            <View style={[styles.cardContainer]}>
                    {icon}
                    {title && <Text style={{ color: color, flex: 1 }}>{title}</Text>}
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
        overflow: 'hidden',
    },
    cardContainer: {
        flexDirection: 'row',
        columnGap: 12,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
    }
});
export default Banner;