import { ThemeContext } from "./ThemeContext";
import { useContext } from "react";
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_500Medium, useFonts } from '@expo-google-fonts/outfit';


export const textStyles = () => {
    const [loaded, error] = useFonts({
        Outfit_600SemiBold,
        Outfit_500Medium,
        Outfit_400Regular,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold
    });
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    // Use Outfit if size is over 20

    return StyleSheet.create({
        text: {
            fontSize: 14,
            color: colorTheme.onSurface,
            fontFamily: 'Inter_400Regular'
        },
        headerText: {
            fontSize: 18,
            color: colorTheme.onPrimaryContainer,
            flex: -1,
            fontFamily: 'Inter_500Medium'
        },
        chipText: {
            fontSize: 12,
            color: colorTheme.onSurface,
            fontFamily: 'Inter_400Regular'
        },
        tertiaryText: {
            fontSize: 12,
            color: colorTheme.onSurfaceVariant,
            fontFamily: 'Inter_400Regular'
        },
        secondaryText: {
            fontSize: 14,
            color: colorTheme.onSurfaceVariant,
            fontFamily: 'Inter_400Regular'
        },
        buttonText: {
            color: colorTheme.secondary,
            fontFamily: 'Inter_500Medium'
        },
        cardTitleText: {
            fontSize: 20,
            color: colorTheme.primary,
            fontFamily: 'Outfit_600SemiBold'
        },
        kvValueText: {
            fontSize: width > 600 ? 14 : 12,
            color: colorTheme.onSurface,
            fontFamily: 'Inter_400Regular'
        },
        sectionTitleText: {
            fontSize: 14,
            color: colorTheme.onSurfaceVariant,
            paddingTop: 4,
            fontFamily: 'Inter_600SemiBold'
        },
        columnKeyText: {
            fontSize: 14,
            color: colorTheme.onSurfaceVariant,
            fontFamily: 'Inter_400Regular'
        },
        columnValueText: {
            fontSize: 24,
            color: colorTheme.onSurface,
            fontFamily: 'Outfit_400Regular'
        },
        columnValueTextMain: {
            fontSize: 26,
            color: colorTheme.onSurface,
            fontFamily: 'Outfit_600SemiBold'
        },
        rowTitleText: {
            fontSize: 16,
            color: colorTheme.onSurface,
            fontFamily: 'Inter_500Medium'
        },
        rowTitleTextPrimary: {
            fontSize: 16,
            color: colorTheme.primary,
            fontFamily: 'Inter_500Medium'
        },
        rowTitleTextBold: {
            fontSize: 16,
            color: colorTheme.onSurface,
            fontFamily: 'Inter_700Bold'
        },
        pageNameText: {
            fontSize: width > 600 ? 24 : 20,
            color: colorTheme.onBackground,
            fontFamily: 'Outfit_400Regular'
        },
    });
}