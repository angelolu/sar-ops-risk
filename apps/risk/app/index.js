import { Ionicons } from '@expo/vector-icons';
import { Banner, BannerGroup, BrandingBar, FilledButton, Header, IconButton, MaterialCard, RiskModal, ThemeContext, Tile, textStyles } from 'calsar-ui';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

const ORMAOptions = require('../assets/images/orma-options.jpg');

const WebDownloadBanner = () => {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    // Apple Smart App Banners only work in Safari
    const isSafari = isIOS && /Safari/i.test(userAgent) && /Version/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    if (isIOS && isSafari) {
        // Rely on Apple Smart App Banner
        return <></>;
    } else if (isAndroid || isIOS) {
        const link = isIOS
            ? "https://apps.apple.com/us/app/risk-sar-risk-assessment/id6596800682"
            : "https://play.google.com/store/apps/details?id=org.ca_sar.risk";

        return <Banner
            onPress={() => { router.navigate(link) }}
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
    const styles = getStyles(colorTheme);
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
        },
        {
            title: "PEAACE Model",
            content: <HelpInfo subject="PEAACE" />
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
                    title="Operational Risk Management Analysis (ORMA)"
                    subtitle="Use before the team enters the field. Considers all factors of a team’s participation in an event.">
                    <View style={{ alignSelf: "flex-end", flexDirection: "row", gap: 6, alignItems: "center" }}>
                        <IconButton ionicons_name="help-circle-outline" onPress={() => { viewHelp(0) }} />
                        <FilledButton rightAlign primary text="Complete an ORMA" onPress={() => { router.navigate("/ORMA") }} />
                    </View>
                </MaterialCard>
                <MaterialCard
                    title="PEAACE"
                    subtitle="Quickly identify risks before and during a mission." >
                    <View style={{ alignSelf: "flex-end", flexDirection: "row", gap: 6, alignItems: "center" }}>
                        <IconButton ionicons_name="help-circle-outline" onPress={() => { viewHelp(2) }} />
                        <FilledButton rightAlign primary text="Complete a PEAACE" onPress={() => { router.navigate("/PEACE") }} />
                    </View>
                </MaterialCard>
                <MaterialCard
                    title="Severity, Probability, Exposure (SPE)"
                    subtitle="Use to categorize a specific risk when the situation in the field changes." >
                    <View style={{ alignSelf: "flex-end", flexDirection: "row", gap: 6, alignItems: "center" }}>
                        <IconButton ionicons_name="help-circle-outline" onPress={() => { viewHelp(1) }} />
                        <FilledButton rightAlign primary text="Complete a SPE" onPress={() => { router.navigate("/SPE") }} />
                    </View>
                </MaterialCard>
                <View style={{ gap: 16 }}>
                    <Text style={styles.headings}>Miscellaneous</Text>
                    <BannerGroup marginHorizontal={20}>
                        <Tile
                            href="settings"
                            icon={<Ionicons name="settings" size={20} />}
                            title="App settings"
                            subtitle="Appearance, language, list style"
                        />
                    </BannerGroup>
                    <BannerGroup marginHorizontal={20}>
                        <Tile
                            href="https://www.cal-esar.org/"
                            icon={<Ionicons name="open-outline" size={20} />}
                            title="About CALSAR"
                        />
                        <Tile
                            href="https://sites.google.com/cal-esar.org/members-only"
                            icon={<Ionicons name="open-outline" size={20} />}
                            title="Member portal"
                            subtitle="Requires ca-sar.org login"
                        />
                    </BannerGroup>
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

const getStyles = (colorTheme) => {

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
            gap: 10,
        },
        headings: {
            color: colorTheme.onPrimaryContainer,
            fontWeight: 'bold',
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
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);
    const styles = getRiskStyles(colorTheme);

    if (subject === "overview") return (
        <View style={styles.content}>
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>Risk management process</Text>
                <Text style={textStyle.bodyMedium}>Risk management is a continuous process that involves identifying hazards, assessing them, and developing mitigations.</Text>

                <Text style={[textStyle.bodyMedium, textStyle.titleMedium, { marginTop: 10 }]}>1. Identify hazards (situational awareness)</Text>
                <Text style={textStyle.bodyMedium}>• <Text style={textStyle.titleMedium}>Gather information</Text>: Objectives, communications, who's in charge.</Text>
                <Text style={textStyle.bodyMedium}>• <Text style={textStyle.titleMedium}>Identify hazards</Text>: Up, down, all around (weather, terrain, etc.), and any "Watch Out" conditions.</Text>

                <Text style={[textStyle.bodyMedium, textStyle.titleMedium, { marginTop: 10 }]}>2. Assess hazards and develop mitigations</Text>
                <Text style={textStyle.bodyMedium}>Use GAR or PEAACE to systematically evaluate the identified risks and plan controls.</Text>

                <Text style={[textStyle.bodyMedium, textStyle.titleMedium, { marginTop: 10 }]}>3. Decide Go/No-Go</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8 }}>
                    <View style={{ flex: 1, padding: 10, backgroundColor: colorTheme.surfaceContainerHighest, borderRadius: 12 }}>
                        <Text style={[textStyle.titleMedium, { textAlign: 'center', color: colorTheme.onSurface }]}>GAR</Text>
                        <Text style={[textStyle.bodySmall, { textAlign: 'center', color: colorTheme.onSurface }]}>Baseline many teams know, interoperable with NPS.</Text>
                    </View>
                    <View style={{ flex: 1, padding: 10, backgroundColor: colorTheme.surfaceContainerHighest, borderRadius: 12 }}>
                        <Text style={[textStyle.titleMedium, { textAlign: 'center', color: colorTheme.onSurface }]}>PEAACE</Text>
                        <Text style={[textStyle.bodySmall, { textAlign: 'center', color: colorTheme.onSurface }]}>GAR 2.0. Interoperable with USCG and simpler to use.</Text>
                    </View>
                </View>

                <Text style={[textStyle.bodyMedium, textStyle.titleMedium, { marginTop: 10 }]}>4. Supervise and evaluate</Text>
                <Text style={textStyle.bodyMedium}>Are controls adequately mitigating hazards? If <Text style={textStyle.titleMedium}>NO</Text>, reassess and consider:</Text>
                <Text style={textStyle.bodyMedium}>• <Text style={textStyle.titleMedium}>Human Factors</Text>: Experience level, Fatigue/Stress, Unsafe attitude.</Text>
                <Text style={textStyle.bodyMedium}>• <Text style={textStyle.titleMedium}>Situation</Text>: What is changing? Are strategies/tactics working?</Text>
            </View>

            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>GAR vs. PEAACE</Text>
                <Text style={textStyle.bodyMedium}>Both were developed by the USCG to assess and mitigate risk. PEAACE is GAR 2.0 and offers several advantages and simplifications. Many teams still use GAR for interoperability reasons.</Text>
                <Text style={[textStyle.bodyMedium, { marginTop: 6 }]}>To complete: Discuss with either your whole team, or a representative subset. GAR/PEAACE works because it gives a voice to all members. It should be completed once all available information is known, but <Text style={textStyle.titleMedium}>before going into the field!</Text></Text>
            </View>
        </View>
    );
    if (subject === "ORMA") return (
        <View style={styles.content}>
            <Banner
                backgroundColor={colorTheme.secondaryContainer}
                color={colorTheme.onSecondaryContainer}
                icon={<Ionicons name="bulb" size={24} color={colorTheme.onSecondaryContainer} />}
                title="ORMA is also referred to as Green-Amber-Red (GAR)" />

            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>When</Text>
                <Text style={textStyle.bodyMedium}>ORMA is used before the team enters the field. Complete it AFTER you have all your assignment information.</Text>
            </View>
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>Who</Text>
                <Text style={textStyle.bodyMedium}>ORMA considers all factors of a team’s participation in an event. Every member of the team should complete it.</Text>
            </View>
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>How</Text>
                <Text style={textStyle.bodyMedium}>Use this app or the worksheet in the IAP (if provided) to complete the <Text style={{ fontWeight: 'bold' }}>Individual method</Text> or <Text style={{ fontWeight: 'bold' }}>Finger method</Text>.</Text>
                <Image source={ORMAOptions} style={[styles.image, { aspectRatio: 863 / 540 }]} />
                <Text style={[textStyle.bodyMedium, { fontWeight: 'bold' }]}>Individual method:</Text>
                <Text style={textStyle.bodyMedium}>All team members complete the assessment individually, then come together to discuss concerns and mitigations. This works best if every member of the team has this app.</Text>
                <Text style={[textStyle.bodyMedium, { marginTop: 8, fontWeight: 'bold' }]}>Finger method:</Text>
                <Text style={textStyle.bodyMedium}>1. Team leader reads each section out loud, including the description.</Text>
                <Text style={textStyle.bodyMedium}>2. Each member decides on their score in their head.</Text>
                <Text style={textStyle.bodyMedium}>3. Team leader asks everyone to throw up their scores on their fingers.</Text>
                <Text style={textStyle.bodyMedium}>4. The score for the worksheet is the <Text style={{ fontWeight: 'bold' }}>highest score</Text> from any member.</Text>
                <Text style={textStyle.bodyMedium}>5. Members with the higher scores should say a few words as to why they're concerned. Save discussions of mitigations for the end.</Text>
                <Text style={textStyle.bodyMedium}>6. Once complete, discuss mitigations. One mitigation can often address multiple concerns.</Text>
            </View>

            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>Element scoring</Text>
                <Text style={textStyle.bodyMedium}>Each element gets scored 1-10. 1-10 seems like a lot of resolution, so how do we actually use this? Again think GAR:</Text>
                <BannerGroup marginHorizontal={0}>
                    <Banner
                        backgroundColor='#b9f0b8'
                        color='#002107'
                        icon={<Ionicons name="remove-circle" size={24} color="#002107" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#002107' }}>1-2</Text>: No to little concern.</>}
                    />
                    <Banner
                        backgroundColor='#e6f4ea'
                        color='#002107'
                        icon={<Ionicons name="remove-circle" size={24} color="#002107" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#002107' }}>3-4</Text>: Mild concern. Not concerning enough to require mitigation but worth drawing attention to.</>}
                    />
                    <Banner
                        backgroundColor='#ffdeae'
                        color='#281900'
                        icon={<Ionicons name="alert-circle" size={24} color="#281900" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#281900' }}>5-7</Text>: Concerning enough we should work to mitigate risks.</>}
                    />
                    <Banner
                        backgroundColor='#ffdad6'
                        color='#410002'
                        icon={<Ionicons name="stop-circle" size={24} color="#410002" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#410002' }}>8-10</Text>: Serious concern. Major restructure or mission turn down should be considered.</>}
                    />
                </BannerGroup>
                <Text style={[textStyle.bodyMedium, { marginTop: 6 }]}>At the end of the GAR, you should have a consensus on: General risk level, Mitigations and controls, Risk vs Gain, and Go / No Go.</Text>
            </View>
        </View>
    );
    if (subject === "SPE") return (
        <View style={styles.content}>
            <Banner
                backgroundColor={colorTheme.tertiaryContainer}
                color={colorTheme.onTertiaryContainer}
                icon={<Ionicons name="warning" size={24} color={colorTheme.onTertiaryContainer} />}
                title="SPE is not appropriate for assessing a whole operation and is not a tool for risk mitigation." />
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>What is SPE?</Text>
                <Text style={textStyle.bodyMedium}>SPE is a method to help leaders make decisions made about risky situation in the field. It's useful for assessing specific risks. For example: is it safe to rappel this cliff?</Text>
                <BannerGroup marginHorizontal={0}>
                    <Banner
                        title="Severity - What is the potential loss or consequence?"
                    />
                    <Banner
                        title="Probability - What is the likelihood of loss or consequence?"
                    />
                    <Banner
                        title="Exposure - What is the amount of time, cycles, people or equipment involved?"
                    />
                </BannerGroup>
                <Text style={textStyle.bodyMedium}>Probability is easily understood, but exposure is less obvious.</Text>
            </View>
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>When</Text>
                <Text style={textStyle.bodyMedium}>SPE is a tool that can be used at any time. Any member can request the team complete a SPE. It’s never required, but should be considered whenever the situation gets notably more complex or risky.</Text>
            </View>
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>How</Text>
                <Text style={textStyle.bodyMedium}>The team leader should use the <Text style={{ fontWeight: 'bold' }}>Finger method</Text>. Input from less experienced members should be prioritized.</Text>
                <Text style={[textStyle.bodyMedium, { fontWeight: 'bold' }]}>Finger method:</Text>
                <Text style={textStyle.bodyMedium}>1. Team leader reads each section out loud, including the description from the worksheet or app.</Text>
                <Text style={textStyle.bodyMedium}>2. Each member decides on their score in their head</Text>
                <Text style={textStyle.bodyMedium}>3. Team leader asks everyone to throw up their scores on their fingers</Text>
                <Text style={textStyle.bodyMedium}>4. The score for the worksheet is the highest score from any member. </Text>
                <Text style={textStyle.bodyMedium}>5. Members with the higher scores should say a few words as to why they’re concerned. Save discussions of mitigations for the end. </Text>
                <Text style={textStyle.bodyMedium}>6. Once all categories are complete, discuss mitigations. Saving the mitigation discussion for the end helps, as sometimes one mitigation can address multiple concerns </Text>
            </View>
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>Element scoring</Text>
                <Text style={textStyle.bodyMedium}>Severity is scored on a scale of 1 (none or slight) to 5 (catastrophic):</Text>
                <BannerGroup marginHorizontal={0}>
                    <Banner
                        backgroundColor='#b9f0b8'
                        color='#002107'
                        icon={<Ionicons name="checkmark-circle" size={24} color="#002107" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#002107' }}>None or Slight</Text>: Discomfort or nuisance.</>}
                    />
                    <Banner
                        backgroundColor='#f0e68c'
                        color='#281900'
                        icon={<Ionicons name="bandage" size={24} color="#281900" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#281900' }}>Minimal</Text>: First aid required.</>}
                    />
                    <Banner
                        backgroundColor='#ffdeae'
                        color='#281900'
                        icon={<Ionicons name="warning" size={24} color="#281900" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#281900' }}>Significant</Text>: IWI/searcher leaves the field early (e.g., urgent care type of medical visit).</>}
                    />
                    <Banner
                        backgroundColor='#ffb59c'
                        color='#410002'
                        icon={<Ionicons name="alert-circle" size={24} color="#410002" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#410002' }}>Major</Text>: IWI with &gt; 1 week recovery (e.g., emergency room type of medical visit).</>}
                    />
                    <Banner
                        backgroundColor='#ff897d'
                        color='#410002'
                        icon={<Ionicons name="skull" size={24} color="#410002" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#410002' }}>Catastrophic</Text>: Death or permanent disability.</>}
                    />
                </BannerGroup>
                <Text style={textStyle.bodyMedium}>Probability is scored on a scale of 1-5.</Text>
                <Text style={textStyle.bodyMedium}>Exposure is scored on a scale of 1-4 with the following definitions as adopted by CALSAR:</Text>
                <BannerGroup marginHorizontal={0}>
                    <Banner
                        backgroundColor='#b9f0b8'
                        color='#002107'
                        icon={<Ionicons name="checkmark-circle" size={24} color="#002107" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#002107' }}>None or below average</Text>: One member of the team exposed for a short time.</>}
                    />
                    <Banner
                        backgroundColor='#f0e68c'
                        color='#281900'
                        icon={<Ionicons name="people" size={24} color="#281900" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#281900' }}>Average</Text>: More than one member exposed for a short time, or one member exposed for a longer time.</>}
                    />
                    <Banner
                        backgroundColor='#ffdeae'
                        color='#281900'
                        icon={<Ionicons name="timer" size={24} color="#281900" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#281900' }}>Above average</Text>: One or more members exposed multiple times, or for long periods.</>}
                    />
                    <Banner
                        backgroundColor='#ffb59c'
                        color='#410002'
                        icon={<Ionicons name="warning" size={24} color="#410002" />}
                        title={<><Text style={{ fontWeight: 'bold', color: '#410002' }}>Great</Text>: Long or repeated exposure to multiple team members.</>}
                    />
                </BannerGroup>
            </View>
        </View>

    );
    if (subject === "PEAACE") return (
        <View style={styles.content}>
            <Banner
                backgroundColor={colorTheme.tertiaryContainer}
                color={colorTheme.onTertiaryContainer}
                icon={<Ionicons name="shield-checkmark" size={24} color={colorTheme.onTertiaryContainer} />}
                title="PEAACE is a tool to identify and mitigate risks." />
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>What is PEAACE?</Text>
                <Text style={textStyle.bodyMedium}>PEAACE is GAR 2.0. It offers several advantages and simplifications over the legacy model while remaining interoperable with USCG standards.</Text>
                <BannerGroup marginHorizontal={0}>
                    <Banner
                        title="Planning - sufficient info? clear mission? time to plan?"
                    />
                    <Banner
                        title="Event Complexity - difficulty? endurance? timelines?"
                    />
                    <Banner
                        title="Assets - Crew - fitness? selection? training? supervision?"
                    />
                    <Banner
                        title="Assets - Resources - appropriate boats? trucks? gear?"
                    />
                    <Banner
                        title="Communications - coverage? equipment? terminology?"
                    />
                    <Banner
                        title="Environment - weather? night/day? terrain?"
                    />
                </BannerGroup>
            </View>
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>Instructions</Text>
                <Text style={textStyle.bodyMedium}>Determine the level of risk for each element based on the Low/Med/High scale. If rated Medium or High, explore controls or mitigations.</Text>
                <Text style={[textStyle.bodyMedium, { marginTop: 6 }]}>For Medium and High, the team should discuss mitigations and the risk vs gain. Only go ahead with High risk factor missions for higher gain missions, and with leadership endorsement.</Text>
            </View>
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>Consensus</Text>
                <Text style={textStyle.bodyMedium}>At the end of the PEAACE assessment you should have a consensus on:</Text>
                <Text style={textStyle.bodyMedium}>• General risk level of the mission</Text>
                <Text style={textStyle.bodyMedium}>• Mitigations and controls</Text>
                <Text style={textStyle.bodyMedium}>• Risk vs Gain</Text>
                <Text style={textStyle.bodyMedium}>• Go / No Go</Text>
            </View>
            <View style={styles.section}>
                <Text style={textStyle.titleLarge}>Mitigation (STAAR)</Text>
                <Text style={textStyle.bodyMedium}>If the risk is too high, consider the STAAR model to mitigate risks:</Text>
                <BannerGroup marginHorizontal={0}>
                    <Banner title="Spread Out - can we increase time or distance?" />
                    <Banner title="Transfer - update equipment, other assets, or different crews?" />
                    <Banner title="Avoid - wait for day? wait for weather?" />
                    <Banner title="Accept - is the gain worth the risk?" />
                    <Banner title="Reduce - more PPE? more training?" />
                </BannerGroup>
            </View>
        </View>
    );
    return (<></>);
}

const getRiskStyles = (colorTheme) => {

    return StyleSheet.create({
        container: {

        },
        content: {
            paddingBottom: 8, // Give the button shadow some "room" inside the animated view
            paddingHorizontal: 4, // Prevents side-shadow clipping
            gap: 12
        },
        section: {
            gap: 6
        },
        image: {
            height: "auto",
            width: "100%",
            resizeMode: 'stretch',
            marginBottom: "10px"
        },
    });
}