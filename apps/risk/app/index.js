import { Ionicons } from '@expo/vector-icons';
import { Banner, BrandingBar, FilledButton, Header, IconButton, MaterialCard, RiskModal, ShareButton, ThemeContext, Tile } from 'calsar-ui';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';

const ORMAOptions = require('../assets/images/orma-options.jpg');

const WebDownloadBanner = () => {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream; // More robust iOS check
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
        // Rely on Apple Smart Banner
        return <></>;
    } else if (isAndroid) {
        return <Banner
            onPress={() => { router.navigate("https://play.google.com/store/apps/details?id=org.ca_sar.risk") }}
            backgroundColor={colorTheme.secondaryContainer}
            color={colorTheme.onSecondaryContainer}
            icon={<Ionicons name="cloud-offline-outline" size={24} color={colorTheme.onSecondaryContainer} />}
            title="To install this app for offline use, tap here, or search your app store for &quot;SAR Risk Assessment&quot;"
            pad />;
    } else {
        return (
            <Banner
                backgroundColor={colorTheme.secondaryContainer}
                color={colorTheme.onSecondaryContainer}
                icon={<Ionicons name="megaphone-outline" size={24} color={colorTheme.onSecondaryContainer} />}
                title="This app is available for offline use on iPhone and Android devices. Search your app store for &quot;SAR Risk Assessment&quot;"
                pad />
        );
    }
};


export default function App() {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const styles = appStyles();
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

    setStatusBarStyle("light", true); // The header is a persistent color on the main page
    return (
        <View style={styles.background}>
            <Header style={styles.header}>
                <BrandingBar textColor={styles.header.color} title="Risk Assessment Tools" />
            </Header>
            <ScrollView
                style={[
                    styles.container,
                    { maxWidth: (width > 850 ? 850 : width) }
                ]}
                contentContainerStyle={styles.mainScroll}>
                {Platform.OS === 'web' && <WebDownloadBanner />}
                <MaterialCard
                    marginLeft={20}
                    marginRight={20}
                    title="Operational Risk Management Analysis (ORMA)"
                    subtitle="Use before the team enters the field. Considers all factors of a team’s participation in an event.">
                    <View style={{ alignSelf: "flex-end", flexDirection: "row", gap: 6, alignItems: "center", marginTop: 15 }}>
                        <IconButton ionicons_name="help-circle-outline" onPress={() => { viewHelp(0) }} />
                        <FilledButton rightAlign primary text="Complete an ORMA" onPress={() => { router.navigate("/ORMA") }} />
                    </View>
                </MaterialCard>
                <MaterialCard
                    marginLeft={20}
                    marginRight={20}
                    title="Severity, Probability, Exposure (SPE)"
                    subtitle="Use to categorize a specific risk when the situation in the field changes." >
                    <View style={{ alignSelf: "flex-end", flexDirection: "row", gap: 6, marginTop: 15 }}>
                        <IconButton ionicons_name="help-circle-outline" onPress={() => { viewHelp(1) }} />
                        <FilledButton rightAlign primary text="Complete a SPE" onPress={() => { router.navigate("/SPE") }} />
                    </View>
                </MaterialCard>
                <Text style={styles.headings}>Miscellaneous</Text>
                <View style={styles.miscSection}>
                    <Tile
                        href="settings"
                        icon={<Ionicons name="settings" size={20} color={colorTheme.primary} />}
                        title="App settings"
                        subtitle="Appearance, language, list style"
                    />
                </View>
                <View style={styles.miscSection}>
                    <Tile
                        href="https://www.cal-esar.org/"
                        icon={<Ionicons name="open-outline" size={20} color={colorTheme.primary} />}
                        title="About CALSAR"
                    />
                    <Tile
                        href="https://sites.google.com/cal-esar.org/members-only"
                        icon={<Ionicons name="open-outline" size={20} color={colorTheme.primary} />}
                        title="Member portal"
                        subtitle="Requires ca-sar.org login"
                    />
                </View>
                <RiskModal
                    isVisible={isModalVisible}
                    title={selectedEntry.title}
                    height={modalHeight}
                    onClose={onModalClose}>
                    {selectedEntry.content}
                </RiskModal>
                <Text style={styles.footerText}>This isn't a substitute for proper leadership, supervision, or comprehensive search and rescue training.</Text>
            </ScrollView>
        </View>
    );
}

const appStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        background: {
            backgroundColor: colorTheme.background,
            height: '100%'
        },
        header: {
            padding: 14,
            backgroundColor: colorTheme.brand,
            color: colorTheme.white,
        },
        container: {
            backgroundColor: colorTheme.background,
            height: '100%',
            alignSelf: 'center'
        },
        mainScroll: {
            paddingTop: 20,
            paddingBottom: Platform.OS === "ios" ? 40 : 20,
            gap: 20,
        },
        miscSection: {
            gap: 4,
            borderRadius: 26,
            overflow: 'hidden',
            marginHorizontal: 20,
        },
        headings: {
            fontSize: 20,
            color: colorTheme.onBackground,
            marginLeft: 20,
            marginRight: 20
        },
        footerText: {
            color: colorTheme.onSurfaceVariant,
            marginLeft: 20,
            marginRight: 20
        }
    });
}

