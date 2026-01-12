import { Ionicons } from '@expo/vector-icons';
import { BackHeader, Banner, FilledButton, MaterialCard, ThemeContext } from 'calsar-ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { default as React, useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function RiskGainMatrix() {
    const params = useLocalSearchParams();
    const { colorTheme } = useContext(ThemeContext);
    const styles = getStyles(colorTheme);
    const { width, height } = useWindowDimensions();

    const [isLandscape, setIsLandscape] = useState(false);
    const currentRisk = params.riskLevel || 'Unknown';

    // Modern, vibrant GAR colors from theme
    const riskColors = {
        low: {
            bg: '#238823', // Light green that works in both modes
            text: '#ffffff', // Dark green text for contrast
        },
        medium: {
            bg: '#CC9900', // Light amber/yellow that works in both modes
            text: '#ffffff', // Dark brown text for contrast
        },
        high: {
            bg: '#ba1a1a', // Light red that works in both modes
            text: '#ffffff', // Dark red text for contrast
        }
    };

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

    const getRiskCellHighlight = (rowRisk) => {
        if (currentRisk.toLowerCase().includes(rowRisk.toLowerCase())) {
            return {
                highlight: true,
                backgroundColor: colorTheme.primaryContainer,
                textColor: colorTheme.onPrimaryContainer,
            };
        }
        return { highlight: false };
    };

    // Matrix Content
    const lowRiskAction = "Accept the Mission. Monitor Risk Factors and reevaluate if conditions or mission/activities change.";
    const medRiskAction = "Accept the Mission. Monitor Risk Factors and employ Controls when available. Re-evaluate if conditions or mission change.";
    const medRiskHighGainAction = "Accept the Mission Only with Command Endorsement. Communicate Risk vs. Gain to Chain of Command. Implement Controls and continuously evaluate conditions and mission for change.";
    const highRiskAction = "Accept the Mission Only with Command Endorsement. Communicate Risk vs. Gain to Chain of Command. Implement Controls and monitor Risk Factors. Continuously evaluate conditions and mission change.";
    const turnDownAction = "DO NOT Accept the Mission. Communicate to Chain of Command. Wait until Risk Factors change or Controls are available to warrant Risk exposure.";

    const ShortCell = ({ text, color, gradient1, gradient2, cellWidth, cellHeight }) => {
        // Calculate responsive font size based on cell dimensions
        const baseFontSize = Math.min(cellWidth / 8, cellHeight / 5, 14);

        if (gradient1, gradient2) {
            return (
                <LinearGradient
                    colors={[gradient1, gradient2]}
                    start={{ x: 0.5, y: 0 }} // Start at Top-Left
                    end={{ x: 1, y: 1 }}   // End at Bottom-Right
                    style={[styles.cell, styles.shortCell, { flex: 1 }]}
                >
                    <Text style={[styles.cellText, { fontSize: baseFontSize, color: riskColors.high.text }]}>
                        {text}
                    </Text>
                </LinearGradient>
            );
        }

        return (
            <View style={[styles.cell, { backgroundColor: color }, styles.shortCell]}>
                <Text style={[styles.cellText, { fontSize: baseFontSize, color: color === riskColors.low.bg ? riskColors.low.text : color === riskColors.medium.bg ? riskColors.medium.text : riskColors.high.text }]}>{text}</Text>
            </View>
        );
    };

    const FullCell = ({ text, color, gradient1, gradient2, cellWidth, cellHeight }) => {
        // Calculate responsive font size for full cells
        const baseFontSize = Math.min(cellWidth / 5, cellHeight / 10, 14);

        if (gradient1, gradient2) {
            return (
                <LinearGradient
                    colors={[gradient1, gradient2]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.cell, styles.fullCell]}
                >
                    <Text style={[styles.cellTextFull, { fontSize: baseFontSize, color: riskColors.high.text }]}>{text}</Text>
                </LinearGradient>
            );
        }

        return (
            <View style={[styles.cell, { backgroundColor: color }, styles.fullCell]}>
                <Text style={[styles.cellTextFull, { fontSize: baseFontSize, color: color === riskColors.low.bg ? riskColors.low.text : color === riskColors.medium.bg ? riskColors.medium.text : riskColors.high.text }]}>{text}</Text>
            </View>
        );
    };

    // Calculate cell dimensions for responsive text sizing
    const cellWidth = isLandscape ? 150 : width / 4;
    const cellHeight = isLandscape ? 120 : 60;

    return (
        <View style={styles.container}>
            <BackHeader title="PEAACE Interpretation" />
            {isLandscape ? (
                <ScrollView contentContainerStyle={[styles.landscapeScroll, { flexGrow: 1 }]}>
                    <View style={styles.controls}>
                        <FilledButton
                            tonal
                            small
                            icon={isLandscape ? "phone-portrait-outline" : "phone-landscape-outline"}
                            text={isLandscape ? "Simple View" : "Full Matrix View"}
                            onPress={() => setIsLandscape(!isLandscape)}
                        />
                    </View>
                    <View style={[styles.matrix, { flexGrow: 1 }]}>
                        {/* Header */}
                        <View style={[styles.row, { flexGrow: 1 }]}>
                            <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}></Text></View>
                            <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>High Gain</Text></View>
                            <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>Med Gain</Text></View>
                            <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>Low Gain</Text></View>
                        </View>

                        {/* Low Risk */}
                        <View style={[styles.row, getHighlight('Low'), { flexGrow: 1 }]}>
                            <View style={[styles.cell, styles.riskLow, getRiskCellHighlight('Low').highlight && { backgroundColor: colorTheme.primaryContainer }, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={[styles.riskLabel, { color: getRiskCellHighlight('Low').highlight ? colorTheme.onPrimaryContainer : colorTheme.onSurface }]}>Low Risk</Text></View>
                            {isLandscape ? (
                                <>
                                    <FullCell text={lowRiskAction} color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <FullCell text={lowRiskAction} color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <FullCell text={lowRiskAction} color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                </>
                            ) : (
                                <>
                                    <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                </>
                            )}
                        </View>

                        {/* Medium Risk */}
                        <View style={[styles.row, getHighlight('Medium'), { flexGrow: 1 }]}>
                            <View style={[styles.cell, styles.riskMed, getRiskCellHighlight('Medium').highlight && { backgroundColor: colorTheme.primaryContainer }, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={[styles.riskLabel, { color: getRiskCellHighlight('Medium').highlight ? colorTheme.onPrimaryContainer : colorTheme.onSurface }]}>Med Risk</Text></View>
                            {isLandscape ? (
                                <>
                                    <FullCell text={medRiskAction} color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <FullCell text={medRiskAction} color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <FullCell text={medRiskHighGainAction} gradient1={riskColors.medium.bg} gradient2={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                </>
                            ) : (
                                <>
                                    <ShortCell text="Accept" color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <ShortCell text="Accept" color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <ShortCell text="Accept (Command)" gradient1={riskColors.medium.bg} gradient2={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                </>
                            )}
                        </View>

                        {/* High Risk */}
                        <View style={[styles.row, getHighlight('High'), { flexGrow: 1 }]}>
                            <View style={[styles.cell, styles.riskHigh, getRiskCellHighlight('High').highlight && { backgroundColor: colorTheme.primaryContainer }, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={[styles.riskLabel, { color: getRiskCellHighlight('High').highlight ? colorTheme.onPrimaryContainer : colorTheme.onSurface }]}>High Risk</Text></View>
                            {isLandscape ? (
                                <>
                                    <FullCell text={highRiskAction} color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <FullCell text={highRiskAction} color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <FullCell text={turnDownAction} color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                </>
                            ) : (
                                <>
                                    <ShortCell text="Accept (Command)" color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <ShortCell text="Accept (Command)" color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    <ShortCell text="Turn Down" color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                </>
                            )}
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll}>
                    {currentRisk.toLowerCase().includes('high') && (
                        <Banner
                            backgroundColor={colorTheme.errorContainer}
                            color={colorTheme.onErrorContainer}
                            icon={<Ionicons name="warning" size={24} color={colorTheme.onErrorContainer} />}
                            title="High risk factor missions require leadership endorsement. Only proceed for high gain missions."
                        />
                    )}

                    <MaterialCard noMargin>
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
                                <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}></Text></View>
                                <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>High Gain</Text></View>
                                <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>Med Gain</Text></View>
                                <View style={[styles.cell, styles.headerCell, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={styles.headerText}>Low Gain</Text></View>
                            </View>

                            {/* Low Risk */}
                            <View style={[styles.row, getHighlight('Low')]}>
                                <View style={[styles.cell, styles.riskLow, getRiskCellHighlight('Low').highlight && { backgroundColor: colorTheme.primaryContainer }, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={[styles.riskLabel, { color: getRiskCellHighlight('Low').highlight ? colorTheme.onPrimaryContainer : colorTheme.onSurface }]}>Low Risk</Text></View>
                                {isLandscape ? (
                                    <>
                                        <FullCell text={lowRiskAction} color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <FullCell text={lowRiskAction} color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <FullCell text={lowRiskAction} color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    </>
                                ) : (
                                    <>
                                        <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    </>
                                )}
                            </View>

                            {/* Medium Risk */}
                            <View style={[styles.row, getHighlight('Medium')]}>
                                <View style={[styles.cell, styles.riskMed, getRiskCellHighlight('Medium').highlight && { backgroundColor: colorTheme.primaryContainer }, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={[styles.riskLabel, { color: getRiskCellHighlight('Medium').highlight ? colorTheme.onPrimaryContainer : colorTheme.onSurface }]}>Med Risk</Text></View>
                                {isLandscape ? (
                                    <>
                                        <FullCell text={medRiskAction} color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <FullCell text={medRiskAction} color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <FullCell text={medRiskHighGainAction} gradient1={riskColors.medium.bg} gradient2={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    </>
                                ) : (
                                    <>
                                        <ShortCell text="Accept" color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <ShortCell text="Accept" color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <ShortCell text="Accept (Command)" gradient1={riskColors.medium.bg} gradient2={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    </>
                                )}
                            </View>

                            {/* High Risk */}
                            <View style={[styles.finalRow, getHighlight('High')]}>
                                <View style={[styles.cell, styles.riskHigh, getRiskCellHighlight('High').highlight && { backgroundColor: colorTheme.primaryContainer }, isLandscape ? styles.fullCell : styles.shortCell]}><Text style={[styles.riskLabel, { color: getRiskCellHighlight('High').highlight ? colorTheme.onPrimaryContainer : colorTheme.onSurface }]}>High Risk</Text></View>
                                {isLandscape ? (
                                    <>
                                        <FullCell text={highRiskAction} color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <FullCell text={highRiskAction} color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <FullCell text={turnDownAction} color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    </>
                                ) : (
                                    <>
                                        <ShortCell text="Accept (Command)" color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <ShortCell text="Accept (Command)" color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                        <ShortCell text="Turn Down" color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                                    </>
                                )}
                            </View>
                        </View>
                        <Text style={[styles.legendText, { opacity: 0.8, fontStyle: 'italic', marginTop: 6 }]}>Match your mission to a gain category to find the corresponding matrix cell.</Text>
                    </MaterialCard>

                    {/* LEGEND / DEFINITIONS */}

                    <MaterialCard title="Gain definitions" noMargin>
                        <View>
                            <Text style={styles.legendText}><Text style={styles.bold}>Low Gain:</Text> Routine training, PR, property recovery or evidence search. Use for low-risk conditions only.</Text>
                            <Text style={styles.legendText}><Text style={styles.bold}>Medium Gain:</Text> Stable patient or environment, noncritical injury or protecting significant property.</Text>
                            <Text style={styles.legendText}><Text style={styles.bold}>High Gain:</Text> Lifesaving opportunity, immediate threat to life or preventing permanent injury.</Text>
                        </View>
                    </MaterialCard>

                    <MaterialCard title="Mitigation models (STAAR)" noMargin>
                        <View>
                            <Text style={[styles.legendText, { marginBottom: 6 }]}>If risks need to be mitigated, consider the STAAR model:</Text>
                            <View style={styles.staarContainer}>
                                <Text style={styles.legendText}>• <Text style={styles.bold}>S</Text>pread Out</Text>
                                <Text style={styles.legendText}>• <Text style={styles.bold}>T</Text>ransfer</Text>
                                <Text style={styles.legendText}>• <Text style={styles.bold}>A</Text>void</Text>
                                <Text style={styles.legendText}>• <Text style={styles.bold}>A</Text>ccept</Text>
                                <Text style={styles.legendText}>• <Text style={styles.bold}>R</Text>educe</Text>
                            </View>
                        </View>
                    </MaterialCard>

                    <MaterialCard title="Team consensus" noMargin>
                        <View>
                            <Text style={[styles.legendText, { marginBottom: 6 }]}>Before going into the field, the team should have a consensus on:</Text>
                            <View style={styles.staarContainer}>
                                <Text style={styles.legendText}>• General risk level of the mission</Text>
                                <Text style={styles.legendText}>• Mitigations and controls</Text>
                                <Text style={styles.legendText}>• Risk vs Gain</Text>
                                <Text style={styles.legendText}>• <Text style={styles.bold}>Go / No Go Decision</Text></Text>
                            </View>
                        </View>
                    </MaterialCard>
                </ScrollView>
            )}
        </View>
    );
}

const getStyles = (colorTheme) => {

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colorTheme.background,
        },
        scroll: {
            padding: 16,
            gap: 10,
        },
        landscapeScroll: {
            padding: 16,
        },
        matrix: {
            borderWidth: 1,
            borderColor: colorTheme.outline,
            backgroundColor: colorTheme.surfaceContainerLow,
            borderRadius: 20,
            overflow: 'hidden',
            flexGrow: 1,
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
            width: 150,
            flex: 1,
            minHeight: 120,
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
            textAlign: 'center',
            fontWeight: '500'
        },
        cellTextFull: {
            textAlign: 'center',
        },
        riskLabel: {
            fontWeight: 'bold',
        },
        section: {
        },
        sectionTitle: {
            fontSize: 20,
            color: colorTheme.primary,
            fontFamily: 'Outfit_600SemiBold'
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
            paddingBottom: 10,
        }
    });
}
