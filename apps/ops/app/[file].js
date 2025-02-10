import { BackHeader, IconButton, MaterialCard, textStyles, ThemeContext } from 'calsar-ui';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { CommsPanel, LogPanel } from '../components/CommsTab';
import { InfoTab } from '../components/FileInfoTab';
import { OptionsTab } from '../components/OptionsTab';
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

function format24HourTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

export default function OperationPage() {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const { printText, isPrinterSupported } = useContext(PrinterContext);
    const { getFileByID, getTeamsByFileId, createLog } = useContext(RxDBContext)

    setStatusBarStyle(colorScheme === 'light' ? "dark" : "light", true);
    const { width } = useWindowDimensions();
    const localParams = useLocalSearchParams();

    const styles = pageStyles();
    const textStyle = textStyles();

    const [activeTab, setActiveTab] = useState("Overview");
    const [fileLoaded, setFileLoaded] = useState(0);
    const [readOnly, setReadOnly] = useState(false);
    const [incidentInfo, setIncidentInfo] = useState({});
    const [teams, setTeams] = useState([]);
    const [activeTeams, setActiveTeams] = useState([]);
    const [selectedHeaderItem, setSelectedHeaderItem] = useState(0);

    useEffect(() => {
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
                setTeams(teams);
                setActiveTeams(teams.filter(team => !team.removed));
            });
        });
    }, []);

    const notifyFileUpdated = () => {
        if (incidentInfo) incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
    }

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

    const addLog = async (fieldToAdd) => {
        if (fieldToAdd.type === "2" && fieldToAdd.time && fieldToAdd.fromTeam && fieldToAdd.toTeam && fieldToAdd.message) {
            await printText(`${format24HourTime(new Date(fieldToAdd.created))}, ${parseTeamName(fieldToAdd.fromTeam)} TO ${parseTeamName(fieldToAdd.toTeam)}`);
            await printText(`  ${fieldToAdd.message}`);
        }
        createLog(incidentInfo.id, fieldToAdd);
        notifyFileUpdated();
    };

    if (fileLoaded === 1) {
        const calculateRemainingTime = (lastStart, lastTimeRemaining) => {
            const elapsedTime = lastStart ? (Date.now() - new Date(lastStart)) / 1000 : 0;
            return lastTimeRemaining - Math.floor(elapsedTime);
        }
        const areTeamsFlagged = activeTeams.some(item => item.flagged === true);

        const areTeamsError = activeTeams.some(item => {
            const timeRemaining = item.isRunning
                ? calculateRemainingTime(item.lastStart, item.lastTimeRemaining)
                : item.lastTimeRemaining;
            return item.status !== "Inactive" ? timeRemaining < 0 : false;
        });

        const tabs = [
            {
                name: "Overview",
                icon: "earth",
                content: <AnimatedBG warn={areTeamsFlagged} error={areTeamsError} image={(activeTeams.length === 0 ? 0.1 : 0.8)}><OverviewTab incidentInfo={incidentInfo} teams={teams} activeTeams={activeTeams} /></AnimatedBG>,
            },
            {
                name: "Resources",
                icon: "id-card",
                content: <ResourcesPanel fileId={incidentInfo.id} notifyFileUpdated={notifyFileUpdated} activeTeams={activeTeams} editTeam={editTeam} />,
                rightPanel: <TeamsPanel fileId={incidentInfo.id} notifyFileUpdated={notifyFileUpdated} activeTeams={activeTeams} editTeam={editTeam} />,
            },
            {
                name: "Planning",
                icon: "map",
                content: <PlanningPanel incidentInfo={incidentInfo} activeTeams={activeTeams} editTeam={editTeam} />,
                rightPanel: <TeamsPanel fileId={incidentInfo.id} notifyFileUpdated={notifyFileUpdated} editTeam={editTeam} />,
            },
            {
                name: "Clues",
                icon: "telescope",
                content: <>
                    <><MaterialCard
                        noMargin
                        title="Section under construction"
                        subtitle="Please search for clues in the Comms tab">
                    </MaterialCard></>
                </>,
            },
            {
                name: "Comms",
                icon: "chatbubbles",
                content: <AnimatedBG warn={areTeamsFlagged} error={areTeamsError} image={(activeTeams.length === 0 ? 0.1 : 0.8)}><CommsPanel incidentInfo={incidentInfo} teams={teams} addLog={addLog} editTeam={editTeam} activeTeams={activeTeams} /></AnimatedBG>,
                rightPanel: <LogPanel incidentInfo={incidentInfo} teams={activeTeams} editTeam={editTeam} />,
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
                                        color={selectedHeaderItem === 2 ? colorTheme.onSurface : colorTheme.onPrimaryContainer}
                                        selected={selectedHeaderItem === 2}
                                        size={24} />
                                </View>
                            </View>}
                    </View>}
                />
                {width > 600 ?
                    <RailContainer readOnly={readOnly} tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
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

function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }

    return true;
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