import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, Pressable } from 'react-native';
import { FilledButton, RiskModal, ShareButton, ThemeContext, Banner } from 'calsar-ui';
import ItemList from '../../components/ItemList';
import RiskHeader from '../../components/RiskHeader';
import { useRiskAssessment } from '../../hooks/useRiskAssessment';
import { PEACE_USCG_ASHORE_CONFIG } from '../../config/RiskStrategies';

export default function PEACE() {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const styles = pageStyles();
    const router = useRouter();

    const { calculate, getResult, getItemResult } = useRiskAssessment(PEACE_USCG_ASHORE_CONFIG);

    const [isModalVisible, setIsModalVisible] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState(0);
    const [inputMode, setInputMode] = useState("emoji");
    const [entries, setEntries] = useState([
        { title: "Planning", subtitle: "Enough time and information to conduct thorough pre-mission planning. Consider: B-0 response, completeness of mission information and of on-scene details.", score: 0, description: "" },
        { title: "Event", subtitle: "Refers to mission complexity. Consider: non-standard mission profile, coordinating multi-agency/nationality, language barriers, not performed often, etc.", score: 0, description: "" },
        { title: "Asset - Crew", subtitle: "Proper number and skill set for the mission. Consider: time at unit, familiarity w/OP area, fatigue, u/w time, crew selection, adequate supervision, etc.", score: 0, description: "" },
        { title: "Asset - Cutter/Boat Resources", subtitle: "Proper number and operational characteristics for mission. Consider: operational thresholds/limitations, status of equipment, etc.", score: 0, description: "" },
        { title: "Communications/Supervision", subtitle: "Ability to maintain comms throughout mission. Consider: availability/quality of internal w/command and external w/customer.", score: 0, description: "" },
        { title: "Environment", subtitle: "External conditions surrounding mission. Consider: weather, night/day, sea state, currents, water temp, air temp, visibility, etc.", score: 0, description: "" },
    ]);


    const [language, setLanguage] = useState(null);
    const [explicitLanguageSet, setExplicitLanguageSet] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem("peace-input-mode").then((value) => {
            if (value) setInputMode(JSON.parse(value));
        });

        AsyncStorage.getItem("language-peace").then((value) => {
            if (value) updateLanguage(JSON.parse(value));
        });
    }, []);

    const updateLanguage = (lang) => {
        setLanguage(lang);
        if (lang) {
            setExplicitLanguageSet(true);
            AsyncStorage.setItem("language-peace", JSON.stringify(lang));

            if (lang === 'nasar') {
                setEntries([
                    { title: "Planning", subtitle: "Enough time and information to conduct thorough pre-mission planning", score: 0, description: "" },
                    { title: "Event", subtitle: "Mission complexity, standard or nonstandard, working with unfamiliar teams, etc.", score: 0, description: "" },
                    { title: "Asset — Crew", subtitle: "Proper number, skill, leadership experience and rest or fatigue level", score: 0, description: "" },
                    { title: "Asset — Equipment", subtitle: "Vehicles, personal and team gear and personal protective equipment that is mission-ready", score: 0, description: "" },
                    { title: "Communications and Supervision", subtitle: "Ability to maintain communications and span of control throughout the incident", score: 0, description: "" },
                    { title: "Environment", subtitle: "Weather, terrain, snow, night or day and wildlife", score: 0, description: "" },
                ]);
            } else {
                // Default USCG Ashore
                setEntries([
                    { title: "Planning", subtitle: "Enough time and information to conduct thorough pre-mission planning. Consider: B-0 response, completeness of mission information and of on-scene details.", score: 0, description: "" },
                    { title: "Event", subtitle: "Refers to mission complexity. Consider: non-standard mission profile, coordinating multi-agency/nationality, language barriers, not performed often, etc.", score: 0, description: "" },
                    { title: "Asset - Crew", subtitle: "Proper number and skill set for the mission. Consider: time at unit, familiarity w/OP area, fatigue, u/w time, crew selection, adequate supervision, etc.", score: 0, description: "" },
                    { title: "Asset - Cutter/Boat Resources", subtitle: "Proper number and operational characteristics for mission. Consider: operational thresholds/limitations, status of equipment, etc.", score: 0, description: "" },
                    { title: "Communications/Supervision", subtitle: "Ability to maintain comms throughout mission. Consider: availability/quality of internal w/command and external w/customer.", score: 0, description: "" },
                    { title: "Environment", subtitle: "External conditions surrounding mission. Consider: weather, night/day, sea state, currents, water temp, air temp, visibility, etc.", score: 0, description: "" },
                ]);
            }
        }
    }

    const getResultString = () => {
        return entries.map(item => `${item.title}\nScore: ${getScoreLabel(item.score)}\n`).join('\n');
    }

    const getScoreLabel = (score) => {
        if (score === 1) return "Low Risk";
        if (score === 2) return "Medium Risk";
        if (score === 3) return "High Risk";
        return "Not Scored";
    }

    const onItemSelect = (index) => {
        setSelectedEntry(index);
        setIsModalVisible(true);
    };

    const onChangeValue = (value, description) => {
        const updatedEntries = [...entries];
        const itemColors = getItemResult(value);
        updatedEntries[selectedEntry].score = value;
        updatedEntries[selectedEntry].containerColor = itemColors.containerColor;
        updatedEntries[selectedEntry].color = itemColors.contentColor;
        updatedEntries[selectedEntry].description = description;
        setEntries(updatedEntries);

        // Wait 0.25 seconds, then auto-advance
        setTimeout(() => {
            if (selectedEntry < entries.length - 1) {
                setSelectedEntry(selectedEntry + 1);
            } else {
                setIsModalVisible(false);
            }
        }, 250);
    };

    const onModalClose = () => {
        setIsModalVisible(false);
    };

    let isDone = !entries.some(entry => entry.score === 0);
    let hasWarning = entries.some(entry => entry.score >= 2); // Medium or High
    setStatusBarStyle(colorScheme === 'light' ? (isDone ? "light" : "dark") : "light", true);

    let score = calculate(entries);
    let result = getResult(score);

    if (!explicitLanguageSet) {
        return (
            <View style={Platform.OS === 'web' ? styles.containerWeb : styles.container}>
                <RiskHeader
                    title="PEAACE Model"
                    score={0}
                    subtitle="Select a language to continue"
                    complete={false}
                />
                <RiskModal
                    isVisible={true}
                    title="Choose PEAACE Language"
                    onClose={() => router.back()}
                >
                    <View style={{ padding: 20, paddingTop: 0 }}>
                        <Text style={{ color: colorTheme.onSurface, marginBottom: 15 }}>Different agencies use different definitions. You can change this later in Settings.</Text>
                        <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2 }}>
                            <Banner
                                backgroundColor={colorTheme.surfaceContainerLow}
                                color={colorTheme.onSurfaceVariant}
                                icon={<Ionicons name="walk" size={24} color={colorTheme.onSurfaceVariant} />}
                                title="NASAR"
                                onPress={() => updateLanguage('nasar')}
                                noRadius />
                            <Banner
                                backgroundColor={colorTheme.surfaceContainerLow}
                                color={colorTheme.onSurfaceVariant}
                                icon={<Ionicons name="boat" size={24} color={colorTheme.onSurfaceVariant} />}
                                title="USCG Ashore"
                                onPress={() => updateLanguage('uscg')}
                                noRadius />
                        </View>
                    </View>
                </RiskModal>
            </View>
        )
    }

    return (
        <View style={Platform.OS === 'web' ? styles.containerWeb : styles.container}>
            <RiskHeader
                sharedTransitionTag="sectionTitle"
                title="PEAACE Model"
                subtitle={isDone ? result.action : "Tap each element below to assign a risk score"}
                riskText={isDone ? result.label : ''}
                riskColor={isDone ? result.color : colorTheme.surfaceContainer}
                complete={isDone}
                menu={isDone && <ShareButton title="PEAACE Results" content={"PEAACE results\nOverall Status: " + result.label + "\n" + getResultString()} color="#ffffff" />}
            />
            {hasWarning && isDone &&
                <View style={styles.warningBar}>
                    <Ionicons name="warning" size={24} color={colorTheme.onTertiaryFixed} />
                    <Text style={styles.warningText}>Discuss mitigations and risk vs gain for elements with medium or high risk</Text>
                </View>}
            <ItemList
                items={entries.map(e => {
                    let scoreDisplay = 0;
                    if (e.score > 0) {
                        if (inputMode === 'emoji') {
                            if (language === 'nasar') {
                                scoreDisplay = e.score === 1 ? '👍' : e.score === 2 ? '✊' : '👎';
                            } else {
                                scoreDisplay = e.score === 1 ? '😀' : e.score === 2 ? '😐' : '☹️';
                            }
                        } else {
                            scoreDisplay = e.score === 1 ? 'L' : e.score === 2 ? 'M' : 'H';
                        }
                    }
                    return { ...e, score: scoreDisplay };
                })}
                onSelect={onItemSelect}
            />
            {isDone && <View style={styles.bottomBar}>
                <FilledButton
                    primary
                    icon="grid-outline"
                    text="Interpret Risk vs Gain"
                    onPress={() => router.push({ pathname: "/PEACE/RiskGainMatrix", params: { riskLevel: result.label } })}
                    style={{ width: '100%' }}
                />
            </View>}
            <RiskModal
                isVisible={isModalVisible}
                title={entries[selectedEntry].title}
                onClose={onModalClose}
            >
                <RiskInput
                    item={entries[selectedEntry]}
                    mode={inputMode}
                    onChangeValue={onChangeValue}
                    language={language}
                />
            </RiskModal>
        </View>
    );
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colorTheme.background,
            height: '100%'
        },
        containerWeb: {
            flex: 1,
            backgroundColor: colorTheme.background,
            height: '100%',
        },
        warningBar: {
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: colorTheme.tertiaryFixed,
            alignItems: 'center'
        },
        warningText: {
            flex: -1,
            color: colorTheme.onTertiaryFixed,
            flexShrink: 1
        },
        bottomBar: {
            padding: 20,
            paddingBottom: 20,
            backgroundColor: colorTheme.surface,
            borderTopWidth: 1,
            borderColor: colorTheme.outlineVariant
        }
    });
}

