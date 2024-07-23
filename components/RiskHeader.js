import { useContext } from 'react';
import { StyleSheet, Text } from 'react-native';
import { BackHeader } from './Headers';

import { ThemeContext } from '../components/ThemeContext';

export default function RiskHeader({ title, subtitle, score, minimumScore, complete = false, menu, riskText = "", riskColor = "" }) {
    const { colorTheme } = useContext(ThemeContext);

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
        return colorTheme.surfaceContainer;
    };

    const getTextColor = (value, minimumScore, complete) => {
        if (complete) {
            if (value >= minimumScore && value <= 35) {
                return '#ffffff';
            } else if (value >= 36 && value <= 60) {
                return '#ffffff';
            } else if (value >= 61) {
                return '#ffffff';
            }
        }
        return colorTheme.onSurface;
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

    return (
        <BackHeader
            title={title}
            subtitle={subtitle}
            backgroundColor={riskColor === "" ? getBackgroundColor(score, minimumScore, complete) : riskColor}
            color={getTextColor(score, minimumScore, complete)}
            menuButton={menu}
        >
            {complete && <Text style={[styles.score, { color: getTextColor(score, minimumScore, complete) }]}>{riskText === "" ? (score + " - " + getScoreCategory(score, minimumScore)) : riskText}</Text>}
        </BackHeader>
    );
};

const styles = StyleSheet.create({
    score: {
        fontSize: 32,
        fontWeight: 'bold',
        marginLeft: 20,
        marginRight: 20,
    },
});