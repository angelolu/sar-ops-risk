import { Ionicons } from '@expo/vector-icons';
import { Banner, FilledButton, IconButton, RiskModal, SegmentedButtons, textStyles, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadingTransition } from 'react-native-reanimated';
import { validateLocationString } from './MapPanel';
import { RxDBContext } from './RxDBContext';
import SwitcherContainer from './SwitcherContainer';
import { EditableText, TextBox } from './TextInput';

export const PlanningPanel = ({ fileId, notifyFileUpdated, activeTeams, markers, removeMarker, addMarker }) => {
    const [activeTab, setActiveTab] = useState("Assignments");
    const tabs = [
        {
            name: "Assignments",
            icon: "navigate",
            content: <>
                <AssignmentPanel fileId={fileId} notifyFileUpdated={notifyFileUpdated} teams={activeTeams} />
            </>
        },
        {
            name: "Incidents",
            icon: "earth",
            content: <>
                <AssignmentPanel incidents fileId={fileId} notifyFileUpdated={notifyFileUpdated} teams={activeTeams} markers={markers} addMarker={addMarker} removeMarker={removeMarker} />
            </>
        }
    ];

    return <SwitcherContainer tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />;
}

const ListItem = ({ teams, item, notifyFileUpdated, setAssignTeamAssignment, setDeleteAssignment, markers, removeMarker, addMarker, incidents }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles(colorTheme);
    const textStyle = textStyles(colorTheme, width);

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

    return (
        <View style={[styles.card, { flexDirection: "row", gap: 16, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }, { backgroundColor: colorTheme.surfaceContainer }]}>
            <View style={{ flexDirection: "column", gap: 8, maxWidth: 100 }}>
                <EditableText
                    style={[textStyle.rowTitleText]}
                    numberOfLines={2} value={item.name}
                    defaultValue={incidents ? "Unnamed incident" : "Unnamed assignment"}
                    onChangeText={(text) => item.incrementalPatch({ name: text }).then(() => notifyFileUpdated())}
                    limit={20} />
            </View>
            <View style={{ flexDirection: "row", gap: 8, flex: 4, minWidth: 200 }}>
                <EditableText
                    style={[textStyle.secondaryText]}
                    numberOfLines={2} value={item.notes}
                    defaultValue="No description"
                    onChangeText={(text) => item.incrementalPatch({ notes: text }).then(() => notifyFileUpdated())}
                    limit={300} />
            </View>
            {incidents && <View style={{ flexDirection: "row", gap: 8, flex: 2, minWidth: 200, alignItems: "center" }}>
                <EditableText
                    style={[textStyle.secondaryText]}
                    numberOfLines={2} value={item.location}
                    defaultValue="No location"
                    onChangeText={(text) => item.incrementalPatch({ location: text }).then(() => notifyFileUpdated())}
                    limit={300} />
            </View>}
            <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-start", alignItems: "center" }}>
                {item.name ? ((item.teamId && item.teamId.length > 0) || (item.completingTeamNames && item.completingTeamNames.length > 0) ?
                    <Chip
                        title={item.completed ? `Completed` : item.completingTeamNames ? `In progress (${item.completingTeamNames})` : `Queued (${item.queuedTeamNames})`}
                        color={item.completed ? colorTheme.garGreenDark : item.completingTeamNames ? colorTheme.tertiaryContainer : colorTheme.surfaceContainerHighest}
                        onPress={(item.completingTeamNames || item.completed) ? undefined : () => { setAssignTeamAssignment(item) }} />
                    // TODO: add a modal to change an in progress assignment
                    :
                    <Chip title={"Unassigned"} color={colorTheme.secondaryContainer} onPress={() => { setAssignTeamAssignment(item) }} />)
                    :
                    <Chip title={"Task name required"} color={colorTheme.surfaceContainerLowest} />
                }
                <>{(!item.teamId || (item.teamId && item.teamId.length === 0)) && <IconButton small ionicons_name="trash" onPress={() => setDeleteAssignment(item)} />}</>
                <>{item.location && validateLocationString(item.location, false) !== null && <IconButton small ionicons_name={isInMarkerArray ? "map" : "map-outline"} onPress={() => {
                    if (isInMarkerArray) {
                        removeMarker(item.id);
                    } else {
                        addMarker({
                            type: "Incidents",
                            id: item.id
                        })
                    }
                }} />}</>
                <IconButton small ionicons_name={item.flagged ? "flag" : "flag-outline"} onPress={() => {
                    item.incrementalPatch({ flagged: !item.flagged });
                    notifyFileUpdated();
                }} />
            </View>
        </View>
    );
}

