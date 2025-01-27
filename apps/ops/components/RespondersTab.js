import { Ionicons } from '@expo/vector-icons';
import { FilledButton, MaterialCard, ThemeContext, Tile } from 'calsar-ui';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PrinterContext } from './PrinterContext';
import SwitcherContainer from './SwitcherContainer';
import { RxDBContext } from './RxDBContext';

export const RespondersTab = ({ incidentInfo }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = pageStyles();
    const [activeTab, setActiveTab] = useState("Teams");
    const tabs = [
        {
            name: "Teams",
            icon: "id-card",
            content: <TeamsPage incidentInfo={incidentInfo} />
        },
        {
            name: "People",
            icon: "earth",
            content: <>
                <MaterialCard
                    noMargin
                    title="People"
                    subtitle="This section is still under construction. Please create ad-hoc teams using the button in the Overview tab.">
                </MaterialCard>
            </>
        },
        {
            name: "Equipment",
            icon: "earth",
            content: <>
                <MaterialCard
                    noMargin
                    title="Equipment"
                    subtitle="This section is still under construction. Please create ad-hoc teams using the button in the Overview tab.">
                </MaterialCard>
            </>
        },
    ];

    return (
        <>
            <SwitcherContainer tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
    );
}

export const TeamsPage = ({ incidentInfo }) => {
    const { getFileByID, getTeamsByFileId, deleteDocument, createTeam, createLog } = useContext(RxDBContext)

    const [teams, setTeams] = useState([]);

    const styles = pageStyles();

    useEffect(() => {
        // Load saved settings
        getTeamsByFileId(incidentInfo.id).then(query => {
            query.$.subscribe(teams => {
                setTeams(teams);
            });
        });
    }, []);

    return <View style={{ flexDirection: "column", gap: 8 }}>
        {teams.map(item => {
            if (item.removed !== true) {
                return <View style={styles.wideCard} key={item.id}>
                    <Text
                        style={styles.sectionBodyTextSmall}
                    >{item.name || "Unnamed team"}</Text>
                    <Text
                        style={styles.text}
                    >Type: {item.type || "Unnamed team"}</Text>
                </View>
            }
        })}
    </View>;
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
        text: {
            fontSize: width > 600 ? 14 : 12,
            color: colorTheme.onSurface
        },
        sectionBodyText: {
            fontSize: width > 600 ? 28 : 20,
            color: colorTheme.onSurface
        },
        sectionBodyTextSmall: {
            fontSize: 18,
            color: colorTheme.onSurface
        },
    });
}