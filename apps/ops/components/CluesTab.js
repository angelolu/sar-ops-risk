import { Ionicons } from '@expo/vector-icons';
import { FilledButton, IconButton, RiskModal, textStyles, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadingTransition } from 'react-native-reanimated';
import { getSimpleDateString } from './helperFunctions';
import { validateLocationString } from './MapPanel';
import { RxDBContext } from './RxDBContext';
import { EditableText, TextBox } from './TextInput';

const ClueCard = ({ item, teams, notifyFileUpdated, markers, removeMarker, addMarker, setChangeStateModalClue }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles();
    const textStyle = textStyles();

    const { getAssignmentById } = useContext(RxDBContext);

    const [assignmentName, setAssignmentName] = useState("");

    useEffect(() => {
        if (item.assignmentId) {
            getAssignmentById(item.assignmentId).then(query => query.exec()).then(assignment => {
                setAssignmentName(assignment.name);
            });
        }
    }, [item.assignment]);

    // Compute the text for the chip based on the teams assigned to the assignment
    let completingTeams = teams.filter(t => t?.assignment === item.id);
    if (completingTeams.length > 0) {
        item.completingTeamNames = completingTeams.map(t => t?.name).join(", ");
    } else if (item.teamId && item.teamId.length > 0) {
        // No teams are currently completing the assignment
        item.completingTeamNames = "";
        let assignedTeams = item.teamId.map(id => teams.find(t => t.id === id));
        item.queuedTeamNames = assignedTeams.map(t => t?.name).join(", ");
    } else {
        item.completingTeamNames = "";
        item.queuedTeamNames = "";
    }

    let isInMarkerArray;

    if (markers && markers.length > 0) {
        isInMarkerArray = markers.find(marker => marker.id === item.id);
    }

    let dateString = getSimpleDateString(item.created);

    return (
        <View key={item.id} style={[styles.card, { backgroundColor: item.flagged ? colorTheme.surfaceContainerHigh : colorTheme.surfaceContainer }]}>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                <View style={{ flexDirection: "column", gap: 2, flex: 1, minWidth: 50 }}>
                    <EditableText
                        style={[textStyle.rowTitleText]}
                        numberOfLines={2} value={item.name}
                        defaultValue={"Unknown item"}
                        onChangeText={(text) => item.incrementalPatch({ name: text }).then(() => notifyFileUpdated())}
                        limit={20} />
                    <Text style={[textStyle.tertiaryText]}>{`Reported by ${teams.find(t => t.id === item.foundByTeamId)?.name || "unknown team"} at ${dateString}${assignmentName ? " in " + assignmentName : ""}`}</Text>
                </View>
                <View style={{ flexDirection: "column", gap: 2, flex: 1, minWidth: 50, alignItems: "flex-end" }}>
                    <View style={{ flexDirection: "row", gap: 2, alignItems: "center" }}>
                        <>{item.location && validateLocationString(item.location, false) !== null && <IconButton small ionicons_name={isInMarkerArray ? "map" : "map-outline"} onPress={() => {
                            if (isInMarkerArray) {
                                removeMarker(item.id);
                            } else {
                                addMarker({
                                    type: "Clues",
                                    id: item.id
                                })
                            }
                        }} />}</>
                        <>{item.state !== "Closed" && <IconButton small ionicons_name={item.flagged ? "flag" : "flag-outline"} onPress={() => {
                            item.incrementalPatch({ flagged: !item.flagged });
                            notifyFileUpdated();
                        }} />}</>
                        <IconButton small ionicons_name={"ellipsis-horizontal-circle-outline"} onPress={() => {
                            setChangeStateModalClue(item);
                        }} />
                    </View>
                    <Text style={[textStyle.tertiaryText]}>{`Clue ${item.id.slice(-5)}`}</Text>
                </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, minWidth: 200 }}>
                <EditableText
                    style={[textStyle.tertiaryText]}
                    numberOfLines={2} value={item.location}
                    defaultValue="No location"
                    onChangeText={(text) => item.incrementalPatch({ location: text }).then(() => notifyFileUpdated())}
                    limit={300} />
            </View>
            <View style={{ flexDirection: "row", gap: 8, minWidth: 200 }}>
                <EditableText
                    style={[textStyle.text]}
                    numberOfLines={4} value={item.notes}
                    defaultValue="No description"
                    onChangeText={(text) => item.incrementalPatch({ notes: text }).then(() => notifyFileUpdated())}
                    limit={1000} />
            </View>
            <View style={{ borderBottomColor: colorTheme.outlineVariant, borderBottomWidth: StyleSheet.hairlineWidth, marginVertical: 2 }} />
            <View style={{ flexDirection: "row", gap: 8, minWidth: 200 }}>
                <EditableText
                    style={[textStyle.text]}
                    numberOfLines={8} value={item.description}
                    defaultValue="No investigation notes"
                    onChangeText={(text) => item.incrementalPatch({ description: text }).then(() => notifyFileUpdated())}
                    limit={2000} />
            </View>
        </View>
    );

}


