import { View, StyleSheet, Text, Platform, Pressable } from 'react-native';
import Header from './Header';
import { setStatusBarStyle } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RiskHeader({ title, subtitle, score, minimumScore, complete = false }) {
    const onBackPress = () => {
        router.back()
    };
    setStatusBarStyle((score >= minimumScore && score <= 80) ? "light" : "dark", true);
    return (
        <Header style={{ backgroundColor: getBackgroundColor(score, minimumScore, complete), borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <View style={[styles.mainContainer, { backgroundColor: getBackgroundColor(score, minimumScore, complete), padding: 0 }]}>
                <View style={styles.titleRow}>
                    <View style={styles.backButtonContainer}>
                        <Pressable
                            style={styles.circleButton}
                            android_ripple={{ color: '#e2e2e9' }}
                            onPress={onBackPress}>
                            <Ionicons name={Platform.OS === 'android' ? "arrow-back" : "chevron-back"} size={24} color={getTextColor(score, minimumScore, complete)} />
                        </Pressable>
                    </View>
                    <Text style={[styles.title, { color: getTextColor(score, minimumScore, complete) }]}>{title}</Text>
                </View>
                {complete && <Text style={[styles.score, { color: getTextColor(score, minimumScore, complete) }]}>{score + " - " + getScoreCategory(score, minimumScore)}</Text>}
                <Text style={[styles.action, score < 8 ? { color: "#1a1b20" } : { color: getTextColor(score, minimumScore, complete) }]}>{subtitle}</Text>
            </View>
        </Header>
    );
};

const getBackgroundColor = (value, minimumScore, complete) => {
    if (complete) {
        if (value >= minimumScore && value <= 35) {
            return '#37693d';
        } else if (value >= 36 && value <= 60) {
            return '#865219';
        } else if (value >= 61 && value <= 80) {
            return '#ba1a1a';
        }
    }
    return '#eeedf4';
};

const getTextColor = (value, minimumScore, complete) => {
    if (complete) {
        if (value >= minimumScore && value <= 35) {
            return '#ffffff';
        } else if (value >= 36 && value <= 60) {
            return '#ffffff';
        } else if (value >= 61 && value <= 80) {
            return '#ffffff';
        }
    }
    return '#1a1b20';
};

const getScoreCategory = (value, minimumScore) => {
    if (value >= minimumScore && value <= 35) {
        return 'Low Risk';
    } else if (value >= 36 && value <= 60) {
        return 'Caution';
    } else if (value >= 31 && value <= 80) {
        return 'High Risk';
    } else {
        return '-';
    }
};

const styles = StyleSheet.create({
    mainContainer: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginTop: 10,
        marginBottom: 20,
        gap: 6
    },
    titleRow: {
        paddingLeft: 6,
        paddingRight: 20,
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center'
    },
    action: {
        marginLeft: 20,
        marginRight: 20,
    },
    score: {
        fontSize: 32,
        fontWeight: 'bold',
        marginLeft: 20,
        marginRight: 20,
    },
    title: {
        fontSize: 18,
        flex: -1
    },
    backButtonContainer: {
        width: 40,
        height: "100%",
        minHeight: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    circleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});