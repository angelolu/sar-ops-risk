import { useLocalSearchParams } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Switch, Platform } from 'react-native';
import { BackHeader, Banner, ThemeContext, FilledButton } from 'calsar-ui';
import { Ionicons } from '@expo/vector-icons';

export default function RiskGainMatrix() {
    const params = useLocalSearchParams();
    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles();

    const [isLandscape, setIsLandscape] = useState(false);
    const currentRisk = params.riskLevel || 'Unknown';

    const getHighlight = (rowRisk) => {
        if (currentRisk.toLowerCase().includes(rowRisk.toLowerCase())) {
            return {
                borderWidth: 2,
                borderColor: colorTheme.primary,
                margin: -2,
                zIndex: 10,
            };
        }
        return {};
    };

    // Matrix Content
    const lowRiskAction = "Accept the Mission. Monitor Risk Factors and reevaluate if conditions or mission/activities change.";
    const medRiskAction = "Accept the Mission. Monitor Risk Factors and employ Controls when available. Re-evaluate if conditions or mission change.";
    const medRiskHighGainAction = "Accept the Mission Only with Command Endorsement. Communicate Risk vs. Gain to Chain of Command. Implement Controls and continuously evaluate conditions and mission for change.";
    const highRiskAction = "Accept the Mission Only with Command Endorsement. Communicate Risk vs. Gain to Chain of Command. Implement Controls and monitor Risk Factors. Continuously evaluate conditions and mission change.";
    const turnDownAction = "DO NOT Accept the Mission. Communicate to Chain of Command. Wait until Risk Factors change or Controls are available to warrant Risk exposure.";

    const ShortCell = ({ text, color, gradient }) => (
        <View style={[styles.cell, { backgroundColor: gradient ? '#FFDCC4' : color }, styles.shortCell]}>
            <Text style={styles.cellText}>{text}</Text>
        </View>
    );

    const FullCell = ({ text, color, gradient }) => (
        <View style={[styles.cell, { backgroundColor: gradient ? '#FFDCC4' : color }, styles.fullCell]}>
            <Text style={styles.cellTextFull}>{text}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <BackHeader title="Risk vs Gain" />
            {isLandscape ? (
                <View>
                    <View style={styles.controls}>
                        <FilledButton
                            tonal
                            icon={isLandscape ? "phone-portrait-outline" : "phone-landscape-outline"}
                            text={isLandscape ? "Simple View" : "Full Matrix View"}
                            onPress={() => setIsLandscape(!isLandscape)}
                        />
                    </View>
                    <View style={styles.matrix}>
                        {/* Header */}
                        <View style={styles.row}>
                            <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}></Text></View>
                            <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>Low Gain</Text></View>
                            <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>Med Gain</Text></View>
                            <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>High Gain</Text></View>
                        </View>

                        {/* Low Risk */}
                        <View style={[styles.row, getHighlight('Low')]}>
                            <View style={[styles.cell, styles.riskLow, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.riskLabel}>Low Risk</Text></View>
                            {isLandscape ? (
                                <>
                                    <FullCell text={lowRiskAction} color="#b9f0b8" />
                                    <FullCell text={lowRiskAction} color="#b9f0b8" />
                                    <FullCell text={lowRiskAction} color="#b9f0b8" />
                                </>
                            ) : (
                                <>
                                    <ShortCell text="Accept" color="#b9f0b8" />
                                    <ShortCell text="Accept" color="#b9f0b8" />
                                    <ShortCell text="Accept" color="#b9f0b8" />
                                </>
                            )}
                        </View>

                        {/* Medium Risk */}
                        <View style={[styles.row, getHighlight('Medium')]}>
                            <View style={[styles.cell, styles.riskMed, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.riskLabel}>Med Risk</Text></View>
                            {isLandscape ? (
                                <>
                                    <FullCell text={medRiskAction} color="#b9f0b8" />
                                    <FullCell text={medRiskAction} color="#b9f0b8" />
                                    <FullCell text={medRiskHighGainAction} gradient />
                                </>
                            ) : (
                                <>
                                    <ShortCell text="Accept" color="#b9f0b8" />
                                    <ShortCell text="Accept" color="#b9f0b8" />
                                    <ShortCell text="Accept (Command)" gradient />
                                </>
                            )}
                        </View>

                        {/* High Risk */}
                        <View style={[styles.row, getHighlight('High')]}>
                            <View style={[styles.cell, styles.riskHigh, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.riskLabel}>High Risk</Text></View>
                            {isLandscape ? (
                                <>
                                    <FullCell text={highRiskAction} color="#ffdeae" />
                                    <FullCell text={highRiskAction} color="#ffdeae" />
                                    <FullCell text={turnDownAction} color="#ffdad6" />
                                </>
                            ) : (
                                <>
                                    <ShortCell text="Accept (Command)" color="#ffdeae" />
                                    <ShortCell text="Accept (Command)" color="#ffdeae" />
                                    <ShortCell text="Turn Down" color="#ffdad6" />
                                </>
                            )}
                        </View>
                    </View>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={[styles.section, { backgroundColor: colorTheme.surfaceContainerHighest, padding: 16, borderRadius: 20, gap: 12 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.sectionTitle}>Matrix</Text>
                            <FilledButton
                                tonal
                                small
                                rightAlign
                                icon={isLandscape ? "phone-portrait-outline" : "phone-landscape-outline"}
                                text={isLandscape ? "Simple view" : "Full view"}
                                onPress={() => setIsLandscape(!isLandscape)}
                            />
                        </View>
                        {/* MATRIX */}
                        <View style={styles.matrix}>
                            {/* Header */}
                            <View style={styles.row}>
                                <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>Risk \ Gain</Text></View>
                                <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>Low</Text></View>
                                <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>Med</Text></View>
                                <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>High</Text></View>
                            </View>

                            {/* Low Risk */}
                            <View style={[styles.row, getHighlight('Low')]}>
                                <View style={[styles.cell, styles.riskLow, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.riskLabel}>Low</Text></View>
                                {isLandscape ? (
                                    <>
                                        <FullCell text={lowRiskAction} color="#b9f0b8" />
                                        <FullCell text={lowRiskAction} color="#b9f0b8" />
                                        <FullCell text={lowRiskAction} color="#b9f0b8" />
                                    </>
                                ) : (
                                    <>
                                        <ShortCell text="Accept" color="#b9f0b8" />
                                        <ShortCell text="Accept" color="#b9f0b8" />
                                        <ShortCell text="Accept" color="#b9f0b8" />
                                    </>
                                )}
                            </View>

                            {/* Medium Risk */}
                            <View style={[styles.row, getHighlight('Medium')]}>
                                <View style={[styles.cell, styles.riskMed, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.riskLabel}>Med</Text></View>
                                {isLandscape ? (
                                    <>
                                        <FullCell text={medRiskAction} color="#b9f0b8" />
                                        <FullCell text={medRiskAction} color="#b9f0b8" />
                                        <FullCell text={medRiskHighGainAction} gradient />
                                    </>
                                ) : (
                                    <>
                                        <ShortCell text="Accept" color="#ffdeae" />
                                        <ShortCell text="Accept" color="#ffdeae" />
                                        <ShortCell text="Accept (Command)" gradient />
                                    </>
                                )}
                            </View>

                            {/* High Risk */}
                            <View style={[styles.finalRow, getHighlight('High')]}>
                                <View style={[styles.cell, styles.riskHigh, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.riskLabel}>High</Text></View>
                                {isLandscape ? (
                                    <>
                                        <FullCell text={highRiskAction} color="#ffdad6" />
                                        <FullCell text={highRiskAction} color="#ffdad6" />
                                        <FullCell text={turnDownAction} color="#ffdad6" />
                                    </>
                                ) : (
                                    <>
                                        <ShortCell text="Accept (Command)" color="#ffdad6" />
                                        <ShortCell text="Accept (Command)" color="#ffdad6" />
                                        <ShortCell text="Turn Down" color="#ffdad6" />
                                    </>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* LEGEND / DEFINITIONS */}

                    <View style={[styles.section, { backgroundColor: colorTheme.surfaceContainerHighest, padding: 16, borderRadius: 20 }]}>
                        <Text style={styles.sectionTitle}>Gain definitions</Text>
                        <Text style={styles.legendText}><Text style={styles.bold}>Low Gain:</Text> Unstable situation, property only, evidence search.</Text>
                        <Text style={styles.legendText}><Text style={styles.bold}>Medium Gain:</Text> Stable patient, environment is stable.</Text>
                        <Text style={styles.legendText}><Text style={styles.bold}>High Gain:</Text> Life saving opportunity, immediate threat to life.</Text>
                    </View>

                    <View style={[styles.section, { backgroundColor: colorTheme.surfaceContainerHighest, padding: 16, borderRadius: 20 }]}>
                        <Text style={styles.sectionTitle}>Mitigation models (STAAR)</Text>
                        <Text style={styles.legendText}>If risks need to be mitigated, consider the STAAR model:</Text>
                        <View style={styles.staarContainer}>
                            <Text style={styles.legendText}>• <Text style={styles.bold}>S</Text>pread Out</Text>
                            <Text style={styles.legendText}>• <Text style={styles.bold}>T</Text>ransfer</Text>
                            <Text style={styles.legendText}>• <Text style={styles.bold}>A</Text>void</Text>
                            <Text style={styles.legendText}>• <Text style={styles.bold}>A</Text>ccept</Text>
                            <Text style={styles.legendText}>• <Text style={styles.bold}>R</Text>educe</Text>
                        </View>
                    </View>

                    <View style={[styles.section, { backgroundColor: colorTheme.surfaceContainerHighest, padding: 16, borderRadius: 20 }]}>
                        <Text style={styles.sectionTitle}>Team consensus</Text>
                        <Text style={[styles.legendText, { marginBottom: 10 }]}>Before going into the field, the team should have a consensus on:</Text>
                        <View style={styles.staarContainer}>
                            <Text style={styles.legendText}>• General risk level of the mission</Text>
                            <Text style={styles.legendText}>• Mitigations and controls</Text>
                            <Text style={styles.legendText}>• Risk vs Gain</Text>
                            <Text style={styles.legendText}>• <Text style={styles.bold}>Go / No Go Decision</Text></Text>
                        </View>

                        {currentRisk.toLowerCase().includes('high') && (
                            <Banner
                                backgroundColor={colorTheme.errorContainer}
                                color={colorTheme.onErrorContainer}
                                icon={<Ionicons name="warning" size={24} color={colorTheme.onErrorContainer} />}
                                title="High risk factor missions require leadership endorsement. Only proceed for higher gain missions."
                                marginTop={12}
                            />
                        )}
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </View>
    );
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colorTheme.background,
        },
        scroll: {
            padding: 16,
            gap: 16,
        },
        matrix: {
            borderWidth: 1,
            borderColor: colorTheme.outline,
            backgroundColor: colorTheme.surfaceContainerLow,
            borderRadius: 20,
            overflow: 'hidden',
        },
        row: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: colorTheme.outline,
        },
        finalRow: {
            flexDirection: 'row',
            borderBottomWidth: 0,
        },
        cell: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 6,
            borderRightWidth: 1,
            borderColor: colorTheme.outline,
        },
        shortCell: {
            flex: 1,
            minHeight: 60,
        },
        fullCell: {
            width: 150, // Fixed width for horizontal scrolling if needed, or flex if landscape implies mostly wider screen
            flex: 1,
            minHeight: 120, // Taller rows for text
        },
        headerCell: {
        },
        headerText: {
            fontWeight: 'bold',
            color: colorTheme.onSurface
        },
        riskHigh: { backgroundColor: colorTheme.garRedContainer },
        riskMed: { backgroundColor: colorTheme.garAmberContainer },
        riskLow: { backgroundColor: colorTheme.garGreenContainer },
        cellText: {
            fontSize: 12,
            textAlign: 'center',
            color: '#000000',
            fontWeight: '500'
        },
        cellTextFull: {
            fontSize: 11,
            textAlign: 'center',
            color: '#000000'
        },
        riskLabel: {
            fontWeight: 'bold',
            color: colorTheme.onSurface
        },
        section: {
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colorTheme.onSurface,
            marginBottom: 8
        },
        legendText: {
            color: colorTheme.onSurface,
            marginBottom: 4,
            lineHeight: 20
        },
        staarContainer: {
            marginLeft: 10,
            marginTop: 4
        },
        bold: {
            fontWeight: 'bold'
        },
        controls: {
            flexDirection: 'column',
            padding: 16,
        }
    });
}
