import { FilledButton, textStyles, ThemeContext } from 'calsar-ui';
import React, { useContext } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { EditableText } from './TextInput';

export const InfoTab = ({ incidentInfo, editIncident }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = pageStyles();
    const textStyle = textStyles();

    return (
        <View style={{
            flexDirection: "column",
            gap: 8,
        }}>
            <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 1, justifyContent: "flex-start", gap: 8 }]}>
                <KeyValue title="Incident name" value={incidentInfo?.incidentName || "-"} >
                    <EditableText style={textStyle.rowTitleText} value={incidentInfo.incidentName} defaultValue="Tap to set" onChangeText={(text) => editIncident({ incidentName: text })} limit={50} />
                </KeyValue>
                <KeyValue title="Incident number">
                    <EditableText style={textStyle.rowTitleText} value={incidentInfo.incidentNumber} defaultValue="Tap to set" onChangeText={(text) => editIncident({ incidentNumber: text })} limit={50} />
                </KeyValue>
                <KeyValue title="Operational period" >
                    <EditableText style={textStyle.rowTitleText} value={incidentInfo.opPeriod} defaultValue="Tap to set" onChangeText={(text) => editIncident({ opPeriod: text })} limit={12} />
                </KeyValue>
            </View>
            <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                <KeyValue title="Operator/log keeper">
                    <EditableText style={textStyle.rowTitleText} value={incidentInfo.commsName} defaultValue="Tap to set" onChangeText={(text) => editIncident({ commsName: text })} />
                </KeyValue>
                <KeyValue title="Operator callsign" >
                    <EditableText style={textStyle.rowTitleText} value={incidentInfo.commsCallsign} defaultValue="Tap to set" onChangeText={(text) => editIncident({ commsCallsign: text })} limit={12} />
                </KeyValue>
                <KeyValue title="Frequency/channel" >
                    <EditableText style={textStyle.rowTitleText} value={incidentInfo.commsFrequency} defaultValue="Tap to set" onChangeText={(text) => editIncident({ commsFrequency: text })} limit={50} />
                </KeyValue>
            </View>
        </View >
    );
}

const KeyValue = ({ title, children }) => {
    const styles = pageStyles();
    const textStyle = textStyles();

    return (<View style={{ flexDirection: "column", gap: 4, flex: 1 }}>
        <Text style={textStyle.tertiaryText}>{title}</Text>
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