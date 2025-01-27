import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHeader, IconButton, MaterialCard, ThemeContext } from 'calsar-ui';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { InfoTab } from '../components/FileInfoTab';
import { LogTab } from '../components/LogTab';
import { OptionsTab } from '../components/OptionsTab';
import { OverviewTab } from '../components/OverviewTab';
import { PrinterContext } from '../components/PrinterContext';
import { PrinterTab } from '../components/PrinterTab';
import { PrinterTabIcon } from '../components/PrinterTabIcon';
import RailContainer from '../components/RailContainer';
import { RespondersTab } from '../components/RespondersTab';
import { RxDBContext } from '../components/RxDBContext';
import TabContainer from '../components/TabContainer';
import { EditableText } from '../components/TextInput';

export default function OperationPage() {
    const styles = pageStyles();
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const { printText, isPrinterSupported } = useContext(PrinterContext);
    const { getFileByID, getTeamsByFileId, deleteDocument, createTeam, createLog } = useContext(RxDBContext)

    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);
    const { width } = useWindowDimensions();

    const { } = useContext(RxDBContext)

    const localParams = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState("Overview");
    const [timeoutDefault, setTimeoutDefault] = useState(3600);
    const [fileLoaded, setFileLoaded] = useState(0);
    const [readOnly, setReadOnly] = useState(false);

    const [incidentInfo, setIncidentInfo] = useState({});
    const [teamsInfo, setTeamsInfo] = useState([]);

    const [selectedHeaderItem, setSelectedHeaderItem] = useState(0);

    const loadFile = (sort = false) => {
        getFileByID(localParams.file).then(query => {
            query.$.subscribe(file => {
                if (file) {
                    setIncidentInfo(file);
                    setFileLoaded(1);
                } else {
                    setFileLoaded(-1);
                }
            });
        });

        getTeamsByFileId(localParams.file).then(query => {
            query.$.subscribe(teams => {
                setTeamsInfo(teams);
            });
        });

        /*getData(localParams.file + "-incidentInfo").then((value) => {
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
        getData(localParams.file + "-userInfo").then((value) => { value && setUserInfo(value) });
        getData(localParams.file + "-teamsInfo").then((value) => {
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
        getData(localParams.file + "-auditInfo").then((value) => { value && setLogInfo(value) });*/
    }

    useEffect(() => {
        // Load saved settings
        getData("timeout-seconds").then((value) => { value && setTimeoutDefault(value) });
        loadFile();
    }, []);

    const handleSetReadOnly = (state) => {
        if (state) {
            setSelectedHeaderItem(0);
            setActiveTab("Overview")
        }
    }

    useEffect(() => {
        handleSetReadOnly(readOnly);

        return () => handleSetReadOnly(false);
    }, [readOnly]);

    const setIsRuning = (teamToUpdate, state) => {
        if (teamToUpdate.isRunning !== state) {
            if (state) {
                // Start timer
                teamToUpdate.incrementalPatch({ lastStart: new Date().toISOString(), isRunning: true });
            } else {
                // Stop timer by recording the amount of time left
                teamToUpdate.incrementalPatch({ lastTimeRemaining: calculateRemainingTime(teamToUpdate.lastStart, teamToUpdate.lastTimeRemaining), isRunning: false });
            }
            incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
        }
    };

    const setAllIsRunning = (state) => {
        teamsInfo.map(team => !team.removed && setIsRuning(team, state))
    };

    const removeTeam = (team) => {
        team.incrementalPatch({ removed: true });
        incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
        addLog({
            created: new Date().toISOString(),
            type: 1, // 1 for Team-related
            fromTeam: team.id || "",
            message: "Removed team"
        });
    };

    const editTeam = (team, fieldToMerge, log = true) => {
        if (team) {
            team.incrementalPatch(fieldToMerge);
            incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
            if (log) {
                let changes = "";
                for (var key in fieldToMerge) {
                    if (fieldToMerge.hasOwnProperty(key)) {
                        if (changes === "") {
                            changes = fieldToMerge[key] ? `${changes}Updated ${key} from "${team[key] || "empty"}" to "${fieldToMerge[key]}"` : (changes + "Removed " + key);
                        } else {
                            changes = fieldToMerge[key] ? `${changes}, updated ${key} from "${team[key] || "empty"}" to "${fieldToMerge[key]}"` : (changes + ", removed " + key);
                        }
                    }
                }

                addLog({
                    created: new Date().toISOString(),
                    type: 1, // 1 for Team-related
                    fromTeam: team.id || "",
                    message: changes
                });
            }
        }
    };

    const editIncident = (fieldToMerge, log = false) => {
        incidentInfo.incrementalPatch({ ...fieldToMerge, ...{ updated: new Date().toISOString() } });

        if (log) {
            let changes = "";
            for (var key in fieldToMerge) {
                if (fieldToMerge.hasOwnProperty(key)) {
                    if (changes === "") {
                        changes = fieldToMerge[key] ? `${changes} ${key} updated to "${fieldToMerge[key]}"` : (changes + "Removed " + key);
                    } else {
                        changes = fieldToMerge[key] ? `${changes}, ${key} updated to "${fieldToMerge[key]}"` : (changes + ", removed " + key);
                    }
                }
            }
            addLog({
                created: new Date().toISOString(),
                type: 3, // 1 for Team-related
                fromTeam: "",
                message: changes
            });
        }
    };

    const parseTeamName = (teamNameToParse) => {
        if (teamNameToParse === "!@#$") {
            return incidentInfo.commsCallsign || "OPERATOR"
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
        if (fieldToAdd.type === "2" && fieldToAdd.time && fieldToAdd.fromTeam && fieldToAdd.toTeam && fieldToAdd.message) {
            await printText(`${format24HourTime(new Date(fieldToAdd.created))}, ${parseTeamName(fieldToAdd.fromTeam)} TO ${parseTeamName(fieldToAdd.toTeam)}`);
            await printText(`  ${fieldToAdd.message}`);
        }
        createLog(incidentInfo.id, fieldToAdd);
        incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
    };

    const addAdHocTeam = () => {
        createTeam(incidentInfo.id)
            .then(team => team.incrementalPatch({
                type: "Ad-hoc"
            }))
        incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
    }

    const handleResetTimeout = (teamToUpdate) => {
        if (teamToUpdate.isRunning === true) {
            teamToUpdate.incrementalPatch({ lastStart: new Date().toISOString(), lastTimeRemaining: timeoutDefault, isRunning: true });
        } else {
            teamToUpdate.incrementalPatch({ lastStart: undefined, lastTimeRemaining: timeoutDefault, isRunning: false });
        }

        incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
    }

    const handleToggleFlag = (teamToUpdate) => {
        teamToUpdate.incrementalPatch({ flagged: !teamToUpdate.flagged });
        incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
    }

    if (fileLoaded === 1) {
        const tabs = [
            {
                name: "Overview",
                icon: "earth",
                content: <OverviewTab incidentInfo={incidentInfo} readOnly={readOnly} teams={teamsInfo} removeTeam={removeTeam} setIsRuning={setIsRuning} setAllIsRunning={setAllIsRunning} handleAddTeam={addAdHocTeam} handleResetTimeout={handleResetTimeout} handleToggleFlag={handleToggleFlag} editTeam={editTeam} addLog={addLog} />
            },
            {
                name: "Resources",
                icon: "id-card",
                content: <RespondersTab incidentInfo={incidentInfo} teams={teamsInfo} />
            },
            {
                name: "Planning",
                icon: "navigate-circle",
                content: <><MaterialCard
                    noMargin
                    title="Nothing here yet!"
                    subtitle="This section is still under construction. Please set assignments manually in the Overview tab.">
                </MaterialCard></>
            },
            {
                name: "Logs",
                icon: "receipt",
                content: <LogTab incidentInfo={incidentInfo} teams={teamsInfo} />

            },
            {
                name: "Options",
                icon: "ellipsis-horizontal",
                content: <OptionsTab setReadOnly={setReadOnly} incidentInfo={incidentInfo} />,
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
                            <EditableText onEditing={(state) => { state && setSelectedHeaderItem(1) }} disabled={readOnly} style={{ fontSize: 18, flex: -1, fontWeight: '500', color: colorTheme.onPrimaryContainer, flexShrink: 1 }} numberOfLines={1} value={incidentInfo.fileName} defaultValue={"Untitled file"} onChangeText={(text) => editIncident({ fileName: text })} limit={50} suffix={readOnly ? "" : ""} />
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
                            <InfoTab incidentInfo={incidentInfo} editIncident={editIncident} />
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
                            <PrinterTab setReadOnly={setReadOnly} incidentInfo={incidentInfo} />
                        </ScrollView>
                    </>
                }
            </View >
        );

    } else if (fileLoaded === -1) {
        return <Redirect href={"/?error=notfound"} />
    } else {
        const loadingTab = [
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