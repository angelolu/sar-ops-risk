import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Banner, BannerGroup, FilledButton, MaterialCard, RiskModal, ShareButton, TabContainer, ThemeContext, textStyles } from 'calsar-ui';
import { useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import ItemList from '../../components/ItemList';
import RiskGainGrid, { MATRIX_CONTENT } from '../../components/RiskGainGrid';
import RiskHeader from '../../components/RiskHeader';
import { PEACE_USCG_ASHORE_CONFIG } from '../../config/RiskStrategies';
import { useRiskAssessment } from '../../hooks/useRiskAssessment';

const getAshoreEntries = () => [
    { title: "Planning", subtitle: "Enough time and information to conduct thorough pre-mission planning. Consider: B-0 response, completeness of mission information and of on-scene details.", score: 0, description: "" },
    { title: "Event", subtitle: "Refers to mission complexity. Consider: non-standard mission profile, coordinating multi-agency/nationality, language barriers, not performed often, etc.", score: 0, description: "" },
    { title: "Asset - Crew", subtitle: "Proper number and skill set for the mission. Consider: time at unit, familiarity w/ op area, fatigue, u/w time, crew selection, adequate supervision, etc.", score: 0, description: "" },
    { title: "Asset - Cutter/Boat Resources", subtitle: "Proper number and operational characteristics for mission. Consider: operational thresholds/limitations, status of equipment, etc.", score: 0, description: "" },
    { title: "Communications/Supervision", subtitle: "Ability to maintain comms throughout mission. Consider: availability/quality of internal w/command and external w/customer.", score: 0, description: "" },
    { title: "Environment", subtitle: "External conditions surrounding mission. Consider: weather, night/day, sea state, currents, water temp, air temp, visibility, etc.", score: 0, description: "" },
];

const getNasarEntries = () => [
    { title: "Planning", subtitle: "Is the planning process rushed or based on missing information?", score: 0, description: "" },
    { title: "Event", subtitle: "Is the mission complicated, nonstandard or involving unfamiliar teams?", score: 0, description: "" },
    { title: "Asset — Crew", subtitle: "Is the team tired, inexperienced or lacking strong leadership or skills or the wrong size?", score: 0, description: "" },
    { title: "Asset — Equipment", subtitle: "Are vehicles, gear or personal protective equipment missing, damaged or unsuitable for this mission?", score: 0, description: "" },
    { title: "Communications and Supervision", subtitle: "Will it be difficult to maintain communication with command and other parties throughout the mission?", score: 0, description: "" },
    { title: "Environment", subtitle: "Do weather, terrain, light, wildlife or other conditions make this mission dangerous?", score: 0, description: "" },
];

export default function PEACE() {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);
    const router = useRouter();

    const { calculate, getResult, getItemResult } = useRiskAssessment(PEACE_USCG_ASHORE_CONFIG);

    const [isModalVisible, setIsModalVisible] = useState(true);
    const [isGainModalVisible, setIsGainModalVisible] = useState(false);

    // Modes
    const [selectedEntry, setSelectedEntry] = useState(0);
    const [inputMode, setInputMode] = useState("emoji");
    const [gain, setGain] = useState(null); // 'Low', 'Medium', 'High'
    const [activeTab, setActiveTab] = useState('risk');

    const [entries, setEntries] = useState(getAshoreEntries());
    const [language, setLanguage] = useState(null);
    const [explicitLanguageSet, setExplicitLanguageSet] = useState(false);
    const [isAdvancing, setIsAdvancing] = useState(false);

    const isLargeScreen = width > 800;
    const styles = getStyles(colorTheme, isLargeScreen);

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
            setEntries(lang === 'nasar' ? getNasarEntries() : getAshoreEntries());
            setSelectedEntry(0);
            setIsModalVisible(true);
        }
    }

    const onItemSelect = (index) => {
        setSelectedEntry(index);
        setIsModalVisible(true);
    };

    // Risk Input Handler
    const onChangeValue = (value, description) => {
        const itemColors = getItemResult(value);
        setEntries(entries.map((entry, idx) =>
            idx === selectedEntry
                ? { ...entry, score: value, backgroundColor: itemColors.backgroundColor, color: itemColors.color, description }
                : entry
        ));

        if (selectedEntry < entries.length - 1) {
            setTimeout(() => { setIsAdvancing(true); }, 100);
            setTimeout(() => {
                setSelectedEntry(selectedEntry + 1);
                setIsAdvancing(false);
            }, 350);
        } else {
            // Last item rated
            setIsModalVisible(false);

            // If Large Screen, auto-transition to Gain if it is not completed
            if (isLargeScreen && !gain) {
                setTimeout(() => {
                    setIsGainModalVisible(true);
                }, 200);
            }
        }
    };

    const handleGainSelect = (selectedGain) => {
        setGain(selectedGain);
        setIsGainModalVisible(false);
        if (!isLargeScreen && activeTab !== 'gain') {
            setActiveTab('gain');
        }
    }

    // Calculations
    let isDone = !entries.some(entry => entry.score === 0);
    setStatusBarStyle(colorScheme === 'light' ? (isDone ? "light" : "dark") : "light", true);

    let score = calculate(entries);
    let result = getResult(score);

    // Tab Handler
    const handleTabSelect = (id) => {
        if (id === 'gain') {
            if (!gain) {
                setIsGainModalVisible(true);
            } else if (activeTab === "gain") {
                setIsGainModalVisible(true);
            }
        }

        if (id === 'risk' && !isDone) {
            // Find first unrated
            const firstUnrated = entries.findIndex(e => e.score === 0);
            if (firstUnrated !== -1) {
                setSelectedEntry(firstUnrated);
                setIsModalVisible(true);
            } else {
                // If somehow all rated but !isDone (logic mismatch?), fallback:
                setIsModalVisible(true);
            }
        }

        setActiveTab(id);
    }

    // Determine Highlighted Cell content
    const getCellContent = () => {
        if (!isDone || !gain) return null;

        const risk = result.label.toLowerCase();
        const g = gain.toLowerCase();

        if (risk.includes('low')) {
            return MATRIX_CONTENT.lowRisk;
        } else if (risk.includes('medium')) {
            if (g === 'low') return MATRIX_CONTENT.medRiskStrict;
            return MATRIX_CONTENT.medRisk;
        } else if (risk.includes('high')) {
            if (g === 'low') return MATRIX_CONTENT.turnDown;
            return MATRIX_CONTENT.highRisk;
        }
        return null;
    }

    const getCombinedResult = () => {
        if (!isDone) return { label: 'PEAACE risk assessment', color: colorTheme.surfaceContainer };

        // Ensure sentence case: "Low risk"
        let riskLabel = result.label || '';
        // Assuming result.label usually comes as "Low Risk", "Medium Risk".

        riskLabel = riskLabel.toLowerCase();
        // capitalize first letter
        riskLabel = riskLabel.charAt(0).toUpperCase() + riskLabel.slice(1);

        if (!gain) return { label: riskLabel, color: result.color };

        const gainLabel = `${gain.toLowerCase()} gain`;

        let color = result.color;
        // Specific warning color for Medium Risk + Low Gain
        if (riskLabel.toLowerCase().includes('medium') && gain === 'Low') {
            color = '#ba1a1a';
        }

        return {
            label: `${riskLabel}, ${gainLabel}`,
            color: color
        };
    };

    const combinedResult = getCombinedResult();

    const getShareContent = () => {
        let content = "PEAACE Results\n";
        content += `Overall Status: ${combinedResult.label}\n\n`;
        content += entries.map(item => `${item.title}: ${getScoreLabel(item.score)}`).join('\n');
        if (gain) {
            content += `\n\nGain Determination: ${gain}`;
        }
        return content;
    }

    const getScoreLabel = (score) => {
        if (score === 1) return "Low";
        if (score === 2) return "Medium";
        if (score === 3) return "High";
        return "Not Scored";
    }

    // -- Views --

    const RiskView = (
        <View style={{ flex: 1 }}>
            <ItemList
                items={entries.map(e => {
                    let scoreDisplay = 0;
                    if (e.score > 0) {
                        if (language === 'nasar') {
                            scoreDisplay = e.score === 1 ? '👍' : e.score === 2 ? '✊' : '👎';
                        } else {
                            scoreDisplay = e.score === 1 ? '😀' : e.score === 2 ? '😐' : '☹️';
                        }
                    }
                    return { ...e, score: scoreDisplay };
                })}
                onSelect={onItemSelect}
            />
        </View>
    );

    const GainView = (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 10 }}>
            {/* Controls */}
            <View style={{ width: '100%', justifyContent: isLargeScreen ? 'space-between' : 'flex-end', flexDirection: 'row', alignSelf: 'center', flexWrap: 'wrap' }}>
                {isLargeScreen && (
                    <Text style={[textStyle.headlineSmall, { paddingVertical: 6 }]}>Gain Assessment</Text>
                )}
                <FilledButton
                    tonal
                    small
                    rightAlign
                    icon="expand-outline"
                    text="Full matrix view"
                    onPress={() => router.push({ pathname: '/PEACE/full_matrix', params: { riskLevel: isDone ? result.label : null, gainLevel: gain } })}
                />
            </View>

            {/* Matrix */}
            <View style={{ width: '100%', alignSelf: 'center' }}>
                <RiskGainGrid
                    riskLevel={isDone ? result.label : null}
                    gainLevel={gain}
                    onGainHeaderPress={() => setIsGainModalVisible(true)}
                    detailedMode={false}
                />
            </View>

            {/* Result Card */}
            {isDone && gain && (
                <View style={{ width: '100%', alignSelf: 'center' }}>
                    <MaterialCard title="Assessment results" noMargin>
                        <Text style={[textStyle.bodyMedium]}>{getCellContent()}</Text>
                    </MaterialCard>
                </View>
            )}

            <View style={{ width: '100%', alignSelf: 'center' }}>
                <MaterialCard title="Mitigation model (STAAR)" noMargin>
                    <View>
                        <Text style={[textStyle.bodyMedium, { marginBottom: 6 }]}>If risks need to be mitigated, consider the STAAR model:</Text>
                        <View style={styles.staarContainer}>
                            <Text style={textStyle.bodyMedium}>• <Text style={{ fontWeight: 'bold' }}>S</Text>pread Out</Text>
                            <Text style={textStyle.bodyMedium}>• <Text style={{ fontWeight: 'bold' }}>T</Text>ransfer</Text>
                            <Text style={textStyle.bodyMedium}>• <Text style={{ fontWeight: 'bold' }}>A</Text>void</Text>
                            <Text style={textStyle.bodyMedium}>• <Text style={{ fontWeight: 'bold' }}>A</Text>ccept</Text>
                            <Text style={textStyle.bodyMedium}>• <Text style={{ fontWeight: 'bold' }}>R</Text>educe</Text>
                        </View>
                    </View>
                </MaterialCard>
            </View>

            <View style={{ width: '100%', alignSelf: 'center' }}>
                <MaterialCard title="Team consensus" noMargin>
                    <View>
                        <Text style={[textStyle.bodyMedium, { marginBottom: 6 }]}>Before going into the field, the team should have a consensus on:</Text>
                        <View style={styles.staarContainer}>
                            <Text style={textStyle.bodyMedium}>• General risk level of the mission</Text>
                            <Text style={textStyle.bodyMedium}>• Mitigations and controls</Text>
                            <Text style={textStyle.bodyMedium}>• Risk vs Gain</Text>
                            <Text style={textStyle.bodyMedium}>• <Text style={{ fontWeight: 'bold' }}>Go / No Go Decision</Text></Text>
                        </View>
                    </View>
                </MaterialCard>
            </View>

            {/* Definitions */}
            <View style={{ width: '100%', alignSelf: 'center' }}>
                <MaterialCard title="Gain definitions" noMargin>
                    <View>
                        <Text style={[textStyle.bodyMedium, { marginBottom: 4 }]}><Text style={{ fontWeight: 'bold' }}>Low Gain:</Text> Routine training, PR, property recovery or evidence search. Use for low-risk conditions only.</Text>
                        <Text style={[textStyle.bodyMedium, { marginBottom: 4 }]}><Text style={{ fontWeight: 'bold' }}>Medium Gain:</Text> Stable patient or environment, noncritical injury or protecting significant property.</Text>
                        <Text style={[textStyle.bodyMedium, { marginBottom: 4 }]}><Text style={{ fontWeight: 'bold' }}>High Gain:</Text> Lifesaving opportunity, immediate threat to life or preventing permanent injury.</Text>
                    </View>
                </MaterialCard>
            </View>
        </ScrollView>
    );

    if (!explicitLanguageSet) {
        return (
            <View style={styles.container}>
                <RiskHeader title="PEAACE model" score={0} subtitle="Select a language to continue" complete={false} />
                <RiskModal isVisible={true} title="Choose PEAACE language" onClose={() => router.back()}>
                    <View style={{ paddingBottom: 8, paddingHorizontal: 4, gap: 10 }}>
                        <Text style={{ color: colorTheme.onSurface, marginBottom: 15 }}>Different agencies use different definitions. You can change this later in Settings.</Text>
                        <BannerGroup marginHorizontal={0}>
                            <Banner backgroundColor={colorTheme.surfaceContainerLow} color={colorTheme.onSurfaceVariant} icon={<Ionicons name="walk" size={24} color={colorTheme.onSurfaceVariant} />} title="NASAR" onPress={() => updateLanguage('nasar')} />
                            <Banner backgroundColor={colorTheme.surfaceContainerLow} color={colorTheme.onSurfaceVariant} icon={<Ionicons name="boat" size={24} color={colorTheme.onSurfaceVariant} />} title="USCG Ashore" onPress={() => updateLanguage('uscg')} />
                        </BannerGroup>
                    </View>
                </RiskModal>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <RiskHeader
                sharedTransitionTag="sectionTitle"
                title="PEAACE"
                subtitle={isDone ? (gain ? "Review mitigations and controls to make a go/no go decision" : "Select gain to complete analysis") : "Start by assigning each element a risk score"}
                riskText={combinedResult.label}
                riskColor={combinedResult.color}
                complete={isDone}
                menu={isDone && <ShareButton title="PEAACE results" content={getShareContent()} color="#ffffff" />}
            />

            {isLargeScreen ? (
                <View style={{ flexDirection: 'row', flex: 1, justifyContent: "center", gap: 20 }}>
                    <View style={{ backgroundColor: colorTheme.surfaceContainerLow, padding: 20, flexShrink: 1 }}>
                        <Text style={[textStyle.headlineSmall, { paddingTop: 6, paddingBottom: 10 }]}>Risk Identification</Text>
                        {RiskView}
                    </View>
                    <View style={{ backgroundColor: colorTheme.surfaceContainerLow, maxWidth: 500, flexShrink: 1.5 }}>
                        {GainView}
                    </View>
                </View>
            ) : (
                <TabContainer
                    items={[
                        { id: 'risk', label: 'Risk', icon: 'list', content: RiskView },
                        { id: 'gain', label: 'Gain Assessment', icon: 'grid', content: GainView }
                    ]}
                    selectedId={activeTab}
                    onSelect={handleTabSelect}
                />
            )}

            {/* Risk Assignment Modal */}
            <RiskModal isVisible={isModalVisible} title={'Score \"' + entries[selectedEntry]?.title + '\"'} onClose={() => setIsModalVisible(false)}>
                <RiskInput item={entries[selectedEntry]} mode={inputMode} onChangeValue={onChangeValue} language={language} isAdvancing={isAdvancing} />
            </RiskModal>

            {/* Gain Assignment Modal */}
            <RiskModal isVisible={isGainModalVisible} title="Rate Gain" onClose={() => setIsGainModalVisible(false)}>
                <GainInput onSelect={handleGainSelect} currentGain={gain} />
            </RiskModal>
        </View>
    );
}

