import { FilledButton, ThemeContext } from 'calsar-ui';
import React, { useContext } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { EditableText } from './TextInput';

export const InfoTab = ({ incidentInfo, editIncident }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = pageStyles();

    return (
        <>
            {false && <View style={[styles.standaloneCard, { backgroundColor: colorTheme.surfaceContainer, alignSelf: "center", flexDirection: "column", flexGrow: 1, justifyContent: "space-between", gap: 8, maxWidth: 600 }]}>
                <View style={{ flexDirection: width > 600 ? "row" : "column", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                    <Text style={[styles.text, { fontStyle: "italic" }]}>Changes auto-saved locally. Download the file to open on another device and for record keeping.</Text>
                    <FilledButton primary small={width <= 600} icon="download" text="Download file" onPress={() => { }} />
                </View>
            </View>}
            <View style={{
                flexDirection: "column",
                gap: 8,
            }}>
                <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 1, justifyContent: "flex-start", gap: 8 }]}>
                    <KeyValue title="Incident name" value={incidentInfo?.incidentName || "-"} >
                        <EditableText style={styles.sectionBodyTextSmall} value={incidentInfo.incidentName} defaultValue="Tap to set" onChangeText={(text) => editIncident({ incidentName: text })} limit={50} />
                    </KeyValue>
                    <KeyValue title="Incident number">
                        <EditableText style={styles.sectionBodyTextSmall} value={incidentInfo.incidentNumber} placeholder="LAW-20..." defaultValue="Tap to set" onChangeText={(text) => editIncident({ incidentNumber: text })} limit={50} />
                    </KeyValue>
                    <KeyValue title="Operational period" >
                        <EditableText style={styles.sectionBodyTextSmall} value={incidentInfo.opPeriod} defaultValue="Tap to set" onChangeText={(text) => editIncident({ opPeriod: text })} limit={12} />
                    </KeyValue>
                </View>
                <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                    <KeyValue title="Operator/log keeper">
                        <EditableText style={styles.sectionBodyTextSmall} value={incidentInfo.commsName} defaultValue="Tap to set" onChangeText={(text) => editIncident({ commsName: text })} />
                    </KeyValue>
                    <KeyValue title="Operator callsign" >
                        <EditableText style={styles.sectionBodyTextSmall} value={incidentInfo.commsCallsign} defaultValue="Tap to set" onChangeText={(text) => editIncident({ commsCallsign: text })} limit={12} />
                    </KeyValue>
                    <KeyValue title="Frequency/channel" >
                        <EditableText style={styles.sectionBodyTextSmall} value={incidentInfo.commsFrequency} defaultValue="Tap to set" onChangeText={(text) => editIncident({ commsFrequency: text })} limit={50} />
                    </KeyValue>
                </View>
            </View >
        </>
    );
}

const KeyValue = ({ title, children }) => {
    const styles = pageStyles();

    return (<View style={{ flexDirection: "column", gap: 2 }}>
        <Text style={styles.text}>{title}</Text>
        {children}
    </View>
    );
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    return StyleSheet.create({
        sectionTitle: {
            color: colorTheme.onBackground,
            fontSize: 20,
        },
        standaloneCard: {
            borderRadius: 26,
            minWidth: 450,
            overflow: 'hidden',
            paddingHorizontal: 18,
            paddingVertical: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: 'space-between',
            backgroundColor: colorTheme.surfaceContainer
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
    });
}