const AssignmentPanel = ({ fileId, notifyFileUpdated, teams, incidents = false, addMarker, markers, removeMarker }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { getAssignmentsByFileId, deleteDocument, createAssignment } = useContext(RxDBContext);

    const { width, height } = useWindowDimensions();

    const styles = pageStyles(colorTheme);
    const textStyle = textStyles(colorTheme, width);

    const [assignments, setAssignments] = useState([]);
    const [deleteAssignment, setDeleteAssignment] = useState(null);
    const [assignTeamAssignment, setAssignTeamAssignment] = useState(null);

    useEffect(() => {
        getAssignmentsByFileId(fileId).then(query => {
            query.$.subscribe(result => {
                // print out incident name and the teamID from each result
                setAssignments(result);
                return () => { query.$.unsubscribe() };
            });
        });
    }, []);

    const removeAssignment = () => {
        deleteDocument(deleteAssignment);
        setDeleteAssignment(null);
    };

    let assignmentList = [];
    let priorityAssignmentList = [];

    // TODO: can't unassign an assignment from a team

    assignments.map(item => {
        if (incidents && item.type !== "inc") return;
        if (!incidents && item.type === "inc") return;

        // TODO: be smarter about the use of the teamID array in tasks vs the assignment field in teams. Right now if the team is assigned to a task, the teamID array may still be empty. Maybe make some helper functions to keep it consistent
        // TODO: do not allow assigning unnamed tasks to teams

        if (item.flagged) {
            priorityAssignmentList.push(item);
        } else {
            assignmentList.push(item);
        }
    })

    return <View style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap", alignSelf: "flex-end" }}>
            <FilledButton small={width <= 600 || height < 500} primary icon="add" text={incidents ? "Incident" : "Assignment"} onPress={() => incidents ? createAssignment(fileId, { type: "inc" }) : createAssignment(fileId)} />
        </View>
        {assignmentList.length + priorityAssignmentList.length === 0 ?
            <View style={{ flexDirection: "column", maxWidth: 1200, gap: 20 }}>
                <View style={{ flexDirection: ("row"), gap: 8, flexWrap: ("wrap") }}>
                    <Banner
                        backgroundColor={colorTheme.surfaceContainer}
                        color={colorTheme.onSurface}
                        icon={<Ionicons name="clipboard-outline" size={24} color={colorTheme.onSurface} />}
                        title={"Tap the button above to add an " + (incidents ? "incident" : "assignment")} />
                </View>
            </View>
            :
            <>
                {priorityAssignmentList.length > 0 && <>
                    <Text style={[textStyle.sectionTitleText]}>Priority {incidents ? "incidents" : "assignments"}</Text>
                    <Animated.FlatList
                        contentContainerStyle={styles.cardContainer}
                        data={priorityAssignmentList}
                        renderItem={({ item }) => <ListItem teams={teams} item={item} incidents={incidents} notifyFileUpdated={notifyFileUpdated} setAssignTeamAssignment={setAssignTeamAssignment} setDeleteAssignment={setDeleteAssignment} markers={markers} removeMarker={removeMarker} addMarker={addMarker} />}
                        keyExtractor={item => item.id}
                        itemLayoutAnimation={FadingTransition}
                    />
                    <Text style={[textStyle.sectionTitleText]}>Others</Text>
                </>}
                <Animated.FlatList
                    contentContainerStyle={styles.cardContainer}
                    data={assignmentList}
                    renderItem={({ item }) => <ListItem teams={teams} item={item} incidents={incidents} notifyFileUpdated={notifyFileUpdated} setAssignTeamAssignment={setAssignTeamAssignment} setDeleteAssignment={setDeleteAssignment} markers={markers} removeMarker={removeMarker} addMarker={addMarker} />}
                    keyExtractor={item => item.id}
                    itemLayoutAnimation={FadingTransition}
                />
            </>
        }
        <AssignTeamAssignmentModal
            fileId={fileId}
            incidents={incidents}
            onClose={() => {
                setAssignTeamAssignment(null);
            }}
            teams={teams}
            notifyFileUpdated={notifyFileUpdated}
            assignment={assignTeamAssignment} />
        <RiskModal
            isVisible={deleteAssignment !== null}
            title={`Delete ${incidents ? "incident" : "assignment"}?`}
            onClose={() => { setDeleteAssignment(null) }}>
            <View style={{
                padding: 20, paddingTop: 0, gap: 20
            }}>
                <Text style={{ color: colorTheme.onSurface }}>{(deleteAssignment && deleteAssignment.name) ? `Assignment ${deleteAssignment.name}` : `Unnamed ${incidents ? "incident" : "assignment"}`} will be removed</Text>
                <FilledButton rightAlign destructive text={"Delete"} onPress={removeAssignment} />
            </View>
        </RiskModal>
    </View>;
}