function GainInput({ onSelect, currentGain }) {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);
    const options = [
        { value: 'Low', label: 'Low Gain', desc: 'Routine training, PR, property recovery or evidence search. Use for low-risk conditions only.' },
        { value: 'Medium', label: 'Medium Gain', desc: 'Stable patient or environment, noncritical injury or protecting significant property.' },
        { value: 'High', label: 'High Gain', desc: 'Lifesaving opportunity, immediate threat to life or preventing permanent injury.' }
    ];

    return (
        <View style={{ gap: 16 }}>
            <Text style={[textStyle.bodyMedium]}>Select the potential level of gain for this task</Text>
            <BannerGroup marginHorizontal={0}>
                {options.map((opt) => (
                    <Banner
                        key={opt.value}
                        backgroundColor={currentGain === opt.value ? colorTheme.primaryContainer : colorTheme.surfaceContainerLow}
                        color={colorTheme.onSurface}
                        icon={<Ionicons name={currentGain === opt.value ? "radio-button-on" : "radio-button-off"} size={24} color={colorTheme.primary} />}
                        title={<><Text style={{ fontWeight: 'bold' }}>{opt.label}</Text>: {opt.desc}</>}
                        onPress={() => onSelect(opt.value)}
                    />
                ))}
            </BannerGroup>
        </View>
    );
}

