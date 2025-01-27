import { Ionicons } from '@expo/vector-icons';
import { Banner, FilledButton, IconButton, RiskModal, SegmentedButtons, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { EditableText, TextBox } from '../components/TextInput';
import { PrinterContext } from './PrinterContext';
import { RxDBContext } from './RxDBContext';

export const OverviewTab = ({ incidentInfo, teams, removeTeam, setIsRuning, setAllIsRunning, handleAddTeam, handleResetTimeout, handleToggleFlag, editTeam, addLog, readOnly }) => {
    const styles = pageStyles();
    const { width, height } = useWindowDimensions();
    const { colorTheme } = useContext(ThemeContext);
    const { isPrinterSupported,
        connectPrinter,
        disconnectPrinter,
        isPrinterConnected,
        feedLines,
        printText,
        cutPaper,
        setBold,
        setNormal,
        setRightAlign,
        setCenterAlign,
        setLeftAlign } = useContext(PrinterContext);

    const printClueStub = async (description, location, team, date, assignment) => {
        //await printFooter();
        await setBold();
        await setCenterAlign();
        await printText("OPERATION MANAGEMENT TOOL");
        await printText("Clue Stub");
        await setLeftAlign();
        await setNormal();
        await feedLines(1);
        await printText(`TASK NAME: ${incidentInfo.incidentName || ""}`);
        await printText(`TASK # ${incidentInfo.incidentNumber || ""}`);
        await printText(`OP. PERIOD: ${incidentInfo.opPeriod || ""}`);
        await feedLines(1);
        await printText(`CLUE DESCRIPTION: ${description || ""}`);
        await printText(`FOUND BY: ${team || ""}`);
        await printText(`DATE & TIME FOUND: ${date || ""}`);
        await printText(`ASSIGNMENT: ${assignment || "None"}`);
        await printText(`LOCATION FOUND: ${location || "Not given"}`);
        await feedLines(2);
        await cutPaper();
        //printHeader();
    }

    const [logTrafficTeam, setLogTrafficTeam] = useState();
    const [expanded, setExpanded] = useState(false);

    const areTimersRunning = teams.some(item => item.isRunning === true);

    const textSearch = (text, filter) => {
        if (text && filter) {
            return (new RegExp(filter, 'i')).test(text)
        }
        return false;
    }

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
                            title={"Teams will appear here. Create one in the \"Resources\" tab or create an ad-hoc team using the button above"} />
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
                {teams.map(item => {
                    if (item.removed !== true) {
                        return <TimerComponent
                            incidentInfo={incidentInfo}
                            readOnly={readOnly}
                            expanded={expanded}
                            team={item}
                            teams={teams}
                            key={item.id}
                            handleResetTimeout={() => handleResetTimeout(item)}
                            handleStartStop={() => setIsRuning(item, !item.isRunning)}
                            removeTeam={() => removeTeam(item)}
                            handleToggleFlag={() => handleToggleFlag(item)}
                            editTeam={(obj, log) => editTeam(item, obj, log)}
                            showLogTrafficModal={() => {
                                setLogTrafficTeam(item);
                                editTeam(item, { editing: true }, false);
                            }}
                            addLog={addLog}
                        />
                    } /*else {
                        return (
                            <View key={item.id} style={[styles.wideCard, { backgroundColor: colorTheme.surfaceContainerLowest, flexGrow: width >= 1080 ? 0 : 1, width: (readOnly && ((width - 10 - 20) / 2) - 10 >= 515) ? ((width - 10 - 20) / 2) - 10 : "100%" }]}>
                                <View style={{
                                    flexDirection: "row",
                                    gap: 12,
                                    flexWrap: "wrap",
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 16,
                                    paddingVertical: 16,
                                }}>
                                    <Text style={styles.text}>Deleted: {item.name || "Unnamed team"}</Text>
                                </View>
                            </View>
                        );
                    }*/
                })}
            </View>
            <LogTrafficComponent
                isPrinterConnected={isPrinterConnected}
                handlePrintClueStub={printClueStub}
                onClose={() => {
                    editTeam(logTrafficTeam, { editing: false }, false);
                    setLogTrafficTeam(undefined);
                }}
                team={logTrafficTeam}
                teams={teams}
                incidentInfo={incidentInfo}
                addLog={addLog}
                updateStatus={(text) => editTeam(logTrafficTeam, { status: text }, false)}
                updateAssignment={(newAssignment) => editTeam(logTrafficTeam, { assignment: newAssignment }, false)}
                setFlag={(state) => editTeam(logTrafficTeam, { flagged: state }, false)}
                resetTimeout={() => handleResetTimeout(logTrafficTeam)} />
        </View>
    );
}

