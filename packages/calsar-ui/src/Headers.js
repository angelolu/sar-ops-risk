import { router } from 'expo-router';
import { useContext } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from './IconButton';
import { textStyles } from './styles';
import { ThemeContext } from './ThemeContext';

export function Header({ children, style }) {
    const insets = useSafeAreaInsets();
    return (
        <View style={[style, { paddingTop: insets.top }]}>
            {children}
        </View>
    );
}

export function BackHeader({
    children,
    title,
    customTitle,
    subtitle,
    backgroundColor,
    color,
    menuButton,
    hideBack = false,
    href,
    minimize = false
}) {
    const { colorTheme } = useContext(ThemeContext);
    const { height: screenHeight } = useWindowDimensions();
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

    const activeColor = color || colorTheme.onPrimaryContainer;
    const activeBg = backgroundColor || colorTheme.primaryContainer;
    const headerMinHeight = (screenHeight < 500 || minimize) ? 44 : 64;

    return (
        <Header style={{ backgroundColor: activeBg }}>
            <View style={styles.mainContainer}>
                <View style={[styles.titleRow, { minHeight: headerMinHeight }]}>

                    {/* LEFT ZONE: Back Button */}
                    {!hideBack ? (
                        <View style={styles.buttonZone}>
                            <IconButton
                                ionicons_name={Platform.OS === 'android' ? "arrow-back" : "chevron-back"}
                                color={activeColor}
                                onPress={() => href ? router.navigate(href) : router.back()}
                            />
                        </View>
                    ) : (
                        // Placeholder to maintain spacing if back is hidden
                        <View style={styles.buttonZone} />
                    )}

                    {/* CENTER ZONE: Title */}
                    <View style={styles.titleZone}>
                        {customTitle ? (
                            customTitle
                        ) : (
                            <Text
                                style={[textStyle.headerText, { color: activeColor }]}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                            >
                                {title}
                            </Text>
                        )}
                    </View>

                    {/* RIGHT ZONE: Menu Button */}
                    <View style={[styles.buttonZone, { alignItems: 'flex-end' }]}>
                        {menuButton ? menuButton : <View style={{ width: 40 }} />}
                    </View>
                </View>

                {children}

                {subtitle && (
                    <View style={[styles.subtitleContainer, { backgroundColor: backgroundColor || colorTheme.tertiaryContainer }]}>
                        <Text style={[styles.subtitleText, { color: color || colorTheme.onTertiaryContainer }]}>
                            {subtitle}
                        </Text>
                    </View>
                )}
            </View>
        </Header>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        overflow: 'hidden',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        gap: 4,
    },
    buttonZone: {
        width: 48, // Fixed width for touch targets for symmetry
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    titleZone: {
        flex: 1,
        justifyContent: 'center',
        // On Web this is centered, on Android this is left-aligned
        alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    },
    subtitleContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    subtitleText: {
        fontSize: 14,
    },
});