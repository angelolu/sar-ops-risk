import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHeader, Banner, BannerGroup, HorizontalTileGroup, ThemeContext, VerticalTile, textStyles } from 'calsar-ui';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, useColorScheme, useWindowDimensions } from 'react-native';

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
    const { colorTheme, changeColorScheme, colorScheme } = useContext(ThemeContext);
    const { height, width } = useWindowDimensions();
    const styles = getStyles(colorTheme);
    const textStyle = textStyles(colorTheme, width);
    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);

    const disabledColor = colorTheme.onSurfaceVariant;

    const [appearanceState, setAppearanceState] = useState(1);
    const saveAppearance = (value) => {
        setAppearanceState(value);
        saveData("appearance", value);
    };
    const [languageState, setLanguageState] = useState("nps");
    const saveLanguage = (value) => {
        setLanguageState(value);
        saveData("language-orma", value);
    };
    const [listStyleState, setListStyleState] = useState("new");
    const saveListStyle = (value) => {
        setListStyleState(value);
        saveData("list-style", value);
    };
    const [peaceInputState, setPeaceInputState] = useState("emoji");
    const savePeaceInput = (value) => {
        setPeaceInputState(value);
        saveData("peace-input-mode", value);
    };
    const [languagePeaceState, setLanguagePeaceState] = useState("uscg");
    const saveLanguagePeace = (value) => {
        setLanguagePeaceState(value);
        saveData("language-peace", value);
    }

    useEffect(() => {
        // Load saved settings
        getData("appearance").then((value) => { value && setAppearanceState(value) });
        getData("language-orma").then((value) => { value && setLanguageState(value) });
        getData("list-style").then((value) => { value && setListStyleState(value) });
        getData("peace-input-mode").then((value) => { value && setPeaceInputState(value) });
        getData("language-peace").then((value) => { value && setLanguagePeaceState(value) });
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
                <View style={styles.listContainer}>
                    <Text style={styles.headings}>Appearance</Text>
                    <HorizontalTileGroup marginHorizontal={0}>
                        <VerticalTile
                            selected={appearanceState === 1}
                            color={appearanceState === 1 ? colorTheme.primary : colorTheme.onSurfaceVariant}
                            icon={<MaterialCommunityIcons name="theme-light-dark" size={24} />}
                            title="Device Default"
                            onPress={() => {
                                saveAppearance(1);
                                changeColorScheme(baseColorScheme);
                            }}
                        />
                        <VerticalTile
                            selected={appearanceState === 2}
                            color={appearanceState === 2 ? colorTheme.primary : colorTheme.onSurfaceVariant}
                            icon={<MaterialCommunityIcons name="weather-sunny" size={24} />}
                            title="Light"
                            onPress={() => {
                                saveAppearance(2);
                                changeColorScheme('light');
                            }}
                        />
                        <VerticalTile
                            selected={appearanceState === 3}
                            color={appearanceState === 3 ? colorTheme.primary : colorTheme.onSurfaceVariant}
                            icon={<MaterialCommunityIcons name="weather-night" size={24} />}
                            title="Dark"
                            onPress={() => {
                                saveAppearance(3);
                                changeColorScheme('dark');
                            }}
                        />
                    </HorizontalTileGroup>
                </View>
                <View style={styles.listContainer}>
                    <Text style={styles.headings}>ORMA language</Text>
                    <BannerGroup marginHorizontal={0}>
                        <Banner
                            backgroundColor={languageState === "nps" ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={languageState === "nps" ? colorTheme.primary : disabledColor}
                            icon={<MaterialIcons name="account-balance" size={24} color={languageState === "nps" ? colorTheme.primary : disabledColor} />}
                            title={<><Text style={languageState === "nps" && { fontWeight: 'bold' }}>National Parks Service</Text> (NPS)</>}
                            onPress={() => { saveLanguage("nps") }}
                        />
                        {false && <Banner
                            backgroundColor={languageState === "calsar" ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={languageState === "calsar" ? colorTheme.primary : disabledColor}
                            icon={<Ionicons name="heart-circle" size={24} color={languageState === "calsar" ? colorTheme.primary : disabledColor} />}
                            title={<><Text style={languageState === "calsar" && { fontWeight: 'bold' }}>California Search and Rescue</Text> (CALSAR)</>}
                            onPress={() => { saveLanguage("calsar") }}
                        />}
                        <Banner
                            backgroundColor={languageState === "fws" ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={languageState === "fws" ? colorTheme.primary : disabledColor}
                            icon={<Ionicons name="fish" size={24} color={languageState === "fws" ? colorTheme.primary : disabledColor} />}
                            title={<><Text style={languageState === "fws" && { fontWeight: 'bold' }}>U.S. Fish & Wildlife Service</Text></>}
                            onPress={() => { saveLanguage("fws") }}
                        />
                    </BannerGroup>
                </View>
                <View style={styles.listContainer}>
                    <Text style={styles.headings}>PEAACE language</Text>
                    <BannerGroup marginHorizontal={0}>
                        <Banner
                            backgroundColor={languagePeaceState === "nasar" ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={languagePeaceState === "nasar" ? colorTheme.primary : disabledColor}
                            icon={<Ionicons name="walk" size={24} color={languagePeaceState === "nasar" ? colorTheme.primary : disabledColor} />}
                            title={<><Text style={languagePeaceState === "nasar" && { fontWeight: 'bold' }}>NASAR</Text></>}
                            onPress={() => { saveLanguagePeace("nasar") }}
                        />
                        <Banner
                            backgroundColor={languagePeaceState === "uscg" ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={languagePeaceState === "uscg" ? colorTheme.primary : disabledColor}
                            icon={<Ionicons name="boat" size={24} color={languagePeaceState === "uscg" ? colorTheme.primary : disabledColor} />}
                            title={<><Text style={languagePeaceState === "uscg" && { fontWeight: 'bold' }}>USCG Ashore</Text></>}
                            onPress={() => { saveLanguagePeace("uscg") }}
                        />
                    </BannerGroup>
                </View>
                <View style={styles.listContainer}>
                    <Text style={styles.headings}>PEAACE input mode</Text>
                    <BannerGroup marginHorizontal={0}>
                        <Banner
                            backgroundColor={peaceInputState === "emoji" ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={peaceInputState === "emoji" ? colorTheme.primary : disabledColor}
                            icon={<MaterialCommunityIcons name="emoticon-happy-outline" size={24} color={peaceInputState === "emoji" ? colorTheme.primary : disabledColor} />}
                            title={<><Text style={peaceInputState === "emoji" && { fontWeight: 'bold' }}>Emoji</Text></>}
                            onPress={() => { savePeaceInput("emoji") }}
                        />
                        <Banner
                            backgroundColor={peaceInputState === "text" ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={peaceInputState === "text" ? colorTheme.primary : disabledColor}
                            icon={<MaterialCommunityIcons name="format-list-bulleted" size={24} color={peaceInputState === "text" ? colorTheme.primary : disabledColor} />}
                            title={<><Text style={peaceInputState === "text" && { fontWeight: 'bold' }}>Text</Text> with descriptions</>}
                            onPress={() => { savePeaceInput("text") }}
                        />
                    </BannerGroup>
                </View>
                <View style={styles.listContainer}>
                    <Text style={styles.headings}>List style</Text>
                    <BannerGroup gap={2} marginHorizontal={0}>
                        <Banner
                            backgroundColor={listStyleState === "new" ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={listStyleState === "new" ? colorTheme.primary : disabledColor}
                            icon={<Ionicons name="heart-circle" size={24} color={listStyleState === "new" ? colorTheme.primary : disabledColor} />}
                            title={<><Text style={listStyleState === "new" && { fontWeight: 'bold' }}>New</Text></>}
                            onPress={() => { saveListStyle("new") }}
                        />
                        <Banner
                            backgroundColor={listStyleState === "legacy" ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainerLow}
                            color={listStyleState === "legacy" ? colorTheme.primary : disabledColor}
                            icon={<MaterialIcons name="account-balance" size={24} color={listStyleState === "legacy" ? colorTheme.primary : disabledColor} />}
                            title={<><Text style={listStyleState === "legacy" && { fontWeight: 'bold' }}>Legacy</Text> (NPS Risk)</>}
                            onPress={() => { saveListStyle("legacy") }}
                        />
                    </BannerGroup>
                </View>
            </ScrollView >
        </View >
    );
}

const getStyles = (colorTheme) => {

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
            gap: 8
        },
        mainScroll: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingHorizontal: 20,
            gap: 20,
        },
        headings: {
            color: colorTheme.onPrimaryContainer,
            fontWeight: 'bold',
        },
        text: {
            color: colorTheme.onBackground
        }
    });
}
