import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Banner, FilledButton, IconButton, MaterialCard, RiskModal, textStyles, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { RxDBContext } from './RxDBContext';
import SwitcherContainer from './SwitcherContainer';
import { EditableText, TextBox } from './TextInput';

export const PlanningPanel = ({ incidentInfo, activeTeams }) => {
    const [activeTab, setActiveTab] = useState("Assignments");
    const tabs = [
        {
            name: "Assignments",
            icon: "navigate",
            content: <>
                <AssignmentPanel incidentInfo={incidentInfo} teams={activeTeams} />
            </>
        },
        {
            name: "Incidents",
            icon: "earth",
            content: <>
                <EquipmentPanel incidentInfo={incidentInfo} teams={activeTeams} />
            </>
        }
    ];

    return <SwitcherContainer tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />;
}

const AssignmentPanel = ({ incidentInfo, teams }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { getAssignmentsByFileId, deleteDocument } = useContext(RxDBContext);

    const { width, height } = useWindowDimensions();

    const styles = pageStyles();
    const textStyle = textStyles();

    const [assignments, setAssignments] = useState([]);
    const [addAssignmentModalShowing, setAddAssignmentModalShowing] = useState(false);
    const [deleteAssignment, setDeleteAssignment] = useState(null);
    const [assignTeamAssignment, setAssignTeamAssignment] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        getAssignmentsByFileId(incidentInfo.id).then(query => {
            query.$.subscribe(result => {
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

    assignments.map(item => {
        assignmentList.push(
            <Pressable
                key={item.id}
                onPress={() => {
                    setSelectedPerson(item);
                    setAddAssignmentModalShowing(true);
                }}
                onLongPress={() => { }}
                style={[styles.card, { flexDirection: "row", gap: 16, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }, { backgroundColor: colorTheme.surfaceContainer }]}>
                <View style={{ flexDirection: "row", gap: 8, minWidth: 125, flex: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <Text style={[textStyle.rowTitleText, { paddingRight: 8 }]} numberOfLines={1}>{item.name}{item.idNumber ? ` #${item.idNumber}` : ""}</Text>
                    {(item.type && item?.type !== "default" || item.role) && <Chip title={`${item?.type !== "default" ? getLabelFromValue(TYPE_OPTIONS, item.type) : ""}${item?.type !== "default" && item.role ? ` ${getLabelFromValue(ROLE_OPTIONS, item.role).toLowerCase()}` : `${getLabelFromValue(ROLE_OPTIONS, item.role)}`}`} color={colorTheme.surfaceContainerHigh} />}
                    {item.medCert && item.medCert !== "default" && <Chip title={getLabelFromValue(MED_CERT_OPTIONS, item.medCert)} color={colorTheme.surfaceContainerHigh} />}
                    {item.additionalAttrs && item.additionalAttrs.map(attr => <Chip key={attr} title={getLabelFromValue(ADDITIONAL_ATTRS_OPTIONS, attr)} color={attr === "cand" ? colorTheme.secondaryContainer : colorTheme.surfaceContainerHigh} />)}
                    <>{(item.phone || item.email) && <IconChip icon={"call-outline"} />}</>
                    <>{(item.trackingURL) && <IconChip icon={"location-outline"} />}</>
                </View>
                {item.notes ?
                    <><View style={{ flexDirection: "column", gap: 8, flex: 2, flexWrap: "wrap", minWidth: 300 }}>
                        <>{item.notes && <Text style={[textStyle.text]}>{item.notes}</Text>}</>
                    </View>
                    </> : <></>}
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-start", alignItems: "center" }}>
                    {item.teamId ?
                        <Chip title={"Team " + teams.find(team => team.id === item.teamId).name} color={colorTheme.tertiaryContainer} onCancel={() => item.incrementalPatch({ teamId: "" }).then(() => incidentInfo.incrementalPatch({ updated: new Date().toISOString() }))} />
                        :
                        <IconButton
                            small
                            tonal={!item.teamId}
                            ionicons_name={item.teamId ? "download-outline" : "push-outline"}
                            onPress={() => item.teamId ? item.incrementalPatch({ teamId: "" }).then(() => incidentInfo.incrementalPatch({ updated: new Date().toISOString() })) : setAssignTeamAssignment(item)} />
                    }
                    <>{(!item.teamId || item.teamId === "") && <IconButton small ionicons_name="trash" onPress={() => setDeleteAssignment(item)} />}</>
                </View>
            </Pressable>
        );
    })

    return <View style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 14, flexWrap: "wrap", flex: 1, alignSelf: "flex-end" }}>
            <FilledButton small={width <= 600 || height < 500} primary icon="add" text={"Assignment"} onPress={() => setAddAssignmentModalShowing(true)} />
        </View>
        {assignments.length === 0 ?
            <View style={{ flexDirection: "column", maxWidth: 1200, gap: 20 }}>
                <View style={{ flexDirection: ("row"), gap: 8, flexWrap: ("wrap") }}>
                    <Banner
                        backgroundColor={colorTheme.surfaceContainer}
                        color={colorTheme.onSurface}
                        icon={<Ionicons name="clipboard-outline" size={24} color={colorTheme.onSurface} />}
                        title={"Tap the button above to add an assignment"} />
                </View>
            </View>
            :
            <>{assignmentList}</>
        }
        {/*<AddAssignmentModal
            isVisible={addAssignmentModalShowing}
            onClose={() => {
                setAddPersonModalShowing(false);
                setSelectedPerson(null);
            }}
            agencyList={agencyList}
            incidentInfo={incidentInfo}
            person={selectedPerson} />
        <AssignTeamAssignmentModal
            onClose={() => {
                setAssignTeamAssignment(null);
            }}
            teams={teams}
            incidentInfo={incidentInfo}
            person={assignTeamAssignment} />
        <RiskModal
            isVisible={deleteAssignment !== null}
            title={"Delete person?"}
            onClose={() => { setDeleteAssignment(null) }}>
            <View style={{
                padding: 20, paddingTop: 0, gap: 20
            }}>
                <Text style={{ color: colorTheme.onSurface }}>{deleteAssignment && deleteAssignment.name} will be removed, but any radio logs won't be affected</Text>
                <FilledButton rightAlign destructive text={"Delete assignment"} onPress={removeAssignment} />
            </View>
        </RiskModal>*/}
    </View>;
}

const EquipmentPanel = ({ incidentInfo, teams }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { getEquipmentByFileId, deleteDocument } = useContext(RxDBContext)

    const { width, height } = useWindowDimensions();
    const [equipment, setEquipment] = useState([]);
    const [agencyList, setAgencyList] = useState([]);
    const [addEquipmentModalShowing, setAddEquipmentModalShowing] = useState(false);
    const [deletePerson, setDeletePerson] = useState(null);
    const [assignTeamPerson, setAssignTeamPerson] = useState(null);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const styles = pageStyles();
    const textStyle = textStyles();

    useEffect(() => {
        // Load saved settings
        getEquipmentByFileId(incidentInfo.id).then(query => {
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

    equipment.map(item => {
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
                style={[styles.card, { flexDirection: "row", gap: 16, justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }, { backgroundColor: colorTheme.surfaceContainer }]}>
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
            incidentInfo={incidentInfo}
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


const getLabelFromValue = (options, value) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
};

const Chip = ({ title, onCancel, color }) => {
    const { colorTheme } = useContext(ThemeContext);
    const textStyle = textStyles();

    return <View style={{ flexDirection: "row", gap: 8, height: 28, alignItems: "center", backgroundColor: color || colorTheme.surfaceContainer, paddingHorizontal: 12, borderRadius: 8 }}>
        <Text style={textStyle.chipText}>{title}</Text>
        {onCancel !== undefined && <Ionicons name="close" size={18} color={colorTheme.onSurface} onPress={onCancel} />}
    </View>
}

const IconChip = ({ icon, onCancel, color }) => {
    const { colorTheme } = useContext(ThemeContext);
    return <View style={{ flexDirection: "row", gap: 8, height: 28, alignItems: "center", backgroundColor: color || colorTheme.surfaceContainerHighest, paddingHorizontal: 8, borderRadius: 8 }}>
        <Ionicons name={icon} size={18} color={colorTheme.onSurface} />
        {onCancel !== undefined && <Ionicons name="close" size={18} color={colorTheme.onSurface} onPress={onCancel} />}
    </View>
}

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

const AddPersonModal = ({ incidentInfo, person, isVisible, onClose, agencyList }) => {
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
    const styles = pageStyles();
    const textStyle = textStyles();
    const { width } = useWindowDimensions();
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
                incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
            } else {
                // create person
                createPerson(incidentInfo.id, formData);
                incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
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

const AddEquipmentModal = ({ incidentInfo, equipment, isVisible, onClose, agencyList, teams }) => {
    const initialFormState = {
        name: '',
        quantity: 0,
        agency: '',
        notes: ''
    };

    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles();
    const textStyle = textStyles();
    const { width } = useWindowDimensions();
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
                incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
            } else {
                // create equipment
                createEquipment(incidentInfo.id, { ...formData, ...{ teamId: selectedTeams } });
                incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
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

const AssignTeamPersonModal = ({ incidentInfo, person, onClose, teams }) => {
    const styles = pageStyles();
    const textStyle = textStyles();

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
                            incidentInfo.incrementalPatch({ updated: new Date().toISOString() });
                            handleClose();
                        }} />
                })}
            </View>
            <Text style={textStyle.text}>Unnamed teams not shown. People can't be deleted while they're assigned to a team.</Text>
        </View>
    </RiskModal >);
}

const TemplateModal = ({ incidentInfo, people, isVisible, onClose }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles();
    const textStyle = textStyles();
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