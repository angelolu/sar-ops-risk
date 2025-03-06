import { Ionicons } from '@expo/vector-icons';
import { BackHeader, IconButton, textStyles, ThemeContext } from 'calsar-ui';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { getAuth } from 'firebase/auth';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { CluePanel } from '../components/CluesTab';
import { CommsPanel, LogPanel } from '../components/CommsTab';
import { InfoTab } from '../components/FileInfoTab';
import { useFirebase } from '../components/FirebaseContext';
import { getAsyncStorageData, saveAsyncStorageData } from '../components/helperFunctions';
import { validateLocationString } from '../components/MapPanel';
import { OverviewTab } from '../components/OverviewTab';
import { PlanningPanel } from '../components/PlanningTab';
import { PrinterContext } from '../components/PrinterContext';
import { PrinterTab } from '../components/PrinterTab';
import { PrinterTabIcon } from '../components/PrinterTabIcon';
import RailContainer, { AnimatedBG } from '../components/RailContainer';
import { ResourcesPanel, TeamsPanel } from '../components/RespondersTab';
import { RxDBContext } from '../components/RxDBContext';
import TabContainer from '../components/TabContainer';
import { EditableText } from '../components/TextInput';

const calculateRemainingTime = (lastStart, lastTimeRemaining) => {
    const elapsedTime = lastStart ? (Date.now() - new Date(lastStart)) / 1000 : 0;
    return lastTimeRemaining - Math.floor(elapsedTime);
}

const pollUntilFileReady = (fileId) => {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            getAsyncStorageData("readyFiles").then(readyFiles => {
                if (readyFiles && readyFiles.includes(fileId)) {
                    clearInterval(interval);
                    resolve();
                }
            });
        }, 500);
    });
}

