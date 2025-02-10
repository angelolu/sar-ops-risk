import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext } from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from './ThemeContext';
import { IconButton } from './IconButton';
import { textStyles } from './styles';

export function Header({ children, style }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[style, { paddingTop: insets.top }]}>
            {children}
        </View>
    );
}

export function BackHeader({ children, title, customTitle, subtitle, backgroundColor, color, menuButton, hideBack = false, href, minimize = false }) {
    const { colorTheme } = useContext(ThemeContext);
    const { width, height } = useWindowDimensions();
    const textStyle = textStyles();
    return (
        <Header style={{ backgroundColor: backgroundColor ? backgroundColor : colorTheme.primaryContainer, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <View style={[styles.mainContainer]}>
                <View style={[styles.titleRow, { justifyContent: (!menuButton && width < 600) ? "flex-start" : "space-between", minHeight: (height < 500 || minimize) ? 40 : 60 }]}>
                    {width < 600 ?
                        <View style={styles.leftContainer}>
                            {hideBack ?
                                <View></View>
                                :
                                <View style={styles.backButtonContainer}>
                                    <IconButton ionicons_name={Platform.OS === 'android' ? "arrow-back" : "chevron-back"} color={color ? color : colorTheme.onPrimaryContainer} onPress={() => { href ? router.navigate(href) : router.back() }} />
                                </View>}
                            {customTitle ?
                                customTitle
                                :
                                <Text style={[textStyle.headerText, { color: color ? color : colorTheme.onPrimaryContainer }]} adjustsFontSizeToFit={true} numberOfLines={1}>{title}</Text>
                            }
                        </View>
                        :
                        <>
                            {hideBack ?
                                <View style={{ flexGrow: 1, flexBasis: 1 }}></View>
                                :
                                <View style={styles.backButtonContainer}>
                                    <IconButton ionicons_name={Platform.OS === 'android' ? "arrow-back" : "chevron-back"} color={color ? color : colorTheme.onPrimaryContainer} onPress={() => { href ? router.navigate(href) : router.back() }} />
                                </View>
                            }
                            {customTitle ?
                                customTitle
                                :
                                <Text style={[textStyle.headerText, { color: color ? color : colorTheme.onPrimaryContainer }]} adjustsFontSizeToFit={true} numberOfLines={1}>{title}</Text>
                            }
                        </>
                    }
                    {menuButton ?
                        <View style={[styles.menuContainer, { flexGrow: 1, flexBasis: 1, alignItems: "flex-end" }]}>
                            {menuButton}
                        </View>
                        :
                        <View style={{ flexGrow: 1, flexBasis: 1 }} />
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
        padding: 0,
        justifyContent: "center"
    },
    titleRow: {
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
        flexGrow: 1,
        flexBasis: 1,
        alignItems: "flex-start",
        justifyContent: "center"
    },
    menuContainer: {
    },
    circleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});