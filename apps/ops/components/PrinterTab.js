import { FilledButton, ThemeContext } from 'calsar-ui';
import React, { useContext } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PrinterContext } from './PrinterContext';

export const PrinterTab = ({ incidentInfo, userInfo }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = pageStyles();
    const { isPrinterSupported,
        connectPrinter,
        disconnectPrinter,
        isPrinterConnected,
        feedLines,
        printText,
        cutPaper,
        setBold,
        setNormal,
        setRightAlign,
        setCenterAlign,
        setLeftAlign } = useContext(PrinterContext);

    const handleFeed = async () => { feedLines(5) };

    const handlePrintHeader = async () => {
        await feedLines(2);
        await setBold();
        await setCenterAlign();
        await printText("OPERATION MANAGEMENT TOOL");
        await printText("Communication Log");
        await setLeftAlign();
        await setNormal();
        await feedLines(1);
        await printText(`TASK NAME: ${incidentInfo.incidentName || ""}`);
        await printText(`TASK # ${incidentInfo.number || ""}`);
        await printText(`OP. PERIOD ${incidentInfo.opPeriod || ""}`);
        await feedLines(1);
        await printText(`LOG KEEPER: ${userInfo.name || ""}`);
        await printText(`STATION CALLSIGN: ${userInfo.callsign || ""}`);
        await printText(`STATION FREQ./CHANNEL: ${userInfo.frequency || ""}`)
        await feedLines(1);
        await setBold();
        await setCenterAlign();
        await printText(`--- Start of printout ${new Date().toLocaleString('en-US', { hour12: false })} ---`);
        await setNormal();
        await setLeftAlign();
        await feedLines(1);
    }

    const handlePrintFooter = async () => {
        await setBold();
        await setCenterAlign();
        await printText(`--- End of printout ${new Date().toLocaleString('en-US', { hour12: false })} ---`);
        await setNormal();
        await setLeftAlign();
        await feedLines(2);
        await cutPaper();
    }

    const handleConnectPrinter = () => {
        isPrinterConnected ? disconnectPrinter() : connectPrinter();
    }

    return (
        <>
            {isPrinterSupported &&
                <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <KeyValue title="Printer status">
                            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                <View style={[styles.circle, { backgroundColor: isPrinterConnected ? colorTheme.garGreenLight : colorTheme.garRedLight }]} />
                                <Text style={styles.sectionBodyTextSmall}>{isPrinterConnected ? "Connected" : "Not connected"}</Text>
                            </View>
                        </KeyValue>
                        <FilledButton small={width <= 600} icon={isPrinterConnected ? "close" : "print-outline"} text={isPrinterConnected ? "Disconnect" : "Connect"} onPress={handleConnectPrinter} />
                    </View>
                    {isPrinterConnected && <KeyValue title="Actions">
                        <View style={{ flexDirection: "row", gap: 12, marginTop: 8, justifyContent: "center" }}>
                            <FilledButton small icon="print" text={"Header"} onPress={handlePrintHeader} />
                            <FilledButton small icon="print" text={"Footer and cut"} onPress={handlePrintFooter} />
                            <FilledButton small icon="caret-up" text={"Feed"} onPress={handleFeed} />
                            <FilledButton small icon="cut" text={"Cut"} onPress={cutPaper} />
                        </View>
                    </KeyValue>}
                </View>
            }
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
            fontSize: width > 600 ? 20 : 16,
            color: colorTheme.onSurface
        },
        circle: {
            width: 12,
            height: 12,
            borderRadius: 6,
        }
    });
}