import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilledButton, IconButton, RiskModal, textStyles, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { RxDBContext } from './RxDBContext';
import { EditableText } from './TextInput';

const TIMEOUT_DEFAULT = 3600;

export const TimerComponent = ({ incidentInfo, team, teams, addLog = () => { }, showLogTrafficModal, expanded, readOnly = false }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { getLastRadioLog } = useContext(RxDBContext)
    const styles = pageStyles();
    const textStyle = textStyles();
    const [time, setTime] = useState(team.lastTimeRemaining);
    const intervalRef = useRef(null);
    const { width } = useWindowDimensions();
    const [deleteModalShowing, setDeleteModalShowing] = useState(false);
    const [timeoutDefault, setTimeoutDefault] = useState(TIMEOUT_DEFAULT);
    const [lastLog, setLastLog] = useState(null);
    const lastStartRef = useRef(team.lastStart);
    const lastTimeRemainingRef = useRef(team.lastTimeRemaining);

    const getData = async (key) => {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            // error reading value
        }
    };

    const editTeam = (fieldToMerge, log = true) => {
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

    const handleResetTimeout = () => {
        if (team.isRunning === true) {
            team.incrementalPatch({ lastStart: new Date().toISOString(), lastTimeRemaining: timeoutDefault, isRunning: true });
        } else {
            team.incrementalPatch({ lastStart: undefined, lastTimeRemaining: timeoutDefault, isRunning: false });
        }

        incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
    }

    const removeTeam = () => {
        team.incrementalPatch({ removed: true });
        incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
        addLog({
            created: new Date().toISOString(),
            type: 1, // 1 for Team-related
            fromTeam: team.id || "",
            message: "Removed team"
        });
    };

    const setIsRuning = (state) => {
        if (team.isRunning !== state) {
            if (state) {
                // Start timer
                team.incrementalPatch({ lastStart: new Date().toISOString(), isRunning: true });
            } else {
                // Stop timer by recording the amount of time left
                team.incrementalPatch({ lastTimeRemaining: calculateRemainingTime(team.lastStart, team.lastTimeRemaining), isRunning: false });
            }
            incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
        }
    };

    const handleToggleFlag = () => {
        team.incrementalPatch({ flagged: !team.flagged });
        incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
    }

    useEffect(() => {
        getData("timeout-seconds").then((value) => { value && setTimeoutDefault(value) });
        getLastRadioLog(incidentInfo.id, team.id).then(query => {
            query.$.subscribe(log => {
                setLastLog(log)
            });
            return () => { query.$.unsubscribe() };
        });
    }, []);

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
            return incidentInfo.commsCallsign || "OPERATOR"
        } else {
            const foundObject = teams.find(obj => obj.id === teamNameToParse);
            return foundObject ? foundObject.name || "Unnamed" : "Unknown";
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
                return `${hours} hr${hours === 1 ? "" : "s"} ${remainingMinutes} min${remainingMinutes === 1 ? "" : "s"} ago`;
            } else {
                return ">10 hrs ago";
            }
        } else {
            return "an unknown time ago";
        }
    }

    const formatTime = (seconds) => {
        if (seconds <= -36000) return ">-10 hrs"
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
            <View style={[styles.wideCard, { backgroundColor: team.editing ? colorTheme.tertiaryContainer : (team.status === "Not in service" || team.status === "Inactive") ? colorTheme.surfaceContainerLowest : error ? colorTheme.errorContainer : team.flagged ? colorTheme.secondaryContainer : colorTheme.surfaceContainer, flexGrow: width >= 1080 ? 0 : 1, width: (readOnly && ((width - 10 - 20) / 2) - 10 >= 515) ? ((width - 10 - 20 - 90) / 2) - 10 : "100%" }]}>
                <View style={{
                    flexDirection: "row",
                    gap: 12,
                    flexWrap: "wrap",
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                }}>
                    <SectionContainer width={readOnly ? 60 : 80} maxWidth={150}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", height: "100%" }}>
                            <View style={{ justifyContent: "center", flex: 1 }}>
                                <EditableText disabled={readOnly} style={textStyle.columnValueTextMain} numberOfLines={1} value={team.name} defaultValue="-" onChangeText={(text) => editTeam({ name: text })} limit={10} />
                                <Text style={textStyle.secondaryText} numberOfLines={1}>{team.type || "No type"}</Text>
                            </View>
                            {!readOnly && team.type === "Ad-hoc" && <IconButton small ionicons_name="person-remove" text="Delete" onPress={() => setDeleteModalShowing(true)} />}
                        </View>
                    </SectionContainer>
                    <SectionContainer width={72} maxWidth={100}>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={[textStyle.columnKeyText]} numberOfLines={1} >Assignment</Text>
                            {!readOnly && <IconButton small ionicons_name="" onPress={() => { }} />}
                        </View>
                        <EditableText disabled={readOnly} style={textStyle.columnValueText} numberOfLines={1} value={team.assignment} defaultValue={"-"} onChangeText={(text) => editTeam({ assignment: text })} limit={25} />
                    </SectionContainer>
                    <SectionContainer width={readOnly ? 205 : 185}>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={[textStyle.columnKeyText]} numberOfLines={1} >Status</Text>
                            {!readOnly && <IconButton small ionicons_name="" onPress={() => { }} />}
                        </View>
                        <EditableText disabled={readOnly} style={textStyle.columnValueText} numberOfLines={1} value={team.status} defaultValue={"-"} onChangeText={(text) => editTeam({ status: text })} limit={25} />
                    </SectionContainer>
                    <SectionContainer noDivider={readOnly} width={110}>
                        <View style={[styles.sectionTitleContainer, { gap: 4 }]}>
                            <Text style={[textStyle.columnKeyText]} numberOfLines={1} >Contact timeout</Text>
                            {!readOnly && <View style={{ flexDirection: "row", gap: 0 }}>
                                <IconButton small tonal={!team.isRunning} ionicons_name={team.isRunning ? "pause" : "play"} onPress={() => setIsRuning(!team.isRunning)} />
                                <IconButton small ionicons_name="refresh" onPress={handleResetTimeout} />
                            </View>}
                        </View>
                        <Text style={textStyle.columnValueText}>{team.status === "Inactive" ? "-" : formatTime(time)}</Text>
                    </SectionContainer>
                    {!readOnly && false && showLogTrafficModal &&
                        <SectionContainer style={{ flexGrow: 0 }} justifyContent="center" noDivider width={32}>
                            <View style={{ flexDirection: "column", gap: 2 }}>
                                <IconButton small tonal={true} ionicons_name="create" onPress={() => showLogTrafficModal()} />
                                <IconButton small ionicons_name="flag" onPress={handleToggleFlag} tonal={team.flagged} />
                            </View>
                        </SectionContainer>}
                    {!readOnly && showLogTrafficModal &&
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
                {(expanded || readOnly) &&
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
                            {lastLog && <Text style={[textStyle.tertiaryText, { fontWeight: '500', flexShrink: 0 }]} numberOfLines={1}>{lastLog.fromTeam === team.id ? `To ${parseTeamName(lastLog.toTeam)}` : lastLog ? `${parseTeamName(lastLog.fromTeam)} to ${parseTeamName(lastLog.toTeam)}` : ""}</Text>}
                            <Text style={[textStyle.tertiaryText]} numberOfLines={1}>{lastLog ? `${lastLog.message}` : "No previous traffic found"}</Text>
                        </View>
                        <Text style={[textStyle.tertiaryText, { fontStyle: 'italic', flexShrink: 0 }]} numberOfLines={1}>{lastLog ? `${calculateElapsedTime(lastLog.created)}` : ""}</Text>
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
                            <EditableText disabled={readOnly} style={textStyle.columnValueText} numberOfLines={1} value={team.name} defaultValue={readOnly ? "-" : "Tap to set"} suffix={"(" + team.type + ")"} onChangeText={(text) => editTeam({ name: text })} limit={10} />
                        </View>
                    </> : <>
                        <EditableText disabled={readOnly} style={textStyle.columnValueText} numberOfLines={1} value={team.name} defaultValue={readOnly ? "-" : "Tap to set"} onChangeText={(text) => editTeam({ name: text })} limit={10} />
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
                    <EditableText disabled={readOnly} style={textStyle.columnValueText} numberOfLines={1} value={team.assignment} defaultValue={readOnly ? "-" : "Tap to set"} onChangeText={(text) => editTeam({ assignment: text })} limit={25} />
                </SectionContainer>
                <SectionContainer style={{ flexBasis: 0, gap: 2 }}>
                    <View style={styles.sectionTitleContainer}>
                        <Text style={[styles.text]}>Status</Text>
                    </View>
                    <EditableText disabled={readOnly} style={textStyle.columnValueText} numberOfLines={1} value={team.status} defaultValue={readOnly ? "-" : "Tap to set"} onChangeText={(text) => editTeam({ status: text })} limit={25} />
                </SectionContainer>
            </View>
            <SectionContainer>
                <View style={styles.sectionTitleContainer}>
                    <View style={{ gap: 2 }}>
                        <Text style={[styles.text]}>Timeout</Text>
                        <Text style={textStyle.columnValueText}>{formatTime(time)}</Text>
                    </View>
                    {!readOnly && <View style={{ flexDirection: "row", gap: 4 }}>
                        <IconButton small tonal={!team.isRunning} ionicons_name={team.isRunning ? "pause" : "play"} onPress={() => setIsRuning(!team.isRunning)} />
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
        <View style={[styles.sectionContainer, !noDivider && false && (useWindowDimensions().width > 600) && styles.sectionContainerDivider, maxWidthOverride, widthOverride, justifyContentOverride, width < 1080 && { flexGrow: 1 }, style]}>
            {children}
        </View>
    );
}

const calculateRemainingTime = (lastStart, lastTimeRemaining) => {
    const elapsedTime = lastStart ? (Date.now() - new Date(lastStart)) / 1000 : 0;
    return lastTimeRemaining - Math.floor(elapsedTime);
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
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
        sectionContainer: {
            flexGrow: 1,
            flexDirection: 'column',
            gap: 4
        },
        sectionContainerDivider: {
            paddingRight: 10,
            borderRightColor: colorTheme.outlineVariant,
            borderRightWidth: StyleSheet.hairlineWidth,
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