export const CluePanel = ({ fileId, notifyFileUpdated, teams, incidents = false, addMarker, markers, removeMarker }) => {
    const { getCluesByFileId } = useContext(RxDBContext);

    const styles = pageStyles();
    const textStyle = textStyles();

    const [clues, setClues] = useState([]);
    const [changeStateModalClue, setChangeStateModalClue] = useState(null);

    useEffect(() => {
        getCluesByFileId(fileId).then(query => {
            query.$.subscribe(result => {
                // print out incident name and the teamID from each result
                setClues(result);
                return () => { query.$.unsubscribe() };
            });
        });
    }, []);

    let newClues = [];
    let investigatingClues = [];
    let escalatedClues = [];
    let closedClues = [];

    clues.map(item => {
        switch (item.state) {
            // TODO: change this so flagged are on top, but still sorted by time
            case "New":
                if (item.flagged) {
                    newClues.unshift(item);
                } else {
                    newClues.push(item);
                }
                break;
            case "Investigating":
                if (item.flagged) {
                    investigatingClues.unshift(item);
                } else {
                    investigatingClues.push(item);
                }
                break;
            case "Escalated":
                if (item.flagged) {
                    escalatedClues.unshift(item);
                } else {
                    escalatedClues.push(item);
                }
                break;
            case "Closed":
                if (item.flagged) {
                    closedClues.unshift(item);
                } else {
                    closedClues.push(item);
                }
                break;
            case "Ignored":
                if (item.flagged) {
                    closedClues.unshift(item);
                } else {
                    closedClues.push(item);
                }
                break;
            default:
        }
    })

    return <View style={[styles.mainScroll]}>
        <View style={{ gap: 8, flexDirection: "row", height: "100%" }}>
            <View style={[styles.stateColumn, { flex: newClues.length > 0 ? 2 : 1 }]}>
                <Text style={[textStyle.rowTitleTextBold, { alignSelf: "center", paddingVertical: 4 }]}>New</Text>
                <Animated.FlatList
                    contentContainerStyle={styles.cardContainer}
                    data={newClues}
                    renderItem={({ item }) => <ClueCard item={item} teams={teams} notifyFileUpdated={notifyFileUpdated} markers={markers} addMarker={addMarker} removeMarker={removeMarker} setChangeStateModalClue={setChangeStateModalClue} />}
                    keyExtractor={item => item.id}
                    itemLayoutAnimation={FadingTransition}
                />
            </View>
            <View style={[styles.stateColumn, { flex: investigatingClues.length > 0 ? 2 : 1 }]}>
                <Text style={[textStyle.rowTitleTextBold, { alignSelf: "center", paddingVertical: 4 }]}>Investigating</Text>
                <Animated.FlatList
                    contentContainerStyle={styles.cardContainer}
                    data={investigatingClues}
                    renderItem={({ item }) => <ClueCard item={item} teams={teams} notifyFileUpdated={notifyFileUpdated} markers={markers} addMarker={addMarker} removeMarker={removeMarker} setChangeStateModalClue={setChangeStateModalClue} />}
                    keyExtractor={item => item.id}
                    itemLayoutAnimation={FadingTransition}
                />
            </View>
            <View style={[styles.stateColumn, { flex: escalatedClues.length > 0 ? 2 : 1 }]}>
                <Text style={[textStyle.rowTitleTextBold, { alignSelf: "center", paddingVertical: 4 }]}>Escalated</Text>
                <Animated.FlatList
                    contentContainerStyle={styles.cardContainer}
                    data={escalatedClues}
                    renderItem={({ item }) => <ClueCard item={item} teams={teams} notifyFileUpdated={notifyFileUpdated} markers={markers} addMarker={addMarker} removeMarker={removeMarker} setChangeStateModalClue={setChangeStateModalClue} />}
                    keyExtractor={item => item.id}
                    itemLayoutAnimation={FadingTransition}
                />
            </View>
            <View style={[styles.stateColumn, { flex: closedClues.length > 0 ? 2 : 1 }]}>
                <Text style={[textStyle.rowTitleTextBold, { alignSelf: "center", paddingVertical: 4 }]}>Closed</Text>
                <Animated.FlatList
                    contentContainerStyle={styles.cardContainer}
                    data={closedClues}
                    renderItem={({ item }) => <ClueCard item={item} teams={teams} notifyFileUpdated={notifyFileUpdated} markers={markers} addMarker={addMarker} removeMarker={removeMarker} setChangeStateModalClue={setChangeStateModalClue} />}
                    keyExtractor={item => item.id}
                    itemLayoutAnimation={FadingTransition}
                />
            </View>
        </View>


        <ChangeStateModal
            onClose={() => {
                setChangeStateModalClue(null);
            }}
            isVisible={changeStateModalClue !== null}
            notifyFileUpdated={notifyFileUpdated}
            clue={changeStateModalClue} />
    </View>;
}

