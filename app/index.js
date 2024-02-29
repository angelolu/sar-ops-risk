import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import MaterialCard from '../components/MaterialCard';
import Header from '../components/Header';
import BrandingBar from '../components/Branding';
import Button from '../components/Button';
import Tile from '../components/Tile';
import Banner from '../components/Banner';


export default function App() {
    const { height, width } = useWindowDimensions();
    return (
        <View style={styles.background}>
            <Header style={Platform.OS === 'web' ? styles.headerWeb : styles.header}>
                <BrandingBar headerStyle={Platform.OS === 'web' ? styles.headerWeb : styles.header} />
            </Header>
            <ScrollView
                style={[
                    Platform.OS === 'web' ? styles.containerWeb : styles.container,
                    { maxWidth: (width > 850 ? 850 : width) }
                ]}
                contentContainerStyle={styles.mainScroll}>
                <Text style={styles.headings}>Risk Assessment/GAR</Text>
                <Banner
                    backgroundColor='#ffdfa0'
                    color='#261a00'
                    icon={<Ionicons name="warning" size={24} color="#281900" />}
                    title="This isn’t a replacement for good leadership, supervision, and training, or a structure for managing risk."
                    style={{ marginLeft: 20 }} />
                <MaterialCard
                    marginLeft={20}
                    marginRight={20}
                    href="/"
                    title="Operational Risk Management Analysis (ORMA)"
                    subtitle="Used before the team enters the field. Considers all factors of a team’s participation in an event.">
                    <Button text="Complete an ORMA" onPress={() => { router.navigate("/ORMA") }} style={{ alignSelf: "flex-end" }} />
                </MaterialCard>
                <MaterialCard
                    marginLeft={20}
                    marginRight={20}
                    href="/"
                    title="Severity, Probability, Exposure (SPE)"
                    subtitle="Used when the situation in the field changes. Targeted at specific risks." >
                    <Button text="Complete a SPE" onPress={() => { router.navigate("/") }} style={{ alignSelf: "flex-end" }} />
                </MaterialCard>
                <StatusBar style="auto" />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: '#faf8ff',
        height: '100%'
    },
    header: {
        padding: 20,
        gap: 20,
        backgroundColor: '#d9e2ff',
        color: '#001945',
        alignItems: 'center',
    },
    headerWeb: {
        padding: 20,
        gap: 20,
        backgroundColor: '#faf8ff',
        color: '#475d92',
        alignItems: 'center'
    },
    container: {
        backgroundColor: '#faf8ff',
        height: '100%'
    },
    containerWeb: {
        backgroundColor: '#faf8ff',
        height: '100%',
        alignSelf: 'center'
    },
    mainScroll: {
        paddingTop: 20,
        paddingBottom: 20,
        gap: 20,
    },
    horizontalSection: {
        height: 160,
        gap: 20,
        paddingHorizontal: 20,
    },
    headings: {
        fontSize: 22,
        color: "#1a1b20",
        marginLeft: 20,
        marginRight: 20
    }
});
