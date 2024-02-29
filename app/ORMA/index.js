import { useState } from 'react';
import { setStatusBarStyle } from 'expo-status-bar';
import { StyleSheet, View, Platform, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import ItemList from '../../components/ItemList';
import RiskHeader from '../../components/RiskHeader';
import RiskModal from '../../components/RiskModal';
import FilledButton from '../../components/FilledButton';
import ShareButton from '../../components/ShareButton';

export default function orma() {
    const minimumScore = 8;

    const [isModalVisible, setIsModalVisible] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState(0);
    const [entries, setEntries] = useState([
        { title: "Supervision", subtitle: "Leadership and supervision are actively engaged, involved, and accessible for all teams and personnel. There is a clear chain of command.", score: 0 },
        { title: "Planning", subtitle: "There is adequate information and proper planning time. JHA’s are current and have been reviewed and signed by all levels. All required equipment, training, and PPE has been provided.", score: 0 },
        { title: "Contingency Resources", subtitle: "Local emergency services can be contacted, available, and respond to the worksite in a reasonable amount of time. Examples: Do you have an emergency evacuation plan?", score: 0 },
        { title: "Communication", subtitle: "There is established two-way communication throughout the area of operations. Radios should always be your primary means of communication. You should know your area of coverage.", score: 0 },
        { title: "Team Selection", subtitle: "Level of individual training and experiences. Cohesiveness and atmosphere that values input/self-critique.", score: 0 },
        { title: "Team Fitness", subtitle: "This includes physical and mental fitness. Team members are rested, engaged, and overall morale is good. The team is mindful and has a high level of situational awareness.", score: 0 },
        { title: "Environment", subtitle: "Extreme temperatures, elevations, difficulty of terrain, long approaches and remoteness, not excluding the office environment", score: 0 },
        { title: "Task Complexity", subtitle: "Severity, probability, and exposure of mishap. The potential for incident that would tax the current staffing levels.", score: 0 },
    ]);

    const getResultString = () => {
        return entries.map(item => `${item.title}\nDescription: ${item.subtitle}\nScore: ${item.score}\n`).join('\n');
    }

    const onItemSelect = (index) => {
        setSelectedEntry(index);
        setIsModalVisible(true);
        // alert(item.title);
    };
    const onChangeValue = (value) => {
        const updatedEntries = [...entries];
        updatedEntries[selectedEntry].score = value;
        setEntries(updatedEntries);
    };
    const onModalClose = () => {
        setIsModalVisible(false);
    };

    const onNext = () => {
        if (selectedEntry === entries.length - 1) {
            setIsModalVisible(false);
        } else {
            setSelectedEntry(selectedEntry + 1);
        }
    };

    let hasAmberScore = entries.some(entry => entry.score >= 5);
    let isDone = !entries.some(entry => entry.score === 0);

    let title = "Score \"" + entries[selectedEntry].title + "\"";
    let score = entries.reduce((acc, entry) => acc + entry.score, 0);
    setStatusBarStyle(isDone ? "light" : "dark", true);
    return (
        <View style={Platform.OS === 'web' ? styles.containerWeb : styles.container}>
            <RiskHeader
                sharedTransitionTag="sectionTitle"
                title="Operational Risk Management Analysis"
                score={score}
                subtitle={isDone ? "Review this score with your team before proceeding" : "Assign a risk score of 1 (for no risk) through 10 (for maximum risk) to each of the elements below"}
                minimumScore={minimumScore}
                complete={isDone}
                menu={isDone && <ShareButton title="ORMA Results" content={"ORMA results\nOverall score: " + score + "\n\n" + getResultString()} color="#ffffff" />}
            />
            {hasAmberScore && isDone &&
                <View style={styles.warningBar}>
                    <Ionicons name="warning" size={24} color="black" />
                    <Text style={styles.warningText}>Discuss elements with a score &gt;= 5 with your team</Text>
                </View>}
            <ItemList
                items={entries}
                onSelect={onItemSelect}
            />
            <RiskModal
                isVisible={isModalVisible}
                title={title}
                onClose={onModalClose}
            >
                <RiskInput selected={selectedEntry} entries={entries} onChangeValue={onChangeValue} onNext={onNext} />
            </RiskModal>
        </View>
    );
}

function RiskInput({ selected, entries, onChangeValue, onNext }) {
    let item = entries[selected];
    const getTextColor = (value) => {
        if (value >= 1 && value <= 4) {
            return '#37693d';
        } else if (value >= 5 && value <= 7) {
            return '#7d570e';
        } else if (value >= 8 && value <= 10) {
            return '#ba1a1a';
        } else {
            return '#1a1b20';
        }
    };
    const getDescriptionFromScore = (value) => {
        if (value >= 1 && value <= 2) {
            return 'No to little concern.';
        } else if (value >= 3 && value <= 4) {
            return 'No to little concern. 3-4 might mean you’re not concerned enough you think we need to mitigate, but worth drawing attention to. Ex. Being poorly rested.';
        } else if (value >= 5 && value <= 7) {
            return 'Concerned enough we should work to mitigate risks. Ex. Radio comms aren\'t available in the search area.';
        } else if (value >= 8 && value <= 10) {
            return 'Serious concern. Major restructure or mission turn down should be considered. Ex. You’re searching desert washes and heavy rain is forecast.';
        } else {
            return 'Use the slider below to select a score';
        }
    }
    const androidSliderPadding = Platform.OS === 'android' ? 12 : Platform.OS === 'web' ? 12 : 0;
    return (
        <View style={riskStyles.container}>
            <Text style={riskStyles.subtitle}>{item.subtitle}</Text>
            <View style={riskStyles.scorebox}>
                <Text style={[riskStyles.score, { color: getTextColor(item.score) }]}>{item.score}</Text>
                <Text style={riskStyles.description}>{getDescriptionFromScore(item.score)}</Text>
            </View>
            <View>
                <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={0}
                    maximumValue={10}
                    value={item.score}
                    thumbTintColor='#475d92'
                    minimumTrackTintColor="#ffffff00"
                    maximumTrackTintColor="#ffffff00"
                    onValueChange={onChangeValue}
                    step={1}
                />
                <View style={{ flexDirection: 'row', gap: 2, top: - 24, zIndex: -1, flex: -1, marginHorizontal: androidSliderPadding, borderRadius: 99, overflow: 'hidden' }}>
                    {Array.from(Array(10).keys()).map((index) => {
                        const dotColor = index < item.score ? getTextColor(index + 1) : "#d9e2ff";
                        return (
                            <View key={index} style={{ backgroundColor: dotColor, height: 8, flexGrow: 1 }} />
                        )
                    })}
                </View>
            </View>
            <FilledButton primary disabled={item.score === 0} text={selected === entries.length - 1 ? "Finish" : "Next element"} onPress={onNext} style={{ alignSelf: "flex-end" }} />
        </View>
    );
}

const riskStyles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 0
    },
    subtitle: {
        fontSize: 16
    },
    scorebox: {
        flexDirection: "row",
        gap: 20,
        height: 85,
        alignItems: 'center'
    },
    score: {
        fontSize: 40,
        width: 50,
        textAlign: "center",
        fontWeight: 'bold',
        flexShrink: 0
    },
    description: {
        flex: -1,
        flexShrink: 1
    }
});

const styles = StyleSheet.create({
    warningBar: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#ffdfa0',
        alignItems: 'center'
    },
    warningText: {
        flex: -1
    },
    container: {
        flex: 1,
        backgroundColor: '#faf8ff',
        height: '100%'
    },
    containerWeb: {
        flex: 1,
        backgroundColor: '#faf8ff',
        height: '100%'
    },
    listContainer: {
    }
});