const Chip = ({ title, onCancel, color, onPress }) => {
    const { colorTheme } = useContext(ThemeContext);
    const textStyle = textStyles();

    const content = (<>
        <Text style={textStyle.chipText}>{title}</Text>
        {onCancel !== undefined && <Ionicons name="close" size={18} color={colorTheme.onSurface} onPress={onCancel} />}
    </>);
    if (onPress) {
        return <Pressable
            onPress={onPress}
            style={{ flexDirection: "row", gap: 8, height: 28, alignItems: "center", backgroundColor: color || colorTheme.surfaceContainer, paddingHorizontal: 12, borderRadius: 8 }}>
            {content}
        </Pressable>
    } else {
        return <View style={{ flexDirection: "row", gap: 8, height: 28, alignItems: "center", backgroundColor: color || colorTheme.surfaceContainer, paddingHorizontal: 12, borderRadius: 8 }}>
            {content}
        </View>
    }
}

const IconChip = ({ icon, onCancel, color, onPress }) => {
    const { colorTheme } = useContext(ThemeContext);

    const content = (<>
        <Ionicons name={icon} size={18} color={colorTheme.onSurface} />
        {onCancel !== undefined && <Ionicons name="close" size={18} color={colorTheme.onSurface} onPress={onCancel} />}
    </>);
    if (onPress) {
        return <Pressable
            onPress={onPress}
            style={{ flexDirection: "row", gap: 8, height: 28, alignItems: "center", backgroundColor: color || colorTheme.surfaceContainerHighest, paddingHorizontal: 8, borderRadius: 8 }}>
            {content}
        </Pressable>
    } else {
        return <View style={{ flexDirection: "row", gap: 8, height: 28, alignItems: "center", backgroundColor: color || colorTheme.surfaceContainerHighest, paddingHorizontal: 8, borderRadius: 8 }}>
            {content}
        </View>
    }
}

