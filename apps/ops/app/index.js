import { Ionicons } from '@expo/vector-icons';
import { Banner, BrandingBar, FilledButton, Header, IconButton, RiskModal, textStyles, ThemeContext, Tile } from 'calsar-ui';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { getAuth } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFirebase } from '../components/FirebaseContext';
import { RxDBContext } from '../components/RxDBContext';
import { getAsyncStorageData, getElapsedTimeString, getSimpleDateString, saveAsyncStorageData } from '../components/helperFunctions';

export default function App() {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = getStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);
    const { createFile, getFiles, deleteFile, restartSync, replicationStatus } = useContext(RxDBContext)
    const { isAuthenticated, waitForFirebaseReady, currentUser, signOut, signInWithGoogle } = useFirebase();

    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);

    const [localFiles, setLocalFiles] = useState([]);
    const [cloudFiles, setCloudFiles] = useState([]);

    const [syncedFiles, setSyncedFiles] = useState([]);
    const [readyFiles, setReadyFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState([]);
    const [modalDocument, setModalDocument] = useState(false);

    useEffect(() => {
        getFiles().then(query => {
            query.$.subscribe(files => {
                let newCloudFiles = [];
                let newLocalFiles = [];
                files.forEach((result) => {
                    if (result.type === "cloud") {
                        newCloudFiles.push(result);
                    } else {
                        newLocalFiles.push(result);
                    }
                });
                setCloudFiles(newCloudFiles);
                setLocalFiles(newLocalFiles);
                refreshIntendedFiles();
            });
            return () => {
                query.$.unsubscribe();
                setCloudFiles([]);
                setLocalFiles([]);
            };
        });
    }, []);

    const refreshIntendedFiles = async () => {
        return Promise.all([getAsyncStorageData("readyFiles"), getAsyncStorageData("syncedFiles")]).then((values) => {
            setReadyFiles(values[0] || []);
            setSyncedFiles(values[1] || []);
            // loadingFiles are the files in syncedFiles but not in readyFiles
            if (syncedFiles && syncedFiles.length > 0 && values[1] && values[0]) {
                setLoadingFiles(values[1] ? values[1].filter(id => !values[0].includes(id)) : []);
            }
        });
    }

    useEffect(() => {
        waitForFirebaseReady().then(() => {
            if (getAuth().currentUser) {
                refreshIntendedFiles();
            }
        });
    }, [isAuthenticated]);

    const handleDeleteFile = (file) => {
        if (file.type === "cloud") {
            // Remove from readyFiles and syncedFiles
            Promise.allSettled([getAsyncStorageData("readyFiles"), getAsyncStorageData("syncedFiles")]).then((values) => {
                let readyFiles = values[0].value || [];
                let syncedFiles = values[1].value || [];
                readyFiles = readyFiles.filter(id => id !== file.id);
                syncedFiles = syncedFiles.filter(id => id !== file.id);
                saveAsyncStorageData("readyFiles", readyFiles);
                saveAsyncStorageData("syncedFiles", syncedFiles);
                setReadyFiles(readyFiles);
                setSyncedFiles(syncedFiles);
            });
        }

        deleteFile(file);
    }

    const handleNewFile = (cloud) => {
        createFile(cloud).then(id => {
            if (cloud) {
                Promise.allSettled([getAsyncStorageData("readyFiles"), getAsyncStorageData("syncedFiles")]).then((values) => {
                    Promise.allSettled([
                        saveAsyncStorageData("syncedFiles", values[1].value ? [...values[1].value, id] : [id]),
                        saveAsyncStorageData("readyFiles", values[0].value ? [...values[0].value, id] : [id])
                    ]).then(() => {
                        restartSync();
                        router.navigate(id);
                    });
                });
            } else {
                router.navigate(id);
            }
        });
    }

    const handleClickToOpen = (file) => {
        if (file.type === "cloud") {
            // Start syncing file
            if (isAuthenticated) {
                if (syncedFiles && !syncedFiles.includes(file.id)) {
                    setLoadingFiles([...loadingFiles, file.id]);
                    const newSyncedFiles = [...syncedFiles, file.id];
                    setSyncedFiles(newSyncedFiles);
                    saveAsyncStorageData("syncedFiles", newSyncedFiles).then(() => {
                        restartSync();
                        const interval = setInterval(() => {
                            getAsyncStorageData("readyFiles").then(readyFiles => {
                                if (readyFiles && readyFiles.includes(file.id)) {
                                    clearInterval(interval);
                                    refreshIntendedFiles();
                                }
                            });
                        }, 1000);
                        // Navigate to the file and hope it's ready
                        router.navigate(file.id);
                    });
                } else {
                    // [file] will determine if the file is ready
                    router.navigate(file.id);
                }
            } else {
                console.error("Trying to open a cloud file without being authenticated");
            }
        } else {
            router.navigate(file.id);
        }
    }

    return (
        <View style={styles.background}>
            <Header style={styles.header}>
                <BrandingBar
                    noLogo
                    textColor={styles.header.color}
                    title="Operation Management Tools"
                    menuButton={<IconButton
                        ionicons_name={"settings-outline"}
                        onPress={() => { router.navigate("settings") }}
                        color={styles.header.color}
                        size={24} />}
                />
            </Header>
            <ScrollView
                contentContainerStyle={[styles.mainScroll, { width: (width > 1200 ? 1200 : width) }]}>
                <Banner
                    backgroundColor={colorTheme.secondaryContainer}
                    color={colorTheme.onSecondaryContainer}
                    icon={<Ionicons name="warning-outline" size={24} color={colorTheme.onSecondaryContainer} />}
                    title="This app is a work in progress. Please only use it at training events and don't input sensitive data. There is a risk of data loss."
                />
                {isAuthenticated ?
                    <>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <View style={{ flexDirection: "column", gap: 8, flex: 1 }}>
                                <Text style={textStyle.rowTitleTextBold}>Cloud-saved files</Text>
                                {isAuthenticated && currentUser &&
                                    <>
                                        <Text style={textStyle.secondaryText}>{`These files sync in real-time after they are opened, when possible`}</Text>
                                    </>
                                }
                            </View>
                            <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
                                <FilledButton onPress={signOut} text="Sign Out" />
                                <FilledButton primary small={width <= 600} icon="add" text="Cloud file" onPress={() => handleNewFile(true)} />
                            </View>
                        </View>
                        {cloudFiles.length === 0 ?
                            <View style={{ flexDirection: (width > 600 ? "row" : "column"), gap: 12, flexWrap: (width > 600 ? "wrap" : "no-wrap") }}>
                                <Banner
                                    backgroundColor={colorTheme.surfaceContainer}
                                    color={colorTheme.onSurface}
                                    icon={<Ionicons name="cloud-outline" size={24} color={colorTheme.onSurface} />}
                                    title={"Cloud saves are shared with your organization"} />
                            </View>
                            :
                            <FlatList
                                data={cloudFiles}
                                contentContainerStyle={styles.filesSection}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <Tile
                                        onPress={() => handleClickToOpen(item)}
                                        icon={<Ionicons name="document" size={20} color={colorTheme.primary} />}
                                        title={item.fileName || "Untitled file"}
                                        subtitle={(`Updated ${getElapsedTimeString(item.updated)}. Created ${getSimpleDateString(item.created)}.`)}
                                    >
                                        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                            <>{loadingFiles.includes(item.id) ?
                                                <Ionicons name={"cloud-download"} size={16} color={colorTheme.onSurface} />
                                                :
                                                <Ionicons name={(!replicationStatus || !replicationStatus?.started) ? "cloud-download" : syncedFiles.includes(item.id) ? readyFiles.includes(item.id) ? "cloud-done" : "thunderstorm" : "cloud-download-outline"} size={16} color={colorTheme.onSurface} />

                                            }</>
                                            <IconButton small ionicons_name="trash" onPress={() => { setModalDocument(item) }} />
                                        </View>
                                    </Tile>
                                )}
                            />
                        }
                    </>
                    :
                    <View style={[styles.card, { flexDirection: "column", gap: 17, alignItems: "center" }]}>
                        <Text style={textStyle.cardTitleText}>Not signed in</Text>
                        <Text style={textStyle.text}>Have a @ca-sar.org email? Sign in to collaborate with your team.</Text>
                        <FilledButton primary icon="log-in-outline" text="Sign in with Google" onPress={signInWithGoogle} />
                    </View>
                }
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "column", gap: 8, flex: 1 }}>
                        <Text style={textStyle.rowTitleTextBold}>Locally-saved files</Text>
                        <Text style={textStyle.secondaryText}>{`These files are stored in this browser. Clearing browsing data or your privacy settings may delete them.`}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                        <FilledButton primary small={width <= 600} icon="add" text="Local file" onPress={() => handleNewFile(false)} />
                    </View>
                </View>
                {localFiles.length === 0 ?
                    <View style={{ flexDirection: (width > 600 ? "row" : "column"), gap: 12, flexWrap: (width > 600 ? "wrap" : "no-wrap") }}>
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="flame-outline" size={24} color={colorTheme.onSurface} />}
                            title={"Create your first file with the button above"} />
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="documents-outline" size={24} color={colorTheme.onSurface} />}
                            title={"Making one file per operational period is recommended"} />
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="hourglass-outline" size={24} color={colorTheme.onSurface} />}
                            title={"Adjust app settings, such as the theme, by tapping the cog icon in the header"} />
                    </View>
                    :
                    <FlatList
                        data={localFiles}
                        contentContainerStyle={styles.filesSection}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <Tile
                                onPress={() => handleClickToOpen(item)}
                                icon={<Ionicons name="document" size={20} color={colorTheme.primary} />}
                                title={item.fileName || "Untitled file"}
                                subtitle={(`Updated ${getElapsedTimeString(item.updated)}. Created ${getSimpleDateString(item.created)}.`)}
                            >
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    <IconButton small ionicons_name="trash" onPress={() => { setModalDocument(item) }} />
                                </View>
                            </Tile>
                        )}
                    />
                }
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colorTheme.surfaceContainerHigh }} />
                <Text style={[textStyle.tertiaryText]}>{`Disclaimer: The app is provided "as is" without any warranties, express or implied. The author of the app shall not be liable for any errors or omissions in the app, including but not limited to bugs or malfunctions. You understand that using any software, including this app, involves the risk of data loss. It is your responsibility to maintain regular backups of all critical data and to have adequate fallback mechanisms. You assume all risks associated with the use of the app, including but not limited to any potential harm or injury resulting from reliance on the app's data or functionality.`}</Text>
            </ScrollView>
            <RiskModal
                isVisible={modalDocument ? true : false}
                title={"Delete file?"}
                onClose={() => { setModalDocument(false) }}>
                <View style={{
                    padding: 20, paddingTop: 0, gap: 20
                }}>
                    <Text style={textStyle.text}>{modalDocument.fileName || "This untitled file"} will be permanently deleted from all devices</Text>
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

const getStyles = (colorTheme, width) => {

    return StyleSheet.create({
        background: {
            backgroundColor: colorTheme.background,
            height: '100%'
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
            padding: 24,
            gap: 8,
            borderRadius: 26,
            overflow: 'hidden',
            backgroundColor: colorTheme.surfaceContainer
        },
        header: {
            padding: 14,
            backgroundColor: colorTheme.brand,
            color: colorTheme.white,
        },
    });
}