const getStyles = (colorTheme, isLargeScreen) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colorTheme.background,
        height: '100%'
    },
    staarContainer: {
        marginLeft: 10,
        marginTop: 4
    },
});

function EmojiButton({ emoji, label, description, selected, onPress, activeColor, disabled }) {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const isLargeScreen = width > 800;

    const handlePressIn = () => { Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 20 }).start(); };
    const handlePressOut = () => { Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start(); };
    const styles = getRiskInputStyles(colorTheme);
    const baseBorderColor = colorTheme.outlineVariant;
    const baseBgColor = colorTheme.surfaceContainerHigh;
    const selectedBg = activeColor ? getHoverColor(activeColor, 0.15) : colorTheme.secondaryContainer;
    const selectedBorder = activeColor || colorTheme.primary;

    return (
        <Animated.View style={[styles.emojiButton, { backgroundColor: selected ? selectedBg : baseBgColor, borderColor: selected ? selectedBorder : baseBorderColor, borderWidth: 2, transform: [{ scale: scaleAnim }] }]}>
            <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} disabled={disabled} android_ripple={{ color: colorTheme.surfaceContainerHighest, borderless: false }} style={styles.emojiPressable}>
                <Text style={styles.emoji} allowFontScaling={false}>{emoji}</Text>
                <Text style={[textStyle.bodyMedium, styles.emojiLabel, { color: colorTheme.onSurface, fontWeight: selected ? '400' : '400', opacity: selected ? 1 : 0.7 }]}>{label}</Text>
                {isLargeScreen && description && (
                    <Text style={[textStyle.bodySmall, { textAlign: 'center', opacity: selected ? 1 : 0.7, color: colorTheme.onSurfaceVariant }]}>{description}</Text>
                )}
            </Pressable>
        </Animated.View>
    );
}

