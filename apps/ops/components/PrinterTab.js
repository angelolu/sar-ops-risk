import { FilledButton, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PrinterContext } from './PrinterContext';
import { textStyles } from 'calsar-ui/lib/styles';

export const PrinterTab = ({ incidentInfo }) => {
    const { colorTheme } = useContext(ThemeContext);
    const styles = pageStyles();
    const textStyle = textStyles();
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

    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

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
        await printText(`TASK # ${incidentInfo.incidentNumber || ""}`);
        await printText(`OP. PERIOD ${incidentInfo.opPeriod || ""}`);
        await feedLines(1);
        await printText(`LOG KEEPER: ${incidentInfo.commsName || ""}`);
        await printText(`STATION CALLSIGN: ${incidentInfo.commsCallsign || ""}`);
        await printText(`STATION FREQ./CHANNEL: ${incidentInfo.commsFrequency || ""}`)
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

    const handleGrantNotification = () => {
        Notification.requestPermission().then((result) => {
            setNotificationPermission(result);
        });
    }

    let notificationStatus = "";
    let notificationText = "";
    let notificationColor = "";
    switch (notificationPermission) {
        case "granted":
            notificationStatus = "Enabled";
            notificationColor = colorTheme.garGreenLight;
            notificationText = "You'll be notified of important changes in this file while it's open";
            break;
        case "denied":
            notificationStatus = "Permission denied";
            notificationColor = colorTheme.garRedLight;
            notificationText = "Grant notification permissions in your browser settings to be notified when changes are made to this file";
            break;
        case "default":
            notificationStatus = "Disabled";
            notificationColor = colorTheme.outlineVariant;
            notificationText = "Grant notification permissions be notified when changes are made to this file";
            break;
    }
    return (
        <>
            {isPrinterSupported &&
                <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <KeyValue title="Thermal printer" color={isPrinterConnected ? colorTheme.garGreenLight : colorTheme.garRedLight}>
                            <Text style={textStyle.rowTitleText}>{isPrinterConnected ? "Connected" : "Not connected"}</Text>
                        </KeyValue>
                        <FilledButton small icon={isPrinterConnected ? "close" : "print-outline"} text={isPrinterConnected ? "Disconnect" : "Connect"} onPress={handleConnectPrinter} primary={!isPrinterConnected} destructive={isPrinterConnected} />
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
            <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <KeyValue title="File storage" color={colorTheme.garGreenLight}>
                        <Text style={textStyle.rowTitleText}>{"Changes saved"}</Text>
                    </KeyValue>
                    {false && <FilledButton small primary icon="download" text={"Download"} onPress={handleConnectPrinter} />}
                </View>
            </View>
            <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <KeyValue title="Notifications" color={notificationColor}>
                        <Text style={textStyle.rowTitleText}>{notificationStatus}</Text>
                        <Text style={[textStyle.secondaryText]}>{notificationText}</Text>
                    </KeyValue>
                    {Notification.permission === "default" && <FilledButton small primary text={"Grant permissions"} onPress={handleGrantNotification} />}
                </View>
            </View>
        </>
    );
}

const KeyValue = ({ title, children, color }) => {
    const styles = pageStyles();
    const textStyle = textStyles();

    if (color) {
        return (<View style={{ flexDirection: "column", gap: 4, flex: 1 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <View style={[styles.circle, { backgroundColor: color }]} />
                <Text style={textStyle.tertiaryText}>{title}</Text>
            </View>
            {children}
        </View>
        );
    } else {
        return (<View style={{ flexDirection: "column", gap: 4, flex: 1 }}>
            <Text style={textStyle.tertiaryText}>{title}</Text>
            {children}
        </View>
        );
    }
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();

    return StyleSheet.create({
        standaloneCard: {
            borderRadius: 26,
            minWidth: 450,
            maxWidth: 500,
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
        circle: {
            width: 10,
            height: 10,
            borderRadius: 5,
        }
    });
}