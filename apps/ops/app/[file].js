import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHeader, Banner, FilledButton, IconButton, MaterialCard, RiskModal, SegmentedButtons, ThemeContext } from 'calsar-ui';
import * as FileSystem from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import { setStatusBarStyle } from 'expo-status-bar';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import RailContainer from '../components/Rail';
import TabContainer from '../components/Tabs';
import { EditableText, SearchBox, TextBox } from '../components/TextInput';

function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }

    return true;
}

export default function OperationPage() {
    const styles = pageStyles();
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);
    const { width } = useWindowDimensions();

    const local = useLocalSearchParams();
    if (local.file === "new") {
        const [fileCreated, setFileCreated] = useState(false);

        useEffect(() => {
            const newFileUUID = uuidv4();
            getData("localFiles")
                .then((value) => {
                    if (value)
                        return saveData("localFiles", [...value, newFileUUID])
                    return saveData("localFiles", [newFileUUID])
                })
                .then(() => {
                    return saveData(newFileUUID + "-incidentInfo", {
                        uuid: newFileUUID,
                        created: new Date(),
                        new: 1,
                        ver: 1,
                    })
                })
                .then(() => setFileCreated(newFileUUID));
        }, []);

        const tabs = [
            {
                name: "Loading...",
                icon: "earth",
                content: <></>
            },
            {
                name: "Cancel",
                icon: "exit",
                content: <></>,
                bottom: true,
                function: () => router.back()
            }
        ];

        if (fileCreated) {
            return <Redirect href={"/" + fileCreated} />;
        } else {
            return <View style={styles.background}>
                <BackHeader title="Creating file..." hideBack={true} />
                {width > 600 ?
                    <RailContainer tabs={tabs} activeTab={"Loading"} setActiveTab={() => { }} />
                    :
                    <TabContainer tabs={tabs} activeTab={"Loading"} setActiveTab={() => { }} />
                }
            </View >
        }
    } else {
        const [activeTab, setActiveTab] = useState("Overview");
        const [timeoutDefault, setTimeoutDefault] = useState(3600);
        const [fileLoaded, setFileLoaded] = useState(0);
        const [readOnly, setReadOnly] = useState(false);
        const readOnlyRefrshRef = useRef(null);
        const printerPortRef = useRef(null);
        const [printerConnected, setPrinterConnected] = useState(false);

        const [incidentInfo, setIncidentInfo] = useState({});
        const [userInfo, setUserInfo] = useState({ callsign: "COMMS" });
        const [teamsInfo, setTeamsInfo] = useState([]);
        const [logInfo, setLogInfo] = useState([]);

        const [fileBarShowing, setFileBarShowing] = useState(false); // Use this to persist file popover/tab state across display size changes

        const loadFile = (sort = false) => {
            getData(local.file + "-incidentInfo").then((value) => {
                if (value) {
                    if (value.new === 1) {
                        // If the incident is new, show the file tab/dropdown
                        //width > 600 ? setActiveTab("File") : setFileBarShowing(true);
                        setIncidentInfo({ ...value, ...{ new: 0 } });
                    } else {
                        setIncidentInfo(value);
                    }
                    setFileLoaded(1);
                } else {
                    // File not found
                    setFileLoaded(-1);
                }
            });
            getData(local.file + "-userInfo").then((value) => { value && setUserInfo(value) });
            getData(local.file + "-teamsInfo").then((value) => {
                if (value) {
                    if (sort) {
                        setTeamsInfo(value.sort((a, b) => {
                            const nameA = a.name || "";
                            const nameB = b.name || "";
                            return nameA.localeCompare(nameB);
                        }));
                    } else {
                        setTeamsInfo(value)
                    }
                }

            });
            getData(local.file + "-auditInfo").then((value) => { value && setLogInfo(value) });
        }

        useEffect(() => {
            // Load saved settings
            getData("timeout-seconds").then((value) => { value && setTimeoutDefault(value) });
            loadFile();

            return () => {
                clearInterval(readOnlyRefrshRef.current);
                // Close the port
                if (printerConnected) {
                    disconnectPrinter();
                }
            }
        }, []);

        const handleSetReadOnly = (state) => {
            if (state) {
                setFileBarShowing(false);
                setActiveTab("Overview")
                // TODO: start file refresh interval
                readOnlyRefrshRef.current = setInterval(() => {
                    loadFile(true);
                }, 1000);
            } else {
                clearInterval(readOnlyRefrshRef.current);
            }
        }

        useEffect(() => {
            handleSetReadOnly(readOnly);

            return () => handleSetReadOnly(false);
        }, [readOnly]);

        // Save data when anything changes
        useEffect(() => {
            if (!isEmpty(incidentInfo))
                saveData(local.file + "-incidentInfo", incidentInfo);
        }, [incidentInfo]);

        useEffect(() => {
            if (!isEmpty(userInfo))
                saveData(local.file + "-userInfo", userInfo);
        }, [userInfo]);

        useEffect(() => {
            if (!isEmpty(logInfo))
                saveData(local.file + "-auditInfo", logInfo);
        }, [logInfo]);

        /*useEffect(() => {
            saveData(local.file + "-teamsInfo", teamsInfo);
        }, [teamsInfo]);*/

        const setIsRuningWithKey = (keyToUpdate, state) => {
            setTeamsInfo(prevData => {
                const newData = prevData.map(item => {
                    if (item.key === keyToUpdate) {
                        if (item.isRunning === state) return item; // The item already has the same state as what is requested
                        if (state) {
                            // Start timer
                            return { ...item, lastStart: new Date(), isRunning: true };
                        } else {
                            // Stop timer by recording the amount of time left
                            return { ...item, lastTimeRemaining: calculateRemainingTime(item.lastStart, item.lastTimeRemaining), isRunning: false };
                        }
                    } else {
                        return item;
                    }
                })
                saveData(local.file + "-teamsInfo", newData);
                return newData;
            });
        };

        const setAllIsRunning = (state) => {
            teamsInfo.map(item => setIsRuningWithKey(item.key, state))
        };

        const removeTeam = (team) => {
            setTeamsInfo(prevData => {
                const newData = prevData.filter(item => item.key !== team.key)
                saveData(local.file + "-teamsInfo", newData);
                return newData;
            });
            addLog({
                time: new Date(),
                type: "1", // 1 for Team-related
                team: team.name || "",
                note: "Removed team"
            });
        };

        const editTeam = (team, fieldToMerge, log = true) => {
            setTeamsInfo(prevData => {
                const newData = prevData.map(item =>
                    item.key === team.key ? { ...item, ...fieldToMerge } : item
                )
                saveData(local.file + "-teamsInfo", newData);
                return newData;
            });
            if (log) {
                let changes = "";
                for (var key in fieldToMerge) {
                    if (fieldToMerge.hasOwnProperty(key)) {
                        if (changes === "") {
                            changes = fieldToMerge[key] ? `${changes}Updated ${key} to "${fieldToMerge[key]}"` : (changes + "Removed " + key);
                        } else {
                            changes = fieldToMerge[key] ? `${changes}, updated ${key} to "${fieldToMerge[key]}"` : (changes + ", removed " + key);
                        }
                    }
                }

                addLog({
                    time: new Date(),
                    type: "1", // 1 for Team-related
                    team: team.name || "",
                    note: changes
                });
            }
        };

        const editIncident = (fieldToMerge) => {
            setIncidentInfo(prevData => { return { ...prevData, ...fieldToMerge } });
        };

        const editUser = (fieldToMerge, log = true) => {
            setUserInfo(prevData => { return { ...prevData, ...fieldToMerge } });
            if (log) {
                let changes = "";
                for (var key in fieldToMerge) {
                    if (fieldToMerge.hasOwnProperty(key)) {
                        if (changes === "") {
                            changes = fieldToMerge[key] ? `${changes}Operator ${key} updated to "${fieldToMerge[key]}"` : (changes + "Removed " + key);
                        } else {
                            changes = fieldToMerge[key] ? `${changes}, ${key} updated to "${fieldToMerge[key]}"` : (changes + ", removed " + key);
                        }
                    }
                }
                addLog({
                    time: new Date(),
                    type: "3", // 1 for Team-related
                    team: "",
                    note: changes
                });
            }
        };

        const parseTeamName = (teamNameToParse) => {
            if (teamNameToParse === "!@#$") {
                return userInfo.callsign || "OPERATOR"
            } else if (teamNameToParse) {
                return teamNameToParse;
            } else {
                return "Unnamed"
            }
        }

        function format24HourTime(date) {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }

        const addLog = async (fieldToAdd) => {
            if (fieldToAdd.type === "2" && fieldToAdd.time && fieldToAdd.from && fieldToAdd.to && fieldToAdd.note) {
                await printText(`${format24HourTime(new Date(fieldToAdd.time))}, ${parseTeamName(fieldToAdd.from)} TO ${parseTeamName(fieldToAdd.to)}`);
                await printText(`  ${fieldToAdd.note}`);
            }
            setLogInfo(prevData => [...prevData, fieldToAdd]);
        };

        const addAdHocTeam = () => {
            setTeamsInfo((prevTeams) => {
                const newData = [{ key: uuidv4(), type: "Ad-hoc", lastStart: undefined, lastTimeRemaining: timeoutDefault, isRunning: false, flagged: false }, ...prevTeams];
                saveData(local.file + "-teamsInfo", newData);
                return newData;
            });
            // addLog({
            //     time: new Date(),
            //     type: "1", // 1 for Team-related
            //     team: "",
            //     note: "Added ad-hoc team"
            // });
        }

        const handleResetTimeoutWithKey = (keyToUpdate) => {
            setTeamsInfo(prevData => {
                const newData = prevData.map(item => {
                    if (item.key === keyToUpdate) {
                        if (item.isRunning === true) {
                            return { ...item, lastStart: new Date(), lastTimeRemaining: timeoutDefault, isRunning: true };
                        } else {
                            return { ...item, lastStart: undefined, lastTimeRemaining: timeoutDefault, isRunning: false };
                        }
                    } else {
                        return item;
                    }
                });
                saveData(local.file + "-teamsInfo", newData);
                return newData;
            });
        }

        const handleToggleFlagWithKey = (keyToUpdate) => {
            setTeamsInfo(prevData => {
                const newData = prevData.map(item =>
                    item.key === keyToUpdate ? { ...item, flagged: !item.flagged } : item
                );
                saveData(local.file + "-teamsInfo", newData);
                return newData;
            });
        }
        const disconnectPrinter = async () => {
            if (printerPortRef.current?.connected) await printerPortRef.current.close().catch(() => { /* Ignore the error */ });
            setPrinterConnected(false);
        }

        const connectPrinter = async () => {
            if (Platform.OS === 'web') {
                try {
                    // Request access to available ports
                    printerPortRef.current = await navigator.serial.requestPort();
                    await printerPortRef.current.open({ baudRate: 9600 }); // Adjust baud rate if needed
                    setPrinterConnected(true);
                    // Print operations
                    // await feedLines(1);
                    //await printText("Hello world!\n");
                    //await feedLines(5);
                    //await cutPaper();
                    // Test test
                    // await printHeader();
                } catch (error) {
                    console.log(error);
                }
            }
        }

        // Function to send ESC/POS commands
        const sendCommand = async (command) => {
            if (Platform.OS === 'web' && printerPortRef.current) {
                const writer = printerPortRef.current.writable.getWriter();
                await writer.write(new Uint8Array(command));
                await writer.releaseLock();
            }
        };

        // ESC/POS commands
        const feedLines = async (lines = 1) => {
            const command = [27, 0x64, lines]; // ESC p <lines>
            await sendCommand(command);
        };

        const printText = async (text) => {
            const command = [...text.split('').map(char => char.charCodeAt(0))];
            await sendCommand(command);
            await feedLines(1);
        };

        const cutPaper = async () => {
            await feedLines(4);
            const command = [27, 105];
            await sendCommand(command);
        };

        const setBold = async () => {
            const command = [27, 69, 1];
            await sendCommand(command);
        };

        const setNormal = async () => {
            const command = [27, 69, 0];
            await sendCommand(command);
        };

        const setRightAlign = async () => {
            const command = [27, 97, 2]; // ESC a 2
            await sendCommand(command);
        };

        const setCenterAlign = async () => {
            const command = [27, 97, 1]; // ESC a 1
            await sendCommand(command);
        };

        const setLeftAlign = async () => {
            const command = [27, 97, 0]; // ESC a 0
            await sendCommand(command);
        };

        const printHeader = async () => {
            await feedLines(2);
            await setBold();
            await setCenterAlign();
            await printText("OPERATION MANAGEMENT TOOL");
            await printText("Communication Log");
            await setLeftAlign();
            await setNormal();
            await feedLines(1);
            await printText(`TASK NAME: ${incidentInfo.incidentName || ""}`);
            await printText(`TASK # ${incidentInfo.number || ""}`);
            await printText(`OP. PERIOD ${incidentInfo.opPeriod || ""}`);
            await feedLines(1);
            await printText(`LOG KEEPER: ${userInfo.name || ""}`);
            await printText(`STATION CALLSIGN: ${userInfo.callsign || ""}`);
            await printText(`STATION FREQ./CHANNEL: ${userInfo.frequency || ""}`)
            await feedLines(1);
            await setBold();
            await setCenterAlign();
            await printText(`--- Start of printout ${new Date().toLocaleString('en-US', { hour12: false })} ---`);
            await setNormal();
            await setLeftAlign();
            await feedLines(1);
        }

        const printFooter = async () => {
            await setBold();
            await setCenterAlign();
            await printText(`--- End of printout ${new Date().toLocaleString('en-US', { hour12: false })} ---`);
            await setNormal();
            await setLeftAlign();
            await feedLines(2);
            await cutPaper();
        }

        const printClueStub = async (description, location, team, date, assignment) => {
            await printFooter();
            await setBold();
            await setCenterAlign();
            await printText("OPERATION MANAGEMENT TOOL");
            await printText("Clue Stub");
            await setLeftAlign();
            await setNormal();
            await feedLines(1);
            await printText(`TASK NAME: ${incidentInfo.incidentName || ""}`);
            await printText(`TASK # ${incidentInfo.number || ""}`);
            await printText(`OP. PERIOD ${incidentInfo.opPeriod || ""}`);
            // await printText(`PRINTED ${new Date().toLocaleString('en-US', { hour12: false })}`);
            await feedLines(1);
            await printText(`CLUE DESCRIPTION: ${description || ""}`);
            await printText(`FOUND BY: ${team || ""}`);
            await printText(`DATE & TIME FOUND: ${date || ""}`);
            await printText(`ASSIGNMENT: ${assignment || "None"}`);
            await printText(`LOCATION FOUND: ${location || "Not given"}`);
            await feedLines(2);
            await cutPaper();
            printHeader();
        }

        function isSerialPossiblySupported() {
            if (Platform.OS === 'web') {
                // anything but true, just in case there are other values other than "false"
                if (navigator.userAgentData.mobile !== "true") {
                    for (brand_version_pair of navigator.userAgentData.brands) {
                        if (brand_version_pair.brand == "Chromium") {
                            return true;
                        }
                    }
                    return false;
                }
            } else {
                return false;
            }
        }

        const printerSupported = isSerialPossiblySupported();

        if (fileLoaded === 1) {
            const tabs = [
                {
                    name: "Overview",
                    icon: "earth",
                    content: <OverviewTab handlePrintClueStub={printClueStub} printerConnected={printerConnected} readOnly={readOnly} logs={logInfo} currentCallsign={userInfo.callsign} teams={teamsInfo} removeTeam={removeTeam} setIsRuningWithKey={setIsRuningWithKey} setAllIsRunning={setAllIsRunning} handleAddTeam={addAdHocTeam} handleResetTimeoutWithKey={handleResetTimeoutWithKey} handleToggleFlagWithKey={handleToggleFlagWithKey} editTeam={editTeam} addLog={addLog} />
                },
                {
                    name: "Responders",
                    icon: "id-card",
                    content: <><MaterialCard
                        noMargin
                        title="Nothing here yet!"
                        subtitle="This section is still under construction. Please create ad-hoc teams using the button in the Overview tab.">
                    </MaterialCard></>
                },
                {
                    name: "Assignments",
                    icon: "navigate-circle",
                    content: <><MaterialCard
                        noMargin
                        title="Nothing here yet!"
                        subtitle="This section is still under construction. Please set assignments manually in the Overview tab.">
                    </MaterialCard></>
                },
                {
                    name: "Log",
                    icon: "receipt",
                    content: <LogTab logs={logInfo} incidentInfo={incidentInfo} userInfo={userInfo} />

                },
                {
                    name: "Settings",
                    icon: "settings",
                    content: <SettingsTab printerSupported={printerSupported} handlePrintFooter={printFooter} handlePrintHeader={printHeader} handleFeed={() => { feedLines(5) }} handleCut={cutPaper} printerConnected={printerConnected} handleConnectPrinter={printerConnected ? disconnectPrinter : connectPrinter} setReadOnly={setReadOnly} incidentInfo={incidentInfo} userInfo={userInfo} editIncident={editIncident} editUser={editUser} />,
                    bottom: true
                },
                {
                    name: "Close file",
                    icon: "exit",
                    content: <></>,
                    bottom: true,
                    function: () => router.navigate("/")
                },
            ];

            /*if (!(width > 600) && activeTab === "File") {
                setActiveTab("Overview");
                setFileBarShowing(true);
            } else if ((width > 600) && fileBarShowing) {
                setActiveTab("File");
                setFileBarShowing(false);
            }*/

            const areTeamsFlagged = teamsInfo.some(item => item.flagged === true);
            const areTeamsError = teamsInfo.some(item => {
                let timeRemaining;
                if (item.isRunning) {
                    timeRemaining = calculateRemainingTime(item.lastStart, item.lastTimeRemaining);
                } else {
                    timeRemaining = item.lastTimeRemaining;
                }

                return timeRemaining < 0;
            });

            return (
                <View style={[styles.background]}>
                    <BackHeader
                        minimize={readOnly}
                        customTitle={<EditableText disabled={readOnly} style={{ fontSize: 18, flex: -1, fontWeight: '500', color: colorTheme.onPrimaryContainer, flexShrink: 1 }} numberOfLines={1} value={incidentInfo.name} defaultValue={"Untitled file"} onChangeText={(text) => editIncident({ name: text })} limit={50} suffix={readOnly ? "" : ""} />}
                        href="/"
                        hideBack={width > 600}
                        menuButton={!readOnly && <IconButton ionicons_name={fileBarShowing ? "caret-up-circle-outline" : "document-text-outline"} onPress={() => { setFileBarShowing(!fileBarShowing) }} color={colorTheme.onPrimaryContainer} size={24} />}
                    />
                    {width > 600 ?
                        <RailContainer readOnly={readOnly} warn={areTeamsFlagged} error={areTeamsError} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} image={activeTab === "Overview" ? (teamsInfo.length === 0 ? 0.1 : 0.8) : 1} />
                        :
                        <TabContainer readOnly={readOnly} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                    }
                    {fileBarShowing &&
                        <ScrollView
                            contentContainerStyle={styles.floatingViewContainer}
                            style={[styles.floatingView]}
                        >
                            <InfoTab handlePrintFooter={printFooter} handlePrintHeader={printHeader} handleFeed={() => { feedLines(5) }} handleCut={cutPaper} printerConnected={printerConnected} handleConnectPrinter={printerConnected ? disconnectPrinter : connectPrinter} setReadOnly={setReadOnly} incidentInfo={incidentInfo} userInfo={userInfo} editIncident={editIncident} editUser={editUser} />
                        </ScrollView>
                    }
                </View >
            );

        } else if (fileLoaded === -1) {
            return <Redirect href={"/?error=notfound"} />
        } else {
            const loadingTab = [{
                name: "Loading...",
                icon: "earth",
                content: <></>
            },
            {
                name: "Cancel",
                icon: "exit",
                content: <></>,
                bottom: true,
                function: () => router.navigate("/")
            }];
            return <View style={styles.background}>
                <BackHeader title="Opening file..." hideBack={true} />
                {width > 600 ?
                    <RailContainer tabs={loadingTab} activeTab={"Loading"} setActiveTab={() => { }} />
                    :
                    <TabContainer tabs={loadingTab} activeTab={"Loading"} setActiveTab={() => { }} />
                }
            </View >
        }
    }
}

