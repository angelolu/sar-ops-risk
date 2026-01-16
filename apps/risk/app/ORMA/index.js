import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { Banner, BannerGroup, FilledButton, RiskModal, ShareButton, ThemeContext, textStyles } from 'calsar-ui';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import ItemList from '../../components/ItemList';
import RiskHeader from '../../components/RiskHeader';
import { ORMA_CONFIG } from '../../config/RiskStrategies';
import { useRiskAssessment } from '../../hooks/useRiskAssessment';

var modalDelayTimeout;

export default function orma() {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const styles = getStyles(colorTheme);

    // Use risk assessment hook
    const { calculate, getResult, getItemResult } = useRiskAssessment(ORMA_CONFIG);



    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(0);
    const [entries, setEntries] = useState([]);
    const [isAdvancing, setIsAdvancing] = useState(false);

    const [listStyle, setListStyle] = useState(null);
    const [explicitLanguageSet, setExplicitLanguageSet] = useState(false);
    useEffect(() => {
        // Get list display setting
        AsyncStorage.getItem("list-style").then((jsonValue) => {
            jsonValue != null ? setListStyle(JSON.parse(jsonValue)) : setListStyle(null);
        }).catch((e) => {
            // error reading value
        });

        // Get language setting used for ORMA
        AsyncStorage.getItem("language-orma").then((jsonValue) => {
            jsonValue != null ? updateLanguage(JSON.parse(jsonValue)) : updateLanguage(null);
        }).catch((e) => {
            // error reading value
        });

        // I'm not sure why, but if there the modal is immediately by useState(true), on iOS
        // there is an issue where the modal will only partially load, causing the UI to get stuck.
        // As a workaround, wait 150ms before launching the modal when the UI is shown
        modalDelayTimeout = setTimeout(() => {
            setIsModalVisible(true);
        }, 150);

        return () => {
            clearTimeout(modalDelayTimeout);
        };
    }, []);

    const updateLanguage = (value) => {
        switch (value) {
            case "nps":
                setExplicitLanguageSet(true);
                setEntries([
                    { title: "Supervision", subtitle: "Leadership and supervision are actively engaged, involved, and accessible for all teams and personnel. There is a clear chain of command.", score: 0 },
                    { title: "Planning", subtitle: "There is adequate information and proper planning time. JHAs are current and have been reviewed and signed by all levels. All required equipment, training, and PPE has been provided.", score: 0 },
                    { title: "Contingency Resources", subtitle: "Local emergency services can be contacted, available, and respond to the worksite in a reasonable amount of time. Examples: Do you have an emergency evacuation plan?", score: 0 },
                    { title: "Communication", subtitle: "There is established two-way communication throughout the area of operations. Radios should always be your primary means of communication. You should know your area of coverage.", score: 0 },
                    { title: "Team Selection", subtitle: "Level of individual training and experiences. Cohesiveness and atmosphere that values input/self-critique.", score: 0 },
                    { title: "Team Fitness", subtitle: "This includes physical and mental fitness. Team members are rested, engaged, and overall morale is good. The team is mindful and has a high level of situational awareness.", score: 0 },
                    { title: "Environment", subtitle: "Extreme temperatures, elevations, difficulty of terrain, long approaches and remoteness, not excluding the office environment", score: 0 },
                    { title: "Task Complexity", subtitle: "Severity, probability, and exposure of mishap. The potential for incident that would tax the current staffing levels.", score: 0 },
                ]);
                break;
            case "fws":
                setExplicitLanguageSet(true);
                setEntries([
                    { title: "Supervision", subtitle: "Leadership and supervisors are actively engaged, involved and accessible for all teams and personnel. There is a clear chain of command", score: 0 },
                    { title: "Planning", subtitle: "There is adequate information and proper planning time. JHAs are current and have been reviewed and signed by all levels. All required equipment, training and PPE had been provided.", score: 0 },
                    { title: "Contingency Resources", subtitle: "Local emergency services can be contacted, available and respond in a reasonable amount of time. Has an emergency evacuation plan been prepared and is crewed briefed?", score: 0 },
                    { title: "Communication", subtitle: "There is established two-way radio (VHF or emergency dispatch) communication throughout the area of operation. EPIRB/PLB, GPS-linked, satellite phone, position/location resources (e.g., AIS, chart plotters, mobile apps)", score: 0 },
                    { title: "Team Selection", subtitle: "Level of individual training, qualifications, experience, familiarity with area of operations and equipment. Cohesiveness and atmosphere that values input and self-critique.", score: 0 },
                    { title: "Team Fitness", subtitle: "This includes physical and mental fitness. Team members are rested, engaged and overall moral is good. The team is mindful and has a high degree of situational awareness.", score: 0 },
                    { title: "Environment", subtitle: "Weather forecast & advisories, wind, seas, tides, depths, currents, river discharge, debris/ice, surf, rocks, reefs, traffic, uncharted water, remoteness, security (personnel and/or equipment)", score: 0 },
                    { title: "Task Complexity", subtitle: "Severity, probability, and exposure of mishap. The potential for incident that would tax the current team level.", score: 0 },
                ]);
                break;
            case 'calsar':
                setExplicitLanguageSet(true);
            default:
                setEntries([
                    { title: "Supervision", subtitle: "Leadership and supervision are actively engaged, involved, and accessible for all teams and personnel. There is a clear chain of command.", score: 0 },
                    { title: "Planning", subtitle: "There is adequate information and proper planning time. JHAs are current and have been reviewed and signed by all levels. All required equipment, training, and PPE has been provided.", score: 0 },
                    { title: "Contingency Resources", subtitle: "Local emergency services can be contacted, available, and respond to the worksite in a reasonable amount of time. Examples: Do you have an emergency evacuation plan?", score: 0 },
                    { title: "Communication", subtitle: "There is established two-way communication throughout the area of operations. Radios should always be your primary means of communication. You should know your area of coverage.", score: 0 },
                    { title: "Team Selection", subtitle: "Level of individual training and experiences. Cohesiveness and atmosphere that values input/self-critique.", score: 0 },
                    { title: "Team Fitness", subtitle: "This includes physical and mental fitness. Team members are rested, engaged, and overall morale is good. The team is mindful and has a high level of situational awareness.", score: 0 },
                    { title: "Environment", subtitle: "Extreme temperatures, elevations, difficulty of terrain, long approaches and remoteness, not excluding the office environment", score: 0 },
                    { title: "Task Complexity", subtitle: "Severity, probability, and exposure of mishap. The potential for incident that would tax the current staffing levels.", score: 0 },
                ]);
        }
    }

    const saveLanguage = (value) => {
        updateLanguage(value);
        // Save language setting used for ORMA
        try {
            const jsonValue = JSON.stringify(value);
            AsyncStorage.setItem("language-orma", jsonValue);
        } catch (e) {
            // error saving value
        }
    };

    const getResultString = () => {
        // Used for sharing/exporting results
        return entries.map(item => `${item.title}\nDescription: ${item.subtitle}\nScore: ${item.score}\n`).join('\n');
    }

    const onItemSelect = (index) => {
        setSelectedEntry(index);
        setIsModalVisible(true);
        // alert(item.title);
    };

    const onChangeValue = (value) => {
        const itemColors = getItemResult(value);
        setEntries(entries.map((entry, idx) =>
            idx === selectedEntry
                ? { ...entry, score: value, backgroundColor: itemColors.backgroundColor, color: itemColors.color || entry.color }
                : entry
        ));
    };

    const onModalClose = () => {
        setIsModalVisible(false);
    };

    const onNext = () => {
        if (selectedEntry === entries.length - 1) {
            // Last item - close immediately without animation
            setIsModalVisible(false);
        } else {
            // Not last item - animate to next
            setIsAdvancing(true);
            setTimeout(() => {
                setSelectedEntry(selectedEntry + 1);
                setIsAdvancing(false);
            }, 300);
        }
    };

    if (explicitLanguageSet) {
        let isDone = !entries.some(entry => entry.score === 0);
        let hasAmberScore = entries.some(entry => entry.score >= 5);
        setStatusBarStyle(colorScheme === 'light' ? (isDone ? "light" : "dark") : "light", true);

        let score = calculate(entries);
        let result = getResult(score);

        return (
            <View style={styles.container}>
                <RiskHeader
                    sharedTransitionTag="sectionTitle"
                    title="Operational Risk Management Analysis"
                    subtitle={isDone ? result.action : "Tap each element below to assign a score of 1 (for no risk) through 10 (for maximum risk)"}
                    complete={isDone}
                    riskColor={result.color}
                    riskText={result.label}
                    menu={isDone && <ShareButton title="ORMA Results" content={"ORMA results\nOverall score: " + score + "\n\n" + getResultString()} color="#ffffff" />}
                />
                {hasAmberScore && isDone &&
                    <View style={styles.warningBar}>
                        <Ionicons name="warning" size={24} color={colorTheme.onTertiaryFixed} />
                        <Text style={styles.warningText}>Discuss elements with a score &gt;= 5 with your team</Text>
                    </View>}
                <ItemList
                    items={entries}
                    onSelect={onItemSelect}
                />
                <RiskModal
                    isVisible={isModalVisible}
                    title={"Score \"" + entries[selectedEntry]?.title + "\""}
                    onClose={onModalClose}
                >
                    <RiskInput
                        selected={selectedEntry}
                        entries={entries}
                        onChangeValue={onChangeValue}
                        onNext={onNext}
                        isAdvancing={isAdvancing}
                    />
                </RiskModal>
            </View>
        );
    } else {
        return (
            <View style={styles.container}>
                <RiskHeader
                    sharedTransitionTag="sectionTitle"
                    title="Operational Risk Management Analysis"
                    score={0}
                    subtitle="Tap each element below to assign a score of 1 (for no risk) through 10 (for maximum risk)"
                    minimumScore={1}
                    complete={false}
                />
                <RiskModal
                    isVisible={true}
                    title="Choose preferred ORMA language"
                    onClose={() => { router.back() }}
                >
                    <View style={{
                        paddingBottom: 8, // Give the button shadow some "room" inside the animated view
                        paddingHorizontal: 4, // Prevents side-shadow clipping,
                        gap: 10
                    }}>
                        <Text style={{ color: colorTheme.onSurface }}>Agencies use different descriptions for ORMA elements. You can change this later in Settings.</Text>
                        <BannerGroup marginHorizontal={0}>
                            <Banner
                                backgroundColor={colorTheme.surfaceContainerLow}
                                color={colorTheme.onSurfaceVariant}
                                icon={<MaterialIcons name="account-balance" size={24} color={colorTheme.onSurfaceVariant} />}
                                title="National Parks Service"
                                onPress={() => { saveLanguage("nps") }}
                            />
                            {false && <Banner
                                backgroundColor={colorTheme.surfaceContainerLow}
                                color={colorTheme.onSurfaceVariant}
                                icon={<Ionicons name="heart-circle" size={24} color={colorTheme.onSurfaceVariant} />}
                                title="California Search and Rescue"
                                onPress={() => { saveLanguage("calsar") }}
                            />}
                            <Banner
                                backgroundColor={colorTheme.surfaceContainerLow}
                                color={colorTheme.onSurfaceVariant}
                                icon={<Ionicons name="fish" size={24} color={colorTheme.onSurfaceVariant} />}
                                title="U.S. Fish & Wildlife Service"
                                onPress={() => { saveLanguage("fws") }}
                            />
                        </BannerGroup>
                    </View>
                </RiskModal>
            </View>
        );
    }
}

