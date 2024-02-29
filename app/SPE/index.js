import { useState } from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ItemList from '../../components/ItemList';
import RiskHeader from '../../components/RiskHeader';
import RiskModal from '../../components/RiskModal';
import FilledButton from '../../components/FilledButton';
import Banner from '../../components/Banner';
import { setStatusBarStyle } from 'expo-status-bar';
import ShareButton from '../../components/ShareButton';

export default function SPE() {
    const minimumScore = 1;

    const [isModalVisible, setIsModalVisible] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState(0);
    const [entries, setEntries] = useState([
        { title: "Severity", subtitle: "What is the potential loss or consequence due to this risk?", score: 0, containerColor: '#faf8ff', color: '#1a1b20', description: "" },
        { title: "Probability", subtitle: "What is the likelihood of loss or consequence due to this risk?", score: 0, containerColor: '#faf8ff', color: '#1a1b20', description: "" },
        { title: "Exposure", subtitle: "What is the amount of time, cycles, people or equipment involved?", score: 0, containerColor: '#faf8ff', color: '#1a1b20', description: "" },
    ]);

    const getResultString = () => {
        return entries.map(item => `${item.title}\nDescription: ${item.subtitle}\nScore: ${item.score}\n`).join('\n');
    }

    const onItemSelect = (index) => {
        setSelectedEntry(index);
        setIsModalVisible(true);
        // alert(item.title);
    };
    const onChangeValue = (value, containerColor, color, description) => {
        const updatedEntries = [...entries];
        if (updatedEntries[selectedEntry].score !== value) {
            updatedEntries[selectedEntry].score = value;
            updatedEntries[selectedEntry].containerColor = containerColor;
            updatedEntries[selectedEntry].color = color;
            updatedEntries[selectedEntry].description = description;
            setEntries(updatedEntries);
        }
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

    const getRiskColor = (value, complete) => {
        if (complete) {
            if (value >= 0 && value <= 19) {
                return '#37693d';
            } else if (value <= 39) {
                return '#865219';
            } else if (value <= 59) {
                return '#865219';
            } else if (value <= 79) {
                return '#ba1a1a';
            } else {
                return '#ba1a1a';
            }
        }
        return '#eeedf4';
    };

    const getRiskText = (value, complete) => {
        if (complete) {
            if (value >= 0 && value <= 19) {
                return value + ' - Slight risk';
            } else if (value <= 39) {
                return value + ' - Possible risk';
            } else if (value <= 59) {
                return value + ' - Substantial risk';
            } else if (value <= 79) {
                return value + ' - High risk';
            } else {
                return value + ' - Very High risk';
            }
        }
        return '';
    };

    const getRiskAction = (value, complete) => {
        if (complete) {
            if (value >= 0 && value <= 19) {
                return 'Risk possibly acceptable. Review risk with your team before proceeding';
            } else if (value <= 39) {
                return 'Attention needed. Review risk with your team before proceeding';
            } else if (value <= 59) {
                return 'Correction required. Review this with your team.';
            } else if (value <= 79) {
                return 'Correct risk immediately';
            } else {
                return <>Discontinue, <Text style={styles.boldText}>stop immediately</Text></>;
            }
        }
        return "Assign a risk score to each of the elements below";
    };

    let isDone = !entries.some(entry => entry.score === 0);

    let title = "Score \"" + entries[selectedEntry].title + "\"";
    let score = entries.reduce((acc, entry) => acc * entry.score, 1);

    setStatusBarStyle(isDone ? "light" : "dark", true);
    return (
        <View style={Platform.OS === 'web' ? styles.containerWeb : styles.container}>
            <RiskHeader
                sharedTransitionTag="sectionTitle"
                title="Severity, Probability, Exposure (SPE)"
                score={score}
                subtitle={getRiskAction(score, isDone)}
                riskText={getRiskText(score, isDone)}
                riskColor={getRiskColor(score, isDone)}
                minimumScore={minimumScore}
                complete={isDone}
                menu={isDone && <ShareButton title="SPE Results" content={"SPE results\nOverall score: " + getRiskText(score, isDone) + "\n" + getRiskAction(score, isDone) + "\n\n" + getResultString()} color="#ffffff" />}
            />
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

    const disabledColor = "#1a1b20";
    const disabledBackgroundColor = "#eeedf4";

    let item = entries[selected];

    return (
        <View style={riskStyles.container}>
            <Text style={riskStyles.subtitle}>{item.subtitle}</Text>
            {item.title === "Severity" && <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginTop: 12 }}>
                <Banner
                    backgroundColor={item.score === 1 ? '#b9f0b8' : disabledBackgroundColor}
                    color={item.score === 1 ? '#002107' : disabledColor}
                    icon={<Ionicons name="remove-circle" size={24} color={item.score === 1 ? '#002107' : disabledColor} />}
                    title={<><Text style={item.score === 1 && riskStyles.boldText}>None or Slight</Text>: Discomfort or nuisance.</>}
                    onPress={() => { onChangeValue(1, '#b9f0b8', '#002107', <><Text style={item.score === 1 && riskStyles.boldText}>None or Slight</Text>: Discomfort or nuisance.</>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 2 ? '#ffdeae' : disabledBackgroundColor}
                    color={item.score === 2 ? '#281900' : disabledColor}
                    icon={<Ionicons name="heart-circle" size={24} color={item.score === 2 ? '#281900' : disabledColor} />}
                    title={<><Text style={item.score === 2 && riskStyles.boldText}>Minimal</Text>: First aid required.</>}
                    onPress={() => { onChangeValue(2, '#ffdeae', '#281900', <><Text style={item.score === 2 && riskStyles.boldText}>Minimal</Text>: First aid required.</>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 3 ? '#ffdeae' : disabledBackgroundColor}
                    color={item.score === 3 ? '#281900' : disabledColor}
                    icon={<Ionicons name="alert-circle" size={24} color={item.score === 3 ? '#281900' : disabledColor} />}
                    title={<><Text style={item.score === 3 && riskStyles.boldText}>Significant</Text>: IWI/searcher leaves the field early (e.g., urgent care type of medical visit).</>}
                    onPress={() => { onChangeValue(3, '#ffdeae', '#281900', <><Text style={item.score === 3 && riskStyles.boldText}>Significant</Text>: IWI/searcher leaves the field early (e.g., urgent care type of medical visit).</>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 4 ? '#ffdad6' : disabledBackgroundColor}
                    color={item.score === 4 ? '#410002' : disabledColor}
                    icon={<Ionicons name="stop-circle" size={24} color={item.score === 4 ? '#410002' : disabledColor} />}
                    title={<><Text style={item.score === 4 && riskStyles.boldText}>Major</Text>: IWI with &gt; 1 week recovery (e.g., emergency room type of medical visit).</>}
                    onPress={() => { onChangeValue(4, '#ffdad6', '#410002', <><Text style={item.score === 4 && riskStyles.boldText}>Major</Text>: IWI with &gt; 1 week recovery (e.g., emergency room type of medical visit).</>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 5 ? '#ffb4ab' : disabledBackgroundColor}
                    color={item.score === 5 ? '#690005' : disabledColor}
                    icon={<Ionicons name="close-circle" size={24} color={item.score === 5 ? '#690005' : disabledColor} />}
                    title={<><Text style={item.score === 5 && riskStyles.boldText}>Catastrophic</Text>: Death or permanent disability.</>}
                    onPress={() => { onChangeValue(5, '#ffb4ab', '#690005', <><Text style={item.score === 5 && riskStyles.boldText}>Catastrophic</Text>: Death or permanent disability.</>) }}
                    noRadius />
            </View>}
            {item.title === "Probability" && <View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginTop: 12 }}>
                <Banner
                    backgroundColor={item.score === 1 ? '#b9f0b8' : disabledBackgroundColor}
                    color={item.score === 1 ? '#002107' : disabledColor}
                    icon={<Ionicons name="remove-circle" size={24} color={item.score === 1 ? '#002107' : disabledColor} />}
                    title={<><Text style={item.score === 1 && riskStyles.boldText}>Impossible/Remote</Text></>}
                    onPress={() => { onChangeValue(1, '#b9f0b8', '#002107', <><Text style={item.score === 1 && riskStyles.boldText}>Impossible/Remote</Text></>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 2 ? '#ffdeae' : disabledBackgroundColor}
                    color={item.score === 2 ? '#281900' : disabledColor}
                    icon={<Ionicons name="heart-circle" size={24} color={item.score === 2 ? '#281900' : disabledColor} />}
                    title={<><Text style={item.score === 2 && riskStyles.boldText}>Unlikely under normal conditions</Text></>}
                    onPress={() => { onChangeValue(2, '#ffdeae', '#281900', <><Text style={item.score === 2 && riskStyles.boldText}>Unlikely under normal conditions</Text></>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 3 ? '#ffdeae' : disabledBackgroundColor}
                    color={item.score === 3 ? '#281900' : disabledColor}
                    icon={<Ionicons name="alert-circle" size={24} color={item.score === 3 ? '#281900' : disabledColor} />}
                    title={<><Text style={item.score === 3 && riskStyles.boldText}>About 50/50</Text></>}
                    onPress={() => { onChangeValue(3, '#ffdeae', '#281900', <><Text style={item.score === 3 && riskStyles.boldText}>About 50/50</Text></>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 4 ? '#ffdad6' : disabledBackgroundColor}
                    color={item.score === 4 ? '#410002' : disabledColor}
                    icon={<Ionicons name="stop-circle" size={24} color={item.score === 4 ? '#410002' : disabledColor} />}
                    title={<><Text style={item.score === 4 && riskStyles.boldText}>Greater than 50%</Text></>}
                    onPress={() => { onChangeValue(4, '#ffdad6', '#410002', <><Text style={item.score === 4 && riskStyles.boldText}>Greater than 50%</Text></>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 5 ? '#ffb4ab' : disabledBackgroundColor}
                    color={item.score === 5 ? '#690005' : disabledColor}
                    icon={<Ionicons name="close-circle" size={24} color={item.score === 5 ? '#690005' : disabledColor} />}
                    title={<><Text style={item.score === 5 && riskStyles.boldText}>Likely to happen</Text></>}
                    onPress={() => { onChangeValue(5, '#ffb4ab', '#690005', <><Text style={item.score === 5 && riskStyles.boldText}>Likely to happen</Text></>) }}
                    noRadius />
            </View>}
            {item.title === "Exposure" && <><Text style={{ paddingTop: 8 }}>These definitions are used by CALSAR. Your agency may have different definitions based on risk tolerance and activity type. </Text><View style={{ borderRadius: 26, overflow: 'hidden', gap: 2, marginTop: 12 }}>
                <Banner
                    backgroundColor={item.score === 1 ? '#b9f0b8' : disabledBackgroundColor}
                    color={item.score === 1 ? '#002107' : disabledColor}
                    icon={<Ionicons name="remove-circle" size={24} color={item.score === 1 ? '#002107' : disabledColor} />}
                    title={<><Text style={item.score === 1 && riskStyles.boldText}>None or below average</Text>: One member of the team exposed for a short time.</>}
                    onPress={() => { onChangeValue(1, '#b9f0b8', '#002107', <><Text style={item.score === 1 && riskStyles.boldText}>None or below average</Text>: One member of the team exposed for a short time.</>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 2 ? '#ffdeae' : disabledBackgroundColor}
                    color={item.score === 2 ? '#281900' : disabledColor}
                    icon={<Ionicons name="alert-circle" size={24} color={item.score === 2 ? '#281900' : disabledColor} />}
                    title={<><Text style={item.score === 2 && riskStyles.boldText}>Average</Text>: More than one member exposed for a short time, or one member exposed for a longer time.</>}
                    onPress={() => { onChangeValue(2, '#ffdeae', '#281900', <><Text style={item.score === 2 && riskStyles.boldText}>Average</Text>: More than one member exposed for a short time, or one member exposed for a longer time.</>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 3 ? '#ffdad6' : disabledBackgroundColor}
                    color={item.score === 3 ? '#410002' : disabledColor}
                    icon={<Ionicons name="stop-circle" size={24} color={item.score === 3 ? '#410002' : disabledColor} />}
                    title={<><Text style={item.score === 3 && riskStyles.boldText}>Above average</Text>: One or more members exposed multiple times, or for long periods.</>}
                    onPress={() => { onChangeValue(3, '#ffdad6', '#410002', <><Text style={item.score === 3 && riskStyles.boldText}>Above average</Text>: One or more members exposed multiple times, or for long periods.</>) }}
                    noRadius />
                <Banner
                    backgroundColor={item.score === 4 ? '#ffb4ab' : disabledBackgroundColor}
                    color={item.score === 4 ? '#690005' : disabledColor}
                    icon={<Ionicons name="close-circle" size={24} color={item.score === 4 ? '#690005' : disabledColor} />}
                    title={<><Text style={item.score === 4 && riskStyles.boldText}>Great</Text>: Long or repeated exposure to multiple team members.</>}
                    onPress={() => { onChangeValue(4, '#ffb4ab', '#690005', <><Text style={item.score === 4 && riskStyles.boldText}>Great</Text>: Long or repeated exposure to multiple team members.</>) }}
                    noRadius />
            </View></>}
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
    description: {
        flex: -1,
        flexShrink: 1
    },
    boldText: {
        fontWeight: 'bold',
    },
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
        height: '100%',
    },
    listContainer: {
    },
    boldText: {
        fontWeight: 'bold',
    },
});
