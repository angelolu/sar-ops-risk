import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import React, { useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { FilledButton, IconButton, BrandingBar, Header, Tile, RiskModal, ThemeContext, MaterialCard, Banner } from 'calsar-ui';

export default function App() {
    const styles = pageStyles();
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);
    const { width } = useWindowDimensions();

    const [files, setFiles] = useState([]);
    const [modalShowing, setModalShowing] = useState(false);

    useFocusEffect(
        // Callback should be wrapped in `React.useCallback` to avoid running the effect too often.
        useCallback(() => {
            // Invoked whenever the route is focused.
            reloadData();
        }, [])
    );

    const reloadData = () => {
        getData("localFiles").then((value) => {
            if (value) {
                let fileLoadingPromises = value.map(fileUUID => getData(fileUUID + "-incidentInfo"));
                Promise.allSettled(fileLoadingPromises).then((results) => {
                    let newFiles = [];
                    results.forEach((result) => result.value && newFiles.push(result.value))
                    setFiles(newFiles);
                });
            }
        });
    }

    const deleteFileWithUUID = (UUID) => {
        getData("localFiles").then((value) => {
            if (value) {
                const index = value.indexOf(UUID);
                if (index > -1) {
                    value.splice(index, 1);
                }
                saveData("localFiles", value)
            }
        })
        removeItem(UUID + "-incidentInfo");
        removeItem(UUID + "-userInfo");
        removeItem(UUID + "-teamsInfo");
        removeItem(UUID + "-auditInfo");
    }

    return (
        <View style={styles.background}>
            <Header style={styles.header}>
                <BrandingBar
                    textColor={styles.header.color}
                    title="Operation Management Tools"
                    menuButton={<IconButton ionicons_name={"settings"} onPress={() => { router.navigate("settings") }} color={colorTheme.onPrimaryContainer} size={24} />}
                />
            </Header>
            <ScrollView
                contentContainerStyle={[styles.mainScroll, { width: (width > 1200 ? 1200 : width) }]}>
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.headerText}>Files</Text>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                        {width > 600 ?
                            <FilledButton small={width <= 600} icon="folder-open" text="Open" onPress={() => { }} /> :
                            <IconButton small tonal ionicons_name="folder-open" onPress={() => { }} />}

                        <FilledButton primary small={width <= 600} icon="add" text="New file" onPress={() => router.navigate("/new")} />
                    </View>
                </View>
                <View style={{ gap: 20 }}>
                    {files.length === 0 ?
                        <MaterialCard
                            noMargin
                            title="Let's get started!">

                            <View style={{ flexDirection: (width > 600 ? "row" : "column"), gap: 12, marginTop: 14, flexWrap: (width > 600 ? "wrap" : "no-wrap") }}>
                                <Banner
                                    backgroundColor={colorTheme.surfaceContainerHigh}
                                    color={colorTheme.onSurface}
                                    icon={<Ionicons name="planet" size={24} color={colorTheme.onSurface} />}
                                    title={"Create your first file or open a file using the buttons above"} />
                                <Banner
                                    backgroundColor={colorTheme.surfaceContainerHigh}
                                    color={colorTheme.onSurface}
                                    icon={<Ionicons name="trail-sign" size={24} color={colorTheme.onSurface} />}
                                    title={"Making one file per operational period is recommended"} />
                                <Banner
                                    backgroundColor={colorTheme.surfaceContainerHigh}
                                    color={colorTheme.onSurface}
                                    icon={<Ionicons name="hourglass" size={24} color={colorTheme.onSurface} />}
                                    title={"Adjust app settings, such as the contact timeout, by tapping the cog icon in the header"} />
                            </View>
                        </ MaterialCard>

                        :
                        <View style={[styles.timerSection, { flexDirection: "column-reverse" }]}>
                            {files.map(item => (
                                <Tile
                                    key={item.uuid}
                                    href={"/" + item.uuid}
                                    icon={<Ionicons name="document" size={20} color={colorTheme.primary} />}
                                    title={item.name || "Untitled file"}
                                    subtitle={("Created " + new Date(item.created).toLocaleString('en-US', { hour12: false }))}
                                >
                                    <IconButton small ionicons_name="trash" onPress={() => { setModalShowing(item) }} />
                                </Tile>
                            ))}

                        </View>
                    }
                    <MaterialCard
                        noMargin
                        title="Disclaimer">
                        <Text style={[styles.text]}>{`The app is provided "as is" without any warranties, express or implied. The author of the app shall not be liable for any errors or omissions in the app, including but not limited to bugs or malfunctions. You understand that using any software, including this app, involves the risk of data loss. It is your responsibility to maintain regular backups of all critical data and to have adequate fallback mechanisms. You assume all risks associated with the use of the app, including but not limited to any potential harm or injury resulting from reliance on the app's data or functionality.`}</Text>
                    </MaterialCard>
                </View>
            </ScrollView>
            <RiskModal
                isVisible={modalShowing ? true : false}
                title={"Delete file?"}
                onClose={() => { setModalShowing(false) }}>
                <View style={{
                    padding: 20, paddingTop: 0, gap: 20
                }}>
                    <Text style={{ color: colorTheme.onSurface }}>{modalShowing.name || "This untitled file"} will be permanently deleted. Download the file before deleting if needed for record keeping.</Text>
                    <FilledButton
                        rightAlign
                        destructive
                        text={"Delete file"}
                        onPress={() => {
                            deleteFileWithUUID(modalShowing.uuid);
                            setModalShowing(false);
                            reloadData();
                        }} />
                </View>
            </RiskModal>
        </View >
    );
}

