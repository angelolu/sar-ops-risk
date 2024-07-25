import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from './ThemeContext';

export default function Header({ children, style }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[style, { paddingTop: insets.top }]}>
            {children}
        </View>
    );
}

export function BackHeader({ children, title, subtitle, backgroundColor, color, menuButton }) {
    const { colorTheme } = useContext(ThemeContext);
    return (
        <Header style={{ backgroundColor: backgroundColor ? backgroundColor : colorTheme.primaryContainer, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <View style={styles.mainContainer}>
                <View style={styles.titleRow}>
                    <View style={styles.backButtonContainer}>
                        <Pressable
                            style={styles.circleButton}
                            android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                            onPress={() => { router.back() }}>
                            <Ionicons name={Platform.OS === 'android' ? "arrow-back" : "chevron-back"} size={24} color={color} />
                        </Pressable>
                    </View>
                    <Text style={[styles.title, { color: color ? color : colorTheme.onPrimaryContainer }]}>{title}</Text>
                    {menuButton ? <View style={[styles.menuContainer, { alignSelf: 'stretch' }]}>
                        {menuButton}
                    </View> : <View></View>}
                </View>
                {children}
                {subtitle && <Text style={[styles.action, { color: color ? color : colorTheme.onPrimaryContainer }]}>{subtitle}</Text>}
            </View>
        </Header>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginTop: 10,
        marginBottom: 10,
        gap: 6,
        padding: 0
    },
    titleRow: {
        paddingLeft: 6,
        paddingRight: 12,
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    action: {
        marginLeft: 20,
        marginRight: 20,
    },
    title: {
        fontSize: 18,
        flex: -1
    },
    backButtonContainer: {
        width: 40,
        height: "100%",
        minHeight: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    menuContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    circleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});