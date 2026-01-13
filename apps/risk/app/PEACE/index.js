import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Banner, BannerGroup, FilledButton, RiskModal, ShareButton, ThemeContext, textStyles } from 'calsar-ui';
import { useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import ItemList from '../../components/ItemList';
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
    { title: "Planning", subtitle: "Enough time and information to conduct thorough pre-mission planning.", score: 0, description: "" },
    { title: "Event", subtitle: "Mission complexity, standard or nonstandard, working with unfamiliar teams, etc.", score: 0, description: "" },
    { title: "Asset — Crew", subtitle: "Proper number, skill, leadership experience and rest or fatigue level.", score: 0, description: "" },
    { title: "Asset — Equipment", subtitle: "Vehicles, personal and team gear and personal protective equipment that is mission-ready.", score: 0, description: "" },
    { title: "Communications and Supervision", subtitle: "Ability to maintain communications and span of control throughout the incident.", score: 0, description: "" },
    { title: "Environment", subtitle: "Weather, terrain, snow, night or day and wildlife.", score: 0, description: "" },
];

export default function PEACE() {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const styles = getStyles(colorTheme);
    const router = useRouter();

    const { calculate, getResult, getItemResult } = useRiskAssessment(PEACE_USCG_ASHORE_CONFIG);

    const [isModalVisible, setIsModalVisible] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState(0);
    const [inputMode, setInputMode] = useState("emoji");
    const [entries, setEntries] = useState(getAshoreEntries());


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
            setEntries(lang === 'nasar' ? getNasarEntries() : getAshoreEntries());
            setSelectedEntry(0);
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

    const [isAdvancing, setIsAdvancing] = useState(false);

    const onChangeValue = (value, description) => {
        const itemColors = getItemResult(value);
        setEntries(entries.map((entry, idx) =>
            idx === selectedEntry
                ? { ...entry, score: value, containerColor: itemColors.containerColor, color: itemColors.contentColor, description }
                : entry
        ));

        if (selectedEntry < entries.length - 1) {
            // Not last item - animate to next
            // Snap to selection faster (150ms), then begin movement
            setTimeout(() => {
                setIsAdvancing(true);
            }, 150);

            // Overall cycle time reduced to 550ms for snappier feel
            setTimeout(() => {
                setSelectedEntry(selectedEntry + 1);
                setIsAdvancing(false);
            }, 550);
        } else {
            // Last item - close immediately without animation
            setIsModalVisible(false);
        }
    };

    const onModalClose = () => {
        setIsModalVisible(false);
    };

    let isDone = !entries.some(entry => entry.score === 0);
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
                    <View style={{
                        paddingBottom: 8, // Give the button shadow some "room" inside the animated view
                        paddingHorizontal: 4, // Prevents side-shadow clipping,
                        gap: 10
                    }}>
                        <Text style={{ color: colorTheme.onSurface, marginBottom: 15 }}>Different agencies use different definitions. You can change this later in Settings.</Text>
                        <BannerGroup marginHorizontal={0}>
                            <Banner
                                backgroundColor={colorTheme.surfaceContainerLow}
                                color={colorTheme.onSurfaceVariant}
                                icon={<Ionicons name="walk" size={24} color={colorTheme.onSurfaceVariant} />}
                                title="NASAR"
                                onPress={() => updateLanguage('nasar')}
                            />
                            <Banner
                                backgroundColor={colorTheme.surfaceContainerLow}
                                color={colorTheme.onSurfaceVariant}
                                icon={<Ionicons name="boat" size={24} color={colorTheme.onSurfaceVariant} />}
                                title="USCG Ashore"
                                onPress={() => updateLanguage('uscg')}
                            />
                        </BannerGroup>
                    </View>
                </RiskModal>
            </View>
        )
    }

    return (
        <View style={Platform.OS === 'web' ? styles.containerWeb : styles.container}>
            <RiskHeader
                sharedTransitionTag="sectionTitle"
                title="PEAACE Risk"
                subtitle={isDone ? result.action : "Tap each element below to assign a risk score"}
                riskText={isDone ? result.label : ''}
                riskColor={isDone ? result.color : colorTheme.surfaceContainer}
                complete={isDone}
                menu={isDone && <ShareButton title="PEAACE Results" content={"PEAACE results\nOverall Status: " + result.label + "\n" + getResultString()} color="#ffffff" />}
            />
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
            {isDone && (
                <View style={styles.bottomBar}>
                    <FilledButton
                        primary
                        icon="grid-outline"
                        text="Analyze Risk vs Gain"
                        onPress={() => router.push({
                            pathname: "/PEACE/RiskGainMatrix",
                            params: { riskLevel: result.label }
                        })}
                        style={{ paddingHorizontal: 16 }}
                    />
                </View>
            )}
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
                    isAdvancing={isAdvancing}
                />
            </RiskModal>
        </View>
    );
}