function RiskInput({ item, mode, onChangeValue, language, isAdvancing }) {
    const { colorTheme } = useContext(ThemeContext);
    const styles = getRiskInputStyles(colorTheme);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);
    const anim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(anim, { toValue: isAdvancing ? 0 : 1, duration: isAdvancing ? 150 : 250, useNativeDriver: true }).start();
    }, [isAdvancing, item.title]);

    const opacity = anim;
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [isAdvancing ? -8 : 10, 0] });
    const options = (language === 'nasar' ? [
        { value: 3, emoji: '👎', label: 'High Risk', desc: 'Significant danger', color: colorTheme.garRedDark },
        { value: 2, emoji: '✊', label: 'Medium Risk', desc: 'Caution warranted', color: colorTheme.garAmberDark },
        { value: 1, emoji: '👍', label: 'Low Risk', desc: 'Minimal concern', color: colorTheme.garGreenDark }
    ] : [
        { value: 3, emoji: '☹️', label: 'High Risk', desc: 'Significant danger', color: colorTheme.garRedDark },
        { value: 2, emoji: '😐', label: 'Medium Risk', desc: 'Caution warranted', color: colorTheme.garAmberDark },
        { value: 1, emoji: '😀', label: 'Low Risk', desc: 'Minimal concern', color: colorTheme.garGreenDark }
    ]);

    return (
        <Animated.View renderToHardwareTextureAndroid={true} style={[styles.container, { opacity, transform: [{ translateY }] }]}>
            <Text style={textStyle.bodyMedium}>{item.subtitle}</Text>
            <View style={styles.inputContainer}>
                {mode === 'emoji' ? (
                    <View style={styles.emojiRow}>
                        {options.map((opt) => {
                            return (
                                <EmojiButton key={opt.value} emoji={opt.emoji} label={opt.label} description={opt.desc} selected={item.score === opt.value} activeColor={opt.color} disabled={isAdvancing} onPress={() => !isAdvancing && onChangeValue(opt.value, "")} />
                            )
                        })}
                    </View>
                ) : (
                    <BannerGroup marginHorizontal={0}>
                        {options.map((opt) => (
                            <Banner
                                key={opt.value}
                                backgroundColor={item.score === opt.value ? opt.color : colorTheme.surfaceContainerLow}
                                color={item.score === opt.value ? '#ffffff' : colorTheme.onSurface}
                                icon={<Text style={{ fontSize: 20 }}>{opt.emoji}</Text>}
                                title={<><Text style={{ fontWeight: 'bold' }}>{opt.label}</Text>: {opt.desc}</>}
                                onPress={() => !isAdvancing && onChangeValue(opt.value, opt.label)}
                            />
                        ))}
                    </BannerGroup>
                )}
            </View>
        </Animated.View>
    );
}

const getRiskInputStyles = (colorTheme) => StyleSheet.create({
    container: { paddingBottom: 8, paddingHorizontal: 4, gap: 8 },
    inputContainer: { marginTop: 10 },
    emojiRow: { flexDirection: 'row', justifyContent: 'space-around', gap: 10 },
    emojiButton: { height: 125, borderRadius: 50, flexBasis: 0, flexGrow: 1, backgroundColor: colorTheme.surfaceContainerHigh, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 1 },
    emojiPressable: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 50 },
    emoji: { fontSize: 40, marginBottom: 5, textAlign: 'center', backgroundColor: 'transparent' },
    emojiLabel: { textAlign: 'center', fontSize: 12 },
});
