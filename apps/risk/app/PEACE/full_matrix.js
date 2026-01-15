import { BackHeader, ThemeContext } from 'calsar-ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import RiskGainGrid from '../../components/RiskGainGrid';

export default function FullMatrixPage() {
    const { colorTheme } = useContext(ThemeContext);
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parse params if passed (riskLevel, gainLevel)
    const riskLevel = params.riskLevel;
    const gainLevel = params.gainLevel;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colorTheme.background,
        },
        outerContainer: {
            width: '100%',
            maxWidth: 1000,
            alignSelf: 'center',
        },
        scrollContent: {
            padding: 16,
            minHeight: '100%',
            flexGrow: 1,
        }
    });

    return (
        <View style={styles.container}>
            <BackHeader title="Risk vs Gain Matrix" />
            <ScrollView
                style={styles.outerContainer}
                contentContainerStyle={styles.scrollContent}
            >
                <RiskGainGrid
                    riskLevel={riskLevel}
                    gainLevel={gainLevel}
                    isLandscape={true}
                />
            </ScrollView>
        </View>
    );
}
