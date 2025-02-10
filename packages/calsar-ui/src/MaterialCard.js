import { router } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from './ThemeContext';
import { textStyles } from './styles';

export const MaterialCard = ({ title, subtitle, children, href = "", color, noMargin = false }) => {
  const { colorTheme } = useContext(ThemeContext);
  if (typeof color === 'undefined') color = colorTheme.surfaceContainer;
  const styles = cardStyles();
  const textStyle = textStyles();

  const contents = <>
    {title && <Text style={textStyle.cardTitleText}>{title}</Text>}
    {subtitle && <Text style={[textStyle.text, title ? {} : { marginTop: 0 }]}>{subtitle}</Text>}
    {children}
  </>;

  return (
    <View style={[styles.card, { backgroundColor: color }, noMargin && { marginHorizontal: 0 }]}>
      {href ?
        <Pressable
          onPress={() => { router.navigate(href) }}
          android_ripple={href === "" ? {} : { color: colorTheme.surfaceContainerHighest }}
          style={{ flexGrow: 1, padding: 24, gap: 8 }}>
          {contents}
        </Pressable>
        :
        <View
          style={{ flexGrow: 1, padding: 24, gap: 8 }}>
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
  });
}