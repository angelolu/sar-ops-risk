import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHeader, IconButton, MaterialCard, ThemeContext } from 'calsar-ui';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { InfoTab } from '../components/FileInfoTab';
import { LogTab } from '../components/LogTab';
import { OptionsTab } from '../components/OptionsTab';
import { OverviewTab } from '../components/OverviewTab';
import { PrinterContext } from '../components/PrinterContext';
import { PrinterTab } from '../components/PrinterTab';
import { PrinterTabIcon } from '../components/PrinterTabIcon';
import RailContainer from '../components/RailContainer';
import TabContainer from '../components/TabContainer';
import { EditableText } from '../components/TextInput';

export default function OperationPage() {
    const styles = pageStyles();
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const { printText, isPrinterSupported, isPrinterConnected } = useContext(PrinterContext);

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

        const [incidentInfo, setIncidentInfo] = useState({});
        const [userInfo, setUserInfo] = useState({ callsign: "COMMS" });
        const [teamsInfo, setTeamsInfo] = useState([]);
        const [logInfo, setLogInfo] = useState([]);

        const [selectedHeaderItem, setSelectedHeaderItem] = useState(0);

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
            }
        }, []);

        const handleSetReadOnly = (state) => {
            if (state) {
                setSelectedHeaderItem(0);
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

        if (fileLoaded === 1) {
            const tabs = [
                {
                    name: "Overview",
                    icon: "earth",
                    content: <OverviewTab incidentInfo={incidentInfo} readOnly={readOnly} logs={logInfo} currentCallsign={userInfo.callsign} teams={teamsInfo} removeTeam={removeTeam} setIsRuningWithKey={setIsRuningWithKey} setAllIsRunning={setAllIsRunning} handleAddTeam={addAdHocTeam} handleResetTimeoutWithKey={handleResetTimeoutWithKey} handleToggleFlagWithKey={handleToggleFlagWithKey} editTeam={editTeam} addLog={addLog} />
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
                    name: "Options",
                    icon: "ellipsis-horizontal",
                    content: <OptionsTab setReadOnly={setReadOnly} incidentInfo={incidentInfo} userInfo={userInfo} />,
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
                        customTitle={
                            <View style={[{ height: 55, flexDirection: "row", gap: 8, justifyContent: "space-between", alignItems: "center", alignSelf: "flex-end", paddingRight: 4, paddingLeft: 12, paddingBottom: 5 }, selectedHeaderItem === 1 && { backgroundColor: colorTheme.surfaceContainerHighest, borderTopLeftRadius: 12, borderTopRightRadius: 12, width: 300 }]}>
                                <EditableText onEditing={(state) => { state && setSelectedHeaderItem(1) }} disabled={readOnly} style={{ fontSize: 18, flex: -1, fontWeight: '500', color: colorTheme.onPrimaryContainer, flexShrink: 1 }} numberOfLines={1} value={incidentInfo.name} defaultValue={"Untitled file"} onChangeText={(text) => editIncident({ name: text })} limit={50} suffix={readOnly ? "" : ""} />
                                {selectedHeaderItem === 1 && <IconButton ionicons_name={"caret-up-circle-outline"} onPress={() => { setSelectedHeaderItem(0) }} color={colorTheme.onSurface} size={24} />}
                            </View>
                        }
                        href="/"
                        hideBack={width > 600}
                        menuButton={!readOnly && <View style={{ flexDirection: "row", height: 60, alignItems: "flex-end", gap: 4 }}>
                            {isPrinterSupported &&
                                <View style={[{ height: 55 }, selectedHeaderItem === 2 && { backgroundColor: colorTheme.surfaceContainerHighest, borderTopLeftRadius: 12, borderTopRightRadius: 12 }]}>
                                    <View>
                                        <PrinterTabIcon
                                            ionicons_name={selectedHeaderItem === 2 ? "caret-up-circle-outline" : "print-outline"}
                                            onPress={() => { setSelectedHeaderItem(selectedHeaderItem === 2 ? 0 : 2) }}
                                            color={selectedHeaderItem === 2 ? colorTheme.onSurface : colorTheme.onPrimaryContainer}
                                            selected={selectedHeaderItem === 2}
                                            size={24} />
                                    </View>
                                </View>}
                        </View>}
                    />
                    {width > 600 ?
                        <RailContainer readOnly={readOnly} warn={areTeamsFlagged} error={areTeamsError} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} image={activeTab === "Overview" ? (teamsInfo.length === 0 ? 0.1 : 0.8) : 1} />
                        :
                        <TabContainer readOnly={readOnly} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                    }
                    {selectedHeaderItem === 1 &&
                        <View style={styles.floatingBackground}>
                            <Pressable onPress={() => setSelectedHeaderItem(0)} style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                borderTopLeftRadius: 20
                            }} />
                            <ScrollView
                                contentContainerStyle={[styles.floatingViewContainer]}
                                style={{ alignSelf: "center", marginRight: width > 600 ? 90 : 0, flexGrow: 0 }}
                            >
                                <InfoTab incidentInfo={incidentInfo} userInfo={userInfo} editIncident={editIncident} editUser={editUser} />
                            </ScrollView>
                        </View>
                    }
                    {selectedHeaderItem === 2 &&
                        <>
                            <Pressable onPress={() => setSelectedHeaderItem(0)} style={styles.floatingBackground} />
                            <ScrollView
                                contentContainerStyle={styles.floatingViewContainer}
                                style={[styles.floatingView]}
                            >
                                <PrinterTab setReadOnly={setReadOnly} incidentInfo={incidentInfo} userInfo={userInfo} />
                            </ScrollView>
                        </>
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

function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }

    return true;
}

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

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    return StyleSheet.create({
        background: {
            backgroundColor: colorTheme.background,
            height: '100%'
        },
        floatingView: {
            position: 'absolute',
            top: 60,
            right: 0,
        },
        floatingViewContainer: {
            gap: 8,
            maxWidth: 1000,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            overflow: "hidden",
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignSelf: "flex-end",
            backgroundColor: colorTheme.surfaceContainerHighest,
        },
        floatingBackground: {
            position: 'absolute',
            top: 60,
            bottom: 0,
            left: width > 600 ? 90 : 0,
            right: 0,
            borderTopLeftRadius: 20,
            backgroundColor: colorTheme.black + Math.round(0.8 * 255).toString(16).toUpperCase()
        },
        circleFixed: {
            position: 'absolute',
            right: 2,
            top: 2,
            width: 14,
            height: 14,
            borderRadius: 7,
            borderWidth: 2,
            borderColor: colorTheme.onSurface,
        },
    });
}