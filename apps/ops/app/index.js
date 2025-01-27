import { Ionicons } from '@expo/vector-icons';
import { Banner, BrandingBar, FilledButton, Header, IconButton, MaterialCard, RiskModal, ThemeContext, Tile } from 'calsar-ui';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { RxDBContext } from '../components/RxDBContext';

export default function App() {
    const styles = pageStyles();
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);
    const { width } = useWindowDimensions();

    const [files, setFiles] = useState([]);
    const [modalDocument, setModalDocument] = useState(false);

    const { createFile, getFiles, deleteFile } = useContext(RxDBContext)

    useEffect(() => {
        getFiles().then(query => {
            query.$.subscribe(files => {
                let newFiles = [];
                files.forEach((result) => newFiles.push(result))
                setFiles(newFiles);
            });
        });
    }, []);

    const handleDeleteFile = (file) => {
        deleteFile(file);
    }

    const handleNewFile = () => {
        createFile().then(id => {
            router.navigate(id);
        });
    }

    const calculateElapsedTime = (dateString) => {
        if (dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffInMs = now - date;

            const seconds = Math.floor(diffInMs / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);

            if (seconds < 60) {
                return "just now";
            } else if (minutes < 60) {
                return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
            } else if (hours < 48) {
                return `${hours} hour${hours === 1 ? "" : "s"} ago`;
            } else {
                return date.toLocaleString('en-US', { hour12: false });
            }
        } else {
            return "an unknown time ago";
        }
    }

    return (
        <View style={styles.background}>
            <Header style={styles.header}>
                <BrandingBar
                    textColor={styles.header.color}
                    title="Operation Management Tools"
                    menuButton={<IconButton
                        ionicons_name={"settings-outline"}
                        onPress={() => { router.navigate("settings") }}
                        color={colorTheme.onPrimaryContainer}
                        size={24} />}
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

                        <FilledButton primary small={width <= 600} icon="add" text="New file" onPress={() => handleNewFile()} />
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
                        <View style={[styles.filesSection, { flexDirection: "column-reverse" }]}>
                            {files.map(item => (
                                <Tile
                                    key={item.id}
                                    href={"/" + item.id}
                                    icon={<Ionicons name="document" size={20} color={colorTheme.primary} />}
                                    title={item.fileName || "Untitled file"}
                                    subtitle={(`Updated ${calculateElapsedTime(item.updated)}. Created ${calculateElapsedTime(item.created)}.`)}
                                >
                                    <IconButton small ionicons_name="trash" onPress={() => { setModalDocument(item) }} />
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
                isVisible={modalDocument ? true : false}
                title={"Delete file?"}
                onClose={() => { setModalDocument(false) }}>
                <View style={{
                    padding: 20, paddingTop: 0, gap: 20
                }}>
                    <Text style={{ color: colorTheme.onSurface }}>{modalDocument.name || "This untitled file"} will be permanently deleted. Download the file before deleting if needed for record keeping.</Text>
                    <FilledButton
                        rightAlign
                        destructive
                        text={"Delete file"}
                        onPress={() => {
                            handleDeleteFile(modalDocument);
                            setModalDocument(false);
                        }} />
                </View>
            </RiskModal>
        </View >
    );
}

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
        filesSection: {
            gap: 4,
            borderRadius: 26,
            overflow: 'hidden'
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
        text: {
            fontSize: width > 600 ? 14 : 12,
            color: colorTheme.onSurface
        },
        headerText: {
            fontSize: width > 600 ? 24 : 20,
            color: colorTheme.onBackground
        },
        header: {
            padding: 14,
            backgroundColor: colorTheme.brand,
            color: colorTheme.white,
        },
    });
}