const removeItem = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
        // saving error
    }
};

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

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    return StyleSheet.create({
        background: {
            backgroundColor: colorTheme.background,
            height: '100%'
        },
        container: {
            flex: 1,
            flexGrow: 1,
            flexDirection: 'column',
            backgroundColor: colorTheme.background,
            height: '100%',
            alignSelf: 'center',
            paddingHorizontal: 20,
            gap: 12
        },
        mainScroll: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingRight: 20,
            paddingLeft: 20,
            gap: 20,
            alignSelf: 'center',
        },
        sectionTitle: {
            color: colorTheme.onBackground,
            fontSize: 20,
        },
        timerSection: {
            gap: 4,
            borderRadius: 26,
            overflow: 'hidden'
        },
        standaloneCard: {
            borderRadius: 26,
            overflow: 'hidden',
            paddingHorizontal: 18,
            paddingVertical: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: 'space-between',
            backgroundColor: colorTheme.surfaceContainer
        },
        card: {
            borderRadius: 6,
            paddingHorizontal: 18,
            paddingVertical: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: width > 600 ? 12 : 8,
            justifyContent: 'space-between',
            backgroundColor: colorTheme.surfaceContainer
        },
        sectionContainer: {
            flexGrow: 1,
            justifyContent: 'space-between',
            flexDirection: 'column',
        },
        buttonContainer: {
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'space-around',
            gap: 8
        },
        sectionTitleContainer: {
            justifyContent: 'space-between',
            alignItems: "center",
            flexDirection: 'row',
            gap: 8
        },
        text: {
            fontSize: width > 600 ? 14 : 12,
            color: colorTheme.onSurface
        },
        headerText: {
            fontSize: width > 600 ? 24 : 20,
            color: colorTheme.onBackground
        },
        sectionBodyText: {
            fontSize: width > 600 ? 28 : 20,
            color: colorTheme.onSurface
        },
        sectionBodyTextSmall: {
            fontSize: width > 600 ? 20 : 16,
            color: colorTheme.onSurface
        },
        header: {
            padding: 14,
            backgroundColor: colorTheme.brand,
            color: colorTheme.white,
        },
    });
}