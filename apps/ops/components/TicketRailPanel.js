import { FilledButton, IconButton, RiskModal, textStyles, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadingTransition } from 'react-native-reanimated';
import { getElapsedTimeString, getSimpleDateString, resetTeamTimeout } from './helperFunctions';
import { RxDBContext } from './RxDBContext';
import { TextBox } from './TextInput';

const TAB_TO_TEAM_MAP = {
    "Overview": "any team",
    "Resources": "operations",
    "Tasks": "plans",
    "Clues": "investigations",
    "Comms": "communications"
}

const OPS_TEAM_TO_NAME = {
    "ops": "Operations",
    "planning": "Plans",
    "investigations": "Investigations",
    "comms": "Communications"
}

export const TicketRailPanel = ({ file, teams, activeTab, filteredCommsQueue }) => {
    const styles = pageStyles();
    const textStyle = textStyles();

    const [replyItem, setReplyItem] = useState(null);

    if (!filteredCommsQueue || filteredCommsQueue.length === 0)
        return <View style={{ flex: 1, justifyContent: "center", alignItems: "center", height: "100%" }}>
            <Text style={textStyle.secondaryText}>No pending requests. Requests sent by or for {TAB_TO_TEAM_MAP[activeTab]} will appear here.</Text>
        </View>;

    return <>
        <Animated.FlatList
            horizontal
            style={{ height: "100%" }}
            contentContainerStyle={styles.cardContainer}
            data={filteredCommsQueue}
            renderItem={({ item }) => <CommsQueueItemCard setReplyItem={setReplyItem} item={item.doc} teams={teams} file={file} activeTab={activeTab} superseded={item.superseded} />}
            keyExtractor={item => item.doc.id}
            itemLayoutAnimation={FadingTransition}
        />
        <ReplyModal
            request={replyItem?.request}
            team={replyItem?.team}
            file={file}
            relatedItem={replyItem?.relatedItem}
            isVisible={replyItem !== null}
            notifyFileUpdated={() => { }}
            onClose={() => setReplyItem(null)} />
    </>;
};

