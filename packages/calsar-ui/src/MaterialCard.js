import { router } from 'expo-router';
import { useContext, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ThemeContext } from './ThemeContext';
import { textStyles } from './styles';

/**
 * MaterialCard
 * A MD3 card component with optional hover and press animations (if a href is provided)
 * Fixed hook stability and improved contrast.
 */
export const MaterialCard = ({ title, subtitle, children, href = "", color, noMargin = false }) => {
  const { colorTheme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const textStyle = textStyles(colorTheme, width);
  const styles = cardStyles();

  const [hovered, setHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const colorVal = color || colorTheme.surfaceContainer;

  const handlePressIn = () => {
    if (!href) return;
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, speed: 20 }).start();
  };

  const handlePressOut = () => {
    if (!href) return;
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const contents = (
    <>
      {title && <Text style={[textStyle.cardTitleText, { color: colorTheme.primary, fontWeight: '700' }]}>{title}</Text>}
      {subtitle && <Text style={[textStyle.text, { marginTop: title ? 2 : 0, color: colorTheme.onSurfaceVariant }]}>{subtitle}</Text>}
      {children}
    </>
  );

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colorVal,
      transform: [{ scale: scaleAnim }],
      // Definitions: Borders only for low-contrast/surface elevation overlap
      ...(colorVal === colorTheme.surfaceContainerLowest ? { borderWidth: 1, borderColor: colorTheme.outlineVariant } : {})
    },
    noMargin && { marginHorizontal: 0 },
    hovered && href && { backgroundColor: colorTheme.surfaceContainerHigh }
  ];

  return (
    <Animated.View style={cardStyle}>
      {href ? (
        <Pressable
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => { router.navigate(href) }}
          android_ripple={{ color: colorTheme.surfaceContainerHighest }}
          style={({ pressed }) => [
            styles.pressable,
            { backgroundColor: (pressed && Platform.OS !== 'android') ? colorTheme.surfaceContainerHighest : 'transparent' }
          ]}
        >
          {contents}
        </Pressable>
      ) : (
        <View style={styles.contentContainer}>
          {contents}
        </View>
      )}
    </Animated.View>
  );
};

const cardStyles = () => {
  return StyleSheet.create({
    card: {
      marginHorizontal: 20,
      marginVertical: 6,
      borderRadius: 20,
      overflow: 'hidden',
      // MD3 Standard Shadow
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 1,
        }
      }),
      ...Platform.select({
        web: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      })
    },
    pressable: {
      flexGrow: 1,
      padding: 24,
      gap: 12,
    },
    contentContainer: {
      flexGrow: 1,
      padding: 24,
      gap: 12,
    },
  });
}