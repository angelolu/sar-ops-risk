import React, { createContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const ThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState(useColorScheme());
  const [colorTheme, setColorTheme] = useState(colorScheme === 'light' ? themeColors.schemes.light : themeColors.schemes.dark);

  const [savedScheme, setSavedScheme] = useState(null);

  const changeColorScheme = (scheme) => {
    if (scheme === 'dark' || scheme === 'light') setColorScheme(scheme);
    setColorTheme(scheme === 'light' ? themeColors.schemes.light : themeColors.schemes.dark);
  }

  useEffect(() => {
    // Update scheme if it has been overridden by the user
    getData("appearance").then((value) => {
      if (value === 2) {
        changeColorScheme('light');
        setSavedScheme(2);
      } else if (value === 3) {
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
          setColorScheme(scheme);

          const theme = scheme === 'light' ? themeColors.schemes.light : themeColors.schemes.dark;
          setColorTheme(theme);
        }
      },
    );

    return () => subscription?.remove();
  }, [setColorScheme, setColorTheme, savedScheme]);

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorScheme, colorScheme, changeColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
