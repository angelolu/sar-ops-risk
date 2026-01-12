import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { textStyles, ThemeContext } from 'calsar-ui';
import { PrinterContext } from './PrinterContext';
import { RxDBContext } from './RxDBContext';

export const PrinterTabIcon = ({ saveLocation, onPress, selected = false, printType }) => {
    const { isPrinterConnected, isPrinterSupported } = useContext(PrinterContext);
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const { replicationStatus } = useContext(RxDBContext);
    const { width } = useWindowDimensions();
    const [focus, setFocus] = useState(false);
    const styles = buttonStyles(colorTheme, getHoverColor);
    const textStyle = textStyles(colorTheme, width);

    const [saveText, setSaveText] = useState(false);
    const [saveColor, setSaveColor] = useState(colorTheme.garAmberLight);

    const focusTheme = (focus) ? { backgroundColor: getHoverColor(colorTheme.surfaceContainerHigh) } : selected ? {} : { backgroundColor: getHoverColor(colorTheme.surfaceContainerHigh, 0.5) };

    useEffect(() => {
        if (saveLocation !== "cloud") {
            setSaveColor(colorTheme.garGreenLight);
            setSaveText("Changes saved");
        }
        else {
            if (replicationStatus) {
                if (replicationStatus?.started && replicationStatus?.status) {
                    setSaveColor(colorTheme.garGreenLight);
                    setSaveText("File up to date");
                } else if (replicationStatus?.started && replicationStatus?.status === false) {
                    setSaveColor(colorTheme.garAmberLight);
                    setSaveText("Syncing with cloud");
                } else {
                    setSaveColor(colorTheme.garRedLight);
                    setSaveText("Connecting to cloud");
                }
            }
        }
    }, [saveLocation, replicationStatus]);

    let printColor;
    let printText;
    if (isPrinterConnected) {
        switch (printType) {
            case "Logs":
                printColor = colorTheme.garGreenLight;
                printText = "Printing logs";
                break;
            case "Clues":
                printColor = colorTheme.garGreenLight;
                printText = "Printing clues";
                break;
            default:
                printColor = colorTheme.garAmberLight;
                printText = "Printer idle";
                break;

        }
    } else {
        printColor = colorTheme.garRedLight;
        printText = "Printer disconnected";
    }

    return (
        <View style={[styles.baseContainer]}>
            <Pressable
                onHoverIn={() => { setFocus(true) }}
                onHoverOut={() => { setFocus(false) }}
                onPress={onPress}
                android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                style={[styles.pressable, focusTheme]}>
                {isPrinterSupported && <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={[styles.circle, { backgroundColor: printColor }]} />
                    <Text style={textStyle.tertiaryText}>{printText}</Text>
                </View>}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: 'flex-end' }}>
                    <View style={[styles.circle, { backgroundColor: saveColor }]} />
                    <Text style={textStyle.tertiaryText}>{saveText}</Text>
                </View>
            </Pressable >
        </View >
    );
};

const buttonStyles = (colorTheme, getHoverColor) => {
    return StyleSheet.create({
        baseContainer: {
            height: 50,
            borderRadius: 8,
            overflow: 'hidden',
        },
        pressable: {
            flexGrow: 1,
            alignItems: 'flex-start',
            justifyContent: "space-evenly",
            paddingHorizontal: 12,
            paddingVertical: 6,
            gap: 2,
        },
        circle: {
            width: 8,
            height: 8,
            borderRadius: 6,
        }
    });
}