const ChangeStateModal = ({ notifyFileUpdated, isVisible, onClose, clue }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { createCommsQueueMessage, deleteDocument } = useContext(RxDBContext);

    const styles = pageStyles();
    const textStyle = textStyles();
    const { width } = useWindowDimensions();
    const [selectedState, setSelectedState] = useState("");
    const [operatorMessage, setOperatorMessage] = useState("");
    const [deleteClue, setDeleteClue] = useState(false);

    const validState = selectedState !== "" || operatorMessage !== "";

    const handleClose = () => {
        setSelectedState("");
        setOperatorMessage("");
        setDeleteClue(false);
        onClose();
    }

    const handleSave = () => {
        if (validState) {
            if (selectedState !== "") {
                clue.incrementalPatch({
                    state: selectedState,
                    flagged: selectedState === "Closed" ? false : clue.flagged
                });
            }
            if (operatorMessage !== "") {
                createCommsQueueMessage(clue.fileId, {
                    type: 'Clue',
                    toOpsTeam: "comms",
                    toFieldTeamId: clue.foundByTeamId,
                    relatedId: clue.id,
                    message: operatorMessage
                })
            }
            notifyFileUpdated();
            handleClose();
        }
    }

    const handleDeleteClue = () => {
        if (deleteClue) {
            deleteDocument(clue);
            notifyFileUpdated();
            handleClose();
        } else {
            setDeleteClue(true);
        }
    }

    const states = ["New", "Investigating", "Escalated", "Closed"];

    let primaryButtonText = "Save";
    if (selectedState !== "" && operatorMessage !== "") {
        primaryButtonText = "Change state + notify operator";
    } else if (selectedState !== "") {
        primaryButtonText = "Change state";
    } else if (operatorMessage !== "") {
        primaryButtonText = "Notify radio operator";
    }

    return (<RiskModal
        isVisible={isVisible}
        title={"Clue actions"}
        onClose={handleClose}>
        <View style={{ paddingHorizontal: 20, gap: 14 }}>
            <Text style={[textStyle.sectionTitleText]}>Change state</Text>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center' }}>
                {states.map(state => {
                    return <FilledButton small disabled={state === clue?.state} selected={selectedState === state} key={state} text={state} onPress={() => {
                        (selectedState === state) ? setSelectedState("") : setSelectedState(state);
                    }} />
                })}
            </View>
            <Text style={[textStyle.sectionTitleText]}>Radio back</Text>
            <TextBox textStyle={{
                paddingVertical: 8,
                paddingHorizontal: 8,
                backgroundColor: colorTheme.surfaceContainerHigh,
                width: "100%"
            }} placeholder="Questions/instructions for radio operator to pass to find team" onChangeText={setOperatorMessage} initialValue={operatorMessage} onConfirm={() => { handleSave() }} limit={1000} />
        </View>
        <View style={{ padding: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between', alignItems: "flex-end" }}>
                <FilledButton destructive text={deleteClue ? "Tap again to delete clue" : "Delete clue"} onPress={handleDeleteClue} />
                <FilledButton primary text={primaryButtonText} onPress={handleSave} disabled={!validState} />
            </View>
        </View>
    </RiskModal >);
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    return StyleSheet.create({
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
        stateColumn: {
            flex: 1,
            flexDirection: "column",
            paddingTop: 8,
            gap: 8,
            backgroundColor: colorTheme.surfaceContainerLowest,
            borderRadius: 12
        },
        mainScroll: {
            paddingTop: 16,
            paddingBottom: 16,
            paddingRight: 16,
            paddingLeft: 16,
            height: "100%"
        },
        card: {
            borderRadius: 12,
            paddingLeft: 12,
            paddingRight: 12,
            paddingVertical: 12,
            flexDirection: "column",
            gap: 6,
            justifyContent: 'space-between',
        },
        cardContainer: {
            gap: 8,
            paddingHorizontal: 12,
            paddingBottom: 12,
            flexDirection: "column",
            flex: 1,
        },
        picker: {
            height: 34,
            outlineStyle: "solid",
            outlineWidth: 2,
            outlineColor: colorTheme.outline,
            color: colorTheme.onSurface,
            backgroundColor: colorTheme.surfaceContainer,
            width: "100%",
            paddingHorizontal: 8
        },
        wideCard: {
            paddingHorizontal: 8,
            paddingVertical: 8,
            borderRadius: 6,
            backgroundColor: colorTheme.surfaceContainer,
            flexDirection: "column",
        },
        tileCard: {
            borderRadius: 26,
            overflow: 'hidden',
        },
    });
}