function RiskInput({ item, mode, onChangeValue, language }) {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const styles = riskInputStyles();

    const options = language === 'nasar' ? [
        { value: 1, emoji: '👍', label: 'Low Risk', desc: 'Minimal concern' },
        { value: 2, emoji: '✊', label: 'Medium Risk', desc: 'Caution warranted' },
        { value: 3, emoji: '👎', label: 'High Risk', desc: 'Significant danger' }
    ] : [
        { value: 1, emoji: '😀', label: 'Low Risk', desc: 'Minimal concern' },
        { value: 2, emoji: '😐', label: 'Medium Risk', desc: 'Caution warranted' },
        { value: 3, emoji: '☹️', label: 'High Risk', desc: 'Significant danger' }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.subtitle}>{item.subtitle}</Text>

            <View style={styles.inputContainer}>
                {mode === 'emoji' ? (
                    <View style={styles.emojiRow}>
                        {options.map((opt) => {
                            let itemStyle = { backgroundColor: colorTheme.surfaceContainerHigh, borderColor: colorTheme.outlineVariant };
                            if (item.score === opt.value) {
                                if (opt.value === 1) itemStyle = { backgroundColor: getHoverColor(colorTheme.garGreenDark, 0.2), borderColor: colorTheme.garGreenDark };
                                else if (opt.value === 2) itemStyle = { backgroundColor: getHoverColor(colorTheme.garAmberDark, 0.2), borderColor: colorTheme.garAmberDark };
                                else if (opt.value === 3) itemStyle = { backgroundColor: getHoverColor(colorTheme.garRedDark, 0.2), borderColor: colorTheme.garRedDark };
                            }

                            return (
                                <Pressable
                                    key={opt.value}
                                    style={[
                                        styles.emojiButton,
                                        item.score === opt.value && styles.emojiSelected,
                                        itemStyle
                                    ]}
                                    onPress={() => onChangeValue(opt.value, "")}
                                >
                                    <Text style={styles.emoji}>{opt.emoji}</Text>
                                    <Text style={[styles.emojiLabel, { color: colorTheme.onSurface }]}>{opt.label}</Text>
                                </Pressable>
                            )
                        })}
                    </View>
                ) : (
                    <View style={styles.textStack}>
                        {options.map((opt) => (
                            <Banner
                                key={opt.value}
                                backgroundColor={item.score === opt.value ? colorTheme.primaryContainer : colorTheme.surfaceContainerLow}
                                color={colorTheme.onSurface}
                                icon={<Text style={{ fontSize: 20 }}>{opt.emoji}</Text>}
                                title={<><Text style={styles.boldText}>{opt.label}</Text>: {opt.desc}</>}
                                onPress={() => onChangeValue(opt.value, opt.label)}
                                noRadius
                            />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const riskInputStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        container: {
            padding: 20,
            paddingTop: 0
        },
        subtitle: {
            color: colorTheme.onSurface,
            fontSize: 16,
            paddingBottom: 10
        },
        inputContainer: {
            marginTop: 10
        },
        emojiRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            gap: 10
        },
        emojiButton: {
            height: 125,
            borderRadius: 50,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            flexBasis: 0,
            flexGrow: 1,
            borderWidth: 2,
            borderColor: colorTheme.outlineVariant
        },
        emojiSelected: {
            borderWidth: 2,
        },
        emoji: {
            fontSize: 40,
            marginBottom: 5
        },
        emojiLabel: {
            fontSize: 12,
            textAlign: 'center'
        },
        textStack: {
            borderRadius: 26,
            overflow: 'hidden',
            gap: 2
        },
        boldText: {
            fontWeight: 'bold'
        }
    });
}
