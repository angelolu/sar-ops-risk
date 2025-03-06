import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { textStyles, ThemeContext } from 'calsar-ui';
import { PrinterContext } from './PrinterContext';

export const PrinterTabIcon = ({ onPress, color, selected = false }) => {
    const { isPrinterConnected } = useContext(PrinterContext);
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const [focus, setFocus] = useState(false);
    const styles = buttonStyles();
    const textStyle = textStyles();

    const focusTheme = (focus) ? { backgroundColor: getHoverColor(colorTheme.surfaceContainerHigh) } : selected ? {} : { backgroundColor: getHoverColor(colorTheme.surfaceContainerHigh, 0.5) };

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
                    <View style={[styles.circle, { backgroundColor: colorTheme.garGreenLight }]} />
                    <Text style={textStyle.tertiaryText}>{"Changes saved"}</Text>
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