const KeyValue = ({ title, children }) => {
    const styles = pageStyles();

    return (<View style={{ flexDirection: "column", gap: 2 }}>
        <Text style={styles.text}>{title}</Text>
        {children}
    </View>
    );
}

const InfoTab = ({ incidentInfo, userInfo, editIncident, editUser, setReadOnly, printerSupported = false, handleConnectPrinter, printerConnected, handlePrintHeader, handlePrintFooter, handleFeed, handleCut }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = pageStyles();

    return (
        <>
            <View style={[styles.standaloneCard, { backgroundColor: colorTheme.surfaceContainer, alignSelf: "center", flexDirection: "column", flexGrow: 1, justifyContent: "space-between", gap: 8, maxWidth: 600 }]}>
                <View style={{ flexDirection: width > 600 ? "row" : "column", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                    <Text style={[styles.text, { fontStyle: "italic" }]}>Changes auto-saved locally. Download the file to open on another device and for record keeping.</Text>
                    <FilledButton primary small={width <= 600} icon="download" text="Download file" onPress={() => { }} />
                </View>
            </View>
            <View style={{
                flexDirection: width > 600 ? "row" : "column",
                gap: 16,
            }}>
                <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 1, justifyContent: "flex-start", gap: 8 }]}>
                    <KeyValue title="Incident name" value={incidentInfo?.incidentName || "-"} >
                        <EditableText style={styles.sectionBodyTextSmall} value={incidentInfo.incidentName} defaultValue="Tap to set" onChangeText={(text) => editIncident({ incidentName: text })} limit={50} />
                    </KeyValue>
                    <KeyValue title="Incident number">
                        <EditableText style={styles.sectionBodyTextSmall} value={incidentInfo.number} placeholder="LAW-20..." defaultValue="Tap to set" onChangeText={(text) => editIncident({ number: text })} limit={50} />
                    </KeyValue>
                    <KeyValue title="Operational period" >
                        <EditableText style={styles.sectionBodyTextSmall} value={incidentInfo.opPeriod} defaultValue="Tap to set" onChangeText={(text) => editIncident({ opPeriod: text })} limit={12} />
                    </KeyValue>
                </View>
                <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                    <KeyValue title="Operator/log keeper">
                        <EditableText style={styles.sectionBodyTextSmall} value={userInfo.name} defaultValue="Tap to set" onChangeText={(text) => editUser({ name: text })} />
                    </KeyValue>
                    <KeyValue title="Operator callsign" >
                        <EditableText style={styles.sectionBodyTextSmall} value={userInfo.callsign} defaultValue="Tap to set" onChangeText={(text) => editUser({ callsign: text })} limit={12} />
                    </KeyValue>
                    <KeyValue title="Frequency/channel" >
                        <EditableText style={styles.sectionBodyTextSmall} value={userInfo.frequency} defaultValue="Tap to set" onChangeText={(text) => editUser({ frequency: text })} limit={50} />
                    </KeyValue>
                </View>
            </View >
        </>
    );
}