export default function OperationPage() {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const { isPrinterSupported } = useContext(PrinterContext);
    const { getFileByID, getTeamsByFileId, createLog, getAssignmentById, getAssignmentsByFileId, getClueById, getCluesByFileId, restartSync } = useContext(RxDBContext)
    const { waitForFirebaseReady } = useFirebase();

    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);
    const { width } = useWindowDimensions();
    const localParams = useLocalSearchParams();

    const styles = pageStyles();
    const textStyle = textStyles();

    const [activeTab, setActiveTab] = useState("");
    const [fileLoaded, setFileLoaded] = useState(0);
    const [readOnly, setReadOnly] = useState(false);
    const [incidentInfo, setIncidentInfo] = useState({});
    const [teams, setTeams] = useState([]);
    const [activeTeams, setActiveTeams] = useState([]);
    const [selectedHeaderItem, setSelectedHeaderItem] = useState(0);
    const [markers, setMarkers] = useState([]);
    const watchedItems = useRef({ clues: [], incidents: [] });

    useEffect(() => {
        getFileByID(localParams.file).then(query => {
            query.$.subscribe(file => {
                if (file && file.type === "cloud") {
                    waitForFirebaseReady().then(() => {
                        if (getAuth().currentUser) {
                            Promise.all([getAsyncStorageData("syncedFiles"), getAsyncStorageData("readyFiles")]).then(([syncedFiles, readyFiles]) => {
                                if (readyFiles && readyFiles.includes(file.id)) {
                                    setIncidentInfo(file);
                                    getAsyncStorageData("lasttab-" + file.id).then((value) => {
                                        if (value) {
                                            setActiveTab(prev => prev !== "" ? prev : value);
                                        } else {
                                            setActiveTab("Overview");
                                        }
                                    });
                                    setFileLoaded(1);
                                } else if (syncedFiles && syncedFiles.includes(file.id)) {
                                    pollUntilFileReady(file.id).then(() => {
                                        setIncidentInfo(file);
                                        getAsyncStorageData("lasttab-" + file.id).then((value) => {
                                            if (value) {
                                                setActiveTab(prev => prev !== "" ? prev : value);
                                            } else {
                                                setActiveTab("Overview");
                                            }
                                        });
                                        setFileLoaded(1);
                                    });
                                } else {
                                    saveAsyncStorageData("syncedFiles", syncedFiles ? [...syncedFiles, file.id] : [file.id]).then(() => {
                                        restartSync();
                                        pollUntilFileReady(file.id).then(() => {
                                            setIncidentInfo(file);
                                            getAsyncStorageData("lasttab-" + file.id).then((value) => {
                                                if (value) {
                                                    setActiveTab(prev => prev !== "" ? prev : value);
                                                } else {
                                                    setActiveTab("Overview");
                                                }
                                            });
                                            setFileLoaded(1);
                                        });
                                    });
                                }
                            });
                        } else {
                            router.navigate("/?error=notauthenticated");
                        }
                    });
                } else if (file && file.type === "local") {
                    setIncidentInfo(file);
                    getAsyncStorageData("lasttab-" + file.id).then((value) => {
                        if (value) {
                            setActiveTab(prev => prev !== "" ? prev : value);
                        } else {
                            setActiveTab("Overview");
                        }
                    });
                    setFileLoaded(1);
                } else {
                    setFileLoaded(-1);
                }
                return () => query.$.unsubscribe();
            });
        });
    }, []);

    useEffect(() => {
        if (fileLoaded === 1) {
            getTeamsByFileId(localParams.file).then(query => {
                query.$.subscribe(teams => {
                    setTeams(teams);
                    setActiveTeams(teams.filter(team => !team.removed));
                });
                return () => query.$.unsubscribe();
            });
        }
    }, [fileLoaded]);

    useEffect(() => {
        handleSetReadOnly(readOnly);

        return () => handleSetReadOnly(false);
    }, [readOnly]);

    useEffect(() => {
        // TODO: only the leader tab should notify the user
        getAssignmentsByFileId(incidentInfo.id).then(query => {
            query.$.subscribe(result => {
                if (watchedItems.current.incidents.length === 0) {
                    // Initial load
                } else {
                    // See if there are any new incidents
                    let newIncidents = result.filter(incident => !watchedItems.current.incidents.some(i => i.id === incident.id));
                    if (newIncidents.length > 0) {
                        // Notify user of new incidents
                        newIncidents.forEach(incident => {
                            if (incident.type === "inc" && Notification.permission === "granted") {
                                new Notification(`New incident`, {
                                    body: `${incident.notes || "No description provided"}`
                                });
                            }
                        });
                    }
                }
                watchedItems.current.incidents = result;
                return () => {
                    query.$.unsubscribe()
                    watchedItems.current.incidents = [];
                };
            });
        });
        getCluesByFileId(incidentInfo.id).then(query => {
            query.$.subscribe(result => {
                if (watchedItems.current.clues.length === 0) {
                    // Initial load
                } else {
                    // See if there are any new incidents
                    let newIncidents = result.filter(incident => !watchedItems.current.clues.some(i => i.id === incident.id));
                    if (newIncidents.length > 0) {
                        // Notify user of new incidents
                        newIncidents.forEach(incident => {
                            if (Notification.permission === "granted") {
                                new Notification(`New clue`, {
                                    body: `${incident.name || ""}${incident.notes || ""}`
                                });
                            }
                        });
                    }
                }
                watchedItems.current.clues = result;
                return () => {
                    query.$.unsubscribe()
                    watchedItems.current.clues = [];
                };
            });
        });
    }, [incidentInfo.id]);

    const notifyFileUpdated = () => {
        if (incidentInfo) incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
    }

    const handleSetActiveTab = (tab) => {
        saveAsyncStorageData("lasttab-" + incidentInfo.id, tab);
        setActiveTab(tab);
    }

    const handleSetReadOnly = (state) => {
        if (state) {
            setSelectedHeaderItem(0);
            setActiveTab("Overview")
        }
    }

    const handleAddMarker = (marker) => {
        // Start listening for changes to the marker
        switch (marker.type) {
            case "Incidents":
                if (marker.id) {
                    getAssignmentById(marker.id).then(query => {
                        marker.subscription = query.$.subscribe(result => {
                            if (result && validateLocationString(result.location, false) !== null) {
                                setMarkers(prev => [...prev, { ...marker, name: result.name, description: result.notes, location: result.location, color: colorTheme.garRedLight }]);
                            } else {
                                setMarkers(prev => prev.filter(item => item.id !== marker.id));
                                marker.subscription.unsubscribe();
                            }
                        });
                    });
                }
                break;
            case "Clues":
                if (marker.id) {
                    getClueById(marker.id).then(query => {
                        marker.subscription = query.$.subscribe(result => {
                            if (result && validateLocationString(result.location, false) !== null) {
                                setMarkers(prev => [...prev, { ...marker, name: result.name, description: result.notes, location: result.location, color: colorTheme.garAmberDark }]);
                            } else {
                                setMarkers(prev => prev.filter(item => item.id !== marker.id));
                                marker.subscription.unsubscribe();
                            }
                        });
                    });
                }
                break;
            default:
                console.log("Unknown marker type");
                break;
        }
    }

    const handleRemoveMarker = (markerID) => {
        const marker = markers.find(item => item.id === markerID);
        if (marker.subscription) {
            marker.subscription.unsubscribe();
        }
        setMarkers(markers.filter(item => item.id !== marker.id));
    }

    const editTeam = (team, fieldToMerge, log = true) => {
        if (team) {
            team.incrementalPatch(fieldToMerge);
            notifyFileUpdated();
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

                createLog(incidentInfo.id, {
                    created: new Date().toISOString(),
                    type: 1, // 1 for Team-related
                    fromTeam: team.id || "",
                    message: changes
                });
                incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
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
            createLog(incidentInfo.id, {
                created: new Date().toISOString(),
                type: 3, // 1 for Team-related
                fromTeam: "",
                message: changes
            });
            incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
        }
    };

    if (fileLoaded === 1) {
        const areTeamsFlagged = activeTeams.filter(item => item.status !== "Inactive").some(item => item.flagged === true);

        const areTeamsError = activeTeams.filter(item => item.status !== "Inactive").some(item => {
            const timeRemaining = item.isRunning
                ? calculateRemainingTime(item.lastStart, item.lastTimeRemaining)
                : item.lastTimeRemaining;
            return item.status !== "Inactive" ? timeRemaining < 0 : false;
        });

        const tabs = [
            {
                name: "Overview",
                icon: "earth",
                content: <AnimatedBG warn={areTeamsFlagged} error={areTeamsError} image={width > 600 ? (activeTeams.length === 0 ? 0.1 : 0.8) : 1}><OverviewTab incidentInfo={incidentInfo} teams={teams} activeTeams={activeTeams} mapShowing={markers && markers.length > 0} /></AnimatedBG>,
            },
            {
                name: "Resources",
                icon: "id-card",
                content: <ResourcesPanel fileId={incidentInfo.id} notifyFileUpdated={notifyFileUpdated} activeTeams={activeTeams} editTeam={editTeam} />,
                rightPanel: <TeamsPanel fileId={incidentInfo.id} notifyFileUpdated={notifyFileUpdated} activeTeams={activeTeams} editTeam={editTeam} infoFunction={teamResourcesInfo} />,
            },
            {
                name: "Tasks",
                icon: "clipboard",
                content: <PlanningPanel fileId={incidentInfo.id} notifyFileUpdated={notifyFileUpdated} activeTeams={activeTeams} markers={markers} addMarker={handleAddMarker} removeMarker={handleRemoveMarker} />,
                rightPanel: <TeamsPanel fileId={incidentInfo.id} notifyFileUpdated={notifyFileUpdated} activeTeams={activeTeams} editTeam={editTeam} infoFunction={teamPlanningInfo} />,
            },
            {
                name: "Clues",
                icon: "telescope",
                content: <CluePanel fileId={incidentInfo.id} notifyFileUpdated={notifyFileUpdated} teams={teams} markers={markers} addMarker={handleAddMarker} removeMarker={handleRemoveMarker} />,
            },
            {
                name: "Comms",
                icon: "chatbubbles",
                content: <AnimatedBG warn={areTeamsFlagged} error={areTeamsError} image={width > 600 ? (activeTeams.filter(team => team.status !== "Inactive").length === 0 ? 0.1 : 0.8) : 1}><CommsPanel incidentInfo={incidentInfo} teams={teams} editTeam={editTeam} activeTeams={activeTeams} addMarker={handleAddMarker} /></AnimatedBG>,
                rightPanel: <LogPanel incidentInfo={incidentInfo} teams={activeTeams} editTeam={editTeam} />,
            },
            // {
            //     name: "Options",
            //     icon: "ellipsis-horizontal",
            //     content: <OptionsTab setReadOnly={setReadOnly} incidentInfo={incidentInfo} />,
            //     bottom: true
            // },
            {
                name: "Close file",
                icon: "exit",
                content: <></>,
                bottom: true,
                function: () => router.navigate("/")
            },
        ];

        return (
            <View style={[styles.background]}>
                <BackHeader
                    minimize={readOnly}
                    customTitle={
                        <View style={[{ height: 55, flexDirection: "row", gap: 8, justifyContent: "space-between", alignItems: "center", alignSelf: "flex-end", paddingRight: 4, paddingLeft: 12, paddingBottom: 5 }, selectedHeaderItem === 1 && { backgroundColor: colorTheme.surfaceContainerHighest, borderTopLeftRadius: 12, borderTopRightRadius: 12, width: 300 }]}>
                            <EditableText onEditing={(state) => { state && setSelectedHeaderItem(1) }} disabled={readOnly} style={[textStyle.headerText]} numberOfLines={1} value={incidentInfo.fileName} defaultValue={"Untitled file"} onChangeText={(text) => editIncident({ fileName: text })} limit={50} suffix={readOnly ? "" : ""} />
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
                                        saveLocation={incidentInfo.type}
                                        selected={selectedHeaderItem === 2}
                                        size={24} />
                                </View>
                            </View>}
                    </View>}
                />
                {width > 600 ?
                    <RailContainer file={incidentInfo} readOnly={readOnly} tabs={tabs} activeTab={activeTab} setActiveTab={handleSetActiveTab} markers={markers} removeMarker={handleRemoveMarker} teams={activeTeams} />
                    :
                    <TabContainer readOnly={readOnly} tabs={tabs} activeTab={activeTab} setActiveTab={handleSetActiveTab} />
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
                            <PrinterTab incidentInfo={incidentInfo} />
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
                name: "Loading",
                icon: "cloud-download",
                content: <View style={{ justifyContent: "center", alignItems: "center", flex: 1, height: "100%" }}>
                    <View style={{ gap: 12, maxWidth: 500, alignItems: "center", backgroundColor: colorTheme.surfaceContainer, padding: 18, borderRadius: 26 }}>
                        <IconFader iconNames={["people", "pizza", "map", "id-card", "chatbubbles", "thunderstorm", "radio", "sparkles", "paw"]} />
                        <Text style={textStyle.cardTitleText}>Getting your file ready</Text>
                        <Text style={[textStyle.text, { textAlign: "center" }]}>If it's the first time you're opening this file it might take a little longer as we get it ready. Next time it'll be lightning fast!</Text>
                    </View>
                </View>
            },
            {
                name: "Cancel",
                icon: "exit",
                content: <></>,
                bottom: true,
                function: () => router.navigate("/")
            }];
        return <View style={styles.background}>
            <BackHeader title="" hideBack={true} />
            {width > 600 ?
                <RailContainer tabs={loadingTab} activeTab={"Loading"} setActiveTab={() => { }} />
                :
                <TabContainer tabs={loadingTab} activeTab={"Loading"} setActiveTab={() => { }} />
            }
        </View >
    }

}