const LogTrafficComponent = ({ teams, team, incidentInfo, onClose, addLog, updateStatus, updateAssignment, setFlag, resetTimeout, isPrinterConnected = false, handlePrintClueStub }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles();
    const [messageType, setMessageType] = useState(0);
    const [messageSubType, setMessageSubType] = useState(0);
    const [fromField, setFromField] = useState(0);
    const [toField, setToField] = useState(0);
    const [toTeam, setToTeam] = useState(undefined);
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
            setToTeam(undefined);
        } else {
            // Exit select mode
            setSelectMode(false);
            setToTeam(undefined);
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
                message: `Searching assignment ${team?.assignment || ""}`,
                status: "Searching",
            },
            "On break": {
                message: "On break",
                status: "On break",
            },
            "Completed": {
                message: `Completed assignment ${team?.assignment || ""}`,
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
                created: new Date().toISOString(),
                type: 2, // 2 for radio logs
                fromTeam: fromField === 0 ? team?.id || "" : "!@#$", // !@#$ will be converted to the operator call sign
                toTeam: toField === 0 ? (fromField === 0 ? "!@#$" : team?.id || "") : toTeam.id,
                message: note
            });
            resetTimeout();
            handleClose();
        }
    }

    let toItems = [fromField === 0 ? incidentInfo.commsCallsign || "You" : team?.name ? team?.name : "This team"];
    if (fromField === 0) toItems.push(toTeam?.name || "Other"); // Only allow recipient selection if the sender is the current team
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
                    <SegmentedButtons small={width <= 600} grow items={[team?.name ? team?.name : "This team", incidentInfo.commsCallsign || "You"]} selected={fromField} onPress={(value) => {
                        setFromField(value);
                        setMessageType(0);
                        setMessageSubType(0);
                        setToField(0);
                        setToTeam(undefined);
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
                            if (t.name && t.id != team?.id && t.removed !== true) {
                                return <FilledButton small key={t?.id} text={t.name} onPress={() => {
                                    setToTeam(t);
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
                            {isPrinterConnected && currentMessageCategories[messageType - 1] === "Clue" && <FilledButton disabled={customTextBoxText === ""} text={"Print stub"} onPress={() => { handlePrintClueStub(customTextBoxText, clueLocationTextBoxText, team?.name || "Unnamed team", new Date(), team.assignment) }} />}
                            <FilledButton primary text={"Save log"} onPress={() => { handleLogMessage() }} />
                        </View>
                    </View>
                </>}
        </View>
    </RiskModal>);
}

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

const TimerComponent = ({ incidentInfo, team, teams, handleResetTimeout, handleStartStop, removeTeam, handleToggleFlag, editTeam, showLogTrafficModal, expanded, readOnly }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { getLastRadioLog } = useContext(RxDBContext)
    const styles = pageStyles();
    const [time, setTime] = useState(team.lastTimeRemaining);
    const intervalRef = useRef(null);
    const { width } = useWindowDimensions();
    const [deleteModalShowing, setDeleteModalShowing] = useState(false);
    const [lastLog, setLastLog] = useState(null);
    const lastStartRef = useRef(team.lastStart);
    const lastTimeRemainingRef = useRef(team.lastTimeRemaining);


    useEffect(() => {
        getLastRadioLog(incidentInfo.id, team.id).then(query => {
            query.$.subscribe(log => {
                setLastLog(log)
            });
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
                            <Text style={[styles.text, { fontStyle: 'italic', flexShrink: 0, color: colorTheme.onSurfaceVariant }]} numberOfLines={1}>{lastLog ? `${parseTeamName(lastLog.fromTeam)} to ${parseTeamName(lastLog.toTeam)}` : ""}</Text>
                            <Text style={[styles.text, { color: colorTheme.onSurfaceVariant }]} numberOfLines={1}>{lastLog ? `${lastLog.message}` : "No previous traffic found"}</Text>
                        </View>
                        <Text style={[styles.text, { fontStyle: 'italic', flexShrink: 0, color: colorTheme.onSurfaceVariant }]} numberOfLines={1}>{lastLog ? `${calculateElapsedTime(lastLog.created)}` : ""}</Text>
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