const SettingsTab = ({ incidentInfo, userInfo, editIncident, editUser, setReadOnly, printerSupported = false, handleConnectPrinter, printerConnected, handlePrintHeader, handlePrintFooter, handleFeed, handleCut }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = pageStyles();

    return (
        <>
            {printerSupported &&
                <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <KeyValue title="Printer status">
                            <Text style={styles.sectionBodyTextSmall}>{printerConnected ? "Connected" : "Not connected"}</Text>
                        </KeyValue>
                        <FilledButton small={width <= 600} icon={printerConnected ? "close" : "print-outline"} text={printerConnected ? "Disconnect" : "Connect"} onPress={handleConnectPrinter} />
                    </View>
                    {printerConnected && <KeyValue title="Actions">
                        <View style={{ flexDirection: "row", gap: 12, marginTop: 8, justifyContent: "center" }}>
                            <FilledButton small icon="print" text={"Header"} onPress={handlePrintHeader} />
                            <FilledButton small icon="print" text={"Footer and cut"} onPress={handlePrintFooter} />
                            <FilledButton small icon="caret-up" text={"Feed"} onPress={handleFeed} />
                            <FilledButton small icon="cut" text={"Cut"} onPress={handleCut} />
                        </View>
                    </KeyValue>}
                </View>
            }
            <View style={[styles.standaloneCard, { flexDirection: "row", flexGrow: 2, justifyContent: "space-between", alignItems: "center", gap: 8 }]}>
                <Text style={styles.sectionBodyTextSmall}>Read-only display mode</Text>
                <FilledButton rightAlign small={width <= 600} icon="tv-outline" text="Enter" onPress={() => { setReadOnly(true) }} />
            </View>
        </>
    );
}