function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }

    return true;
}

const IconFader = ({ iconNames, size = 50, duration = 1000 }) => {
    const { colorTheme } = useContext(ThemeContext);
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useSharedValue(1);

    useEffect(() => {
        if (!iconNames || iconNames.length <= 1) return;

        const intervalId = setInterval(() => {
            // Start fade out
            fadeAnim.value = withTiming(0, { duration: duration / 2 }, () => {
                // Change icon when fully faded out
                setCurrentIndex((prevIndex) => (prevIndex + 1) % iconNames.length);

                // Start fade in with new icon
                fadeAnim.value = withTiming(1, { duration: duration / 2 });
            });
        }, duration);

        return () => clearInterval(intervalId);
    }, [iconNames, duration]);

    if (!iconNames || iconNames.length === 0) {
        return null;
    }

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Ionicons
                name={iconNames[currentIndex]}
                size={size}
                color={colorTheme.primary}
            />
        </Animated.View>
    );
};

const teamResourcesInfo = (teamId) => {
    return <>
        <KeyChild icon="people-outline"><AssignedPeopleText teamId={teamId} /></KeyChild>
        <KeyChild icon="bag-handle-outline"><AssignedEquipmentText teamId={teamId} /></KeyChild>
    </>;
}

const teamPlanningInfo = (teamId, team) => {
    return <>
        <KeyChild icon="arrow-forward-circle-outline"><CurrentAssignmentText team={team} /></KeyChild>
        <KeyChild icon="list-outline"><TaskQueueText team={team} /></KeyChild>
    </>;
}