const Chip = ({ title, onCancel, color, onPress }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

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

const AssignTeamAssignmentModal = ({ fileId, notifyFileUpdated, assignment, onClose, teams = [], incidents }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

    const { createCommsQueueMessage } = useContext(RxDBContext);

    const [assignmentTiming, setAssignmentTiming] = useState(0);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [initialTeams, setInitialTeams] = useState([]);

    const assignmentTimings = ["Now", "Add to queue"];

    // Set the selected teams to the teams that are currently assigned to the assignment
    useEffect(() => {
        if (assignment) {
            if (assignment.teamId && assignment.teamId.length > 0) {
                setSelectedTeams(assignment.teamId);
                setInitialTeams(assignment.teamId);
                setAssignmentTiming(1);
            }
        }
    }, [assignment]);

    const handleClose = () => {
        setSelectedTeams([]);
        setInitialTeams([]);
        setAssignmentTiming(0);
        onClose();
    }

    const handleSave = () => {
        if (selectedTeams.length !== 0 || initialTeams.length !== 0) {
            if (assignmentTiming === 0) {
                selectedTeams.forEach(teamId => {
                    teams.find(t => t.id === teamId).incrementalPatch({ assignment: assignment.id });
                });
            }

            assignment.incrementalPatch({ teamId: selectedTeams });
            notifyFileUpdated();
            handleClose();
        }
    }

    const handleSendRequest = () => {
        if (selectedTeams.length !== 0) {
            // Send message to radio operator
            selectedTeams.forEach(teamId => {
                createCommsQueueMessage(fileId, {
                    type: 'Task',
                    toOpsTeam: "comms",
                    toFieldTeamId: teamId,
                    subtype: `Assign`,
                    relatedId: assignment.id
                })
            });
            assignment.incrementalPatch({ teamId: selectedTeams });
            notifyFileUpdated();
            handleClose();
        }
    }

    let actionText = "Save";
    let footerMessage = "";
    if (selectedTeams.length === 0) {
        actionText = "Save";
        if (initialTeams.length > selectedTeams.length) {
            footerMessage = "This task will be unassigned from the teams";
        }
    } else if (assignmentTiming === 0) {
        actionText = "Assign";
        footerMessage = `Tap "Notify operator" to ask the radio operator to inform the team${selectedTeams.length > 1 ? "s" : ""} of the task change. ${assignment?.name || `unnamed ${incidents ? "incident" : "assignment"}`} will be placed in the team's queue, in the meantime\nTap "Assign" to change the team's In progress task to ${assignment?.name || `unnamed ${incidents ? "incident" : "assignment"}`}`;
    } else {
        footerMessage = `${assignment?.name || `Unnamed ${incidents ? "incident" : "assignment"}`} will be placed ${selectedTeams.length > 1 ? "each" : "the"} team's queue`;
    }

    return (<RiskModal
        isVisible={assignment !== null}
        title={`Assign team(s) to ${assignment?.name || `unnamed ${incidents ? "incident" : "assignment"}`}`}
        onClose={handleClose}>
        <View style={{ paddingHorizontal: 20, gap: 14, paddingBottom: 20 }}>
            {(teams && teams.length > 0) ?
                <>
                    <Text style={[textStyle.sectionTitleText]}>Team(s)</Text>
                    <View style={{ flexDirection: 'row', gap: 12, flexWrap: "wrap-reverse", justifyContent: "center" }}>
                        {teams.map(t => {
                            if (t.name !== "")
                                return <FilledButton small key={t?.id} selected={selectedTeams.includes(t.id)} text={t.name} onPress={() => {
                                    if (selectedTeams.includes(t.id)) {
                                        setSelectedTeams(prev => prev.filter(item => item !== t.id))
                                    } else {
                                        setSelectedTeams(prev => [...prev, t.id])
                                    }
                                }} />
                        })}
                    </View>
                    <Text style={[textStyle.secondaryText]}>Unnamed teams not shown</Text>
                </>
                :
                <Text style={[textStyle.text]}>No teams available</Text>}
            <>{selectedTeams.length > 0 && <>
                <Text style={[textStyle.sectionTitleText]}>Timing</Text>
                <SegmentedButtons small grow items={assignmentTimings} selected={assignmentTiming} onPress={setAssignmentTiming} />
                <Text style={[textStyle.text, { paddingTop: 8 }]}>{footerMessage}</Text>
            </>}</>
            <>{(initialTeams.length !== 0 || selectedTeams.length !== 0) && <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between', alignItems: "flex-end", paddingTop: 8 }}>
                <Text style={[textStyle.secondaryText, { alignSelf: "center" }]}>{selectedTeams.length === 0 ? footerMessage : ""}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <FilledButton primary={actionText === "Save" || selectedTeams.length === 0} text={actionText} onPress={handleSave} />
                    <>{actionText === "Assign" && selectedTeams.length > 0 && <FilledButton primary text={"Notify operator"} disabled={selectedTeams.length === 0} onPress={handleSendRequest} />}</>
                </View>
            </View>}</>
        </View>
    </RiskModal >);
}

const TemplateModal = ({ fileId, notifyFileUpdated, people, isVisible, onClose }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles(colorTheme);
    const textStyle = textStyles(colorTheme, width);
    const { width } = useWindowDimensions();
    const [name, setName] = useState("");

    const handleClose = () => {
        onClose();
    }

    const handleSave = () => {
        handleClose();
    }

    return (<RiskModal
        overrideWidth={700}
        isVisible={isVisible}
        title={"Add a person"}
        onClose={handleClose}>
        <View style={{ paddingHorizontal: 20, gap: 8 }}>
            <TextBox keyboardType="default" value={name} placeholder="Name" onChangeText={setName} onConfirm={() => { }} textStyle={textStyle.text} limit={20} />
        </View>
        <View style={{ padding: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end', alignItems: "flex-end" }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <FilledButton primary text={"Save log"} onPress={() => { handleSave() }} />
                </View>
            </View>
        </View>
    </RiskModal >);
}

const pageStyles = (colorTheme) => {
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
        card: {
            borderRadius: 4,
            overflow: 'hidden',
            paddingLeft: 12,
            paddingRight: 12,
            paddingVertical: 10,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: 'space-between',
            backgroundColor: colorTheme.surfaceContainer
        },
        cardContainer: {
            gap: 4,
            borderRadius: 12,
            //borderRadius: 26,
            overflow: 'hidden'
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