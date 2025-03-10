import { router } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from './ThemeContext';
import { textStyles } from './styles';

export const Tile = ({ title, subtitle, children, href = "", icon, width = "auto", onPress }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = tileStyles();
    const textStyle = textStyles();

    return (
        <View style={[styles.card, { width: width }]}>
            <Pressable
                onPress={() => { onPress ? onPress() : router.navigate(href) }}
                android_ripple={(href === "" || onPress) ? {} : { color: colorTheme.surfaceContainerHighest }}
                style={{ flexGrow: 1, padding: 16, gap: 6, justifyContent: "space-between", flexDirection: "row", alignItems: "center" }}>
                <View style={{ flexDirection: "row", gap: 14, alignItems: "center", flexShrink: 1 }}>
                    {icon}
                    <View style={{ flexShrink: 1, gap: 2 }}>
                        {title && <Text style={textStyle.rowTitleTextPrimary} numberOfLines={1}>{title}</Text>}
                        {subtitle && <Text style={textStyle.tertiaryText} numberOfLines={1}>{subtitle}</Text>}
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
    });
}