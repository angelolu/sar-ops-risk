import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useState, useEffect } from 'react';
import { Platform, StyleSheet, Text, View, useColorScheme, ScrollView, useWindowDimensions } from 'react-native';
import Banner from '../../components/Banner';
import { ThemeContext } from '../../components/ThemeContext';
import { BackHeader } from '../../components/Headers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const saveData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        // saving error
    }
};

const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        // error reading value
    }
};

export default function Settings() {
    const styles = pageStyles();
    const riskStyles = riskInputStyles();
    const { colorTheme, changeColorScheme, colorScheme } = useContext(ThemeContext);
    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);

    const disabledColor = colorTheme.onSurfaceVariant;

    const [appearanceState, setAppearanceState] = useState(1);
    const saveAppearance = (value) => {
        setAppearanceState(value);
        saveData("appearance", value);
    };
    const [languageState, setLanguageState] = useState(1);
    const saveLanguage = (value) => {
        setLanguageState(value);
        saveData("language", value);
    };

    useEffect(() => {
        // Load saved settings
        getData("appearance").then((value) => { value && setAppearanceState(value) });
        getData("language").then((value) => { value && setLanguageState(value) });
    }, []);

    const { height, width } = useWindowDimensions();
    const baseColorScheme = useColorScheme();

    return (
        <View style={styles.background}>
            <BackHeader
                title="Settings"
                backgroundColor={colorTheme.primaryContainer}
                color={colorTheme.onPrimaryContainer}
            />
            <ScrollView
                style={[
                    Platform.OS === 'web' ? styles.containerWeb : styles.container,
                    { width: (width > 850 ? 850 : width) }
                ]}
                contentContainerStyle={styles.mainScroll}>
                <View>
                    <Text style={styles.headings}>Appearance</Text>
                    <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginTop: 12 }}>
                        <Banner
                            backgroundColor={appearanceState === 1 ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={appearanceState === 1 ? colorTheme.tertiary : disabledColor}
                            icon={<MaterialCommunityIcons name="theme-light-dark" size={24} color={appearanceState === 1 ? colorTheme.tertiary : disabledColor} />}
                            title={<><Text style={appearanceState === 1 && riskStyles.boldText}>Device Default</Text> ({baseColorScheme})</>}
                            onPress={() => {
                                saveAppearance(1);
                                changeColorScheme(baseColorScheme);
                            }}
                            noRadius />
                        <Banner
                            backgroundColor={appearanceState === 2 ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={appearanceState === 2 ? colorTheme.tertiary : disabledColor}
                            icon={<MaterialCommunityIcons name="weather-sunny" size={24} color={appearanceState === 2 ? colorTheme.tertiary : disabledColor} />}
                            title={<><Text style={appearanceState === 2 && riskStyles.boldText}>Light</Text></>}
                            onPress={() => {
                                saveAppearance(2);
                                changeColorScheme('light');
                            }}
                            noRadius />
                        <Banner
                            backgroundColor={appearanceState === 3 ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={appearanceState === 3 ? colorTheme.tertiary : disabledColor}
                            icon={<MaterialCommunityIcons name="weather-night" size={24} color={appearanceState === 3 ? colorTheme.tertiary : disabledColor} />}
                            title={<><Text style={appearanceState === 3 && riskStyles.boldText}>Dark</Text></>}
                            onPress={() => {
                                saveAppearance(3);
                                changeColorScheme('dark');
                            }}
                            noRadius />

                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        background: {
            backgroundColor: colorTheme.background,
            height: '100%'
        },
        container: {
            flex: 1,
            backgroundColor: colorTheme.background,
            height: '100%'
        },
        containerWeb: {
            backgroundColor: colorTheme.background,
            height: '100%',
            alignSelf: 'center'
        },
        listContainer: {
        },
        boldText: {
            fontWeight: 'bold',
        },
        mainScroll: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingHorizontal: 20,
            gap: 20,
        },
        headings: {
            fontSize: 22,
            color: colorTheme.onBackground,
        },
        text: {
            color: colorTheme.onBackground
        }
    });
}

const riskInputStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        container: {
            padding: 20,
            paddingTop: 0
        },
        subtitle: {
            color: colorTheme.onSurface,
            fontSize: 16
        },
        description: {
            flex: -1,
            flexShrink: 1
        },
        boldText: {
            fontWeight: 'bold',
        },
    });
}