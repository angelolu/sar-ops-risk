import { router } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from '../components/ThemeContext';

const MaterialCard = ({ title, subtitle, children, href = "", color }) => {
  const { colorTheme } = useContext(ThemeContext);
  if (typeof color === 'undefined') color = colorTheme.surfaceContainer;
  const styles = cardStyles();

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Pressable
        onPress={() => { router.navigate(href) }}
        android_ripple={href === "" ? {} : { color: colorTheme.surfaceContainerHighest }}
        style={{ flexGrow: 1, padding: 24 }}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={[styles.subtitle, title ? {} : { marginTop: 0 }]}>{subtitle}</Text>}
        {children}
      </Pressable>
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

export default MaterialCard;