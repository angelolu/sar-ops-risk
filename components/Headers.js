import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
    const windowWidth = Dimensions.get('window').width;
    return (
        <Header style={{ backgroundColor: backgroundColor ? backgroundColor : colorTheme.primaryContainer, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <View style={styles.mainContainer}>
                <View style={[styles.titleRow, { justifyContent: (!menuButton && windowWidth < 600) ? "flex-start" : "space-between" }]}>
                    {windowWidth < 600 ?
                        <View style={styles.leftContainer}>
                            <View style={styles.backButtonContainer}>
                                <Pressable
                                    style={styles.circleButton}
                                    android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                                    onPress={() => { router.back() }}>
                                    <Ionicons name={Platform.OS === 'android' ? "arrow-back" : "chevron-back"} size={24} color={color ? color : colorTheme.onPrimaryContainer} />
                                </Pressable>
                            </View>
                            <Text style={[styles.title, { color: color ? color : colorTheme.onPrimaryContainer }]} adjustsFontSizeToFit={true} numberOfLines={1}>{title}</Text>
                        </View>
                        :
                        <>
                            <View style={styles.backButtonContainer}>
                                <Pressable
                                    style={styles.circleButton}
                                    android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                                    onPress={() => { router.back() }}>
                                    <Ionicons name={Platform.OS === 'android' ? "arrow-back" : "chevron-back"} size={24} color={color ? color : colorTheme.onPrimaryContainer} />
                                </Pressable>
                            </View>
                            <Text style={[styles.title, { color: color ? color : colorTheme.onPrimaryContainer }]} adjustsFontSizeToFit={true} numberOfLines={1}>{title}</Text>
                        </>
                    }
                    {menuButton ?
                        <View style={[styles.menuContainer, { alignSelf: 'stretch' }]}>
                            {menuButton}
                        </View>
                        :
                        <View />
                    }
                </View>
                {children}
                {subtitle &&
                    <View style={[styles.subtitleContainer, { backgroundColor: backgroundColor ? backgroundColor : colorTheme.tertiaryContainer }]}>
                        <Text style={[styles.action, { color: color ? color : colorTheme.onTertiaryContainer }]}>{subtitle}</Text>
                    </View>
                }
            </View>
        </Header>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        padding: 0
    },
    titleRow: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 6,
        paddingRight: 12,
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContainer: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: -1,
    },
    subtitleContainer: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    action: {
        marginLeft: 20,
        marginRight: 20,
    },
    title: {
        fontSize: 18,
        flex: -1,
        fontWeight: '500'
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