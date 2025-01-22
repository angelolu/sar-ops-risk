import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from 'calsar-ui';

export default function ListItem({ onPress, title, subtitle, score, backgroundColor, color, description = "" }) {
    const { colorTheme } = useContext(ThemeContext);

    const [listStyle, setListStyle] = useState(null);
    useEffect(() => {
        // Get language setting used for ORMA
        AsyncStorage.getItem("list-style").then((jsonValue) => {
            jsonValue != null ? setListStyle(JSON.parse(jsonValue)) : setListStyle(null);
        }).catch((e) => {
            // error reading value
        });
    }, []);

    let styles;

    if (listStyle === "legacy") {
        styles = itemStylesClassic();
        return (
            <View style={styles.listItemContainer}>
                <Pressable
                    android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                    onPress={onPress}>
                    <View style={[styles.row, { backgroundColor: backgroundColor ? backgroundColor : colorTheme.surface }]}>
                        <View style={styles.textColumn}>
                            <Text style={[styles.Title, { color: color ? color : colorTheme.onSurface }]}>{title}</Text>
                            {subtitle && <Text style={{ color: color ? color : colorTheme.onSurfaceVariant }}>{subtitle}</Text>}
                            {description !== "" && <Text style={{ marginTop: 4, marginLeft: 6, color: color ? color : colorTheme.onSurfaceVariant }}>- {description}</Text>}
                        </View>
                        <View>
                            <Text style={[styles.score, { color: color ? color : colorTheme.onSurface }]}>{(score === 0 || score === '') ? "-" : score}</Text>
                        </View>
                    </View>
                </Pressable>
            </View>
        );
    } else {
        styles = itemStyles();
        return (
            <View>
                <Pressable
                    android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                    onPress={onPress}>
                    <View style={styles.row}>
                        <View style={[styles.littleBox, { backgroundColor: backgroundColor ? backgroundColor : colorTheme.surfaceVariant }]}>
                            <Text style={[styles.score, { color: color ? color : colorTheme.white }]}>{(score && score !== 0) ? score : "-"}</Text>
                        </View>
                        <View style={styles.textColumn}>
                            <Text style={styles.headline}>{title}</Text>
                            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                            {description !== "" && <Text style={{ marginTop: 4, marginLeft: 6, color: colorTheme.onSurfaceVariant }}>- {description}</Text>}
                        </View>
                    </View>
                </Pressable>
            </View>
        );
    }
}

const itemStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        row: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            backgroundColor: colorTheme.surface,
            alignItems: 'flex-start'
        },
        textColumn: {
            flex: 1,
        },
        score: {
            fontSize: 26,
            fontWeight: 'bold',
        },
        headline: {
            fontSize: 20,
            color: colorTheme.onSurface
        },
        subtitle: {
            fontSize: 14,
            lineHeight: 20,
            color: colorTheme.onSurfaceVariant
        },
        littleBox: {
            width: 56,
            height: 56,
            marginTop: 6,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
        }
    });
}

const itemStylesClassic = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        listItemContainer: {
        },
        row: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 12,
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 25
        },
        textColumn: {
            flex: 1,
        },
        score: {
            fontSize: 26,
            fontWeight: 'bold',
        },
        Title: {
            fontSize: 22,
        },
        subtitle: {
            color: colorTheme.onSurfaceVariant
        }
    });
}