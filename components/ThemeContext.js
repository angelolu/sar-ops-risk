import React, { createContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';

import themeColors from '../assets/theme.json';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState(useColorScheme());
  const [colorTheme, setColorTheme] = useState(colorScheme === 'light' ? themeColors.schemes.light : themeColors.schemes.dark);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      (preferences) => {
        const scheme = preferences?.colorScheme;
        setColorScheme(scheme);

        const theme = scheme === 'light' ? themeColors.schemes.light : themeColors.schemes.dark;
        setColorTheme(theme);
      },
    );

    return () => subscription?.remove();
  }, [setColorScheme, setColorTheme]);

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
