import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Banner, FilledButton, IconButton, RiskModal, textStyles, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { RxDBContext } from './RxDBContext';
import SwitcherContainer from './SwitcherContainer';
import { EditableText, TextBox } from './TextInput';
import { setTeamTimeoutRunning } from './helperFunctions';

export const ResourcesPanel = ({ fileId, notifyFileUpdated, activeTeams }) => {
    const [activeTab, setActiveTab] = useState("People");
    const tabs = [
        {
            name: "People",
            icon: "earth",
            content: <>
                <PeoplePanel fileId={fileId} notifyFileUpdated={notifyFileUpdated} teams={activeTeams} />
            </>
        },
        {
            name: "Equipment",
            icon: "earth",
            content: <>
                <EquipmentPanel fileId={fileId} notifyFileUpdated={notifyFileUpdated} teams={activeTeams} />
            </>
        }
    ];

    return <SwitcherContainer tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />;
}

const PeoplePanel = ({ fileId, notifyFileUpdated, teams }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { getPeopleByFileId, deleteDocument } = useContext(RxDBContext)

    const { width, height } = useWindowDimensions();

    const styles = pageStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);

    const [people, setPeople] = useState([]);
    const [agencyList, setAgencyList] = useState([]);
    const [addPersonModalShowing, setAddPersonModalShowing] = useState(false);
    const [deletePerson, setDeletePerson] = useState(null);
    const [assignTeamPerson, setAssignTeamPerson] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState(null);

    useEffect(() => {
        getPeopleByFileId(fileId).then(query => {
            query.$.subscribe(result => {
                setPeople(result);
                // regenerates the agency names list
                let agencyNames = result.map(item => item.agency).filter((value, index, self) => self.indexOf(value) === index).filter(item => item !== "" && item !== undefined);
                setAgencyList(agencyNames);
                return () => { query.$.unsubscribe() };
            });
        });
    }, []);

    const removePerson = () => {
        deleteDocument(deletePerson);
        setDeletePerson(null);
    };

    let peopleList = [];
    let tempList = [];
    let currentAgency = "";

    people.map(item => {
        if (item.agency !== currentAgency) {
            if (tempList.length > 0) {
                peopleList.push(<View key={Date.now() + item.agency + "_cont"} style={styles.cardContainer}>{tempList}</View>);
                tempList = [];
            }
            peopleList.push(<Text key={Date.now() + item.agency} style={[textStyle.sectionTitleText]}>{item.agency || "No agency"}</Text>);
            currentAgency = item.agency;
        }
        tempList.push(
            <Pressable
                key={item.id}
                onPress={() => {
                    setSelectedPerson(item);
                    setAddPersonModalShowing(true);
                }}
                onLongPress={() => { }}
                style={[styles.card, { flexDirection: "row", gap: 16, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }, { backgroundColor: colorTheme.surfaceContainer }]}>
                <View style={{ flexDirection: "row", gap: 8, minWidth: 125, flex: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <Text style={[textStyle.rowTitleText, { paddingRight: 8 }]} numberOfLines={1}>{item.name}{item.idNumber ? ` #${item.idNumber}` : ""}</Text>
                    {(item.type && item?.type !== "default" || item.role) && <Chip title={`${item?.type !== "default" ? getLabelFromValue(TYPE_OPTIONS, item.type) : ""}${item?.type !== "default" && item.role ? ` ${getLabelFromValue(ROLE_OPTIONS, item.role).toLowerCase()}` : `${getLabelFromValue(ROLE_OPTIONS, item.role)}`}`} color={colorTheme.surfaceContainerHigh} />}
                    {item.medCert && item.medCert !== "default" && <Chip title={getLabelFromValue(MED_CERT_OPTIONS, item.medCert)} color={colorTheme.surfaceContainerHigh} />}
                    {item.additionalAttrs && item.additionalAttrs.map(attr => <Chip key={attr} title={getLabelFromValue(ADDITIONAL_ATTRS_OPTIONS, attr)} color={attr === "cand" ? colorTheme.secondaryContainer : colorTheme.surfaceContainerHigh} />)}
                    <>{(item.phone || item.email) && <IconChip icon={"call-outline"} />}</>
                    <>{(item.trackingURL) && <IconChip icon={"link-outline"} onPress={() => { Linking.openURL(item.trackingURL) }} />}</>
                </View>
                {item.notes ?
                    <><View style={{ flexDirection: "column", gap: 8, flex: 2, flexWrap: "wrap", minWidth: 300 }}>
                        <>{item.notes && <Text style={[textStyle.secondaryText]}>{item.notes}</Text>}</>
                    </View>
                    </> : <></>}
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-start", alignItems: "center" }}>
                    {item.teamId ?
                        <Chip title={"Team " + teams.find(team => team.id === item.teamId)?.name} color={colorTheme.tertiaryContainer} onCancel={() => item.incrementalPatch({ teamId: "" }).then(() => notifyFileUpdated())} />
                        :
                        <IconButton
                            small
                            tonal={!item.teamId}
                            ionicons_name={item.teamId ? "download-outline" : "push-outline"}
                            onPress={() => item.teamId ? item.incrementalPatch({ teamId: "" }).then(() => notifyFileUpdated()) : setAssignTeamPerson(item)} />
                    }
                    <>{(!item.teamId || item.teamId === "") && <IconButton small ionicons_name="trash" onPress={() => setDeletePerson(item)} />}</>
                </View>
            </Pressable>
        );
    })

    if (tempList.length > 0) {
        peopleList.push(<View key={Date.now() + "last_cont"} style={styles.cardContainer}>{tempList}</View>);
    }

    return <View style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap", flex: 1, alignSelf: "flex-end" }}>
            {false && <FilledButton small={width <= 600 || height < 500} backgroundColor={colorTheme.background} icon={"people"} text={"Quick assign"} onPress={() => { }} />}
            <FilledButton small={width <= 600 || height < 500} primary icon="person-add" text={"Person"} onPress={() => setAddPersonModalShowing(true)} />
            <IconButton outline small={width <= 600 || height < 500} backgroundColor={colorTheme.background} ionicons_name={"share-outline"} text={"Export"} onPress={() => { }} />
        </View>
        {people.length === 0 ?
            <View style={{ flexDirection: "column", maxWidth: 1200, gap: 20 }}>
                <View style={{ flexDirection: ("row"), gap: 8, flexWrap: ("wrap") }}>
                    <Banner
                        backgroundColor={colorTheme.surfaceContainer}
                        color={colorTheme.onSurface}
                        icon={<Ionicons name="people" size={24} color={colorTheme.onSurface} />}
                        title={"Tap the button above to add a person"} />
                    <Banner
                        backgroundColor={colorTheme.surfaceContainer}
                        color={colorTheme.onSurface}
                        icon={<Ionicons name="chatbubble-ellipses-outline" size={24} color={colorTheme.onSurface} />}
                        title={"People can be assigned to teams randomly, according to rules, or manually"} />
                </View>
            </View>
            :
            <>{peopleList}</>
        }
        <AddPersonModal
            isVisible={addPersonModalShowing}
            onClose={() => {
                setAddPersonModalShowing(false);
                setSelectedPerson(null);
            }}
            agencyList={agencyList}
            fileId={fileId}
            notifyFileUpdated={notifyFileUpdated}
            person={selectedPerson} />
        <AssignTeamPersonModal
            onClose={() => {
                setAssignTeamPerson(null);
            }}
            teams={teams}
            fileId={fileId}
            notifyFileUpdated={notifyFileUpdated}
            person={assignTeamPerson} />
        <RiskModal
            isVisible={deletePerson !== null}
            title={`Delete ${deletePerson && deletePerson.name}?`}
            onClose={() => { setDeletePerson(null) }}>
            <View style={{
                padding: 20, paddingTop: 0, gap: 20
            }}>
                <Text style={{ color: colorTheme.onSurface }}>{deletePerson && deletePerson.name} will be removed</Text>
                <FilledButton rightAlign destructive text={"Delete"} onPress={removePerson} />
            </View>
        </RiskModal>
    </View>;
}

const EquipmentPanel = ({ fileId, notifyFileUpdated, teams }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { getEquipmentByFileId, deleteDocument } = useContext(RxDBContext)

    const { width, height } = useWindowDimensions();
    const [equipment, setEquipment] = useState([]);
    const [agencyList, setAgencyList] = useState([]);
    const [addEquipmentModalShowing, setAddEquipmentModalShowing] = useState(false);
    const [deletePerson, setDeletePerson] = useState(null);
    const [assignTeamPerson, setAssignTeamPerson] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const styles = pageStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);

    useEffect(() => {
        // Load saved settings
        getEquipmentByFileId(fileId).then(query => {
            query.$.subscribe(result => {
                setEquipment(result);
                // regenerates the agency names list
                let agencyNames = result.map(item => item.agency).filter((value, index, self) => self.indexOf(value) === index).filter(item => item !== "" && item !== undefined);
                setAgencyList(agencyNames);
                return () => { query.$.unsubscribe() };
            });
        });
    }, []);

    const removeEquipment = () => {
        deleteDocument(deletePerson);
        setDeletePerson(null);
    };

    let equipmentList = [];
    let tempList = [];
    let currentAgency = "";

    equipment.forEach(item => {
        if (item.agency !== currentAgency) {
            if (tempList.length > 0) {
                equipmentList.push(<View key={Date.now() + item.agency + "_cont"} style={styles.cardContainer}>{tempList}</View>);
                tempList = [];
            }
            equipmentList.push(<Text key={Date.now() + item.agency} style={[textStyle.sectionTitleText]}>{item.agency || "No agency"}</Text>);
            currentAgency = item.agency;
        }

        let remaining = item.quantity - (item.teamId?.length || 0);
        tempList.push(
            <Pressable
                key={item.id}
                onPress={() => {
                    setSelectedEquipment(item);
                    setAddEquipmentModalShowing(true);
                }}
                onLongPress={() => { }}
                style={[styles.card, { flexDirection: "row", gap: 16, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center", backgroundColor: colorTheme.surfaceContainer }]}>
                <View style={{ flexDirection: "row", gap: 8, minWidth: 250, flex: 2, flexWrap: "wrap" }}>
                    <Text style={[textStyle.rowTitleText, { paddingRight: 8 }]} numberOfLines={1}>{item.name}{item.idNumber ? `, #${item.idNumber}` : ""}</Text>
                </View>
                {item.notes ?
                    <><View style={{ flexDirection: "column", gap: 8, flex: 3, flexWrap: "wrap", minWidth: 250 }}>
                        <>{item.notes && <Text style={[textStyle.text]}>{item.notes}</Text>}</>
                    </View>
                    </> : <></>}
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-start" }}>
                    <Chip title={`${item.quantity - remaining}/${item.quantity} assigned`} color={remaining === item.quantity ? colorTheme.secondaryContainer : colorTheme.tertiaryContainer} />
                    <>{(remaining === item.quantity) && <IconButton small ionicons_name="trash" onPress={() => setDeletePerson(item)} />}</>
                </View>
            </Pressable>
        );
    })

    if (tempList.length > 0) {
        equipmentList.push(<View key={Date.now() + "last_cont"} style={styles.cardContainer}>{tempList}</View>);
        tempList = [];
    }

    return <View style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap", flex: 1, alignSelf: "flex-end" }}>
            <FilledButton small={width <= 600 || height < 500} primary icon="add" text={"Equipment"} onPress={() => setAddEquipmentModalShowing(true)} />
            <IconButton outline small={width <= 600 || height < 500} backgroundColor={colorTheme.background} ionicons_name={"share-outline"} text={"Export"} onPress={() => { }} />
        </View>
        {equipment.length === 0 ?
            <View style={{ flexDirection: "column", maxWidth: 1200, gap: 20 }}>
                <View style={{ flexDirection: ("row"), gap: 8, flexWrap: ("wrap") }}>
                    <Banner
                        backgroundColor={colorTheme.surfaceContainer}
                        color={colorTheme.onSurface}
                        icon={<Ionicons name="medkit-outline" size={24} color={colorTheme.onSurface} />}
                        title={"Tap the button above to add equipment"} />
                    <Banner
                        backgroundColor={colorTheme.surfaceContainer}
                        color={colorTheme.onSurface}
                        icon={<Ionicons name="chatbubble-ellipses-outline" size={24} color={colorTheme.onSurface} />}
                        title={"Available equipment can be assigned to teams"} />
                </View>
            </View>
            :
            <>{equipmentList}</>
        }
        <AddEquipmentModal
            isVisible={addEquipmentModalShowing}
            onClose={() => {
                setAddEquipmentModalShowing(false);
                setSelectedEquipment(null);
            }}
            teams={teams}
            agencyList={agencyList}
            fileId={fileId}
            notifyFileUpdated={notifyFileUpdated}
            equipment={selectedEquipment} />
        <RiskModal
            isVisible={deletePerson !== null}
            title={"Delete equipment?"}
            onClose={() => { setDeletePerson(null) }}>
            <View style={{
                padding: 20, paddingTop: 0, gap: 20
            }}>
                <Text style={{ color: colorTheme.onSurface }}>{deletePerson && deletePerson.name} will be deleted</Text>
                <FilledButton rightAlign destructive text={"Delete"} onPress={removeEquipment} />
            </View>
        </RiskModal>
    </View>;
}

export const TeamsPanel = ({ fileId, notifyFileUpdated, activeTeams, editTeam, infoFunction, hideActions = false }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width, height } = useWindowDimensions();
    const { createTeam, removeTeam } = useContext(RxDBContext);
    const [deleteTeam, setDeleteTeam] = useState(null);
    const styles = pageStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);

    const handleRemoveTeam = () => {
        removeTeam(deleteTeam);
        notifyFileUpdated();
        setDeleteTeam(null);
    }

    const setAvailable = (team, state) => {
        team.incrementalPatch({ status: state ? "Available" : "Inactive" });
        if (state === false) {
            setTeamTimeoutRunning(team, false);
        }
        notifyFileUpdated();
    }

    return <ScrollView contentContainerStyle={{ gap: 12, paddingTop: 20, paddingBottom: 20, paddingRight: 10, paddingLeft: 20 }} style={{ height: "100%", paddingRight: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 14 }}>
            <FilledButton small={width <= 600 || height < 500} primary icon="add" text={"Team"} onPress={() => createTeam(fileId, "", "Inactive")} />
            <IconButton outline small={width <= 600 || height < 500} backgroundColor={colorTheme.background} ionicons_name={"share-outline"} text={"Export"} onPress={() => { }} />
        </View>
        {activeTeams.length === 0 ?
            <View style={{ flexDirection: "column", maxWidth: 1200, gap: 20 }}>
                <View style={{ flexDirection: ("row"), gap: 8, flexWrap: ("wrap") }}>
                    <Banner
                        backgroundColor={colorTheme.surfaceContainer}
                        color={colorTheme.onSurface}
                        icon={<Ionicons name="people" size={24} color={colorTheme.onSurface} />}
                        title={"Tap the button above to create a team"} />
                </View>
            </View>
            :
            <View style={styles.cardContainer}>
                {activeTeams.map(item => {
                    return <View
                        style={[styles.card, { flexDirection: "row", gap: 16, justifyContent: "space-between", flexWrap: "wrap" }, (item.status === "Inactive") && { backgroundColor: colorTheme.surfaceContainerLowest }]}
                        key={item.id}
                    >
                        <View style={{ flexDirection: "column", gap: 4, minWidth: 90, flex: 1 }}>
                            <EditableText
                                style={[textStyle.rowTitleTextBold, { fontWeight: "bold" }]}
                                numberOfLines={1} value={item.name}
                                defaultValue="-"
                                onChangeText={(text) => editTeam(item, { name: text })}
                                limit={10} />
                            <EditableText
                                style={[textStyle.tertiaryText]}
                                numberOfLines={1} value={item.type}
                                defaultValue="No type"
                                onChangeText={(text) => editTeam(item, { type: text })}
                                limit={12} />
                        </View>
                        <View style={{ flexDirection: "column", gap: 8, flex: 4, flexWrap: "wrap", minWidth: 150 }}>
                            <EditableText
                                style={[textStyle.text]}
                                numberOfLines={1}
                                value={item.status}
                                defaultValue={item.status || "No status"}
                                onChangeText={(text) => editTeam(item, { status: text })}
                                limit={50} />
                            {infoFunction(item.id, item)}
                        </View>
                        <>{!hideActions && <View style={{ flexDirection: "column", gap: 8 }}>
                            <>{item.type !== "Ad-hoc" && <IconButton small tonal={(item.status === "Inactive")} ionicons_name={(item.status === "Inactive") ? "log-in-outline" : "log-out-outline"} onPress={() => setAvailable(item, (item.status !== "Inactive") ? false : true)} />}</>
                            <>{(item.status === "Inactive" || item.type === "Ad-hoc" || item.type) && <IconButton small ionicons_name="trash" onPress={() => setDeleteTeam(item)} />}</>
                        </View>
                        }</>
                    </View>
                })}
            </View>
        }
        <RiskModal
            isVisible={deleteTeam !== null}
            title={"Delete team?"}
            onClose={() => { setDeleteTeam(null) }}>
            <View style={{
                padding: 20, paddingTop: 0, gap: 20
            }}>
                <View style={{ flexDirection: "column", gap: 8 }}>
                    <Text style={{ color: colorTheme.onSurface }}>{deleteTeam && deleteTeam.name ? deleteTeam.name : "This team"} will be removed, but any radio logs won't be affected. Equipment, people, and tasks will be unassigned.</Text>
                </View>
                <FilledButton rightAlign destructive text={"Delete team"} onPress={handleRemoveTeam} />
            </View>
        </RiskModal >
    </ScrollView>;
}

const Chip = ({ title, onCancel, color }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

    return <View style={{ flexDirection: "row", gap: 8, height: 28, alignItems: "center", backgroundColor: color || colorTheme.surfaceContainer, paddingHorizontal: 12, borderRadius: 8 }}>
        <Text style={textStyle.chipText}>{title}</Text>
        {onCancel !== undefined && <Ionicons name="close" size={18} color={colorTheme.onSurface} onPress={onCancel} />}
    </View>
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

const getLabelFromValue = (options, value) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
};

const TYPE_OPTIONS = [
    { label: "Type", value: "default" },
    { label: "T1", value: "1" },
    { label: "T2", value: "2" },
    { label: "T3", value: "3" },
    { label: "T4", value: "4" }
];

const ROLE_OPTIONS = [
    { label: "Ground", value: "ground" },
    { label: "Canine handler", value: "canine" },
    { label: "Canine flanker", value: "flanker" },
    { label: "Command/overhead", value: "command" },
    { label: "Law enforcement", value: "law" },
    { label: "Water", value: "water" },
    { label: "Air", value: "air" },
    { label: "Drone", value: "drone" },
];

const MED_CERT_OPTIONS = [
    { label: "Medical qualification", value: "default" },
    { label: "No med", value: "none" },
    { label: "WFA", value: "WFA" },
    { label: "WFR", value: "WFR" },
    { label: "EMT-B", value: "EMTB" },
    { label: "EMT-P", value: "EMTP" },
    { label: "PA", value: "PA" },
    { label: "RN", value: "RN" },
    { label: "MD/DO/NP", value: "MD" }
];

const ADDITIONAL_ATTRS_OPTIONS = [
    { label: "Tap to add additional attribute", value: "default" },
    { label: "Candidate", value: "cand" },
    { label: "ATV qualified", value: "atv" },
    { label: "Tracker", value: "track" },
    { label: "Technical ropes", value: "rope" },
    { label: "Swiftwater", value: "water" },
    { label: "SMIBE", value: "burn" },
    { label: "HAZMAT", value: "hazmat" }
];

const AddPersonModal = ({ fileId, notifyFileUpdated, person, isVisible, onClose, agencyList }) => {
    const initialFormState = {
        name: '',
        idNumber: '',
        agency: '',
        role: 'ground',
        type: 'default',
        medCert: 'default',
        additionalAttrs: [],
        phone: '',
        email: '',
        trackingURL: '',
        notes: ''
    };

    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = pageStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);
    const [formData, setFormData] = useState(initialFormState);
    const [errorMessage, setErrorMessage] = useState("");
    const { createPerson } = useContext(RxDBContext)

    useEffect(() => {
        setFormData(person ? person.toJSON() : initialFormState);
    }, [person]);

    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClose = () => {
        onClose();
        setFormData(initialFormState);
        setErrorMessage("");
    }

    const handleSave = () => {
        if (formData.name !== "") {
            if (person) {
                // update person
                person.incrementalPatch(formData);
                notifyFileUpdated();
            } else {
                // create person
                createPerson(fileId, formData);
                notifyFileUpdated();
            }
            handleClose();
        } else {
            setErrorMessage("Name is required");
        }
    }

    const addAttribute = (attribute) => {
        if (attribute !== "default" && !formData.additionalAttrs.includes(attribute)) {
            setFormData(prev => ({
                ...prev,
                additionalAttrs: [...prev.additionalAttrs, attribute]
            }));
        }
    }

    return (<RiskModal
        overrideWidth={700}
        isVisible={isVisible}
        title={person ? "Edit person" : "Add a person"}
        onClose={handleClose}>
        <View style={{ paddingHorizontal: 20, gap: 8, rowGap: 12 }}>
            <>{errorMessage && <Text style={[textStyle.text, { color: colorTheme.error }]}>{errorMessage}</Text>}</>
            <View style={{ gap: 12, flexDirection: "row", flex: 1 }}>
                <TextBox autoFocus keyboardType="default" height={34} value={formData.name} placeholder="Name" onChangeText={(value) => {
                    if (value !== "" && errorMessage !== "") setErrorMessage("");
                    updateField('name', value);
                }} onConfirm={() => handleSave()} containerStyle={{ flex: 3 }} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }, errorMessage && { outlineColor: colorTheme.error }]} limit={50} />
                <TextBox keyboardType="number-pad" height={34} value={formData.idNumber} placeholder="ID" onChangeText={(value) => updateField('idNumber', value)} onConfirm={() => handleSave()} textStyle={[textStyle.text, { flex: 1, paddingHorizontal: 12 }]} limit={20} />
            </View>
            <TextBox autofill={agencyList} keyboardType="default" value={formData.agency} placeholder="Agency" onChangeText={(value) => updateField('agency', value)} onConfirm={() => handleSave()} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }]} limit={20} />
            <Text style={[textStyle.sectionTitleText]}>Attributes</Text>
            <View style={{ gap: 12, flexDirection: "row", flex: 1 }}>
                <Picker
                    style={[styles.picker, { flex: 2 }]}
                    selectedValue={formData.role}
                    onValueChange={(itemValue) => updateField('role', itemValue)}>
                    {ROLE_OPTIONS.map((option) => (
                        <Picker.Item
                            key={option.value}
                            label={option.label}
                            value={option.value}
                        />
                    ))}
                </Picker>
                <Picker
                    style={[styles.picker, { flex: 1 }]}
                    selectedValue={formData.type}
                    onValueChange={(itemValue) => updateField('type', itemValue)}>
                    {TYPE_OPTIONS.map((option) => (
                        <Picker.Item
                            key={option.value}
                            label={option.label}
                            value={option.value}
                        />
                    ))}
                </Picker>
                <Picker
                    style={[styles.picker, { flex: 2 }]}
                    selectedValue={formData.medCert}
                    onValueChange={(itemValue) => updateField('medCert', itemValue)}>
                    {MED_CERT_OPTIONS.map((option) => (
                        <Picker.Item
                            key={option.value}
                            label={option.label}
                            value={option.value}
                        />
                    ))}
                </Picker>
            </View>
            {formData.additionalAttrs.length !== ADDITIONAL_ATTRS_OPTIONS.length - 1 && <Picker
                style={[styles.picker]}
                selectedValue={0}
                onValueChange={(itemValue, itemIndex) =>
                    addAttribute(itemValue)
                }>
                {ADDITIONAL_ATTRS_OPTIONS.map((option) => {
                    if (!formData.additionalAttrs.includes(option.value))
                        return <Picker.Item
                            key={option.value}
                            label={option.label}
                            value={option.value}
                        />
                })}
            </Picker>}
            {formData.additionalAttrs.length > 0 && <View style={{ gap: 8, flexDirection: "row", flex: 1, flexWrap: "wrap" }}>
                <>{formData.additionalAttrs.map((attr, index) => <Chip key={index} title={getLabelFromValue(ADDITIONAL_ATTRS_OPTIONS, attr)} color={attr === "cand" ? colorTheme.secondaryContainer : colorTheme.surfaceContainerLow} onCancel={() => {
                    setFormData(prev => ({
                        ...prev,
                        additionalAttrs: prev.additionalAttrs.filter(item => item !== attr)
                    }));
                }} />)}</>
            </View>}
            <Text style={[textStyle.sectionTitleText]}>Contact</Text>
            <View style={{ gap: 12, flexDirection: "row", flex: 1 }}>
                <TextBox keyboardType="phone-pad" height={34} value={formData.phone} placeholder="Phone" onChangeText={(itemValue) => updateField('phone', itemValue)} onConfirm={() => handleSave()} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }]} limit={20} />
                <TextBox keyboardType="email-address" height={34} value={formData.email} placeholder="Email" onChangeText={(itemValue) => updateField('email', itemValue)} onConfirm={() => handleSave()} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }]} limit={50} />
            </View>
            <TextBox keyboardType="url" height={34} value={formData.trackingURL} placeholder="Tracking URL" onChangeText={(itemValue) => updateField('trackingURL', itemValue)} onConfirm={() => handleSave()} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }]} limit={150} />
            <Text style={[textStyle.sectionTitleText]}>Notes</Text>
            <TextBox keyboardType="default" height={34} value={formData.notes} placeholder="" onChangeText={(itemValue) => updateField('notes', itemValue)} onConfirm={() => handleSave()} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }]} limit={200} />
        </View>
        <View style={{ padding: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <FilledButton primary text={"Save person"} onPress={() => { handleSave() }} />
                </View>
            </View>
        </View>
    </RiskModal >);
}

