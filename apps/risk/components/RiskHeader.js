import { useContext } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ThemeContext, BackHeader } from 'calsar-ui';

export default function RiskHeader({ title, subtitle, complete = false, menu, riskText, riskColor }) {
    const { colorTheme } = useContext(ThemeContext);

    return (
        <BackHeader
            title={title}
            subtitle={subtitle}
            backgroundColor={complete && riskColor}
            color={complete && colorTheme.white}
            menuButton={menu}
        >
            {complete && riskText && <Text style={[styles.score, { color: colorTheme.white }]}>{riskText}</Text>}
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