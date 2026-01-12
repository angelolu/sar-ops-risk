import { Ionicons } from '@expo/vector-icons';
import { BackHeader, Banner, textStyles, ThemeContext } from 'calsar-ui';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from 'react-native';
import { getAsyncStorageData, saveAsyncStorageData } from '../../components/helperFunctions';

export default function Settings() {
    const { colorTheme, changeColorScheme, colorScheme } = useContext(ThemeContext);

    const { height, width } = useWindowDimensions();
    const styles = pageStyles(colorTheme);
    const textStyle = textStyles(colorTheme, width);

    const [appearanceState, setAppearanceState] = useState(1);

    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);
    const disabledColor = colorTheme.onSurfaceVariant;

    const saveAppearance = (value) => {
        setAppearanceState(value);
        saveAsyncStorageData("appearance", value);
    };

    useEffect(() => {
        // Load saved settings
        getAsyncStorageData("appearance").then((value) => { value && setAppearanceState(value) });
    }, []);

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
                    <Text style={textStyle.sectionTitleText}>Appearance</Text>
                    <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginTop: 12 }}>
                        <Banner
                            backgroundColor={appearanceState === 1 ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={appearanceState === 1 ? colorTheme.secondary : disabledColor}
                            icon={<Ionicons name={appearanceState === 1 ? "star-half" : "star-half-outline"} size={24} color={appearanceState === 1 ? colorTheme.secondary : disabledColor} />}
                            title={<>Device Default ({baseColorScheme})</>}
                            onPress={() => {
                                saveAppearance(1);
                                changeColorScheme(baseColorScheme);
                            }}
                            selected={appearanceState === 1}
                            noRadius />
                        <Banner
                            backgroundColor={appearanceState === 2 ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={appearanceState === 2 ? colorTheme.secondary : disabledColor}
                            icon={<Ionicons name={appearanceState === 2 ? "sunny" : "sunny-outline"} size={24} color={appearanceState === 2 ? colorTheme.secondary : disabledColor} />}
                            title={<>Light</>}
                            onPress={() => {
                                saveAppearance(2);
                                changeColorScheme('light');
                            }}
                            selected={appearanceState === 2}
                            noRadius />
                        <Banner
                            backgroundColor={appearanceState === 3 ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={appearanceState === 3 ? colorTheme.secondary : disabledColor}
                            icon={<Ionicons name={appearanceState === 3 ? "moon" : "moon-outline"} size={24} color={appearanceState === 3 ? colorTheme.secondary : disabledColor} />}
                            title={<>Dark</>}
                            onPress={() => {
                                saveAppearance(3);
                                changeColorScheme('dark');
                            }}
                            selected={appearanceState === 3}
                            noRadius />

                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const pageStyles = (colorTheme) => {

    return StyleSheet.create({
        background: {
            backgroundColor: colorTheme.background,
            height: '100%'
        },
        container: {
            flex: 1,
            backgroundColor: colorTheme.background,
            height: '100%',
            alignSelf: 'center'
        },
        containerWeb: {
            backgroundColor: colorTheme.background,
            height: '100%',
            alignSelf: 'center'
        },
        listContainer: {
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