const LogTrafficComponent = ({ teams, team, currentCallsign, onClose, addLog, updateStatus, updateAssignment, setFlag, resetTimeout, printerConnected = false, handlePrintClueStub }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles();
    const [messageType, setMessageType] = useState(0);
    const [messageSubType, setMessageSubType] = useState(0);
    const [fromField, setFromField] = useState(0);
    const [toField, setToField] = useState(0);
    const [toTeam, setToTeam] = useState("");
    const [selectMode, setSelectMode] = useState(false);

    const { width } = useWindowDimensions();

    const [customTextBoxText, setCustomTextBoxText] = useState("");
    const [clueLocationTextBoxText, setClueLocationTextBoxText] = useState("");
    const [assignmentTextBoxText, setAssignmentTextBoxText] = useState("");
    const [clueAction, setClueAction] = useState(0);

    const clueActions = ["Mark", "Ignore", "Pick up"];

    const handleSetToField = (value) => {
        if (value === 1) {
            // Enter select mode
            setSelectMode(true);
            setToTeam("");
        } else {
            // Exit select mode
            setSelectMode(false);
            setToTeam("");
        }
        setToField(value);
    };

    const handleClose = () => {
        setMessageType(0);
        setMessageSubType(0);
        setFromField(0);
        setCustomTextBoxText("");
        setClueLocationTextBoxText("");
        setAssignmentTextBoxText("");
        setClueAction(0);
        handleSetToField(0);
        onClose();
    }

    // Preset messages from team to the operator
    const presetTeamMessages = {
        "Radio": {
            "Good": {
                message: "Radio check, good"
            },
            "Fair": {
                message: "Radio check, fair"
            },
            "Unintelligible": {
                message: "Radio check, unintelligible"
            }
        },
        "Search": {
            "Searching": {
                message: `Searching assignment ${team?.assignment}`,
                status: "Searching",
            },
            "On break": {
                message: "On break",
                status: "On break",
            },
            "Completed": {
                message: `Completed assignment ${team?.assignment}`,
                status: "Completed assignment",
                flag: true
            },
        },
        "Response": {
            "Available": {
                message: "Available/posted",
                status: "Available/posted",
            },
            "Responding": {
                message: "Responding to call",
                status: "Responding to call",
            },
            "On scene": {
                message: "On scene",
                status: "On scene",
                flag: true
            },
            "Transporting": {
                message: "Transporting patient",
                status: "Transporting patient",
            },
            "Out of service": {
                message: "Out of service",
                status: "Not in service",
            },
        },
        "Transport": {
            "At ICP": {
                message: "At ICP",
                status: "At ICP",
            },
            "Need transport": {
                message: "Waiting for transport",
                status: "Waiting for transport",
                flag: true
            },
            "En route": {
                message: "En route to assignment",
                status: "En route to assignment",
            },
            "Returning to ICP": {
                message: "Returning to ICP",
                status: "En route to ICP",
            },
        },
        "Clue": {}
    };

    // Preset messages from operator to team
    const presetOperatorMessages = {
        "Radio check": {
            "Good": {
                message: "Radio check, good"
            },
            "Fair": {
                message: "Radio check, fair"
            },
            "Unintelligible": {
                message: "Radio check, unintelligible"
            }
        },
        "Status check": {
            "OK": {
                message: "Requested status check, responded status OK",
            },
            "Need transport": {
                message: "Requested status check, responded waiting for transport",
                status: "Waiting for transport",
                flag: true
            },
            "On break": {
                message: "Requested status check, responded on break",
                status: "On break",
            },
            "Returning to ICP": {
                message: "Requested status check, responded returning to ICP",
                status: "Returning to ICP",
            }
        },
        "Assign": {
            "Now": {
                message: "Proceed to assignment ",
                status: "Assigned",
            },
            "When completed": {
                message: `After assignment ${team?.assignment || ""}, proceed to assignment `,
            },
        }
    };

    // Preset messages from team to team
    const presetInterTeamMessages = {
        "Radio check": {
            "Good": {
                message: "Radio check, good"
            },
            "Fair": {
                message: "Radio check, fair"
            },
            "Unintelligible": {
                message: "Radio check, unintelligible"
            }
        }
    };

    let currentMessages = {};
    if (fromField === 0) {
        if (toField === 0) {
            currentMessages = presetTeamMessages;
        } else {
            currentMessages = presetInterTeamMessages;
        }
    } else if (fromField === 1) {
        currentMessages = presetOperatorMessages;
    }

    const currentMessageCategories = Object.keys(fromField === 0 ? currentMessages : presetOperatorMessages);
    currentMessageCategories.sort();

    let footerMessage = `A log will be added for ${team?.name || "unnamed team"} and\n- Contact timeout reset`;
    let activeSubTypeKeys = [];
    let activeSubType = "";

    if (messageType > 0 && messageType <= currentMessageCategories.length) {
        activeSubTypeKeys = Object.keys(currentMessages[currentMessageCategories[messageType - 1]]);
        activeSubType = currentMessages[currentMessageCategories[messageType - 1]][activeSubTypeKeys[messageSubType]]
        if (activeSubType?.status)
            footerMessage = footerMessage + `\n- Status set to "${activeSubType?.status}"`;
        if (activeSubType?.flag)
            footerMessage = footerMessage + "\n- Flagged for follow up";
        if (activeSubTypeKeys[messageSubType] === "Now")
            footerMessage = footerMessage + `, flag cleared, assignment set to "${assignmentTextBoxText}"`;
    }

    const handleLogMessage = () => {
        let note = "";
        if (messageType === 0) {
            if (customTextBoxText) note = customTextBoxText;
        } else if (currentMessageCategories[messageType - 1] === "Clue") {
            if (customTextBoxText) note = `Found "${customTextBoxText}"${clueLocationTextBoxText && " at " + clueLocationTextBoxText}. Instructed to ${clueActions[clueAction].toLowerCase()}`;
        } else if (currentMessageCategories[messageType - 1] === "Assign") {
            if (assignmentTextBoxText) {
                activeSubTypeKeys = Object.keys(currentMessages[currentMessageCategories[messageType - 1]]);
                activeSubType = currentMessages[currentMessageCategories[messageType - 1]][activeSubTypeKeys[messageSubType]]
                note = activeSubType.message + assignmentTextBoxText;
                if (activeSubTypeKeys[messageSubType] === "Now") {
                    updateAssignment(assignmentTextBoxText);
                    setFlag(false);
                }
                if (activeSubType.status) updateStatus(activeSubType.status);
            }
        } else if (messageType > 0 && messageType <= currentMessageCategories.length) {
            activeSubTypeKeys = Object.keys(currentMessages[currentMessageCategories[messageType - 1]]);
            activeSubType = currentMessages[currentMessageCategories[messageType - 1]][activeSubTypeKeys[messageSubType]]

            note = activeSubType.message;
            if (activeSubType.status) updateStatus(activeSubType.status);
            if (activeSubType.flag) setFlag(true);
        }
        if (note) {
            addLog({
                time: new Date(),
                type: "2", // 2 for radio logs
                from: fromField === 0 ? team?.name || "" : "!@#$", // !@#$ will be converted to the operator call sign
                to: toField === 0 ? (fromField === 0 ? "!@#$" : team?.name || "") : toTeam,
                note: note
            });
            resetTimeout();
            handleClose();
        }
    }

    let toItems = [fromField === 0 ? currentCallsign || "You" : team?.name ? team?.name : "This team"];
    if (fromField === 0) toItems.push(toTeam || "Other"); // Only allow recipient selection if the sender is the current team
    return (<RiskModal
        overrideWidth={700}
        isVisible={team ? true : false}
        ignoreBackdropPress={selectMode}
        title={"Log radio traffic"}
        onClose={handleClose}>
        <View style={{ padding: 20, paddingTop: 0, gap: 12 }}>
            <View style={{ flexDirection: (width > 600 ? "row" : "column"), gap: (width > 600 ? 20 : 12) }}>
                <View style={{ flexDirection: "column", gap: 8, flexGrow: (width > 600 ? 1 : 0), flexBasis: (width > 600 ? 0 : "auto") }}>
                    <Text style={{ color: colorTheme.onSurface, alignSelf: "flex-start" }}>From</Text>
                    <SegmentedButtons small={width <= 600} grow items={[team?.name ? team?.name : "This team", currentCallsign || "You"]} selected={fromField} onPress={(value) => {
                        setFromField(value);
                        setMessageType(0);
                        setMessageSubType(0);
                        setToField(0);
                        setToTeam("");
                        setSelectMode(false);
                    }} />
                </View>
                <View style={{ flexDirection: "column", gap: 8, flexGrow: (width > 600 ? 1 : 0), flexBasis: (width > 600 ? 0 : "auto") }}>
                    <Text style={{ color: colorTheme.onSurface, alignSelf: "flex-start" }}>To</Text>
                    <SegmentedButtons disabled={fromField === 1} small={width <= 600} grow items={toItems} noCheck={toField === 1 && !toTeam} selected={toField} onPress={(value) => {
                        handleSetToField(value);
                        setMessageType(0);
                        setMessageSubType(0);
                    }} />
                </View>
            </View>
            {(selectMode) ?
                <>
                    <View
                        style={{
                            borderBottomColor: colorTheme.outlineVariant,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    />
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
                        <Text style={{ color: colorTheme.onSurface }}>Select the recipient of this message:</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', flexWrap: "wrap-reverse" }}>
                        {teams.map(t => {
                            if (t.name && t.name != team?.name) {
                                return <FilledButton small key={t?.key} text={t.name} onPress={() => {
                                    setToTeam(t.name);
                                    setSelectMode(false);
                                }} />
                            }
                        })}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
                        <Text style={{ color: colorTheme.onSurface, fontStyle: "italic" }}>Unnamed teams are not shown</Text>
                    </View>
                </> :
                <>
                    <View style={{ flexDirection: "column", gap: 8, alignItems: "center", flexGrow: 1 }}>
                        <Text style={{ color: colorTheme.onSurface, alignSelf: "flex-start" }}>Message</Text>
                        <SegmentedButtons grow small={width <= 600} items={["Custom", ...currentMessageCategories]} selected={messageType} onPress={(item) => {
                            setMessageType(item);
                            setMessageSubType(0);
                        }} />
                    </View>
                    {messageType === 0 && <TextBox textStyle={{
                        paddingVertical: 8,
                        paddingHorizontal: 8,
                        backgroundColor: colorTheme.surfaceContainerHigh,
                        width: "100%"
                    }} placeholder="Custom message" onChangeText={setCustomTextBoxText} initialValue={customTextBoxText} onConfirm={() => { handleLogMessage() }} limit={1000} autoFocus={width > 600} />}
                    {messageType > 0 && messageType <= currentMessageCategories.length && currentMessageCategories[messageType - 1] !== "Clue" && <SegmentedButtons small grow items={activeSubTypeKeys} selected={messageSubType} onPress={setMessageSubType} />}
                    {currentMessageCategories[messageType - 1] === "Clue" && <TextBox textStyle={{
                        paddingVertical: 8,
                        paddingHorizontal: 8,
                        backgroundColor: colorTheme.surfaceContainerHigh,
                        width: "100%"
                    }} placeholder="Description" onChangeText={setCustomTextBoxText} initialValue={customTextBoxText} onConfirm={() => { handleLogMessage() }} limit={1000} />}
                    {currentMessageCategories[messageType - 1] === "Clue" && <TextBox textStyle={{
                        paddingVertical: 8,
                        paddingHorizontal: 8,
                        backgroundColor: colorTheme.surfaceContainerHigh,
                        width: "100%"
                    }} placeholder="Location (optional)" autoFocus={false} onChangeText={setClueLocationTextBoxText} initialValue={clueLocationTextBoxText} onConfirm={() => { handleLogMessage() }} limit={500} />}
                    {currentMessageCategories[messageType - 1] === "Clue" && <SegmentedButtons small grow items={clueActions} selected={clueAction} onPress={setClueAction} />}
                    {currentMessageCategories[messageType - 1] === "Assign" && <TextBox textStyle={{
                        paddingVertical: 8,
                        paddingHorizontal: 8,
                        backgroundColor: colorTheme.surfaceContainerHigh,
                        width: "100%"
                    }} placeholder="New assignment" onChangeText={setAssignmentTextBoxText} initialValue={assignmentTextBoxText} onConfirm={() => { handleLogMessage() }} limit={500} />}
                    <View
                        style={{
                            borderBottomColor: colorTheme.outlineVariant,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    />
                    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between', alignItems: "flex-end" }}>
                        <Text style={{ color: colorTheme.onSurface, alignSelf: "flex-start", fontStyle: "italic" }}>{footerMessage}</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            {printerConnected && currentMessageCategories[messageType - 1] === "Clue" && <FilledButton disabled={customTextBoxText === ""} text={"Print stub"} onPress={() => { handlePrintClueStub(customTextBoxText, clueLocationTextBoxText, team?.name || "Unnamed team", new Date(), team.assignment) }} />}
                            <FilledButton primary text={"Save log"} onPress={() => { handleLogMessage() }} />
                        </View>
                    </View>
                </>}
        </View>
    </RiskModal>);
}

const TimerComponent = ({ team, currentCallsign, handleResetTimeout, handleStartStop, removeTeam, handleToggleFlag, editTeam, showLogTrafficModal, expanded, lastMessage, readOnly }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles();
    const [time, setTime] = useState(team.lastTimeRemaining);
    const intervalRef = useRef(null);
    const { width } = useWindowDimensions();
    const [deleteModalShowing, setDeleteModalShowing] = useState(false);
    const lastStartRef = useRef(team.lastStart);
    const lastTimeRemainingRef = useRef(team.lastTimeRemaining);

    useEffect(() => {
        if (team.isRunning) {
            setTime(calculateRemainingTime(team.lastStart, team.lastTimeRemaining));
        } else {
            setTime(team.lastTimeRemaining);
        }
    }, [team.lastTimeRemaining, team.lastStart, team.isRunning]);

    useEffect(() => {
        if (team.lastStart !== lastStartRef.current) lastStartRef.current = team.lastStart;
        if (team.lastTimeRemaining !== lastTimeRemainingRef.current) lastTimeRemainingRef.current = team.lastTimeRemaining;
    }, [team.lastTimeRemaining, team.lastStart]);

    useEffect(() => {
        if (team.isRunning) {
            startTimer();
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current); // Cleanup on unmount
    }, [team.isRunning]);

    const startTimer = () => {
        intervalRef.current = setInterval(() => {
            // Functional update to get the latest time
            setTime(prevTime => {
                return calculateRemainingTime(lastStartRef.current, lastTimeRemainingRef.current);
            });
        }, 1000);
    }

    const parseTeamName = (teamNameToParse) => {
        if (teamNameToParse === "!@#$") {
            return currentCallsign || "OPERATOR"
        } else if (teamNameToParse) {
            return teamNameToParse;
        } else {
            return "unnamed team"
        }
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
                return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
            } else if (hours < 24) {
                const remainingMinutes = minutes % 60;
                return `${hours} hr${hours === 1 ? "" : "s"}, ${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"} ago`;
            } else {
                return ">10 hrs ago";
            }
        } else {
            return "an unknown time ago";
        }
    }


    const formatTime = (seconds) => {
        if (seconds <= -3600) return ">-10 hrs"
        const hours = Math.floor(Math.abs(seconds) / 3600);
        const minutes = Math.floor((Math.abs(seconds) % 3600) / 60);
        const remainingSeconds = Math.abs(seconds) % 60;

        const formattedHours = String(hours).padStart(hours > 9 ? 2 : 1, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        const minusSign = (seconds < 0) ? "-" : "";
        if (hours >= 1) {
            return `${minusSign}${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        } else {
            return `${minusSign}${formattedMinutes}:${formattedSeconds}`;
        }
    };

    const error = time < 0;

    if (width > 600) {
        return (
            <View style={[styles.wideCard, { backgroundColor: team.editing ? colorTheme.tertiaryContainer : team.status === "Not in service" ? colorTheme.surfaceContainerLowest : error ? colorTheme.errorContainer : team.flagged ? colorTheme.secondaryContainer : colorTheme.surfaceContainer, flexGrow: width >= 1080 ? 0 : 1, width: (readOnly && ((width - 10 - 20) / 2) - 10 >= 515) ? ((width - 10 - 20) / 2) - 10 : "100%" }]}>
                <View style={{
                    flexDirection: "row",
                    gap: 12,
                    flexWrap: "wrap",
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                }}>
                    <SectionContainer justifyContent={readOnly ? "center" : "flex-start"} width={readOnly ? 60 : 80} maxWidth={150}>
                        {!readOnly && <View style={[styles.sectionTitleContainer, { gap: 4 }]}>
                            <Text style={[styles.text]} numberOfLines={1} >Team</Text>
                            {!readOnly && team.type === "Ad-hoc" && <IconButton small ionicons_name="person-remove" text="Delete" onPress={() => setDeleteModalShowing(true)} />}
                        </View>}
                        {team.type ? <>
                            <EditableText disabled={readOnly} style={[styles.sectionBodyText, { fontWeight: "bold" }, !readOnly && { fontSize: 20 }]} numberOfLines={1} value={team.name} defaultValue="-" onChangeText={(text) => editTeam({ name: text })} limit={10} />
                            <Text style={[styles.sectionBodyText, { fontSize: 12 }]} numberOfLines={1}>{team.type}</Text>
                        </> : <>
                            <EditableText disabled={readOnly} style={[styles.sectionBodyText]} numberOfLines={1} value={team.name} defaultValue="-" onChangeText={(text) => editTeam({ name: text })} limit={10} />
                        </>}
                    </SectionContainer>
                    <SectionContainer width={72} maxWidth={100}>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={[styles.text]} numberOfLines={1} >Assignment</Text>
                            {!readOnly && <IconButton small ionicons_name="" onPress={() => { }} />}
                        </View>
                        <EditableText disabled={readOnly} style={[styles.sectionBodyText]} numberOfLines={1} value={team.assignment} defaultValue={"-"} onChangeText={(text) => editTeam({ assignment: text })} limit={25} />
                    </SectionContainer>
                    <SectionContainer justifyContent="space-between" width={readOnly ? 205 : 185}>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={[styles.text]} numberOfLines={1} >Status</Text>
                            {!readOnly && <IconButton small ionicons_name="" onPress={() => { }} />}
                        </View>
                        <EditableText disabled={readOnly} style={[styles.sectionBodyTextSmall, { marginBottom: 4 }]} numberOfLines={1} value={team.status} defaultValue={"-"} onChangeText={(text) => editTeam({ status: text })} limit={25} />
                    </SectionContainer>
                    <SectionContainer noDivider={readOnly} width={110}>
                        <View style={[styles.sectionTitleContainer, { gap: 4 }]}>
                            <Text style={[styles.text]} numberOfLines={1} >Contact timeout</Text>
                            {!readOnly && <View style={{ flexDirection: "row", gap: 0 }}>
                                <IconButton small tonal={!team.isRunning} ionicons_name={team.isRunning ? "pause" : "play"} onPress={handleStartStop} />
                                <IconButton small ionicons_name="refresh" onPress={handleResetTimeout} />
                            </View>}
                        </View>
                        <Text style={[styles.sectionBodyText]}>{formatTime(time)}</Text>
                    </SectionContainer>
                    {!readOnly &&
                        <SectionContainer style={{ flexGrow: 0 }} justifyContent="center" noDivider width={96}>
                            <View style={{ flexDirection: "column", gap: 8 }}>
                                <FilledButton small backgroundColor={colorTheme.surfaceContainer} icon="create" text="Traffic" onPress={() => showLogTrafficModal()} />
                                <FilledButton small backgroundColor={colorTheme.surfaceContainer} icon="flag" text={team.flagged ? "Unflag" : "Flag"} onPress={handleToggleFlag} />
                            </View>
                        </SectionContainer>}
                    <RiskModal
                        isVisible={deleteModalShowing}
                        title={"Delete team?"}
                        onClose={() => { setDeleteModalShowing(false) }}>
                        <View style={{
                            padding: 20, paddingTop: 0, gap: 20
                        }}>
                            <Text style={{ color: colorTheme.onSurface }}>{team.name ? team.name : "This team"} will be removed, but any logs won't be affected</Text>
                            <FilledButton rightAlign destructive text={"Delete team"} onPress={removeTeam} />
                        </View>
                    </RiskModal>
                </View>
                {(expanded || readOnly) && team.name &&
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        gap: 12,
                        backgroundColor: colorTheme.surfaceContainerLow,
                        paddingLeft: readOnly ? 18 : 24,
                        paddingRight: readOnly ? 18 : 24,
                        paddingBottom: 6,
                        paddingTop: 6,
                        borderBottomLeftRadius: 6,
                        borderBottomRightRadius: 6,
                    }}>
                        <View style={{
                            flex: 1,
                            flexDirection: "row",
                            gap: 12
                        }}>
                            <Text style={[styles.text, { fontStyle: 'italic', flexShrink: 0, color: colorTheme.onSurfaceVariant }]} numberOfLines={1}>{lastMessage ? `${parseTeamName(lastMessage.from)} to ${parseTeamName(lastMessage.to)}` : ""}</Text>
                            <Text style={[styles.text, { color: colorTheme.onSurfaceVariant }]} numberOfLines={1}>{lastMessage ? `${lastMessage.note}` : "No previous traffic found"}</Text>
                        </View>
                        <Text style={[styles.text, { fontStyle: 'italic', flexShrink: 0, color: colorTheme.onSurfaceVariant }]} numberOfLines={1}>{lastMessage ? `${calculateElapsedTime(lastMessage.time)}` : ""}</Text>
                    </View>
                }
            </View>
        );
    } else {
        return <View style={[styles.card, { backgroundColor: error ? colorTheme.errorContainer : team.flagged ? colorTheme.secondaryContainer : colorTheme.surfaceContainer, flexDirection: "column", gap: 4, paddingVertical: 10, }]}>
            <SectionContainer justifyContent="flex-start">
                <View style={styles.sectionTitleContainer}>
                    {team.type ? <>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <EditableText disabled={readOnly} style={[styles.sectionBodyTextSmall, { fontWeight: "bold" }]} numberOfLines={1} value={team.name} defaultValue={readOnly ? "-" : "Tap to set"} suffix={"(" + team.type + ")"} onChangeText={(text) => editTeam({ name: text })} limit={10} />
                        </View>
                    </> : <>
                        <EditableText disabled={readOnly} style={[styles.sectionBodyTextSmall, { fontWeight: "bold" }]} numberOfLines={1} value={team.name} defaultValue={readOnly ? "-" : "Tap to set"} onChangeText={(text) => editTeam({ name: text })} limit={10} />
                    </>}
                    {!readOnly && <View style={{ flexDirection: "row", gap: 4 }}>
                        <IconButton small ionicons_name="person-remove" onPress={() => setDeleteModalShowing(true)} />
                        <IconButton small tonal={team.flagged} ionicons_name={team.flagged ? "flag" : "flag-outline"} text={team.flagged ? "Unflag" : "Flag"} onPress={handleToggleFlag} />
                        <IconButton small primary backgroundColor={colorTheme.surfaceContainer} ionicons_name="create" text="Log traffic" onPress={() => showLogTrafficModal()} />
                    </View>}
                </View>
            </SectionContainer>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <SectionContainer style={{ flexBasis: 0, gap: 2 }}>
                    <View style={styles.sectionTitleContainer}>
                        <Text style={[styles.text]}>Assignment</Text>
                    </View>
                    <EditableText disabled={readOnly} style={[styles.sectionBodyTextSmall, { fontWeight: "bold" }]} numberOfLines={1} value={team.assignment} defaultValue={readOnly ? "-" : "Tap to set"} onChangeText={(text) => editTeam({ assignment: text })} limit={25} />
                </SectionContainer>
                <SectionContainer style={{ flexBasis: 0, gap: 2 }}>
                    <View style={styles.sectionTitleContainer}>
                        <Text style={[styles.text]}>Status</Text>
                    </View>
                    <EditableText disabled={readOnly} style={[styles.sectionBodyTextSmall, { fontWeight: "bold" }]} numberOfLines={1} value={team.status} defaultValue={readOnly ? "-" : "Tap to set"} onChangeText={(text) => editTeam({ status: text })} limit={25} />
                </SectionContainer>
            </View>
            <SectionContainer>
                <View style={styles.sectionTitleContainer}>
                    <View style={{ gap: 2 }}>
                        <Text style={[styles.text]}>Timeout</Text>
                        <Text style={[styles.sectionBodyTextSmall, { fontWeight: "bold" }]}>{formatTime(time)}</Text>
                    </View>
                    {!readOnly && <View style={{ flexDirection: "row", gap: 4 }}>
                        <IconButton small tonal={!team.isRunning} ionicons_name={team.isRunning ? "pause" : "play"} onPress={handleStartStop} />
                        <IconButton small ionicons_name="refresh" onPress={handleResetTimeout} />
                    </View>}
                </View>
            </SectionContainer>
            <RiskModal
                isVisible={deleteModalShowing}
                title={"Delete team?"}
                onClose={() => { setDeleteModalShowing(false) }}>
                <View style={{
                    padding: 20, paddingTop: 0, gap: 20
                }}>
                    <Text style={{ color: colorTheme.onSurface }}>{team.name ? team.name : "This team"} will be removed, but any radio logs won't be affected</Text>
                    <FilledButton rightAlign destructive text={"Delete team"} onPress={removeTeam} />
                </View>
            </RiskModal>
        </View>
    }
};

const SectionContainer = ({ children, maxWidth, width, justifyContent, style, noDivider = false }) => {
    const styles = pageStyles();
    const maxWidthOverride = maxWidth ? { maxWidth: maxWidth } : {};
    const widthOverride = width ? { width: width } : {};
    const justifyContentOverride = justifyContent ? { justifyContent: justifyContent } : {};

    return (
        <View style={[styles.sectionContainer, !noDivider && (useWindowDimensions().width > 600) && styles.sectionContainerDivider, maxWidthOverride, widthOverride, justifyContentOverride, width < 1080 && { flexGrow: 1 }, style]}>
            {children}
        </View>
    );
}

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

const calculateRemainingTime = (lastStart, lastTimeRemaining) => {
    const now = new Date();

    let lastTime;
    if (lastStart) {
        lastTime = new Date(lastStart);
    } else {
        lastTime = new Date(now);
    }

    const diff = now.getTime() - lastTime.getTime();

    return lastTimeRemaining - Math.floor(diff / 1000);
}

const OverviewTab = ({ teams, logs, currentCallsign, removeTeam, setIsRuningWithKey, setAllIsRunning, handleAddTeam, handleResetTimeoutWithKey, handleToggleFlagWithKey, editTeam, addLog, readOnly, printerConnected = false, handlePrintClueStub }) => {
    const styles = pageStyles();
    const { width, height } = useWindowDimensions();
    const { colorTheme } = useContext(ThemeContext);

    const [logTrafficTeam, setLogTrafficTeam] = useState();
    const [expanded, setExpanded] = useState(false);

    const areTimersRunning = teams.some(item => item.isRunning === true);

    const displayLogs = logs.filter((log) => log.type === "2");
    displayLogs.sort((a, b) => new Date(b.time) - new Date(a.time));

    return (
        <View style={{ gap: 20 }}>
            {!readOnly && <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
                <Text style={styles.sectionTitle}></Text>
                <View style={{ flexDirection: "row", gap: 14 }}>
                    {width > 600 && <FilledButton small={height < 500} backgroundColor={colorTheme.background} disabled={teams.length === 0} icon={expanded ? "chevron-up-outline" : "chevron-down-outline"} text={expanded ? "Hide last" : "Show last"} onPress={() => setExpanded(!expanded)} />}
                    <FilledButton small={width <= 600 || height < 500} backgroundColor={colorTheme.background} disabled={teams.length === 0} icon={areTimersRunning ? "pause" : "play"} text={areTimersRunning ? "Pause all" : "Resume all"} onPress={() => setAllIsRunning(!areTimersRunning)} />
                    <FilledButton small={width <= 600 || height < 500} primary icon="person-add" text={width > 600 ? "Ad-hoc team" : "Ad-hoc"} onPress={handleAddTeam} />
                </View>
            </View>}
            {teams.length === 0 &&
                <>
                    <View style={{ flexDirection: "column", gap: 6, paddingHorizontal: 12 }}>
                        <Text style={[styles.sectionTitle]}>Howdy!</Text>
                        <Text style={{ color: colorTheme.onSurface }}></Text>
                        <Text style={styles.text}>Welcome to Operation Management Tools</Text>
                    </View>
                    <View style={{ flexDirection: (width > 600 ? "row" : "column"), gap: 8, flexWrap: (width > 600 ? "wrap" : "no-wrap") }}>
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="sparkles" size={24} color={colorTheme.onSurface} />}
                            title={"All changes are saved automatically"} />
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="rocket" size={24} color={colorTheme.onSurface} />}
                            title={(width > 600 ? "Tap the file name in the header to name this file, and enter incident details in the \"File\" tab" : "Tap the file name to name this file and the file icon to enter incident details, both found in the header")} />
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="people" size={24} color={colorTheme.onSurface} />}
                            title={"Teams will appear here. Create one in the \"Responders\" tab or create an ad-hoc team using the button above"} />
                        <Banner
                            backgroundColor={colorTheme.secondaryContainer}
                            color={colorTheme.onSecondaryContainer}
                            icon={<Ionicons name="lock-closed" size={24} color={colorTheme.onSecondaryContainer} />}
                            title={"All data is stored in this browser and will be deleted if browsing data is cleared"}>
                            <Text style={[styles.text, { color: colorTheme.onSecondaryContainer }]}>{"Download this file for safekeeping " + (width > 600 ? "from the \"File\" tab" : "by tapping the file icon in the header") + ". Refer to agency data classification and storage requirements."}</Text>
                        </Banner>
                    </View>
                </>
            }
            <View style={[styles.timerSection, { flexWrap: "wrap", flexDirection: (readOnly && width > 600) ? "row" : "column", gap: readOnly ? 10 : 4 }]}>
                {teams.map(item => (
                    <TimerComponent
                        readOnly={readOnly}
                        expanded={expanded}
                        team={item}
                        teams={teams}
                        currentCallsign={currentCallsign}
                        key={item.key}
                        handleResetTimeout={() => handleResetTimeoutWithKey(item.key)}
                        handleStartStop={() => setIsRuningWithKey(item.key, !item.isRunning)}
                        removeTeam={() => removeTeam(item)}
                        handleToggleFlag={() => handleToggleFlagWithKey(item.key)}
                        editTeam={(obj, log) => editTeam(item, obj, log)}
                        showLogTrafficModal={() => {
                            setLogTrafficTeam(item);
                            editTeam(item, { editing: true }, false);
                        }}
                        addLog={addLog}
                        lastMessage={displayLogs.find((log) => textSearch(log.to, item.name) || textSearch(log.from, item.name) || textSearch(log.team, item.name))}
                    />
                ))}
            </View>
            <LogTrafficComponent
                printerConnected={printerConnected}
                handlePrintClueStub={handlePrintClueStub}
                onClose={() => {
                    editTeam(logTrafficTeam, { editing: false }, false);
                    setLogTrafficTeam(undefined);
                }}
                team={logTrafficTeam}
                teams={teams}
                currentCallsign={currentCallsign}
                addLog={addLog}
                updateStatus={(text) => editTeam(logTrafficTeam, { status: text }, false)}
                updateAssignment={(newAssignment) => editTeam(logTrafficTeam, { assignment: newAssignment }, false)}
                setFlag={(state) => editTeam(logTrafficTeam, { flagged: state }, false)}
                resetTimeout={() => handleResetTimeoutWithKey(logTrafficTeam?.key)} />
        </View>
    );
}

const textSearch = (text, filter) => {
    if (text && filter) {
        return (new RegExp(filter, 'i')).test(text)
    }
    return false;
}

const LogTab = ({ logs, incidentInfo, userInfo }) => {
    const styles = pageStyles();
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const [typeFilter, setTypeFilter] = useState(0);
    const [textFilter, setTextFilter] = useState("");
    const [logSlice, setLogSlice] = useState(1);
    // Export related
    const [modalShowing, setModalShowing] = useState(false);
    const [exportType, setExportType] = useState(0);
    const [exportContents, setExportContents] = useState(0);
    const [exportFileType, setExportFileType] = useState(0);
    const [exportDatePreference, setExportDatePreference] = useState(0);
    const numLogsPerPage = 15;

    useEffect(() => {
        // Load saved settings
        getData("export-date-format").then((value) => { value && setExportDatePreference(value) });
    }, []);

    let displayLogs = logs;
    if (typeFilter === 1) {
        displayLogs = displayLogs.filter((log) => log.type === "2")
    }
    if (textFilter && textFilter.length >= 2) {
        displayLogs = displayLogs.filter((log) => textSearch(log.to, textFilter) || textSearch(log.from, textFilter) || textSearch(log.team, textFilter) || textSearch(log.note, textFilter))
    }
    displayLogs.sort((a, b) => new Date(b.time) - new Date(a.time));

    let printToFile = async (displayLogs, incidentInfo, userInfo) => {
        const maxLogsLinesPerPage = 24;
        const maxCharsPerLine = 65;
        let logsHTML = "";
        let lines = 0;
        let pages = [];

        if (exportType === 0 || exportType === 1) displayLogs = displayLogs.filter((log) => log.type === "2"); // ICS309, SAR 133 only has radio logs

        displayLogs.forEach((log) => {
            if (log.note) {
                let logLines = Math.ceil(log.note.length / maxCharsPerLine);
                if ((logLines + lines) > maxLogsLinesPerPage) {
                    lines = 0;
                    pages.push(logsHTML);
                    logsHTML = "";
                }
                lines = lines + logLines;
            } else {
                // If there is no note, this counts as a single line
                lines = lines + 1;
            }
            logsHTML = logsHTML + `<tr>
            <td class="time">${exportDatePreference === 1 ? new Date(log.time).toISOString() : new Date(log.time).toLocaleString('en-US', { hour12: false })}</td>
            ${log.from !== undefined ? `<td class="oneline center">${parseTeamName(log.from || "Unknown")}</td>
            <td class="oneline center">${parseTeamName(log.team || log.to || "Unknown")}</td>` :
                    `<td class="oneline center" colspan="2">${parseTeamName(log.team || log.to || "Unknown")}</td>`
                }
            <td class="subject">${log.note || ""}</td>
        </tr>`})
        pages.push(logsHTML);

        let pageContents = "";
        pages.forEach((tableContents, index) => {
            if (exportType === 0) {
                // ICS 309 style
                pageContents = pageContents + `
                        <table>
                            <tr>
                                <th colspan="3">COMMUNICATIONS LOG</th>
                                <td colspan="2"><p class="small">TASK #</p>${incidentInfo.number || ""}</td>
                                <td colspan="2"><p class="small">FOR PERIOD</p>FROM: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[0]?.time).toISOString() : new Date(displayLogs[0]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</br>TO: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[displayLogs.length - 1]?.time).toISOString() : new Date(displayLogs[displayLogs.length - 1]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</td>
                            </tr>
                            <tr>
                                <td colspan="2"><p class="small">FOR OP. PERIOD #</p>${incidentInfo.opPeriod || ""}</td>
                                <td colspan="5"><p class="small">TASK NAME</p>${incidentInfo.incidentName || ""}</td>

                            </tr>
                            <tr>
                                <td colspan="3"><p class="small">LOG KEEPER</p>${userInfo.name || ""}</td>
                                <td colspan="2"><p class="small">STATION CALLSIGN</p>${userInfo.callsign || ""}</td>
                                <td colspan="2"><p class="small">STATION FREQUENCY</p>${userInfo.frequency || ""}</td>
                            </tr>
                        </table>
                        <table id="tableId">
                            <tr>
                                <td></td>
                                <th colspan="2"><p class="small">STATION I.D.</p></td>
                                <td></td>
                            </tr>
                            <tr>
                                <th><p class="small">TIME</p></th>
                                <th><p class="small">THIS IS</p></th>
                                <th><p class="small">STN CALLED</p></th>
                                <th><p class="small">SUBJECT</p></th>
                            </tr>
                            ${tableContents}
                        </table>
                        <table>
                            <tr>
                                <td class="center">Page ${index + 1} of ${pages.length}</td>
                                <td class="center"><b>ICS 309</b></td>
                            </tr>
                        </table>
                        <p class="smallFooter">CALSAR 12/2024</p>
                        ${(index + 1 === pages.length) ? "" : `<div class="pagebreak"></div>`}
                        `;
            } else if (exportType === 1) {
                // BASARC SAR 133 style
                pageContents = pageContents + `
                    <table>
                        <tr>
                            <th colspan="1" class="center">RADIO LOG</th>
                            <td colspan="1"><p class="small">1. INCIDENT NAME</p>${incidentInfo.incidentName || ""}</td>
                            <td colspan="1"><p class="small">2. DATE</p>${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[0]?.time).toISOString() : new Date(displayLogs[0]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</td>
                            <td colspan="1"><p class="small">3. INCIDENT NUMBER</p>${incidentInfo.number || ""}</td>
                        </tr>
                        <tr>
                            <td colspan="2"><p class="small">4. OPERATOR LOCATION</p></td>
                            <td colspan="2"><p class="small">5. FREQUENCY</p>${userInfo.frequency || ""}</td>
                        </tr>
                    </table>
                    <table id="tableId">
                        <tr>
                            <td></td>
                            <th colspan="2"><p class="small">TEAM</p></td>
                            <td></td>
                        </tr>
                        <tr>
                            <th><p class="small">TIME</p></th>
                            <th><p class="small">FROM</p></th>
                            <th><p class="small">TO</p></th>
                            <th><p class="small">MESSAGE</p></th>
                        </tr>
                        ${tableContents}
                    </table>
                    <table>
                        <tr>
                            <td class="center"><b>SAR 133</b><p class="small">BASARC 3/98</p></td>
                            <td><p class="small">6. LOG PREPARED BY</p></td>
                            <td><p class="small">7. RADIO OPERATOR</p>${userInfo.name || ""}</td>
                        </tr>
                    </table>
                    ${(index + 1 === pages.length) ? "" : `<div class="pagebreak"></div>`}
                        `;
            } else {
                // Standard export style
                pageContents = pageContents + `
                        <table>
                            <tr>
                                <td colspan="3" class="center"><p class="small">OPERATION MANAGEMENT TOOL</p><b>${((exportType === 2 && (typeFilter !== 0 || textFilter !== "") && exportContents !== 1) ? "PARTIAL " : "FULL ")}LOG</b></td>
                                <td colspan="2"><p class="small">TASK #</p>${incidentInfo.number || ""}</td>
                                <td colspan="2"><p class="small">PERIOD</p>FROM: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[0]?.time).toISOString() : new Date(displayLogs[0]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</br>TO: ${displayLogs.length > 0 && (exportDatePreference === 1 ? new Date(displayLogs[displayLogs.length - 1]?.time).toISOString() : new Date(displayLogs[displayLogs.length - 1]?.time).toLocaleString('en-US', { hour12: false })) ||
                    ""}</td>
                            </tr>
                            <tr>
                                <td colspan="1"><p class="small">OP. PERIOD #</p>${incidentInfo.opPeriod || ""}</td>
                                <td colspan="6"><p class="small">TASK NAME</p>${incidentInfo.incidentName || ""}</td>
                            </tr>
                            <tr>
                                <td colspan="3"><p class="small">LOG KEEPER</p>${userInfo.name || ""}</td>
                                <td colspan="2"><p class="small">STATION CALLSIGN</p>${userInfo.callsign || ""}</td>
                                <td colspan="2"><p class="small">STATION FREQ./CHANNEL</p>${userInfo.frequency || ""}</td>
                            </tr>
                        </table>
                        <table id="tableId">
                            <tr>
                                <td></td>
                                <th colspan="2">TEAM</td>
                                <td></td>
                            </tr>
                            <tr>
                                <th>TIME</th>
                                <th>FROM</th>
                                <th>TO</th>
                                <th>MESSAGE</th>
                            </tr>
                            ${tableContents}
                        </table>
                        <table>
                            <tr>
                                <td>Page ${index + 1} of ${pages.length}</td>
                            </tr>
                        </table>
                        ${(index + 1 === pages.length) ? "" : `<div class="pagebreak"></div>`}
                        `;
            }
        })

        const exportWindowHTML = `
            <html>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <head>
                <title>Export ${exportType === 0 ? "ICS309" : exportType === 1 ? "SAR 133" : "Log"}${incidentInfo.incidentName ? " - " + incidentInfo.incidentName : ""}</title>
                <style>
                    table {
                        border: 1px solid black;
                        border-collapse: collapse;
                        width: 100%;
                    }
                    body {
                        font-family: Arial, sans-serif;
                    }
                    th,
                    td {
                        border: 1px solid black;
                        padding: 5px;
                        vertical-align: top;
                    }
                    p {
                        margin: 0px;
                    }
                    @media print {
                        .pagebreak { page-break-before: always; } /* page-break-after works, as well */
                    }
                    .oneline {
                        white-space: nowrap;
                    }
                    .time {
                        width: 165px;
                    }
                    .center {
                        text-align: center;
                        vertical-align: middle;
                    }
                    .subject {
                        width: 425px;
                    }
                    .small {
                        font-size: 0.3cm;
                    }
                    .smallFooter {
                        font-size: 0.3cm;
                        margin: 4px;
                        text-align: right;
                    }
                </style>
            </head>
            <body>
                ${pageContents}
            </body>
        `;

        if (Platform.OS === 'web') {
            const winUrl = URL.createObjectURL(
                new Blob([exportWindowHTML], { type: "text/html" })
            );

            const win = window.open(
                winUrl,
                "win",
                `width=800,height=400,screenX=200,screenY=200`
            );

            win.print(); // this is blocking
        } else {
            // On iOS/android prints the given html. On web prints the HTML from the current page.
            const { uri } = await printToFileAsync({ exportWindowHTML });
            console.log('File has been saved to:', uri);
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        }
    };

    const exportCSV = async (logs, filename) => {
        let csvString = "Time,From,To,Message\n";
        logs.forEach((log) => {
            csvString = csvString + `"${exportDatePreference === 1 ? new Date(log.time).toISOString() : new Date(log.time).toLocaleString('en-US', { hour12: false })}",${log.from !== undefined ? `${parseTeamName(log.from || "Unknown")}` : "(Non-radio log)"},${parseTeamName(log.team || log.to || "Unknown")},"${log.note || ""}"\n`;
        });
        if (Platform.OS === 'web') {
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = (filename || "export") + '_logs.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } else {
            try {
                // Create a temporary URI
                const { uri } = await FileSystem.writeAsStringAsync(
                    FileSystem.documentDirectory + (filename || "export") + '_logs.csv',
                    csvString,
                    { encoding: FileSystem.EncodingType.UTF8 }
                );

                // Open the saved file (if supported by the device)
                await shareAsync(uri, { mimeType: 'text/csv' });

            } catch (error) {
                console.error('Error saving CSV:', error);
                // Handle the error (e.g., show an error message to the user)
            }
        }
    }

    const handleExportButton = () => {
        let logsToExport = displayLogs;
        logsToExport = logs.sort((a, b) => new Date(a.time) - new Date(b.time)); // Exports are printed in reverse order
        if (exportType === 0 || exportFileType === 0) {
            printToFile(logsToExport, incidentInfo, userInfo);
        } else {
            exportCSV(logsToExport, incidentInfo.name);
        }
        setModalShowing(false);
    }

    const parseTeamName = (teamNameToParse) => {
        if (teamNameToParse === "!@#$") {
            return userInfo.callsign || "OPERATOR"
        } else if (teamNameToParse) {
            return teamNameToParse;
        } else {
            return "Unnamed"
        }
    }

    const LogRow = ({ log, bold = false }) => {
        const renderRow = (time, from, to, message, bold = false) => {
            return (
                <>
                    <View style={{ alignSelf: 'stretch', flexDirection: 'row' }}>
                        <View style={{ flex: 1, alignSelf: 'stretch' }}>
                            <Text style={[styles.text, bold && { fontWeight: "bold" }]}>{time}</Text>
                        </View>
                        <View style={{ flex: 1, alignSelf: 'stretch', alignItems: "center" }}>
                            <Text style={[styles.text, bold && { fontWeight: "bold" }]}>{from}</Text>
                        </View>
                        <View style={{ flex: 1, alignSelf: 'stretch', alignItems: "center" }}>
                            <Text style={[styles.text, bold && { fontWeight: "bold" }]}>{to}</Text>
                        </View>
                        <View style={{ flex: 4, alignSelf: 'stretch' }}>
                            <Text style={[styles.text, bold && { fontWeight: "bold" }]}>{message}</Text>
                        </View>
                    </View>
                    <View
                        style={{
                            borderBottomColor: colorTheme.outlineVariant,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    />
                </>
            );
        }

        switch (log?.type) {
            case "3":
                // Non-radio operator related changes
                return (<>{renderRow(new Date(log.time).toLocaleString('en-US', { hour12: false }), "(non-radio)", "Operator", log.note)}</>);
                break;
            case "2":
                // Radio log
                return (<>{renderRow(new Date(log.time).toLocaleString('en-US', { hour12: false }), parseTeamName(log.from), parseTeamName(log.to), log.note)}</>);
                break;
            case "1":
                // Non-radio team related changes
                return (<>{renderRow(new Date(log.time).toLocaleString('en-US', { hour12: false }), "(non-radio)", parseTeamName(log.team), log.note)}</>);
                break;
            default:
                // Assume this is a header row?
                return (<>{renderRow("Time", "From", "To/Subject", "Message", true)}</>);
        }
    }

    return (
        <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14, alignItems: width > 600 ? "center" : "flex-start" }}>
                <View style={{ flexDirection: width > 600 ? "row" : "column", gap: 12, alignItems: "flex-start" }}>
                    <SearchBox placeholder="Search for..." onChangeText={setTextFilter} small={width <= 600} limit={20} />
                    <SegmentedButtons items={["All", "Radio only"]} selected={typeFilter} small={width <= 600} onPress={setTypeFilter} />
                </View>
                <FilledButton primary small={width <= 600} icon="share-outline" text="Export" onPress={() => setModalShowing(true)} />
            </View>

            <View style={[styles.standaloneCard, { flexDirection: "column", justifyContent: "flex-start", gap: 6, flexWrap: "nowrap" }]}>
                <LogRow />
                {displayLogs.length === 0 && <View style={{ flex: 1, alignSelf: 'stretch', alignItems: "center", marginVertical: 8 }}>
                    {(textFilter !== "" || typeFilter !== 0) ?
                        <Text style={[styles.text, { fontStyle: "italic" }]}>No logs found. Try adjusting the filters.</Text> :
                        <Text style={[styles.text, { fontStyle: "italic" }]}>No logs found</Text>
                    }
                </View>}
                {displayLogs.slice((logSlice - 1) * numLogsPerPage, logSlice * numLogsPerPage).map(log => (
                    <LogRow
                        log={log}
                        key={log.time + Math.random()}
                    />
                ))}


            </View>

            {displayLogs.length > 0 &&
                <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
                    <Text style={[styles.text, { fontStyle: "italic" }]}>Page {logSlice} of {Math.ceil(displayLogs.length / numLogsPerPage)}</Text>
                    <FilledButton small text="Previous" disabled={logSlice === 1} onPress={() => setLogSlice(prev => prev - 1)} />
                    <FilledButton small text="Next" disabled={logSlice === Math.ceil(displayLogs.length / numLogsPerPage)} onPress={() => setLogSlice(prev => prev + 1)} />
                </View>
            }
            <RiskModal
                isVisible={modalShowing}
                title={"Export log"}
                onClose={() => { setModalShowing(false) }}>
                <View style={{
                    padding: 20, paddingTop: 0, gap: 8, alignItems: "flex-start"
                }}>
                    <Text style={styles.text}>Type</Text>
                    <SegmentedButtons small items={["ICS 309", "SAR 133", "Custom"]} selected={exportType} onPress={setExportType} />
                    {(exportType === 0 || exportType === 1) ? <>
                        <Text style={styles.text}>This type of file contains radio logs only. Non-radio logs will not appear.</Text>
                        {Platform.OS === 'web' && <Text style={[styles.text, { fontStyle: "italic" }]}>A new window will open with a print dialog. Print to PDF to save the document.</Text>}
                    </> :
                        <>
                            <Text style={styles.text}>Contents</Text>
                            <SegmentedButtons small items={["Current filter", "All items"]} disabled={typeFilter === 0 && textFilter === ""} selected={(typeFilter !== 0 || textFilter) ? exportContents : 1} onPress={setExportContents} />
                            {typeFilter === 0 && textFilter === "" && <Text style={styles.text}>To export a subset of all logs, close this dialog and apply a filter.</Text>}
                            <Text style={styles.text}>File Type</Text>
                            <SegmentedButtons small items={["PDF", "CSV"]} selected={exportFileType} onPress={setExportFileType} />
                            {Platform.OS === 'web' && exportFileType === 0 && <Text style={[styles.text, { fontStyle: "italic" }]}>A new window will open with a print dialog. Print to PDF to save the document.</Text>}
                        </>}
                    <FilledButton primary rightAlign text="Export" disabled={false} onPress={handleExportButton} />
                </View>
            </RiskModal>
        </View>
    );
}

const pageStyles = () => {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    return StyleSheet.create({
        background: {
            backgroundColor: colorTheme.background,
            height: '100%'
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
        wideCard: {
            borderRadius: 6,
            backgroundColor: colorTheme.surfaceContainer,
            flexDirection: "column",
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
        sectionContainerDivider: {
            paddingRight: 10,
            borderRightColor: colorTheme.outlineVariant,
            borderRightWidth: StyleSheet.hairlineWidth,
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
        floatingView: {
            position: 'absolute',
            top: 60,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colorTheme.black + Math.round(0.8 * 255).toString(16).toUpperCase()
        },
        floatingViewContainer: {
            gap: 8,
            maxWidth: 1000,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            overflow: "hidden",
            backgroundColor: colorTheme.primaryContainer,
            paddingBottom: 20,
            paddingHorizontal: 20,
            marginLeft: width > 600 ? 90 : 0,
            alignSelf: "flex-end",
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
        sectionBodyTextDisabled: {
            color: getHoverColor(colorTheme.onSurface, 0.2)
        },
        header: {
            padding: 14,
            backgroundColor: colorTheme.brand,
            color: colorTheme.white,
        },
    });
}