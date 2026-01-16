import { Ionicons } from '@expo/vector-icons';
import { Banner, textStyles, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { TimerComponent } from './TimerComponent';

export const OverviewTab = ({ incidentInfo, teams, activeTeams, mapShowing }) => {
    const { width } = useWindowDimensions();
    const { colorTheme } = useContext(ThemeContext);

    const styles = getStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);

    const [enabledTeams, setEnabledTeams] = useState([]);
    const [disabledTeams, setDisabledTeams] = useState([]);

    useEffect(() => {
        let tempEnabled = [];
        let tempDisabled = [];
        activeTeams.forEach(item => {
            if (item.status !== "Inactive") {
                tempEnabled.push(<TimerComponent
                    incidentInfo={incidentInfo}
                    readOnly={true}
                    team={item}
                    teams={teams}
                    key={item.id}
                    fullWidth={mapShowing}
                />);
            } else {
                tempDisabled.push(<TimerComponent
                    incidentInfo={incidentInfo}
                    readOnly={true}
                    team={item}
                    teams={teams}
                    key={item.id}
                    fullWidth={mapShowing}
                />);
            }
        });
        setEnabledTeams(tempEnabled);
        setDisabledTeams(tempDisabled);
    }, [activeTeams]);

    return (
        <ScrollView
            contentContainerStyle={styles.mainScroll}>
            {activeTeams.length === 0 ?
                <View style={{ flexDirection: "column", maxWidth: 1200, gap: 20, alignSelf: "center" }}>
                    <View style={{ flexDirection: "column", gap: 6, paddingHorizontal: 12 }}>
                        <Text style={textStyle.pageNameText}>Howdy!</Text>
                        <Text style={textStyle.text}>Welcome to Operation Management Tools</Text>
                    </View>
                    <View style={{ flexDirection: (width > 600 ? "row" : "column"), gap: 8, flexWrap: (width > 600 ? "wrap" : "no-wrap") }}>
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="sparkles" size={24} color={colorTheme.onSurface} />}
                            title={"Changes are saved automatically"} />
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="rocket" size={24} color={colorTheme.onSurface} />}
                            title={"Tap the file name in the header to name this file and enter incident details"} />
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="people" size={24} color={colorTheme.onSurface} />}
                            title={"Teams will appear here. Create one in the \"Resources\" or \"Comms\" tabs"} />
                        <Banner
                            backgroundColor={colorTheme.surfaceContainer}
                            color={colorTheme.onSurface}
                            icon={<Ionicons name="print" size={24} color={colorTheme.onSurface} />}
                            title={"Tap the status box in the header to connect a thermal printer"} />
                        {incidentInfo.type !== "cloud" && <Banner
                            backgroundColor={colorTheme.secondaryContainer}
                            color={colorTheme.onSecondaryContainer}
                            icon={<Ionicons name="lock-closed" size={24} color={colorTheme.onSecondaryContainer} />}
                            title={"This file is stored in this browser and will be deleted if browsing data is cleared"} />}
                    </View>
                </View>
                :
                <>
                    <View style={styles.timerSection}>
                        {enabledTeams}
                    </View>
                    {disabledTeams.length > 0 ? <>
                        <Text style={[textStyle.sectionTitleText]}>Inactive teams</Text>
                        <View style={styles.timerSection}>
                            {disabledTeams}
                        </View>
                    </> : <></>
                    }
                </>
            }
        </ScrollView>
    );
}

const getStyles = (colorTheme, width) => {
    return StyleSheet.create({
        mainScroll: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingRight: 10,
            paddingLeft: 20,
            gap: 12,
            width: width > 600 ? width - 90 - 10 : width - 10
        },
        timerSection: {
            gap: 4,
            borderRadius: 26,
            overflow: 'hidden',
            flexWrap: "wrap",
            flexDirection: (width > 600) ? "row" : "column"
        },
    });
}