import { textStyles, ThemeContext } from 'calsar-ui';
import { LinearGradient } from 'expo-linear-gradient';
import { default as React, useContext } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function RiskGainGrid({ riskLevel = 'Unknown', gainLevel = 'Unknown', onGainHeaderPress, isLandscape = false }) {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);
    const styles = getStyles(colorTheme, isLandscape);

    // Modern, vibrant GAR colors from theme
    const riskColors = {
        low: {
            bg: '#238823', // Light green
            text: '#ffffff',
        },
        medium: {
            bg: '#CC9900', // Light amber/yellow
            text: '#ffffff',
        },
        high: {
            bg: '#ba1a1a', // Light red
            text: '#ffffff',
        }
    };

    const isCellSelected = (rowRisk, colGain) => {
        if (!riskLevel || !gainLevel) return false;

        const r = riskLevel.toLowerCase();
        const g = gainLevel.toLowerCase();
        const row = rowRisk.toLowerCase();
        const col = colGain.toLowerCase();

        return r.includes(row) && g.includes(col);
    };

    // Header highlight for Gain
    // Lighter background than default with normal text color/weight when not selected.
    // When selected: bold, primary background, primary text.
    const getGainHeaderHighlight = (colGain) => {
        if (gainLevel && gainLevel.toLowerCase().includes(colGain.toLowerCase())) {
            return {
                container: { backgroundColor: colorTheme.primaryContainer },
                text: { color: colorTheme.onPrimaryContainer, fontWeight: 'bold' }
            };
        }
        return {
            container: { backgroundColor: colorTheme.surfaceContainer }, // Lighter background
            text: { color: colorTheme.onSurface, fontWeight: 'normal' }
        };
    }

    const getRiskHeaderHighlight = (rowRisk) => {
        if (riskLevel && riskLevel.toLowerCase().includes(rowRisk.toLowerCase())) {
            return {
                container: { backgroundColor: colorTheme.primaryContainer },
                text: { color: colorTheme.onPrimaryContainer, fontWeight: 'bold' }
            };
        }
        return {
            container: { backgroundColor: colorTheme.surfaceContainer }, // Lighter background
            text: { color: colorTheme.onSurface, fontWeight: 'normal' }
        };
    }

    // Content Definitions
    const lowRiskAction = "Accept the Mission. Monitor Risk Factors and reevaluate if conditions or mission/activities change.";
    const medRiskAction = "Accept the Mission. Monitor Risk Factors and employ Controls when available. Re-evaluate if conditions or mission change.";
    const medRiskStrictAction = "Accept the Mission Only with Command Endorsement. Communicate Risk vs. Gain to Chain of Command. Implement Controls and continuously evaluate conditions and mission for change.";
    const highRiskAction = "Accept the Mission Only with Command Endorsement. Communicate Risk vs. Gain to Chain of Command. Implement Controls and monitor Risk Factors. Continuously evaluate conditions and mission change.";
    const turnDownAction = "DO NOT Accept the Mission. Communicate to Chain of Command. Wait until Risk Factors change or Controls are available to warrant Risk exposure.";

    const ShortCell = ({ text, color, gradient1, gradient2, cellWidth, cellHeight, isSelected }) => {
        const baseFontSize = Math.min(cellWidth / 8, cellHeight / 5, 14);
        const textColor = (gradient1 && gradient2) ? riskColors.high.text : (color === riskColors.low.bg ? riskColors.low.text : color === riskColors.medium.bg ? riskColors.medium.text : riskColors.high.text);

        const cellTextStyle = {
            fontSize: baseFontSize,
            color: textColor,
            fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_400Regular',
            fontWeight: isSelected ? 'bold' : 'normal',
            textAlign: 'center'
        };

        if (gradient1 && gradient2) {
            return (
                <LinearGradient
                    colors={[gradient1, gradient2]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.cellContent]}
                >
                    <Text style={cellTextStyle}>{text}</Text>
                </LinearGradient>
            );
        }

        return (
            <View style={[styles.cellContent, { backgroundColor: color }]}>
                <Text style={cellTextStyle}>{text}</Text>
            </View>
        );
    };

    const FullCell = ({ text, color, gradient1, gradient2, cellWidth, cellHeight, isSelected }) => {
        // Increased font size for desktop/landscape, reduced for mobile portrait (Full Matrix View on phone)
        const isNarrow = width < 600;
        const maxFontSize = isNarrow ? 12 : 16;

        const baseFontSize = Math.min(cellWidth / 6, cellHeight / 6, maxFontSize);
        const textColor = (gradient1 && gradient2) ? riskColors.high.text : (color === riskColors.low.bg ? riskColors.low.text : color === riskColors.medium.bg ? riskColors.medium.text : riskColors.high.text);

        const cellTextStyle = {
            fontSize: baseFontSize,
            color: textColor,
            fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_400Regular',
            fontWeight: isSelected ? 'bold' : 'normal',
            textAlign: 'center'
        };

        if (gradient1 && gradient2) {
            return (
                <LinearGradient
                    colors={[gradient1, gradient2]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.cellContent]}
                >
                    <Text style={cellTextStyle}>{text}</Text>
                </LinearGradient>
            );
        }

        return (
            <View style={[styles.cellContent, { backgroundColor: color }]}>
                <Text style={cellTextStyle}>{text}</Text>
            </View>
        );
    };

    const cellWidth = isLandscape ? 150 : width / 4;
    const cellHeight = isLandscape ? 120 : 60;

    const HeaderCell = ({ title, gainType, style }) => {
        const highlight = getGainHeaderHighlight(gainType);
        return (
            <Pressable
                onPress={onGainHeaderPress}
                style={({ pressed }) => [
                    styles.cell,
                    isLandscape ? styles.headerCellLandscape : styles.shortCell,
                    highlight.container,
                    style,
                    { opacity: pressed ? 0.7 : 1 }
                ]}
            >
                <Text style={[textStyle.bodyMedium, highlight.text, { textAlign: 'center' }]}>{title}</Text>
            </Pressable>
        )
    }

    // Row wrapper component to handle border highlight for Risk Only (legacy/no gain selected)
    const RiskRow = ({ risk, children, isFinal }) => {
        const isSelected = (!gainLevel || gainLevel === 'Unknown') && riskLevel && riskLevel.toLowerCase().includes(risk.toLowerCase());
        return (
            <View style={[
                styles.row,
                isLandscape && styles.expandedRow, // Use flex: 1 in landscape
                isFinal && styles.finalRow,
            ]}>
                {children}
                {isSelected && <View style={[styles.absoluteSelectionRows, { borderRadius: 12, borderWidth: 3 }]} pointerEvents="none" />}
            </View>
        )
    }

    // Risk Label Cell
    const RiskLabelCell = ({ risk }) => {
        const highlight = getRiskHeaderHighlight(risk);
        return (
            <View style={[
                styles.cell,
                isLandscape ? styles.fullCell : styles.shortCell,
                highlight.container
            ]}>
                {/* Selection Overlay handled by RiskRow or CellWrapper for specific cells, but if we need to highlight the label itself: */}
                {/* Actually, getRiskHeaderHighlight handles the background/text color for the simple cell */}
                <Text style={[textStyle.bodyMedium, highlight.text, { textAlign: 'center' }]}>
                    {risk === 'Medium' ? 'Med Risk' : `${risk} Risk`}
                </Text>
            </View>
        )
    }

    const CellWrapper = ({ risk, gain, gains, children, style }) => {
        const selected = gains ? gains.some(g => isCellSelected(risk, g)) : isCellSelected(risk, gain);
        // Clone child to pass isSelected
        const childWithProp = React.cloneElement(children, { isSelected: selected });

        return (
            <View style={[
                styles.cell,
                isLandscape ? styles.fullCell : styles.shortCell,
                style
            ]}>
                {/* Content - Fills the cell */}
                {childWithProp}

                {/* Selection Overlay - Absolute Positioned to NOT affect layout */}
                {selected && <View style={styles.absoluteSelection} pointerEvents="none" />}
            </View>
        )
    }

    return (
        <View style={[styles.matrix, isLandscape && { flex: 1 }]}>
            {/* Header - Fixed height relative to content */}
            <View style={[styles.row, isLandscape && { flexGrow: 0 }]}>
                <View style={[styles.cell, isLandscape ? styles.headerCellLandscape : styles.shortCell, { backgroundColor: colorTheme.surface }]}>
                    <Text style={textStyle.bodyMedium}></Text>
                </View>
                <HeaderCell title="High Gain" gainType="High" />
                <HeaderCell title="Med Gain" gainType="Medium" />
                <HeaderCell title="Low Gain" gainType="Low" style={{ borderRightWidth: 0 }} />
            </View>

            {/* Low Risk Row */}
            <RiskRow risk="Low">
                <RiskLabelCell risk="Low" />

                {isLandscape ? (
                    /* Merged Cell for Low Risk (All Gains) */
                    <CellWrapper risk="Low" gains={['High', 'Medium', 'Low']} style={{ flex: 3, borderRightWidth: 0 }}>
                        <FullCell text={lowRiskAction} color={riskColors.low.bg} cellWidth={cellWidth * 3} cellHeight={cellHeight} />
                    </CellWrapper>
                ) : (
                    <>
                        {/* High Gain (Low Risk) */}
                        <CellWrapper risk="Low" gain="High">
                            <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>

                        {/* Med Gain (Low Risk) */}
                        <CellWrapper risk="Low" gain="Medium">
                            <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>

                        {/* Low Gain (Low Risk) */}
                        <CellWrapper risk="Low" gain="Low" style={{ borderRightWidth: 0 }}>
                            <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>
                    </>
                )}
            </RiskRow>

            {/* Medium Risk Row */}
            <RiskRow risk="Medium">
                <RiskLabelCell risk="Medium" />

                {isLandscape ? (
                    <>
                        {/* Merged High & Medium Gain */}
                        <CellWrapper risk="Medium" gains={['High', 'Medium']} style={{ flex: 2 }}>
                            <FullCell text={medRiskAction} color={riskColors.medium.bg} cellWidth={cellWidth * 2} cellHeight={cellHeight} />
                        </CellWrapper>

                        {/* Low Gain */}
                        <CellWrapper risk="Medium" gain="Low" style={{ borderRightWidth: 0 }}>
                            <FullCell text={medRiskStrictAction} gradient1={riskColors.medium.bg} gradient2={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>
                    </>
                ) : (
                    <>
                        {/* High Gain (Medium Risk) - Accept */}
                        <CellWrapper risk="Medium" gain="High">
                            <ShortCell text="Accept" color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>

                        {/* Med Gain (Medium Risk) - Accept */}
                        <CellWrapper risk="Medium" gain="Medium">
                            <ShortCell text="Accept" color={riskColors.medium.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>

                        {/* Low Gain (Medium Risk) - Accept (Command) / Gradient */}
                        <CellWrapper risk="Medium" gain="Low" style={{ borderRightWidth: 0 }}>
                            <ShortCell text="Accept (Command)" gradient1={riskColors.medium.bg} gradient2={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>
                    </>
                )}
            </RiskRow>

            {/* High Risk Row */}
            <RiskRow risk="High" isFinal>
                <RiskLabelCell risk="High" />

                {isLandscape ? (
                    <>
                        {/* Merged High & Medium Gain */}
                        <CellWrapper risk="High" gains={['High', 'Medium']} style={{ flex: 2 }}>
                            <FullCell text={highRiskAction} color={riskColors.high.bg} cellWidth={cellWidth * 2} cellHeight={cellHeight} />
                        </CellWrapper>

                        {/* Low Gain */}
                        <CellWrapper risk="High" gain="Low" style={{ borderRightWidth: 0 }}>
                            <FullCell text={turnDownAction} color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>
                    </>
                ) : (
                    <>
                        {/* High Gain */}
                        <CellWrapper risk="High" gain="High">
                            <ShortCell text="Accept (Command)" color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>

                        {/* Med Gain */}
                        <CellWrapper risk="High" gain="Medium">
                            <ShortCell text="Accept (Command)" color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>

                        {/* Low Gain */}
                        <CellWrapper risk="High" gain="Low" style={{ borderRightWidth: 0 }}>
                            <ShortCell text="Turn Down" color={riskColors.high.bg} cellWidth={cellWidth} cellHeight={cellHeight} />
                        </CellWrapper>
                    </>
                )}
            </RiskRow>
        </View>
    );
};

// Extracted Strings
export const MATRIX_CONTENT = {
    lowRisk: "Accept the mission. Monitor risk factors and reevaluate if conditions or mission/activities change.",
    medRisk: "Accept the mission. Monitor risk factors and employ controls when available. Re-evaluate if conditions or mission change.",
    medRiskStrict: "Accept the mission only with command endorsement. Communicate risk vs. gain to chain of command. Implement controls and continuously evaluate conditions and mission for change.",
    highRisk: "Accept the mission only with command endorsement. Communicate risk vs. gain to chain of command. Implement controls and monitor risk factors. Continuously evaluate conditions and mission change.",
    turnDown: "DO NOT accept the mission. Communicate to chain of command. Wait until risk factors change or controls are available to warrant risk exposure."
};

const getStyles = (colorTheme, isLandscape) => {
    return StyleSheet.create({
        matrix: {
            width: '100%',
            borderWidth: 1,
            borderColor: colorTheme.outline,
            backgroundColor: colorTheme.surfaceContainerLow,
            borderRadius: 12,
            overflow: 'hidden',
        },
        row: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: colorTheme.outline,
            position: 'relative', // For row highlight
        },
        expandedRow: {
            flex: 1, // Distribute available vertical space
        },
        finalRow: {
            flexDirection: 'row',
            borderBottomWidth: 0,
        },
        cell: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0, // No padding so inner content fills cell
            // To prevent double borders we can use borderRightWidth only
            borderRightWidth: 1,
            borderColor: colorTheme.outline,
            position: 'relative',
        },
        cellContent: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 6, // Padding for text inside
        },
        shortCell: {
            flex: 1,
            height: 60, // Fixed height specifically for portrait mode functionality
            overflow: 'hidden',
        },
        fullCell: {
            width: 150,
            flex: 1,
            minHeight: 120, // Keep safe minimums, but flex will expand it
        },
        headerCellLandscape: {
            width: 150,
            flex: 1,
            minHeight: 60, // Shorter than content cells in landscape
        },
        absoluteSelection: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderWidth: 3,
            borderColor: colorTheme.primary,
            zIndex: 10,
        },
        absoluteSelectionRows: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderWidth: 3,
            borderColor: colorTheme.primary,
            zIndex: 10,
            borderRadius: 12
        }
    });
}
