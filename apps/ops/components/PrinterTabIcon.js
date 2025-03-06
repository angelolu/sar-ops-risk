import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { textStyles, ThemeContext } from 'calsar-ui';
import { PrinterContext } from './PrinterContext';
import { RxDBContext } from './RxDBContext';

export const PrinterTabIcon = ({ saveLocation, onPress, selected = false }) => {
    const { isPrinterConnected } = useContext(PrinterContext);
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const { replicationStatus } = useContext(RxDBContext);
    const [focus, setFocus] = useState(false);
    const styles = buttonStyles();
    const textStyle = textStyles();

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

    return (
        <View style={[styles.baseContainer]}>
            <Pressable
                onHoverIn={() => { setFocus(true) }}
                onHoverOut={() => { setFocus(false) }}
                onPress={onPress}
                android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                style={[styles.pressable, focusTheme]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={[styles.circle, { backgroundColor: isPrinterConnected ? colorTheme.garGreenLight : colorTheme.garRedLight }]} />
                    <Text style={textStyle.tertiaryText}>{isPrinterConnected ? "Printer connected" : "Printer disconnected"}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: 'flex-end' }}>
                    <View style={[styles.circle, { backgroundColor: saveColor }]} />
                    <Text style={textStyle.tertiaryText}>{saveText}</Text>
                </View>
            </Pressable >
        </View >
    );
};

const buttonStyles = () => {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
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