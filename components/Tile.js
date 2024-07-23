import { router } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from '../components/ThemeContext';

const Tile = ({ title, subtitle, children, href = "", icon, width = 175 }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = tileStyles();

    return (
        <View style={[styles.card, { width: width }]}>
            <Pressable
                onPress={() => { router.navigate(href) }}
                android_ripple={href === "" ? {} : { color: colorTheme.surfaceContainerHighest }}
                style={{ flexGrow: 1, padding: 24 }}>
                {icon}
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
            borderRadius: 26, // Rounded corners
            overflow: 'hidden',
        },
        title: {
            fontSize: 20,
            color: colorTheme.primary,
        },
        subtitle: {
            color: colorTheme.onSurface,
        },
    });
}

export default Tile;