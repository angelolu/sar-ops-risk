import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, ScrollView, useWindowDimensions, Image, TouchableWithoutFeedback } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import { useState } from 'react';

import MaterialCard from '../components/MaterialCard';
import Header from '../components/Header';
import BrandingBar from '../components/Branding';
import FilledButton from '../components/FilledButton';
import Tile from '../components/Tile';
import Banner from '../components/Banner';
import IconButton from '../components/IconButton';
import RiskModal from '../components/RiskModal';

const ORMAOptions = require('../assets/images/orma-options.jpg');

export default function App() {
    const [modalHeight, setmodalHeight] = useState(1000);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(<></>);
    const { height, width } = useWindowDimensions();
    const entries = [
        {
            title: "Operational Risk Management Analysis (ORMA)",
            content: <HelpInfo subject="ORMA" />
        },
        {
            title: "Severity, Probability, Exposure (SPE)",
            content: <HelpInfo subject="SPE" />
        }
    ]

    const viewHelp = (index) => {
        setSelectedEntry({ ...entries[index] });
        setmodalHeight(height - 60);
        setIsModalVisible(true);
    };
    const onModalClose = () => {
        setIsModalVisible(false);
    };

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
                    pad />
                <MaterialCard
                    marginLeft={20}
                    marginRight={20}
                    title="Operational Risk Management Analysis (ORMA)"
                    subtitle="Used before the team enters the field. Considers all factors of a team’s participation in an event.">
                    <View style={{ alignSelf: "flex-end", flexDirection: "row", gap: 6, alignItems: "center" }}>
                        <IconButton ionicons_name="help-circle-outline" onPress={() => { viewHelp(0) }} />
                        <FilledButton primary text="Complete an ORMA" onPress={() => { router.navigate("/ORMA") }} />
                    </View>
                </MaterialCard>
                <MaterialCard
                    marginLeft={20}
                    marginRight={20}
                    title="Severity, Probability, Exposure (SPE)"
                    subtitle="A risk assessment model used to categorize a risk. Used when the situation in the field changes. Targeted at a specific risk." >
                    <View style={{ alignSelf: "flex-end", flexDirection: "row", gap: 6 }}>
                        <IconButton ionicons_name="help-circle-outline" onPress={() => { viewHelp(1) }} />
                        <FilledButton primary text="Complete a SPE" onPress={() => { router.navigate("/SPE") }} />
                    </View>
                </MaterialCard>
                <Text style={styles.headings}>Reference</Text>
                <ScrollView
                    contentContainerStyle={styles.horizontalSection}
                    showsHorizontalScrollIndicator={Platform.OS === 'web'}
                    horizontal
                >
                    <Tile
                        href="https://sites.google.com/cal-esar.org/members-only"
                        icon={<Ionicons name="bookmarks" size={24} color="#575e71" style={{ marginBottom: 8 }} />}
                        title="Members"
                        subtitle="CALSAR Member Site"
                        width={150}
                    />
                </ScrollView>
                <RiskModal
                    isVisible={isModalVisible}
                    title={selectedEntry.title}
                    height={modalHeight}
                    onClose={onModalClose}>
                    {selectedEntry.content}
                </RiskModal>
                <StatusBar style="dark" />
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
        padding: 16,
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

function HelpInfo({ subject }) {
    if (subject === "ORMA") return (
        <ScrollView
            contentContainerStyle={riskStyles.container}>
            <TouchableWithoutFeedback>
                <View style={riskStyles.content}>
                    <Banner
                        backgroundColor='#dce2f9'
                        color='#141b2c'
                        icon={<Ionicons name="bulb" size={24} color="#141b2c" />}
                        title="ORMA is also referred to as Green-Amber-Red (GAR)" />
                    <View style={riskStyles.section}>
                        <Text style={riskStyles.heading}>When</Text>
                        <Text>ORMA is used before the team enters the field. Complete it AFTER you have all your assignment information.</Text>
                    </View>
                    <View style={riskStyles.section}>
                        <Text style={riskStyles.heading}>Who</Text>
                        <Text>ORMA considers all factors of a team’s participation in an event. Every member of the team should complete it.</Text>
                    </View>
                    <View style={riskStyles.section}>
                        <Text style={riskStyles.heading}>How</Text>
                        <Text>Use this app, the NPS Risk app, or the GAR worksheet on the IAP (if the search is organized by CALSAR) to complete the "individual" or "finger" methods.</Text>
                        <Image source={ORMAOptions} style={[riskStyles.image, { aspectRatio: 863 / 540 }]} />
                        <Text>Individual method:</Text>
                        <Text>All team members complete the ORMA individually, then come together to discuss concerns and mitigations. This works best if every member of the team has a ORMA app.</Text>
                        <Text>Finger method:</Text>
                        <Text>1. Team leader reads each section out loud, including the description from the worksheet or app.</Text>
                        <Text>2. Each member decides on their score in their head</Text>
                        <Text>3. Team leader asks everyone to throw up their scores on their fingers</Text>
                        <Text>4. The score for the worksheet is the highest score from any member. </Text>
                        <Text>5. Members with the higher scores should say a few words as to why they’re concerned. Save discussions of mitigations for the end. </Text>
                        <Text>6. Once all categories are complete, discuss mitigations. Saving the mitigation discussion for the end helps, as sometimes one mitigation can address multiple concerns </Text>
                    </View>
                    <View style={riskStyles.section}>
                        <Text style={riskStyles.heading}>Element Scoring</Text>
                        <Text>Each element gets scored 1-10. 1-10 seems like a lot of resolution, so how do we actually use this? Again think GAR:</Text>
                        <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginVertical: 4 }}>
                            <Banner
                                backgroundColor='#b9f0b8'
                                color='#002107'
                                icon={<Ionicons name="remove-circle" size={24} color="#002107" />}
                                title={<><Text style={riskStyles.boldText}>Green</Text>: 1-4. No to little concern.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdeae'
                                color='#281900'
                                icon={<Ionicons name="alert-circle" size={24} color="#281900" />}
                                title={<><Text style={riskStyles.boldText}>Amber</Text>: 5-7. Concerned enough we should work to mitigate risks.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdad6'
                                color='#410002'
                                icon={<Ionicons name="stop-circle" size={24} color="#410002" />}
                                title={<><Text style={riskStyles.boldText}>Red</Text>: 8-10. Serious concern. Major restructure or mission turn down should be considered.</>}
                                noRadius />
                        </View>
                        <Text>Any elements in the amber range should trigger a talk about managing the risk.</Text>
                        <Text>The total score should be calculated, but isn’t as important as individual elements scores.</Text>
                        <Text>A large number of elements in the yellow, or a few in red are reasons to turn down an assignment unless those risks can be mitigated.</Text>
                    </View>
                    <View style={riskStyles.section}>
                        <Text style={riskStyles.heading}>Cool so we’re done?</Text>
                        <Text>Nope! Managing risk is a task that requires constant vigilance.</Text>
                        <Text>Have conditions changed in the field? Has our team dynamic changed? Is the command post still engaged? Are we using the mitigations we planned, and are they working?</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
    if (subject === "SPE") return (
        <ScrollView
            contentContainerStyle={riskStyles.container}>
            <TouchableWithoutFeedback>
                <View style={riskStyles.content}>
                    <Banner
                        backgroundColor='#ffdfa0'
                        color='#261a00'
                        icon={<Ionicons name="warning" size={24} color="#141b2c" />}
                        title="SPE is not appropriate for assessing a whole operation and is not a tool for risk mitigation." />
                    <View style={riskStyles.section}>
                        <Text style={riskStyles.heading}>What is SPE?</Text>
                        <Text>SPE is a method to help leaders make decisions made about risky situation in the field. It's useful for assessing specific risks. For example: is it safe to rappel this cliff?</Text>
                        <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginVertical: 4 }}>
                            <Banner
                                backgroundColor='#eeedf4'
                                color='#1a1b20'
                                title="Severity - What is the potential loss or consequence?"
                                noRadius />
                            <Banner
                                backgroundColor='#eeedf4'
                                color='#1a1b20'
                                title="Probability - What is the likelihood of loss or consequence?"
                                noRadius />
                            <Banner
                                backgroundColor='#eeedf4'
                                color='#1a1b20'
                                title="Exposure - What is the amount of time, cycles, people or equipment involved?"
                                noRadius />
                        </View>
                        <Text>Probability is easily understood, but exposure is less obvious.</Text>
                    </View>
                    <View style={riskStyles.section}>
                        <Text style={riskStyles.heading}>When</Text>
                        <Text>SPE is a tool that can be used at any time. Any member can request the team complete a SPE. It’s never required, but should be considered whenever the situation gets notably more complex or risky.</Text>
                    </View>
                    <View style={riskStyles.section}>
                        <Text style={riskStyles.heading}>How</Text>
                        <Text>The team leader should use the "finger" method. Input from less experienced members should be prioritized.</Text>
                        <Text>Finger method:</Text>
                        <Text>1. Team leader reads each section out loud, including the description from the worksheet or app.</Text>
                        <Text>2. Each member decides on their score in their head</Text>
                        <Text>3. Team leader asks everyone to throw up their scores on their fingers</Text>
                        <Text>4. The score for the worksheet is the highest score from any member. </Text>
                        <Text>5. Members with the higher scores should say a few words as to why they’re concerned. Save discussions of mitigations for the end. </Text>
                        <Text>6. Once all categories are complete, discuss mitigations. Saving the mitigation discussion for the end helps, as sometimes one mitigation can address multiple concerns </Text>
                    </View>
                    <View style={riskStyles.section}>
                        <Text style={riskStyles.heading}>Element Scoring</Text>
                        <Text>Severity is scored on a scale of 1 (none or slight) to 5 (catastrophic):</Text>
                        <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginVertical: 4 }}>
                            <Banner
                                backgroundColor='#b9f0b8'
                                color='#002107'
                                icon={<Ionicons name="remove-circle" size={24} color="#002107" />}
                                title={<><Text style={riskStyles.boldText}>None or Slight</Text>: Discomfort or nuisance.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdeae'
                                color='#281900'
                                icon={<Ionicons name="heart-circle" size={24} color="#281900" />}
                                title={<><Text style={riskStyles.boldText}>Minimal</Text>: First aid required.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdeae'
                                color='#281900'
                                icon={<Ionicons name="alert-circle" size={24} color="#281900" />}
                                title={<><Text style={riskStyles.boldText}>Significant</Text>: IWI/searcher leaves the field early (e.g., urgent care type of medical visit).</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdad6'
                                color='#410002'
                                icon={<Ionicons name="stop-circle" size={24} color="#410002" />}
                                title={<><Text style={riskStyles.boldText}>Major</Text>: IWI with &gt; 1 week recovery (e.g., emergency room type of medical visit).</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffb4ab'
                                color='#690005'
                                icon={<Ionicons name="close-circle" size={24} color="#690005" />}
                                title={<><Text style={riskStyles.boldText}>Catastrophic</Text>: Death or permanent disability.</>}
                                noRadius />
                        </View>
                        <Text>Probability is scored on a scale of 1-5.</Text>
                        <Text>Exposure is scored on a scale of 1-4 with the following definitions as adopted by CALSAR:</Text>
                        <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginVertical: 4 }}>
                            <Banner
                                backgroundColor='#b9f0b8'
                                color='#002107'
                                icon={<Ionicons name="remove-circle" size={24} color="#002107" />}
                                title={<><Text style={riskStyles.boldText}>None or below average</Text>: One member of the team exposed for a short time.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdeae'
                                color='#281900'
                                icon={<Ionicons name="alert-circle" size={24} color="#281900" />}
                                title={<><Text style={riskStyles.boldText}>Average</Text>: More than one member exposed for a short time, or one member exposed for a longer time.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdad6'
                                color='#410002'
                                icon={<Ionicons name="stop-circle" size={24} color="#410002" />}
                                title={<><Text style={riskStyles.boldText}>Above average</Text>: One or more members exposed multiple times, or for long periods.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffb4ab'
                                color='#690005'
                                icon={<Ionicons name="close-circle" size={24} color="#690005" />}
                                title={<><Text style={riskStyles.boldText}>Great</Text>: Long or repeated exposure to multiple team members.</>}
                                noRadius />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
    return (<></>);
}

const riskStyles = StyleSheet.create({
    container: {

    },
    content: {
        padding: 20,
        paddingTop: 0,
        gap: 12
    },
    heading: {
        fontSize: 22,
        lineHeight: 28,
    },
    section: {
        gap: 6
    },
    image: {
        height: undefined,
        width: "100%",
        resizeMode: 'contain',
    },
    boldText: {
        fontWeight: 'bold',
    },
});