function HelpInfo({ subject }) {
    const styles = riskStyles();
    const { colorTheme } = useContext(ThemeContext);
    if (subject === "ORMA") return (
        <ScrollView
            contentContainerStyle={styles.container}>
            <TouchableWithoutFeedback>
                <View style={styles.content}>
                    <Banner
                        backgroundColor={colorTheme.secondaryContainer}
                        color={colorTheme.onSecondaryContainer}
                        icon={<Ionicons name="bulb" size={24} color={colorTheme.onSecondaryContainer} />}
                        title="ORMA is also referred to as Green-Amber-Red (GAR)" />
                    <View style={styles.section}>
                        <Text style={styles.heading}>When</Text>
                        <Text style={styles.bodyText}>ORMA is used before the team enters the field. Complete it AFTER you have all your assignment information.</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Who</Text>
                        <Text style={styles.bodyText}>ORMA considers all factors of a team’s participation in an event. Every member of the team should complete it.</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>How</Text>
                        <Text style={styles.bodyText}>Use this app, the NPS Risk app, or the GAR worksheet on the IAP (if the search is organized by CALSAR) to complete the "individual" or "finger" methods.</Text>
                        <Image source={ORMAOptions} style={[styles.image, { aspectRatio: 863 / 540 }]} />
                        <Text style={styles.bodyText}>Individual method:</Text>
                        <Text style={styles.bodyText}>All team members complete the ORMA individually, then come together to discuss concerns and mitigations. This works best if every member of the team has a ORMA app.</Text>
                        <Text style={styles.bodyText}>Finger method:</Text>
                        <Text style={styles.bodyText}>1. Team leader reads each section out loud, including the description from the worksheet or app.</Text>
                        <Text style={styles.bodyText}>2. Each member decides on their score in their head</Text>
                        <Text style={styles.bodyText}>3. Team leader asks everyone to throw up their scores on their fingers</Text>
                        <Text style={styles.bodyText}>4. The score for the worksheet is the highest score from any member. </Text>
                        <Text style={styles.bodyText}>5. Members with the higher scores should say a few words as to why they’re concerned. Save discussions of mitigations for the end. </Text>
                        <Text style={styles.bodyText}>6. Once all categories are complete, discuss mitigations. Saving the mitigation discussion for the end helps, as sometimes one mitigation can address multiple concerns </Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Element Scoring</Text>
                        <Text style={styles.bodyText}>Each element gets scored 1-10. 1-10 seems like a lot of resolution, so how do we actually use this? Again think GAR:</Text>
                        <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginVertical: 4 }}>
                            <Banner
                                backgroundColor='#b9f0b8'
                                color='#002107'
                                icon={<Ionicons name="remove-circle" size={24} color="#002107" />}
                                title={<><Text style={styles.boldText}>Green</Text>: 1-4. No to little concern.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdeae'
                                color='#281900'
                                icon={<Ionicons name="alert-circle" size={24} color="#281900" />}
                                title={<><Text style={styles.boldText}>Amber</Text>: 5-7. Concerned enough we should work to mitigate risks.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdad6'
                                color='#410002'
                                icon={<Ionicons name="stop-circle" size={24} color="#410002" />}
                                title={<><Text style={styles.boldText}>Red</Text>: 8-10. Serious concern. Major restructure or mission turn down should be considered.</>}
                                noRadius />
                        </View>
                        <Text style={styles.bodyText}>Any elements in the amber range should trigger a talk about managing the risk.</Text>
                        <Text style={styles.bodyText}>The total score should be calculated, but isn’t as important as individual elements scores.</Text>
                        <Text style={styles.bodyText}>A large number of elements in the yellow, or a few in red are reasons to turn down an assignment unless those risks can be mitigated.</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Cool so we’re done?</Text>
                        <Text style={styles.bodyText}>Nope! Managing risk is a task that requires constant vigilance.</Text>
                        <Text style={styles.bodyText}>Have conditions changed in the field? Has our team dynamic changed? Is the command post still engaged? Are we using the mitigations we planned, and are they working?</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
    if (subject === "SPE") return (
        <ScrollView
            contentContainerStyle={styles.container}>
            <TouchableWithoutFeedback>
                <View style={styles.content}>
                    <Banner
                        backgroundColor={colorTheme.tertiaryContainer}
                        color={colorTheme.onTertiaryContainer}
                        icon={<Ionicons name="warning" size={24} color={colorTheme.onTertiaryContainer} />}
                        title="SPE is not appropriate for assessing a whole operation and is not a tool for risk mitigation." />
                    <View style={styles.section}>
                        <Text style={styles.heading}>What is SPE?</Text>
                        <Text style={styles.bodyText}>SPE is a method to help leaders make decisions made about risky situation in the field. It's useful for assessing specific risks. For example: is it safe to rappel this cliff?</Text>
                        <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginVertical: 4 }}>
                            <Banner
                                title="Severity - What is the potential loss or consequence?"
                                noRadius />
                            <Banner
                                title="Probability - What is the likelihood of loss or consequence?"
                                noRadius />
                            <Banner
                                title="Exposure - What is the amount of time, cycles, people or equipment involved?"
                                noRadius />
                        </View>
                        <Text style={styles.bodyText}>Probability is easily understood, but exposure is less obvious.</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>When</Text>
                        <Text style={styles.bodyText}>SPE is a tool that can be used at any time. Any member can request the team complete a SPE. It’s never required, but should be considered whenever the situation gets notably more complex or risky.</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>How</Text>
                        <Text style={styles.bodyText}>The team leader should use the "finger" method. Input from less experienced members should be prioritized.</Text>
                        <Text style={styles.bodyText}>Finger method:</Text>
                        <Text style={styles.bodyText}>1. Team leader reads each section out loud, including the description from the worksheet or app.</Text>
                        <Text style={styles.bodyText}>2. Each member decides on their score in their head</Text>
                        <Text style={styles.bodyText}>3. Team leader asks everyone to throw up their scores on their fingers</Text>
                        <Text style={styles.bodyText}>4. The score for the worksheet is the highest score from any member. </Text>
                        <Text style={styles.bodyText}>5. Members with the higher scores should say a few words as to why they’re concerned. Save discussions of mitigations for the end. </Text>
                        <Text style={styles.bodyText}>6. Once all categories are complete, discuss mitigations. Saving the mitigation discussion for the end helps, as sometimes one mitigation can address multiple concerns </Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>Element Scoring</Text>
                        <Text style={styles.bodyText}>Severity is scored on a scale of 1 (none or slight) to 5 (catastrophic):</Text>
                        <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginVertical: 4 }}>
                            <Banner
                                backgroundColor='#b9f0b8'
                                color='#002107'
                                icon={<Ionicons name="remove-circle" size={24} color="#002107" />}
                                title={<><Text style={styles.boldText}>None or Slight</Text>: Discomfort or nuisance.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdeae'
                                color='#281900'
                                icon={<Ionicons name="heart-circle" size={24} color="#281900" />}
                                title={<><Text style={styles.boldText}>Minimal</Text>: First aid required.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdeae'
                                color='#281900'
                                icon={<Ionicons name="alert-circle" size={24} color="#281900" />}
                                title={<><Text style={styles.boldText}>Significant</Text>: IWI/searcher leaves the field early (e.g., urgent care type of medical visit).</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdad6'
                                color='#410002'
                                icon={<Ionicons name="stop-circle" size={24} color="#410002" />}
                                title={<><Text style={styles.boldText}>Major</Text>: IWI with &gt; 1 week recovery (e.g., emergency room type of medical visit).</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffb4ab'
                                color='#690005'
                                icon={<Ionicons name="close-circle" size={24} color="#690005" />}
                                title={<><Text style={styles.boldText}>Catastrophic</Text>: Death or permanent disability.</>}
                                noRadius />
                        </View>
                        <Text style={styles.bodyText}>Probability is scored on a scale of 1-5.</Text>
                        <Text style={styles.bodyText}>Exposure is scored on a scale of 1-4 with the following definitions as adopted by CALSAR:</Text>
                        <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginVertical: 4 }}>
                            <Banner
                                backgroundColor='#b9f0b8'
                                color='#002107'
                                icon={<Ionicons name="remove-circle" size={24} color="#002107" />}
                                title={<><Text style={styles.boldText}>None or below average</Text>: One member of the team exposed for a short time.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdeae'
                                color='#281900'
                                icon={<Ionicons name="alert-circle" size={24} color="#281900" />}
                                title={<><Text style={styles.boldText}>Average</Text>: More than one member exposed for a short time, or one member exposed for a longer time.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffdad6'
                                color='#410002'
                                icon={<Ionicons name="stop-circle" size={24} color="#410002" />}
                                title={<><Text style={styles.boldText}>Above average</Text>: One or more members exposed multiple times, or for long periods.</>}
                                noRadius />
                            <Banner
                                backgroundColor='#ffb4ab'
                                color='#690005'
                                icon={<Ionicons name="close-circle" size={24} color="#690005" />}
                                title={<><Text style={styles.boldText}>Great</Text>: Long or repeated exposure to multiple team members.</>}
                                noRadius />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ScrollView>
    );
    return (<></>);
}

const riskStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
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
            color: colorTheme.onBackground
        },
        bodyText: {
            color: colorTheme.onBackground
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
}