import { useContext } from 'react';
import { StyleSheet, Text, useWindowDimensions } from 'react-native';

import { BackHeader, textStyles, ThemeContext } from 'calsar-ui';

export default function RiskHeader({ title, subtitle, complete = false, menu, riskText, riskColor }) {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

    return (
        <BackHeader
            title={title}
            subtitle={subtitle}
            backgroundColor={complete && riskColor}
            color={complete && colorTheme.white}
            menuButton={menu}
        >
            {complete && riskText && <Text style={[textStyle.displaySmall, styles.score, { color: colorTheme.white }]}>{riskText}</Text>}
        </BackHeader>
    );
};

const styles = StyleSheet.create({
    score: {
        fontWeight: 'bold',
        marginLeft: 20,
        marginRight: 20,
    },
});