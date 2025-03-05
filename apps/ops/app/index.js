import { Ionicons } from '@expo/vector-icons';
import { Banner, BrandingBar, FilledButton, Header, IconButton, MaterialCard, RiskModal, textStyles, ThemeContext, Tile } from 'calsar-ui';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useFirebase } from '../components/FirebaseContext';
import { RxDBContext } from '../components/RxDBContext';
import { getAsyncStorageData, getElapsedTimeString, getSimpleDateString, saveAsyncStorageData } from '../components/helperFunctions';

export default function App() {
    const styles = pageStyles();
    const textStyle = textStyles();
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const { createFile, getFiles, deleteFile, restartSync } = useContext(RxDBContext)
    const { waitForFirebaseReady } = useFirebase();

    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);

    const [files, setFiles] = useState([]);
    const [syncedFiles, setSyncedFiles] = useState([]);
    const [modalDocument, setModalDocument] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        getFiles().then(query => {
            query.$.subscribe(files => {
                let newFiles = [];
                files.forEach((result) => newFiles.push(result));
                setFiles(newFiles);
                getAsyncStorageData("readyFiles").then(syncedFiles => {
                    setSyncedFiles(syncedFiles || []);
                });
            });
            return () => { query.$.unsubscribe() };
        });
        waitForFirebaseReady().then(() => {
            onAuthStateChanged(getAuth(), (user) => {
                setUser(user);
            });
        });
    }, []);

    const handleDeleteFile = (file) => {
        deleteFile(file);
    }

    const handleNewFile = () => {
        createFile().then(id => {
            getAsyncStorageData("readyFiles").then(syncedFiles => {
                saveAsyncStorageData("readyFiles", syncedFiles ? [...syncedFiles, id] : [id]);
            });
            getAsyncStorageData("syncedFiles").then(syncedFiles => {
                setSyncedFiles(syncedFiles ? [...syncedFiles, id] : [id]);
            });
            router.navigate(id);
        });
    }

    const handleClickToOpen = (fileId) => {
        // Start syncing file
        if (user) {
            if (!syncedFiles.includes(fileId)) {
                const newSyncedFiles = [...syncedFiles, fileId];
                setSyncedFiles(newSyncedFiles);
                saveAsyncStorageData("syncedFiles", newSyncedFiles).then(() => {
                    restartSync();
                    // poll "readyFiles" until it includes fileId
                    const interval = setInterval(() => {
                        getAsyncStorageData("readyFiles").then(readyFiles => {
                            if (readyFiles && readyFiles.includes(fileId)) {
                                clearInterval(interval);
                                console.log("File is ready to open");
                                router.navigate(fileId);
                            }
                        });
                    }, 1000);
                });
            } else {
                router.navigate(fileId);
            }
        } else {
            router.navigate(fileId);
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
                    icon={<Ionicons name="document-lock" size={24} color={colorTheme.onSecondaryContainer} />}
                    title="This app is a work in progress. Please only use it at training events and don't input sensitive data. There is a risk of data loss."
                />
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={textStyle.pageNameText}>Files</Text>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                        <FilledButton primary small={width <= 600} icon="add" text="New file" onPress={() => handleNewFile()} />
                    </View>
                </View>
                <SignInComponent />
                <View style={{ gap: 20 }}>
                    {files.length === 0 ?
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
                        <View style={[styles.filesSection, { flexDirection: "column-reverse" }]}>
                            {files.map(item => (
                                <Tile
                                    key={item.id}
                                    onPress={() => handleClickToOpen(item.id)}
                                    icon={<Ionicons name="document" size={20} color={colorTheme.primary} />}
                                    title={item.fileName || "Untitled file"}
                                    subtitle={(`Updated ${getElapsedTimeString(item.updated)}. Created ${getSimpleDateString(item.created)}.`)}
                                >
                                    <View style={{ flexDirection: "row", gap: 8 }}>
                                        <IconButton small ionicons_name={syncedFiles.includes(item.id) ? "cloud-done-outline" : "cloud-outline"} />
                                        <IconButton small ionicons_name="trash" onPress={() => { setModalDocument(item) }} />
                                    </View>
                                </Tile>
                            ))}

                        </View>
                    }
                    <MaterialCard
                        noMargin
                        title="Disclaimer">
                        <Text style={[textStyle.secondaryText]}>{`The app is provided "as is" without any warranties, express or implied. The author of the app shall not be liable for any errors or omissions in the app, including but not limited to bugs or malfunctions. You understand that using any software, including this app, involves the risk of data loss. It is your responsibility to maintain regular backups of all critical data and to have adequate fallback mechanisms. You assume all risks associated with the use of the app, including but not limited to any potential harm or injury resulting from reliance on the app's data or functionality.`}</Text>
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
                    <Text style={textStyle.text}>{modalDocument.name || "This untitled file"} will be permanently deleted. Download the file before deleting if needed for record keeping.</Text>
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

const SignInComponent = () => {
    const textStyle = textStyles();
    const styles = pageStyles();

    const { signInWithGoogle, waitForFirebaseReady } = useFirebase();
    const [user, setUser] = useState(null);

    // Start tracking firebase auth state
    useEffect(() => {
        waitForFirebaseReady().then(() => {
            const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
                setUser(user);
            });
            return () => unsubscribe();
        });
    }, []);

    return <View style={styles.card}>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <>{user ?
                <>
                    <View style={{ flexDirection: "column", gap: 4, flex: 1 }}>
                        <Text style={textStyle.cardTitleText}>Hey {user.displayName}!</Text>
                        <Text style={textStyle.text}>{`Your files are being synced in real-time, when possible.`}</Text>
                    </View>
                    <FilledButton onPress={() => getAuth().signOut()} text="Sign Out" />
                </>
                :
                <>
                    <View style={{ flexDirection: "column", gap: 4, flex: 1 }}>
                        <Text style={textStyle.cardTitleText}>Not signed in</Text>
                        <Text style={textStyle.text}>Files will only be saved in this browser.</Text>
                        <Text style={textStyle.secondaryText}>Have a @ca-sar.org email? Sign in to collaborate with your team. Your existing files will be uploaded. This can't be undone.</Text>
                    </View>
                    <FilledButton primary icon="log-in-outline" text="Sign in with Google" onPress={() => signInWithGoogle()} />
                </>
            }</>
        </View>

    </View>;
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
            padding: 24,
            gap: 8,
            borderRadius: 26,
            overflow: 'hidden',
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