import { Picker } from '@react-native-picker/picker';
import { FilledButton, ThemeContext } from 'calsar-ui';
import { textStyles } from 'calsar-ui/lib/styles';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { PrinterContext } from './PrinterContext';
import { RxDBContext } from './RxDBContext';

export const PrinterTab = ({ incidentInfo, setPrintType, printType, printTypes, printLogHeader, printLogFooter }) => {
    const { colorTheme } = useContext(ThemeContext);
    const { replicationStatus } = useContext(RxDBContext);
    const { width } = useWindowDimensions();
    const styles = getStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);
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
    const [saveText, setSaveText] = useState(false);
    const [saveColor, setSaveColor] = useState(colorTheme.garAmberLight);

    useEffect(() => {
        if (incidentInfo.type !== "cloud") {
            setSaveColor(colorTheme.garGreenLight);
            setSaveText("Changes saved locally");
        }
        else {
            if (replicationStatus) {
                if (replicationStatus?.started && replicationStatus?.status) {
                    setSaveColor(colorTheme.garGreenLight);
                    setSaveText("File up to date with cloud");
                } else if (replicationStatus?.started && replicationStatus?.status === false) {
                    setSaveColor(colorTheme.garAmberLight);
                    setSaveText("Changes saved locally. Trying to save to cloud...");
                } else {
                    setSaveColor(colorTheme.garRedLight);
                    setSaveText("Trying to connect to cloud...");
                }
            }
        }
    }, [incidentInfo, replicationStatus]);

    const handleFeed = async () => { feedLines(5) };

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

    let fileStorageSecondaryText = incidentInfo.type === "cloud" ? "This file syncs when a connection is available. You can continue working while offline." : "This file is stored in this browser and will be deleted if browsing data is cleared";

    let printColor;
    if (isPrinterConnected) {
        switch (printType) {
            case "Logs":
                printColor = colorTheme.garGreenLight;
                break;
            case "Clues":
                printColor = colorTheme.garGreenLight;
                break;
            default:
                printColor = colorTheme.garAmberLight;
                break;

        }
    } else {
        printColor = colorTheme.garRedLight;
    }

    return (
        <>
            <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, paddingBottom: isPrinterConnected ? 4 : 0 }}>
                    <KeyValue title="Thermal printer" color={printColor}>
                        {isPrinterSupported ?
                            <Text style={textStyle.rowTitleText}>{isPrinterConnected ? "Connected" : "Not connected"}</Text>
                            :
                            <Text style={textStyle.rowTitleText}>This browser doesn't support printers over serial</Text>
                        }
                    </KeyValue>
                    <>{isPrinterSupported && <FilledButton small icon={isPrinterConnected ? "close" : "print-outline"} text={isPrinterConnected ? "Disconnect" : "Connect"} onPress={handleConnectPrinter} primary={!isPrinterConnected} destructive={isPrinterConnected} />}</>
                </View>
                {isPrinterConnected && <View>
                    <Text style={textStyle.tertiaryText}>Content to print</Text>
                    <View style={{ flexDirection: "row", gap: 12, marginTop: 8, justifyContent: "center" }}>
                        <Picker
                            style={[styles.picker]}
                            selectedValue={printType}
                            onValueChange={(itemValue) => setPrintType(itemValue)}>
                            {printTypes.map((option) => (
                                <Picker.Item
                                    key={option}
                                    label={option}
                                    value={option}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>}
                {isPrinterConnected && <View style={{ flexDirection: "row", gap: 12, marginTop: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {printType === "Logs" && <FilledButton small icon="arrow-up-circle-outline" text={"Header"} onPress={printLogHeader} />}
                    {printType === "Logs" && <FilledButton small icon="arrow-down-circle-outline" text={"Footer"} onPress={printLogFooter} />}
                    <FilledButton small icon="caret-up" text={"Feed"} onPress={handleFeed} />
                    <FilledButton small icon="cut" text={"Cut"} onPress={cutPaper} />
                </View>}
            </View>
            <View style={[styles.standaloneCard, { flexDirection: "column", flexGrow: 2, justifyContent: "flex-start", gap: 8 }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <KeyValue title="File storage" color={saveColor}>
                        <Text style={textStyle.rowTitleText}>{saveText}</Text>
                        <Text style={[textStyle.secondaryText]}>{fileStorageSecondaryText}</Text>
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
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = getStyles(colorTheme, width);
    const textStyle = textStyles(colorTheme, width);

    if (color) {
        return (<View style={{ flexDirection: "column", gap: 8, flex: 1 }}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <View style={[styles.circle, { backgroundColor: color }]} />
                <Text style={textStyle.tertiaryText}>{title}</Text>
            </View>
            {children}
        </View>
        );
    } else {
        return (<View style={{ flexDirection: "column", gap: 8, flex: 1 }}>
            <Text style={textStyle.tertiaryText}>{title}</Text>
            {children}
        </View>
        );
    }
}

const getStyles = (colorTheme, width) => {
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
        circle: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        picker: {
            height: 34,
            outlineStyle: "solid",
            outlineWidth: 2,
            outlineColor: colorTheme.outline,
            color: colorTheme.onSurface,
            backgroundColor: colorTheme.surfaceContainer,
            width: "100%",
            paddingHorizontal: 8
        },
    });
}