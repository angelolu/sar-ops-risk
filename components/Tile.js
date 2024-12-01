import { router } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from '../components/ThemeContext';

const Tile = ({ title, subtitle, children, href = "", icon, width = "auto" }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = tileStyles();

    return (
        <View style={[styles.card, { width: width }]}>
            <Pressable
                onPress={() => { router.navigate(href) }}
                android_ripple={href === "" ? {} : { color: colorTheme.surfaceContainerHighest }}
                style={{ flexGrow: 1, padding: 16, gap: 6 }}>
                <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                    {icon}
                    <View style={{ flexShrink: 1, gap: 2 }}>
                        {title && <Text style={styles.title} numberOfLines={1}>{title}</Text>}
                        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
                    </View>
                </View>

                {children}
            </Pressable>
        </View>
    );
};

const tileStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        card: {
            backgroundColor: colorTheme.surfaceContainer,
            borderRadius: 6, // Rounded corners
            overflow: 'hidden',
        },
        title: {
            fontSize: 18,
            color: colorTheme.primary,
        },
        subtitle: {
            color: colorTheme.onSurface,
        },
    });
}

export default Tile;