const KeyChild = ({ icon, children }) => {
    const { colorTheme } = useContext(ThemeContext);
    if (!children) return null;

    return (<View style={{ flexDirection: "row", gap: 2, alignItems: "center", gap: 8 }}>
        <Ionicons name={icon} size={16} color={colorTheme.onSurface} />
        {children}
    </View>
    );
}

const CurrentAssignmentText = ({ team }) => {
    const { getAssignmentById } = useContext(RxDBContext);

    const [assignmentName, setAssignmentName] = useState("");
    const [loaded, setLoaded] = useState(false);

    const textStyle = textStyles();

    // Return a string of people who are assigned to this team, separated by commas
    useEffect(() => {
        let subscription;
        if (team.assignment) {
            getAssignmentById(team.assignment).then(query => {
                subscription = query.$.subscribe(result => {
                    setAssignmentName(result?.name || "-");
                    setLoaded(true);
                });
            });
        } else {
            setAssignmentName("-");
            setLoaded(true);
        }

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [team.assignment, getAssignmentById]);

    return <Text style={textStyle.tertiaryText}>
        {loaded ?
            `Now: ${assignmentName}` || "-"
            :
            "Loading..."
        }
    </Text>
}

const TaskQueueText = ({ team }) => {
    const { getAssignmentById, getAssignmentsByTeamId } = useContext(RxDBContext);

    const [assignmentName, setAssignmentName] = useState("");
    const [allAssignments, setAllAssignments] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const textStyle = textStyles();

    // Return a string of people who are assigned to this team, separated by commas
    useEffect(() => {
        let subscription, subscription2;
        if (team.id) {
            getAssignmentsByTeamId(team.id).then(query => {
                subscription2 = query.$.subscribe(result => {
                    setAllAssignments(result);
                    setLoaded(true);
                });
            });
        }

        if (team.assignment) {
            getAssignmentById(team.assignment).then(query => {
                subscription = query.$.subscribe(result => {
                    setAssignmentName(result?.name || "Unknown");
                    setLoaded(true);
                });
            });
        }

        return () => {
            if (subscription)
                subscription.unsubscribe();
            if (subscription2)
                subscription2.unsubscribe();
        };
    }, [team.id, team.assignment, getAssignmentById, getAssignmentsByTeamId]);

    let assignmentText = "Queued: ";

    const queuedAssignments = allAssignments.filter(assignment => assignment.name !== assignmentName);
    if (queuedAssignments.length > 0) {
        assignmentText += queuedAssignments.map(assignment => {
            return `${assignment.name || "Unnamed task"}`;
        }).join(", ");
    } else {
        assignmentText += "-";
    }

    return <Text style={textStyle.tertiaryText}>
        {loaded ?
            assignmentText || "-"
            :
            "Loading..."
        }
    </Text>
}

const AssignedPeopleText = ({ teamId }) => {
    const { getPeopleByTeamId } = useContext(RxDBContext);

    const [assignedPeople, setAssignedPeople] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const textStyle = textStyles();

    // Return a string of people who are assigned to this team, separated by commas
    useEffect(() => {
        let subscription;
        if (teamId) {
            getPeopleByTeamId(teamId).then(query => {
                subscription = query.$.subscribe(result => {
                    setAssignedPeople(result);
                    setLoaded(true);
                });
            });
        }

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [teamId, getPeopleByTeamId]);

    return <Text style={textStyle.tertiaryText}>
        {loaded ?
            assignedPeople.length === 0 ? "-" :
                assignedPeople.map((person, index) => {
                    if (index === assignedPeople.length - 1) {
                        return person.name;
                    } else {
                        return person.name + ", ";
                    }
                })
            :
            "Loading..."
        }
    </Text>
}

const AssignedEquipmentText = ({ teamId }) => {
    const { getEquipmentByTeamId } = useContext(RxDBContext);

    const [assignedPeople, setAssignedPeople] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const textStyle = textStyles();

    // Return a string of people who are assigned to this team, separated by commas
    useEffect(() => {
        if (teamId) {
            getEquipmentByTeamId(teamId).then(query => {
                query.$.subscribe(result => {
                    setAssignedPeople(result);
                    setLoaded(true);
                });
                return () => { query.$.unsubscribe() };
            });
        }
    }, [teamId]);

    return <Text style={textStyle.tertiaryText}>
        {loaded ?
            assignedPeople.length === 0 ? "-" :
                assignedPeople.map((person, index) => {
                    if (index === assignedPeople.length - 1) {
                        return person.name;
                    } else {
                        return person.name + ", ";
                    }
                })
            :
            "Loading..."
        }
    </Text>
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
            paddingHorizontal: 12,
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