const CommsQueueItemCard = ({ file, item, teams, activeTab, superseded, setReplyItem }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { getAssignmentById, createLog, getClueById } = useContext(RxDBContext);

    const intervalRef = useRef(null);

    const styles = pageStyles();
    const textStyle = textStyles();

    const [descriptionText, setDescriptionText] = useState("Loading...");
    const [elapsedTime, setElapsedTime] = useState("-");
    const [team, setTeam] = useState();
    const [waitingTimeMs, setWaitingTimeMs] = useState(0); // Waiting time tracks how long a request has sat since the request time, or the acknowledge time
    const [relatedItem, setRelatedItem] = useState();

    useEffect(() => {
        updateTime(item);
        intervalRef.current = setInterval(() => {
            updateTime(item);
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [item]);

    useEffect(() => {
        let subscription;
        let toTeam;
        if (item.toFieldTeamId) {
            toTeam = teams.find(team => team.id === item.toFieldTeamId);
        } else if (item.fromId) {
            toTeam = teams.find(team => team.id === item.fromId);
        }
        setTeam(toTeam);

        switch (item.type) {
            case 'General':
                setDescriptionText(item.message || "No message");
                break;
            case 'Resource':
                setDescriptionText(`${toTeam?.name}: Requesting ${item.message || "unknown resource"}`);
                break;
            case 'Task':
                if (toTeam && item.relatedId !== "") {
                    if (item.subtype === "Assign") {
                        getAssignmentById(item.relatedId).then(query => {
                            subscription = query.$.subscribe(result => {
                                if (result) {
                                    setDescriptionText(`Assign ${toTeam.name || "unnamed team"} to ${result?.name || "unnamed task"}`);
                                    setRelatedItem(result);
                                } else {
                                    // Assume the task was deleted and close the request
                                    setDescriptionText(`Assign ${toTeam.name || "unnamed team"} to deleted task`);
                                    item.incrementalPatch({
                                        response: "Task deleted",
                                        closed: true
                                    });
                                    file.incrementalPatch({ updated: new Date().toISOString() });
                                }
                            });
                        });
                    }
                } else {
                    setDescriptionText("Team not found");
                }
                break;
            case 'Clue':
                if (toTeam) {
                    getClueById(item.relatedId).then(query => {
                        subscription = query.$.subscribe(result => {
                            setDescriptionText(`Ask ${toTeam.name | "Unnamed team"}: ${item.message || "No message"}`);
                            if (result) {
                                setRelatedItem(result);
                            } else {
                                // Assume the clue was deleted and close the request
                                item.incrementalPatch({
                                    response: "Request cancelled",
                                    closed: true
                                });
                                file.incrementalPatch({ updated: new Date().toISOString() });
                            }
                        });
                    });
                }
                break;
        }

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [item, teams]);

    const updateTime = (item) => {
        const date = new Date(item.acknowledgedTime ? item.acknowledgedTime : item.created);
        const now = new Date();
        const diffInMs = now - date;

        setElapsedTime(getElapsedTimeString(item.created));
        setWaitingTimeMs(diffInMs);
    }

    const handleAcknowledge = () => {
        item.incrementalPatch({ acknowledgedTime: new Date().toISOString() });
    }

    const handleCancel = () => {
        item.incrementalPatch({
            response: "Request cancelled",
            closed: true
        });
        file.incrementalPatch({ updated: new Date().toISOString() });
    }

    const handleComplete = () => {
        let note;
        switch (item.type) {
            case 'Resource':
                if (item.toOpsTeam === "comms") {
                    file.incrementalPatch({ updated: new Date().toISOString() });
                    item.incrementalPatch({ closed: true });
                } else if (item.toOpsTeam === "ops") {
                    setReplyItem({
                        request: item,
                        team: team,
                        relatedItem: null
                    });
                }
                break;
            case 'Task':
                if (item.subtype === "Assign") {
                    team.incrementalPatch({ assignment: item.relatedId });
                    // TODO: remove other teams from queue?
                    note = descriptionText;
                }
                break;
            case 'Clue':
                setReplyItem({
                    request: item,
                    team: team,
                    relatedItem: relatedItem
                });
                break;
        }
        if (note) {
            createLog(file.id, {
                created: new Date().toISOString(),
                type: 2, // 2 for radio logs
                fromTeam: "!@#$", // !@#$ will be converted to the operator call sign
                toTeam: item.toFieldTeamId,
                message: note
            });
            file.incrementalPatch({ updated: new Date().toISOString() });
            if (team) resetTeamTimeout(team);
            item.incrementalPatch({ closed: true });
        }
    }

    let showActions = false;
    let waitingText;
    if (item.acknowledgedTime) {
        waitingText = "Request acknowledged";
    } else {
        waitingText = "Waiting for " + item.toOpsTeam;
    }

    switch (activeTab) {
        case "Resources":
            if (item.toOpsTeam === "ops") {
                showActions = true;
                if (item.acknowledgedTime) {
                    waitingText = "Please reply with plan";
                } else {
                    waitingText = "Please acknowledge";
                }
            }
            break;
        case "Tasks":
            if (item.toOpsTeam === "planning") {
                showActions = true;
                waitingText = "Please acknowledge";
            }
            break;
        case "Clues":
            if (item.toOpsTeam === "investigations") {
                showActions = true;
                waitingText = "Please acknowledge";
            }
            break;
        case "Comms":
            if (item.type === "Resource") {
                if (item.toOpsTeam === "comms") {
                    showActions = true;
                    if (item.acknowledgedTime) {
                        waitingText = `Complete request: ${item.response}`;
                    } else {
                        waitingText = `Ops: ${item.response}`;
                    }
                }
            } else if (item.type === "Task") {
                if (item.toOpsTeam === "comms") {
                    showActions = true;
                    if (item.acknowledgedTime) {
                        waitingText = "Contact team and tap to update";
                    } else {
                        waitingText = "Please acknowledge";
                    }
                }
            } else if (item.type === "Clue") {
                if (item.toOpsTeam === "comms") {
                    showActions = true;
                    if (item.acknowledgedTime) {
                        waitingText = "Please contact team";
                    } else {
                        waitingText = "Please acknowledge";
                    }
                }
            }
            break
        default:
            showActions = false;
    }

    return <View style={[styles.card, { backgroundColor: (!item.closed && !superseded && waitingTimeMs > 1000 * 60 * 5) ? colorTheme.errorContainer : (item.closed || superseded) ? colorTheme.surfaceContainerLowest : colorTheme.surfaceContainer }]}>
        <View style={{ flexDirection: "column", gap: 4, justifyContent: "space-evenly", height: "100%", flex: 1 }}>
            <Text style={textStyle.tertiaryText}>{elapsedTime} - {item.type}{item.type === "Clue" && relatedItem?.name ? ` (${relatedItem.name})` : ""}</Text>
            <Text style={item.closed ? textStyle.secondaryText : textStyle.text}>{descriptionText}</Text>
            <Text style={textStyle.tertiaryText}>{item.closed ? item.response ? item.response === "Request cancelled" ? item.response : `Complete: ${item.response}` : "Request complete" : superseded ? "Request superseded" : waitingText}</Text>
        </View>
        {(!item.closed && !superseded) && <View style={{ flexDirection: "column", gap: 4, alignItems: "center" }}>
            {showActions ? <>
                <>{!item.acknowledgedTime && <IconButton small tonal ionicons_name="mail-open-outline" onPress={handleAcknowledge} />}</>
                <>{item.acknowledgedTime && <IconButton small tonal ionicons_name={((item.type === "Task" && item.subtype === "Assign") || (item.type === "Resource" && item.toOpsTeam === "comms")) ? "checkmark-done-outline" : "chatbox-ellipses-outline"} onPress={handleComplete} />}</>
            </> :
                <IconButton small ionicons_name="trash-outline" onPress={handleCancel} />
            }
        </View>}
    </View>;
}

const ReplyModal = ({ request, team, relatedItem, file, isVisible, onClose }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { createLog } = useContext(RxDBContext);
    const textStyle = textStyles();
    const { width } = useWindowDimensions();
    const [responseMessage, setResponseMessage] = useState("");

    const handleClose = () => {
        setResponseMessage("");
        onClose();
    }

    const handleSave = (requestDescription) => {
        if (request?.type === "Resource") {
            request.incrementalPatch({
                toOpsTeam: "comms",
                acknowledgedTime: "",
                response: responseMessage || "No reply given",
            });
        } else {
            request.incrementalPatch({
                response: responseMessage || "No reply given",
                closed: true
            });
            createLog(file.id, {
                created: new Date().toISOString(),
                type: 2, // 2 for radio logs
                fromTeam: "!@#$", // !@#$ will be converted to the operator call sign
                toTeam: team.id,
                message: requestDescription + (responseMessage || "")
            });
            if (team) resetTeamTimeout(team);
        }

        file.incrementalPatch({ updated: new Date().toISOString() });
        handleClose();
    }

    const handleCancel = () => {
        request.incrementalPatch({
            response: "Request cancelled",
            closed: true
        });
        file.incrementalPatch({ updated: new Date().toISOString() });
        handleClose();
    }

    // Infer the team that sent the request and the team that should receive the reply
    let replyTeam;
    switch (request?.toOpsTeam) {
        case "comms":
            switch (request?.type) {
                case "Resources":
                    replyTeam = "ops";
                    break;
                case "Task":
                    replyTeam = "planning";
                    break;
                case "Clue":
                    replyTeam = "investigations";
                    break;
            }
            break;
        default:
            replyTeam = "comms";
    }

    let requestHeading;
    let requestDescription;
    let requestShortDescription;
    let messageResponse = false;
    let resourceResponse = false;
    switch (request?.type) {
        case "Resource":
            requestHeading = `${OPS_TEAM_TO_NAME[replyTeam]} requesting action from ${OPS_TEAM_TO_NAME[request?.toOpsTeam]}`;
            requestDescription = `${team?.name} is requesting ${request.message}`;
            requestShortDescription = `RE request for ${request.message}. `;
            resourceResponse = true;
            break;
        case "Task":
            requestDescription = relatedItem?.name;
            break;
        case "Clue":
            requestHeading = `${OPS_TEAM_TO_NAME[replyTeam]} requesting action from ${OPS_TEAM_TO_NAME[request?.toOpsTeam]}`;
            requestDescription = `Regarding ${request?.type} "${relatedItem?.name}" found at ${getSimpleDateString(relatedItem.created)}, tell ${team?.name}: "${request.message}"`;
            requestShortDescription = `RE ${request?.type} "${relatedItem?.name}", ${request.message}. `;
            messageResponse = true;
            break;
    }

    return (<RiskModal
        overrideWidth={700}
        isVisible={isVisible}
        title={"Request details"}
        onClose={handleClose}>
        <View style={{ paddingHorizontal: 20, gap: 8 }}>
            <Text style={textStyle.sectionTitleText}>Request</Text>
            <Text style={textStyle.text}>{requestHeading}</Text>
            <Text style={textStyle.text}>{requestDescription}</Text>
            <Text style={textStyle.sectionTitleText}>Reply</Text>
            {messageResponse && <>
                <TextBox textStyle={{
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    backgroundColor: colorTheme.surfaceContainerHigh,
                    width: "100%"
                }}
                    placeholder={"Reply from " + (team?.name || "unnamed team")}
                    onChangeText={setResponseMessage}
                    initialValue={responseMessage}
                    onConfirm={() => { handleSave(requestShortDescription) }}
                    limit={1000}
                    autoFocus={width > 600} />
                <Text style={textStyle.secondaryText}>{`A log will be added and the contact timeout for ${team?.name || "unnamed team"} will be reset`}</Text>
            </>}
            {resourceResponse && <>
                <TextBox textStyle={{
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    backgroundColor: colorTheme.surfaceContainerHigh,
                    width: "100%"
                }}
                    placeholder={"Reply for " + (team?.name || "unnamed team") + " and the operator"}
                    onChangeText={setResponseMessage}
                    initialValue={responseMessage}
                    onConfirm={() => { handleSave(requestShortDescription) }}
                    limit={1000}
                    autoFocus={width > 600} />
                <Text style={textStyle.secondaryText}>{`The radio operator will be asked to tell ${team?.name || "unnamed team"} about your reply`}</Text>
            </>}
        </View>
        <View style={{ padding: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: "space-between", alignItems: "flex-end" }}>
                <FilledButton destructive text={"Cancel request"} onPress={() => { handleCancel() }} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <FilledButton primary text={responseMessage === "" ? "Complete without reply" : "Complete request"} onPress={() => { handleSave(requestShortDescription) }} />
                </View>
            </View>
        </View>
    </RiskModal >);
}

const pageStyles = () => {
    return StyleSheet.create({
        card: {
            borderRadius: 12,
            paddingLeft: 12,
            paddingRight: 12,
            paddingVertical: 12,
            flexDirection: "row",
            gap: 8,
            overflow: "hidden",
            alignItems: "center",
            maxWidth: 300
        },
        cardContainer: {
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row"
        },
    });
}