const getStyles = (colorTheme) => {

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
            position: "absolute",
            bottom: 30, // Distance from the bottom of the screen
            right: 20,  // Distance from the right edge
            // Remove backgroundColor if you want it to be invisible/floating
            // backgroundColor: 'transparent',

            // Elevation (Shadows)
            ...Platform.select({
                ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                },
                android: {
                    elevation: 8,
                },
            }),
        }
    });
}

function EmojiButton({ emoji, label, selected, onPress, activeColor }) {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 20 }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    const styles = getRiskInputStyles(colorTheme);

    const baseBorderColor = colorTheme.outlineVariant;
    const baseBgColor = colorTheme.surfaceContainerHigh;
    const selectedBg = activeColor ? getHoverColor(activeColor, 0.15) : colorTheme.secondaryContainer;
    const selectedBorder = activeColor || colorTheme.primary;

    return (
        <Animated.View style={[
            styles.emojiButton,
            {
                backgroundColor: selected ? selectedBg : baseBgColor,
                borderColor: selected ? selectedBorder : baseBorderColor,
                borderWidth: 2,
                transform: [{ scale: scaleAnim }]
            }
        ]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                android_ripple={{ color: colorTheme.surfaceContainerHighest, borderless: false }}
                style={styles.emojiPressable}
            >
                <Text
                    style={styles.emoji}
                    allowFontScaling={false}
                >
                    {emoji}
                </Text>
                <Text style={[
                    textStyle.labelLarge,
                    styles.emojiLabel,
                    {
                        color: colorTheme.onSurface,
                        fontWeight: selected ? '600' : '400',
                        opacity: selected ? 1 : 0.7
                    }
                ]}>{label}</Text>
            </Pressable>
        </Animated.View>
    );
}

function RiskInput({ item, mode, onChangeValue, language, isAdvancing }) {
    const { colorTheme } = useContext(ThemeContext);
    const styles = getRiskInputStyles(colorTheme);
    const { width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

    // Unified animation value: 1 = visible, 0 = advancing (out)
    const anim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: isAdvancing ? 0 : 1,
            duration: isAdvancing ? 150 : 250,
            useNativeDriver: true,
        }).start();

        // If we've just landed on a new item, ensure we start from the "bottom"
        if (!isAdvancing) {
            // We can't easily reset an interpolated value mid-animation without logic,
            // but for this simple snappy transition, the timing block above is sufficient.
        }
    }, [isAdvancing, item.title]);

    const opacity = anim;
    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [isAdvancing ? -8 : 10, 0]
    });

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
        <Animated.View
            renderToHardwareTextureAndroid={true}
            style={[
                styles.container,
                { opacity, transform: [{ translateY }] }
            ]}
        >
            <Text style={textStyle.bodyMedium}>{item.subtitle}</Text>

            <View style={styles.inputContainer}>
                {mode === 'emoji' ? (
                    <View style={styles.emojiRow}>
                        {options.map((opt) => {
                            let activeColor = null;
                            if (opt.value === 1) activeColor = colorTheme.garGreenDark;
                            else if (opt.value === 2) activeColor = colorTheme.garAmberDark;
                            else if (opt.value === 3) activeColor = colorTheme.garRedDark;

                            return (
                                <EmojiButton
                                    key={opt.value}
                                    emoji={opt.emoji}
                                    label={opt.label}
                                    selected={item.score === opt.value}
                                    activeColor={activeColor}
                                    onPress={() => onChangeValue(opt.value, "")}
                                />
                            )
                        })}
                    </View>
                ) : (
                    <BannerGroup marginHorizontal={0}>
                        {options.map((opt) => (
                            <Banner
                                key={opt.value}
                                backgroundColor={item.score === opt.value ? colorTheme.primaryContainer : colorTheme.surfaceContainerLow}
                                color={colorTheme.onSurface}
                                icon={<Text style={{ fontSize: 20 }}>{opt.emoji}</Text>}
                                title={<><Text style={{ fontWeight: 'bold' }}>{opt.label}</Text>: {opt.desc}</>}
                                onPress={() => onChangeValue(opt.value, opt.label)}
                            />
                        ))}
                    </BannerGroup>
                )}
            </View>
        </Animated.View>
    );
}

const getRiskInputStyles = (colorTheme) => {

    return StyleSheet.create({
        container: {
            paddingBottom: 8, // Give the button shadow some "room" inside the animated view
            paddingHorizontal: 4, // Prevents side-shadow clipping
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
            flexBasis: 0,
            flexGrow: 1,
            // Removed overflow:hidden on Android to prevent ripple/shadow clipping glitches
            backgroundColor: colorTheme.surfaceContainerHigh,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 1,
        },
        emojiPressable: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            borderRadius: 50, // Ensure ripple/press state stays circular
        },
        emoji: {
            fontSize: 40,
            marginBottom: 5,
            textAlign: 'center',
            backgroundColor: 'transparent', // Android stability fix
        },
        emojiLabel: {
            fontSize: 12,
            textAlign: 'center'
        },
    });
}
