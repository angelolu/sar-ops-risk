import { textStyles, ThemeContext } from 'calsar-ui';
import { LinearGradient } from 'expo-linear-gradient';
import { default as React, useContext } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

/**
 * Risk vs Gain Matrix Grid
 *
 * @param {Object} props
 * @param {string} props.riskLevel - 'Low', 'Medium', 'High'
 * @param {string} props.gainLevel - 'Low', 'Medium', 'High'
 * @param {function} props.onGainHeaderPress - Callback when gain header is pressed
 * @param {boolean} props.detailedMode - If true, displays the full/detailed matrix content (merged cells with descriptions). If false, displays the compact clickable grid.
 */
export default function RiskGainGrid({ riskLevel = 'Unknown', gainLevel = 'Unknown', onGainHeaderPress, detailedMode = false }) {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

    // Increasing threshold to 1000 to ensure variable width logic applies to tablets/landscape phones too, preventing overflow in Low Gain column.
    const isNarrow = width < 1000;

    // Column Flex Ratios to give "Low Gain" more space on narrow screens (Detailed Mode Only)
    const COLUMN_FLEX_DETAILED = {
        header: 0.6,
        high: 0.9,
        medium: 0.9,
        low: 1.4
    };

    const styles = getStyles(colorTheme, detailedMode, isNarrow);

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
        // Approximate width if not provided
        const w = cellWidth || (width / 4);
        const h = cellHeight || 60;

        const baseFontSize = Math.min(w / 8, h / 3, 14);
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

    const FullCell = ({ text, color, gradient1, gradient2, cellWidth, isSelected }) => {
        // Dynamic scaling: 12px min for phones, up to 15px for tablets/desktop.
        // width / 45 gives approx 14.4px at 650px width, filling space better.
        const fontSize = Math.max(12, Math.min(15, width / 45));

        // If cellWidth isn't provided or is messy, use a default approximation
        const safeCellWidth = cellWidth || 100;

        const textColor = (gradient1 && gradient2) ? riskColors.high.text : (color === riskColors.low.bg ? riskColors.low.text : color === riskColors.medium.bg ? riskColors.medium.text : riskColors.high.text);

        const cellTextStyle = {
            fontSize: fontSize,
            color: textColor,
            fontFamily: isSelected ? 'Outfit_600SemiBold' : 'Outfit_400Regular',
            fontWeight: isSelected ? 'bold' : 'normal',
            textAlign: 'center',
            lineHeight: fontSize * 1.3
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

    const cellWidth = detailedMode ? 150 : width / 4;
    const cellHeight = detailedMode ? 120 : 60;

    const HeaderCell = ({ title, gainType, style }) => {
        const highlight = getGainHeaderHighlight(gainType);

        // Portrait specific flex for Detailed Mode.
        // For Compact Mode (not detailed), we revert to equal flex (or no flex override, letting styles.cell handle it with flex: 1)
        let flexStyle = {};
        if (isNarrow && detailedMode) {
            if (gainType === 'High') flexStyle = { flex: COLUMN_FLEX_DETAILED.high };
            if (gainType === 'Medium') flexStyle = { flex: COLUMN_FLEX_DETAILED.medium };
            if (gainType === 'Low') flexStyle = { flex: COLUMN_FLEX_DETAILED.low };
        } else if (detailedMode) {
            flexStyle = { flex: 1 };
        }

        if (detailedMode) {
            return (
                <View
                    style={[
                        styles.cell,
                        styles.headerCellDetailed,
                        flexStyle,
                        highlight.container,
                        style
                    ]}
                >
                    <Text style={[textStyle.bodyMedium, highlight.text, { textAlign: 'center' }]}>{title}</Text>
                </View>
            );
        }

        return (
            <Pressable
                onPress={onGainHeaderPress}
                style={({ pressed }) => [
                    styles.cell,
                    detailedMode ? styles.headerCellDetailed : styles.shortCell,
                    flexStyle,
                    highlight.container,
                    style,
                    { opacity: pressed ? 0.7 : 1 }
                ]}
            >
                <Text style={[textStyle.bodyMedium, highlight.text, { textAlign: 'center' }]}>{title}</Text>
            </Pressable>
        )
    }

    // Row wrapper
    const RiskRow = ({ risk, children, isFinal }) => {
        const isSelected = (!gainLevel || gainLevel === 'Unknown') && riskLevel && riskLevel.toLowerCase().includes(risk.toLowerCase());
        return (
            <View style={[
                styles.row,
                detailedMode && styles.expandedRow,
                isFinal && styles.finalRow,
            ]}>
                {children}
                {isSelected && <View style={[styles.absoluteSelectionRows, { borderWidth: 3 }]} pointerEvents="none" />}
            </View>
        )
    }

    // Risk Label Cell
    const RiskLabelCell = ({ risk }) => {
        const highlight = getRiskHeaderHighlight(risk);

        let flexStyle = {};
        if (isNarrow && detailedMode) {
            flexStyle = { flex: COLUMN_FLEX_DETAILED.header };
        } else if (detailedMode) {
            flexStyle = { flex: 1 };
        } else {
            // Just let flex:1 from styles.shortCell handle it
        }

        return (
            <View style={[
                styles.cell,
                detailedMode ? styles.fullCell : styles.shortCell,
                flexStyle,
                highlight.container
            ]}>
                <Text style={[textStyle.bodyMedium, highlight.text, { textAlign: 'center' }]}>
                    {risk === 'Medium' ? 'Med Risk' : `${risk} Risk`}
                </Text>
            </View>
        )
    }

    const CellWrapper = ({ risk, gain, gains, children, style, rowIndex }) => {
        const selected = gains ? gains.some(g => isCellSelected(risk, g)) : isCellSelected(risk, gain);
        // Clone child to pass isSelected
        const childWithProp = React.cloneElement(children, { isSelected: selected });

        let flexStyle = {};

        if (isNarrow && detailedMode) {
            if (gains) {
                // Merged cells logic for narrow
                let totalFlex = 0;
                if (gains.includes('High')) totalFlex += COLUMN_FLEX_DETAILED.high;
                if (gains.includes('Medium')) totalFlex += COLUMN_FLEX_DETAILED.medium;
                if (gains.includes('Low')) totalFlex += COLUMN_FLEX_DETAILED.low;
                flexStyle = { flex: totalFlex };
            } else if (gain) {
                if (gain === 'High') flexStyle = { flex: COLUMN_FLEX_DETAILED.high };
                if (gain === 'Medium') flexStyle = { flex: COLUMN_FLEX_DETAILED.medium };
                if (gain === 'Low') flexStyle = { flex: COLUMN_FLEX_DETAILED.low };
            }
        }

        // Gain Only Selection Logic (Column Highlight)
        // If Risk is unknown/null but Gain is set, we highlight the Gain column.
        // We do this by adding borders to the individual cells in that column because we don't have a column wrapper.
        const isGainOnlySelected = (!riskLevel || riskLevel === 'Unknown') && gainLevel && gain && gainLevel.toLowerCase().includes(gain.toLowerCase());

        return (
            <View style={[
                styles.cell,
                detailedMode ? styles.fullCell : styles.shortCell,
                flexStyle,
                style
            ]}>
                {childWithProp}
                {selected && <View style={styles.absoluteSelection} pointerEvents="none" />}

                {/* Gain Only Selection (Column Highlight) */}
                {isGainOnlySelected && (
                    <View style={[
                        styles.absoluteSelection, // Re-use base absolute style (pos: absolute, etc)
                        {
                            borderColor: colorTheme.primary,
                            borderLeftWidth: 3,
                            borderRightWidth: 3,
                            // Top border only for first row
                            borderTopWidth: rowIndex === 0 ? 3 : 0,
                            // Bottom border only for last row
                            borderBottomWidth: rowIndex === 2 ? 3 : 0,
                            // Ensure it covers full height
                            top: 0, bottom: 0,
                        }
                    ]} pointerEvents="none" />
                )}
            </View>
        )
    }

    // Width calculations for passing to cells for text sizing estimation
    const getCompactWidth = (type) => {
        // Now equal in compact mode
        return width / 4;
    };

    return (
        <View style={[styles.matrix, detailedMode && { flex: 1 }]}>
            {/* Header */}
            <View style={[styles.row, detailedMode && { flexGrow: 0 }]}>
                <View style={[
                    styles.cell,
                    detailedMode ? styles.headerCellDetailed : styles.shortCell,
                    (isNarrow && detailedMode) ? { flex: COLUMN_FLEX_DETAILED.header } : { flex: 1 },
                    { backgroundColor: colorTheme.surface }
                ]}>
                    <Text style={textStyle.bodyMedium}></Text>
                </View>
                <HeaderCell title="High Gain" gainType="High" />
                <HeaderCell title="Med Gain" gainType="Medium" />
                <HeaderCell title="Low Gain" gainType="Low" style={{ borderRightWidth: 0 }} />
            </View>

            {/* Low Risk Row */}
            <RiskRow risk="Low">
                <RiskLabelCell risk="Low" />

                {detailedMode ? (
                    <CellWrapper risk="Low" gains={['High', 'Medium', 'Low']} style={{ flex: isNarrow ? (COLUMN_FLEX_DETAILED.high + COLUMN_FLEX_DETAILED.medium + COLUMN_FLEX_DETAILED.low) : 3, borderRightWidth: 0 }} rowIndex={0}>
                        <FullCell text={lowRiskAction} color={riskColors.low.bg} cellWidth={cellWidth * 3} isSelected={false} />
                    </CellWrapper>
                ) : (
                    <>
                        <CellWrapper risk="Low" gain="High" rowIndex={0}>
                            <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={getCompactWidth('High')} />
                        </CellWrapper>

                        <CellWrapper risk="Low" gain="Medium" rowIndex={0}>
                            <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={getCompactWidth('Medium')} />
                        </CellWrapper>

                        <CellWrapper risk="Low" gain="Low" style={{ borderRightWidth: 0 }} rowIndex={0}>
                            <ShortCell text="Accept" color={riskColors.low.bg} cellWidth={getCompactWidth('Low')} />
                        </CellWrapper>
                    </>
                )}
            </RiskRow>

            {/* Medium Risk Row */}
            <RiskRow risk="Medium">
                <RiskLabelCell risk="Medium" />

                {detailedMode ? (
                    <>
                        <CellWrapper risk="Medium" gains={['High', 'Medium']} style={{ flex: isNarrow ? (COLUMN_FLEX_DETAILED.high + COLUMN_FLEX_DETAILED.medium) : 2 }} rowIndex={1}>
                            <FullCell text={medRiskAction} color={riskColors.medium.bg} cellWidth={cellWidth * 2} />
                        </CellWrapper>

                        <CellWrapper risk="Medium" gain="Low" style={{ borderRightWidth: 0 }} rowIndex={1}>
                            <FullCell text={medRiskStrictAction} gradient1={riskColors.medium.bg} gradient2={riskColors.high.bg} cellWidth={cellWidth} />
                        </CellWrapper>
                    </>
                ) : (
                    <>
                        <CellWrapper risk="Medium" gain="High" rowIndex={1}>
                            <ShortCell text="Accept" color={riskColors.medium.bg} cellWidth={getCompactWidth('High')} />
                        </CellWrapper>

                        <CellWrapper risk="Medium" gain="Medium" rowIndex={1}>
                            <ShortCell text="Accept" color={riskColors.medium.bg} cellWidth={getCompactWidth('Medium')} />
                        </CellWrapper>

                        <CellWrapper risk="Medium" gain="Low" style={{ borderRightWidth: 0 }} rowIndex={1}>
                            <ShortCell text="Accept (Command)" gradient1={riskColors.medium.bg} gradient2={riskColors.high.bg} cellWidth={getCompactWidth('Low')} />
                        </CellWrapper>
                    </>
                )}
            </RiskRow>

            {/* High Risk Row */}
            <RiskRow risk="High" isFinal>
                <RiskLabelCell risk="High" />

                {detailedMode ? (
                    <>
                        <CellWrapper risk="High" gains={['High', 'Medium']} style={{ flex: isNarrow ? (COLUMN_FLEX_DETAILED.high + COLUMN_FLEX_DETAILED.medium) : 2 }} rowIndex={2}>
                            <FullCell text={highRiskAction} color={riskColors.high.bg} cellWidth={cellWidth * 2} />
                        </CellWrapper>

                        <CellWrapper risk="High" gain="Low" style={{ borderRightWidth: 0 }} rowIndex={2}>
                            <FullCell text={turnDownAction} color={riskColors.high.bg} cellWidth={cellWidth} />
                        </CellWrapper>
                    </>
                ) : (
                    <>
                        <CellWrapper risk="High" gain="High" rowIndex={2}>
                            <ShortCell text="Accept (Command)" color={riskColors.high.bg} cellWidth={getCompactWidth('High')} />
                        </CellWrapper>

                        <CellWrapper risk="High" gain="Medium" rowIndex={2}>
                            <ShortCell text="Accept (Command)" color={riskColors.high.bg} cellWidth={getCompactWidth('Medium')} />
                        </CellWrapper>

                        <CellWrapper risk="High" gain="Low" style={{ borderRightWidth: 0 }} rowIndex={2}>
                            <ShortCell text="Turn Down" color={riskColors.high.bg} cellWidth={getCompactWidth('Low')} />
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

const getStyles = (colorTheme, isNarrow) => {
    return StyleSheet.create({
        matrix: {
            width: '100%',
            maxWidth: '100%',
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
            position: 'relative',
        },
        expandedRow: {
            flex: 1,
        },
        finalRow: {
            flexDirection: 'row',
            borderBottomWidth: 0,
        },
        cell: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
            borderRightWidth: 1,
            borderColor: colorTheme.outline,
            position: 'relative',
            flex: 1, // Default to flex 1 (equal width) unless overridden
        },
        cellContent: {
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 6,
        },
        shortCell: {
            flex: 1,
            height: 60,
            overflow: 'hidden',
        },
        fullCell: {
            width: isNarrow ? undefined : 150,
            flex: 1,
            minHeight: 120,
        },
        headerCellDetailed: {
            width: isNarrow ? undefined : 150,
            flex: 1,
            minHeight: 60,
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
        },
        absoluteSelectionCols: {
            position: 'absolute',
            width: '100%',
            // Dimensions handled in render
            borderColor: colorTheme.primary,
            zIndex: 10,
        }
    });
}
