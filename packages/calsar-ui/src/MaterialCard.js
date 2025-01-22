import { router } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from './ThemeContext';

export const MaterialCard = ({ title, subtitle, children, href = "", color, noMargin = false }) => {
  const { colorTheme } = useContext(ThemeContext);
  if (typeof color === 'undefined') color = colorTheme.surfaceContainer;
  const styles = cardStyles();

  const contents = <>
    {title && <Text style={styles.title}>{title}</Text>}
    {subtitle && <Text style={[styles.subtitle, title ? {} : { marginTop: 0 }]}>{subtitle}</Text>}
    {children}
  </>;
  return (
    <View style={[styles.card, { backgroundColor: color }, noMargin && { marginHorizontal: 0 }]}>
      {href ?
        <Pressable
          onPress={() => { router.navigate(href) }}
          android_ripple={href === "" ? {} : { color: colorTheme.surfaceContainerHighest }}
          style={{ flexGrow: 1, padding: 24 }}>
          {contents}
        </Pressable>
        :
        <View
          style={{ flexGrow: 1, padding: 24 }}>
          {contents}
        </View>
      }
    </View>
  );
};

const cardStyles = () => {
  const { colorTheme } = useContext(ThemeContext);

  return StyleSheet.create({
    card: {
      marginLeft: 20,
      marginRight: 20,
      borderRadius: 26, // Rounded corners
      overflow: 'hidden',
    },
    title: {
      fontSize: 20,
      fontWeight: '500',
      color: colorTheme.primary,
    },
    subtitle: {
      color: colorTheme.onSurface,
      marginTop: 8,
    },
  });
}