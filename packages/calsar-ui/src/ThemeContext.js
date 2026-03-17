import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, useFonts } from '@expo-google-fonts/outfit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import themeColors from '../assets/theme.json';

export const ThemeContext = createContext();

const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
};

const extractThemeFromScheme = (scheme) => {
  let theme = scheme === 'light' ? themeColors.schemes.light : themeColors.schemes.dark;
  theme = { ...theme, ...themeColors.customColors };
  return theme;
}

export const ThemeProvider = ({ children }) => {
  const [loaded, error] = useFonts({
    Outfit_600SemiBold,
    Outfit_500Medium,
    Outfit_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
  });

  const [colorScheme, setColorScheme] = useState(useColorScheme());
  const [colorTheme, setColorTheme] = useState(extractThemeFromScheme(colorScheme));

  const [savedScheme, setSavedScheme] = useState(null);

  const changeColorScheme = (scheme) => {
    if (scheme === 'dark' || scheme === 'light') setColorScheme(scheme);
    setColorTheme(extractThemeFromScheme(scheme));
  }

  useEffect(() => {
    // Update scheme if it has been overridden by the user
    getData("appearance").then((value) => {
      if (value === 2) {
        changeColorScheme('light');
        setSavedScheme(2);
      } else if (value === 3) {
        changeColorScheme('dark');
        setSavedScheme(3);
      } else {
        setSavedScheme(null);
      }
    });
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      (preferences) => {
        // skip updating the scheme if the scheme is overridden by the user
        if (savedScheme === null) {
          const scheme = preferences?.colorScheme;
          changeColorScheme(scheme);
        }
      },
    );

    return () => subscription?.remove();
  }, [setColorTheme, savedScheme]);

  const getHoverColor = (baseColorHex, opacity = 0.8) => {
    return baseColorHex + Math.round(Math.max(Math.min(opacity, 1), 0) * 255).toString(16).toUpperCase();
  }

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorScheme, colorScheme, changeColorScheme, getHoverColor }}>
      {children}
    </ThemeContext.Provider>
  );
}
