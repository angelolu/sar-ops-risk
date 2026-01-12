"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textStyles = void 0;
var _reactNative = require("react-native");
var textStyles = exports.textStyles = function textStyles(colorTheme, width) {
  // Use Outfit if size is over 20

  return _reactNative.StyleSheet.create({
    text: {
      fontSize: 14,
      color: colorTheme.onSurface,
      fontFamily: 'Inter_400Regular'
    },
    headerText: {
      fontSize: 18,
      color: colorTheme.onPrimaryContainer,
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
      fontSize: 14,
      lineHeight: 20,
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
      fontSize: width > 600 ? 24 : 16,
      color: colorTheme.onSurface,
      fontFamily: width > 600 ? 'Outfit_400Regular' : 'Inter_400Regular'
    },
    columnValueTextMain: {
      fontSize: width > 600 ? 26 : 18,
      color: colorTheme.onSurface,
      fontFamily: width > 600 ? 'Outfit_600SemiBold' : 'Inter_600SemiBold'
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
      fontFamily: 'Outfit_600SemiBold'
    },
    // MD3 Typography Scale
    displayLarge: {
      fontFamily: 'Outfit_400Regular',
      fontSize: 57,
      lineHeight: 64,
      letterSpacing: -0.25,
      color: colorTheme.onSurface
    },
    displayMedium: {
      fontFamily: 'Outfit_400Regular',
      fontSize: 45,
      lineHeight: 52,
      letterSpacing: 0,
      color: colorTheme.onSurface
    },
    displaySmall: {
      fontFamily: 'Outfit_400Regular',
      fontSize: 36,
      lineHeight: 44,
      letterSpacing: 0,
      color: colorTheme.onSurface
    },
    headlineLarge: {
      fontFamily: 'Outfit_400Regular',
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: 0,
      color: colorTheme.onSurface
    },
    headlineMedium: {
      fontFamily: 'Outfit_400Regular',
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
      color: colorTheme.onSurface
    },
    headlineSmall: {
      fontFamily: 'Outfit_400Regular',
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
      color: colorTheme.onSurface
    },
    titleLarge: {
      fontFamily: 'Inter_400Regular',
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 0,
      color: colorTheme.onSurface
    },
    titleMedium: {
      fontFamily: 'Inter_500Medium',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
      color: colorTheme.onSurface
    },
    titleSmall: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      color: colorTheme.onSurface
    },
    bodyLarge: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
      color: colorTheme.onSurface
    },
    bodyMedium: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.25,
      color: colorTheme.onSurface
    },
    bodySmall: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.4,
      color: colorTheme.onSurface
    },
    labelLarge: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      color: colorTheme.onSurface
    },
    labelMedium: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.5,
      color: colorTheme.onSurface
    },
    labelSmall: {
      fontFamily: 'Inter_500Medium',
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 0.5,
      color: colorTheme.onSurface
    }
  });
};