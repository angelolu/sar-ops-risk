import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeContext } from '../components/ThemeContext';

export default function ListItem({ onPress, title, subtitle, score, backgroundColor, color, description }) {
    const { colorTheme } = useContext(ThemeContext);
    const styles = itemStyles();

    const getBackgroundColor = (value) => {
        if (value >= 1 && value <= 4) {
            return '#b9f0b8';
        } else if (value >= 5 && value <= 7) {
            return '#ffdeae';
        } else if (value >= 8 && value <= 10) {
            return '#ffdad6';
        } else {
            return colorTheme.surface;
        }
    };
    
    const getSubtitleColor = (value) => {
        if (value >= 1) {
            return getTextColor(value);
        } else {
            return colorTheme.onSurfaceVariant;
        }
    }
    
    const getTextColor = (value) => {
        if (value >= 1 && value <= 4) {
            return '#002107';
        } else if (value >= 5 && value <= 7) {
            return '#281900';
        } else if (value >= 8 && value <= 10) {
            return '#410002';
        } else {
            return colorTheme.onSurface;
        }
    };

    return (
        <View style={styles.listItemContainer}>
            <Pressable
                android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                onPress={onPress}>
                <View style={[styles.row, { backgroundColor: backgroundColor ? backgroundColor : getBackgroundColor(score) }]}>
                    <View style={styles.textColumn}>
                        <Text style={[styles.Title, { color: color ? color : getTextColor(score) }]}>{title}</Text>
                        <Text style={{ color: getSubtitleColor(score) }}>{subtitle}</Text>
                        {description && <Text style={{ marginTop: 4, marginLeft: 6 }}>- {description}</Text>}
                    </View>
                    <View>
                        <Text style={[styles.score, { color: color ? color : getTextColor(score) }]}>{(score === 0 || score === '') ? "-" : score}</Text>
                    </View>
                </View>
            </Pressable>
        </View>
    );
}

const itemStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        listItemContainer: {
        },
        row: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 16,
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