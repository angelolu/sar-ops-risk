import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import ItemList from '../../components/ItemList';
import RiskHeader from '../../components/RiskHeader';
import RiskModal from '../../components/RiskModal';
import Button from '../../components/Button';

export default function orma() {
    const minimumScore = 8;

    const [headerHeight, setHeaderHeight] = useState(400);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(1);
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

    return (
        <View style={Platform.OS === 'web' ? styles.containerWeb : styles.container}>
            <RiskHeader
                sharedTransitionTag="sectionTitle"
                title="Operational Risk Management Analysis"
                score={entries.reduce((acc, entry) => acc + entry.score, 0)}
                subtitle={isDone ? "Review the score with your team before proceeding" : "Assign a risk code of 1 (for no risk) through 10 (for maximum risk) to each of the elements below"}
                minimumScore={minimumScore}
                complete={isDone}
            />
            {hasAmberScore && isDone &&
                <View style={styles.warningBar}>
                    <Ionicons name="warning" size={24} color="black" />
                    <Text style={styles.warningText}>Discuss items with a score &gt;= 5 with your team</Text>
                </View>}
            <ItemList
                items={entries}
                onSelect={onItemSelect}
            />
            <RiskModal
                isVisible={isModalVisible}
                item={entries[selectedEntry]}
                height={headerHeight}
                onClose={onModalClose}
            >
                <RiskInput selected={selectedEntry} entries={entries} onChangeValue={onChangeValue} onNext={onNext} />
            </RiskModal>
            <StatusBar style="dark" />
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
    return (
        <View style={riskStyles.container}>
            <Text style={riskStyles.subtitle}>{item.subtitle}</Text>
            <View style={riskStyles.scorebox}>
                <Text style={[riskStyles.score, { color: getTextColor(item.score) }]}>{item.score}</Text>
                <Text style={riskStyles.description}>{getDescriptionFromScore(item.score)}</Text>
            </View>
            <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={1}
                maximumValue={10}
                value={item.score}
                thumbTintColor='#475d92'
                minimumTrackTintColor={getTextColor(item.score)}
                maximumTrackTintColor="#d9e2ff"
                onValueChange={onChangeValue}
                step={1}
            />
            <Button disabled={item.score === 0} text={selected === entries.length - 1 ? "Finish" : "Next element"} onPress={onNext} style={{ alignSelf: "flex-end" }} />
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
        fontWeight: 'bold',
    },
    description: {
        flex: -1
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