const AddEquipmentModal = ({ fileId, notifyFileUpdated, equipment, isVisible, onClose, agencyList, teams }) => {
    const initialFormState = {
        name: '',
        quantity: 0,
        agency: '',
        notes: ''
    };

    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = pageStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);
    const [formData, setFormData] = useState(initialFormState);
    const [errorMessage, setErrorMessage] = useState("");
    const { createEquipment } = useContext(RxDBContext)

    const [selectedTeams, setSelectedTeams] = useState([]);

    useEffect(() => {
        setFormData(equipment ? equipment.toJSON() : initialFormState);
        if (equipment?.teamId) setSelectedTeams(equipment?.teamId);
    }, [equipment]);

    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClose = () => {
        onClose();
        setFormData(initialFormState);
        setErrorMessage("");
        setSelectedTeams([]);
    }

    const handleSave = () => {
        let errors = [];
        if (formData.name === "") errors.push("name is required");
        if (!formData.quantity) {
            errors.push("equipment quantity must be greater than 0");
        } else if (formData.quantity < selectedTeams.length)
            errors.push("the number of assigned teams is greater than the quantity available. Increase equipment quantity or unassign units from teams.");
        if (errors.length === 0) {
            if (equipment) {
                // update equipment
                equipment.incrementalPatch({ ...formData, ...{ teamId: selectedTeams } });
                notifyFileUpdated();
            } else {
                // create equipment
                createEquipment(fileId, { ...formData, ...{ teamId: selectedTeams } });
                notifyFileUpdated();
            }
            handleClose();
        } else {
            let errorString = errors.map(e => e).join(", ");
            setErrorMessage(errorString.charAt(0).toUpperCase() + errorString.slice(1));

        }
    }

    let selectedTeamButtons = [];
    let remaining = formData.quantity - selectedTeams.length;
    teams.forEach(t => {
        if (t.name !== "") {
            selectedTeamButtons.push(<FilledButton small selected={selectedTeams.includes(t.id) && formData.quantity} disabled={!selectedTeams.includes(t.id) && remaining === 0 || !formData.quantity} key={t?.id} text={t.name} onPress={() => {
                if (selectedTeams.includes(t.id)) {
                    setSelectedTeams(prev => prev.filter(item => item !== t.id))
                } else {
                    setSelectedTeams(prev => [...prev, t.id])
                }
            }} />);
        }
    });

    return (<RiskModal
        overrideWidth={700}
        isVisible={isVisible}
        title={equipment ? "Edit equipment" : "Add equipment"}
        onClose={handleClose}>
        <View style={{ paddingHorizontal: 20, gap: 8, rowGap: 12 }}>
            <>{errorMessage && <Text style={[textStyle.text, { color: colorTheme.error }]}>{errorMessage}</Text>}</>
            <View style={{ gap: 12, flexDirection: "row", flex: 1 }}>
                <TextBox autoFocus keyboardType="default" height={34} value={formData.name} placeholder="Item" onChangeText={(value) => {
                    if (value !== "" && errorMessage !== "") setErrorMessage("");
                    updateField('name', value);
                }} onConfirm={() => handleSave()} containerStyle={{ flex: 3 }} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }]} limit={50} />
                <TextBox keyboardType="number-pad" height={34} value={formData.quantity} placeholder="Quantity" onChangeText={(value) => {
                    if (value !== "" && errorMessage !== "") setErrorMessage("");
                    updateField('quantity', Number(value))
                }} onConfirm={() => handleSave()} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }]} limit={20} />
            </View>
            <TextBox autofill={agencyList} keyboardType="default" value={formData.agency} placeholder="Provided by" onChangeText={(value) => updateField('agency', value)} onConfirm={() => handleSave()} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }]} limit={20} maxHeight={84} />
            <Text style={[textStyle.sectionTitleText]}>Notes</Text>
            <TextBox keyboardType="default" height={34} value={formData.notes} placeholder="" onChangeText={(itemValue) => updateField('notes', itemValue)} onConfirm={() => handleSave()} textStyle={[textStyle.text, { height: 34, paddingHorizontal: 12 }]} limit={200} />
            <Text style={[textStyle.text, { paddingTop: 8 }]}>{!formData.quantity ? "Enter the the quantity of equipment available to assign to teams" : remaining > 0 ? `Select team to assign/unassign. ${remaining} ${remaining > 1 ? "units" : "unit"} left.` : remaining < 0 ? `Too many units assigned. Select team to unassign.` : `All units assigned. Select team to unassign.`}</Text>
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: "wrap-reverse" }}>
                <>{selectedTeamButtons}</>
            </View>
        </View>
        <View style={{ padding: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between', alignItems: "flex-end" }}>
                <Text style={[textStyle.secondaryText, { alignSelf: "flex-start" }]}>Unnamed teams not shown. Equipment can't be deleted while units are assigned to a team.</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <FilledButton primary text={"Save equipment"} onPress={() => { handleSave() }} />
                </View>
            </View>
        </View>
    </RiskModal >);
}

const AssignTeamPersonModal = ({ fileId, notifyFileUpdated, person, onClose, teams }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = pageStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);

    const handleClose = () => {
        onClose();
    }

    return (<RiskModal
        isVisible={person !== null}
        title={`Assign ${person?.name || ""} to team`}
        onClose={handleClose}>
        <View style={{ paddingHorizontal: 20, gap: 14, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', gap: 12, flexWrap: "wrap-reverse", justifyContent: "center" }}>
                {teams.map(t => {
                    if (t.name !== "")
                        return <FilledButton small key={t?.id} text={t.name} onPress={() => {
                            person.incrementalPatch({ teamId: t.id });
                            notifyFileUpdated();
                            handleClose();
                        }} />
                })}
            </View>
            <Text style={textStyle.text}>Unnamed teams not shown. People can't be deleted while they're assigned to a team.</Text>
        </View>
    </RiskModal >);
}


const pageStyles = (colorTheme, width) => {

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