const getStyles = (colorTheme) => {
    return StyleSheet.create({
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
            color: colorTheme.onTertiaryFixed
        },
        container: {
            flex: 1,
            backgroundColor: colorTheme.background,
            height: '100%'
        },
    });
}


const RiskInput = ({ selected, entries, onChangeValue, onNext, isAdvancing }) => {
    const { colorTheme } = useContext(ThemeContext);
    const riskStyles = getRiskInputStyles(colorTheme);

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
    }, [isAdvancing, selected]);

    const opacity = anim;
    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [isAdvancing ? -8 : 10, 0]
    });

    let item = entries[selected];

    if (item === undefined)
        return (
            <View style={riskStyles.container} />
        );

    const getTextColor = (value) => {
        if (value >= 1 && value <= 4) {
            return colorTheme.garGreenDark;
        } else if (value >= 5 && value <= 7) {
            return colorTheme.garAmberDark;
        } else if (value >= 8 && value <= 10) {
            return colorTheme.garRedDark;
        } else {
            return colorTheme.onBackground;
        }
    };

    const getBarColor = (value) => {
        if (value >= 1 && value <= 4) {
            return colorTheme.garGreenLight;
        } else if (value >= 5 && value <= 7) {
            return colorTheme.garAmberDark;
        } else if (value >= 8 && value <= 10) {
            return colorTheme.garRedLight;
        } else {
            return colorTheme.onBackground;
        }
    };

    const getDescriptionFromScore = (value) => {
        if (value >= 1 && value <= 2) {
            return 'No to little concern.';
        } else if (value >= 3 && value <= 4) {
            if (item?.title === "Team Fitness")
                return 'No to little concern. 3-4 might mean you’re not concerned enough you think we need to mitigate, but worth drawing attention to. Ex. Being poorly rested.';
            return 'No to little concern. 3-4 might mean you’re not concerned enough you think we need to mitigate, but worth drawing attention to.';
        } else if (value >= 5 && value <= 7) {
            if (item?.title === "Communication")
                return 'Concerned enough we should work to mitigate risks. Ex. Radio comms aren\'t available in the search area.';
            return 'Concerned enough we should work to mitigate risks.'
        } else if (value >= 8 && value <= 10) {
            if (item?.title === "Environment")
                return 'Serious concern. Major restructure or mission turn down should be considered. Ex. You’re searching desert washes and heavy rain is forecast.';
            return 'Serious concern. Major restructure or mission turn down should be considered.';
        } else {
            return 'Use the slider below to select a score';
        }
    }

    let overridePadding;
    switch (Platform.OS) {
        case 'android':
            overridePadding = 12;
            break;
        case 'web':
            overridePadding = 12;
            break;
        case 'ios':
            overridePadding = 16;
            break;
        default:
            overridePadding = 0;
    }

    return (
        <Animated.View
            renderToHardwareTextureAndroid={true}
            style={[
                riskStyles.container,
                { opacity, transform: [{ translateY }] }
            ]}
        >
            <Text style={textStyle.bodyMedium}>{item.subtitle}</Text>
            <View style={riskStyles.scorebox}>
                <Text style={[textStyle.displayMedium, riskStyles.score, { color: getTextColor(item.score) }]}>{item.score}</Text>
                <Text style={[textStyle.bodyMedium, riskStyles.description]}>{getDescriptionFromScore(item.score)}</Text>
            </View>
            <View style={{ marginBottom: 15, justifyContent: 'center' }}>
                {/* Background Dots */}
                <View style={{ flexDirection: 'row', gap: 2, position: 'absolute', width: '100%', paddingHorizontal: overridePadding, borderRadius: 99, overflow: 'hidden' }}>
                    {/* Added paddingHorizontal offset of 16 roughly corresponds to thumb width/2 to align dots with track */}
                    {Array.from(Array(10).keys()).map((index) => {
                        const dotColor = index < item.score ? getBarColor(index + 1) : colorTheme.primaryContainer;
                        return (
                            <View key={index} style={{ backgroundColor: dotColor, height: 8, flexGrow: 1 }} />
                        )
                    })}
                </View>

                {/* Slider */}
                <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={0}
                    maximumValue={10}
                    value={item.score}
                    thumbTintColor={colorTheme.primary}
                    minimumTrackTintColor="#ffffff00"
                    maximumTrackTintColor="#ffffff00"
                    onValueChange={onChangeValue}
                    step={1}
                />
            </View>
            <FilledButton rightAlign primary disabled={item.score === 0} text={selected === entries.length - 1 ? "Finish" : "Next element"} onPress={onNext} style={{ alignSelf: "flex-end" }} />
        </Animated.View>
    );
}

const getRiskInputStyles = (colorTheme) => {

    return StyleSheet.create({
        container: {
            paddingBottom: 8, // Give the button shadow some "room" inside the animated view
            paddingHorizontal: 4, // Prevents side-shadow clipping
        },
        scorebox: {
            flexDirection: "row",
            gap: 20,
            height: 85,
            alignItems: 'center'
        },
        score: {
            fontSize: 38,
            width: 50,
            textAlign: "center",
            fontWeight: 'bold',
            flexShrink: 0
        },
        description: {
            color: colorTheme.onSurface,
            flex: -1,
            flexShrink: 1
        }
    });
}