import { router } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const Tile = ({ title, subtitle, children, href = "", icon, width = 175 }) => {
    return (
        <View style={[styles.card, { width: width }]}>
            <Pressable
                onPress={() => { router.navigate(href) }}
                android_ripple={href === "" ? {} : { color: '#e2e2e9' }}
                style={{ flexGrow: 1, padding: 24 }}>
                {icon}
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                {children}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#eeedf4',
        borderRadius: 26, // Rounded corners
        overflow: 'hidden',
    },
    title: {
        fontSize: 20,
        color: '#475d92', // Primary text color
    },
    subtitle: {
        color: '#1a1b20', // On surface var
    },
});

export default Tile;