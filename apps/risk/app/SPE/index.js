import { Ionicons } from '@expo/vector-icons';
import { Banner, BannerGroup, RiskModal, ShareButton, ThemeContext } from 'calsar-ui';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import ItemList from '../../components/ItemList';
import RiskHeader from '../../components/RiskHeader';
import { SPE_CONFIG } from '../../config/RiskStrategies';
import { useRiskAssessment } from '../../hooks/useRiskAssessment';

export default function SPE() {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const styles = getStyles(colorTheme);

    // Use the risk assessment hook
    const { calculate, getResult, getItemResult } = useRiskAssessment(SPE_CONFIG);

    const minimumScore = 1;

    const [isModalVisible, setIsModalVisible] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState(0);
    const [entries, setEntries] = useState([
        { title: "Severity", subtitle: "What is the potential loss or consequence due to this risk?", score: 0, description: "" },
        { title: "Probability", subtitle: "What is the likelihood of loss or consequence due to this risk?", score: 0, description: "" },
        { title: "Exposure", subtitle: "What is the amount of time, cycles, people or equipment involved?", score: 0, description: "" },
    ]);

    const getResultString = () => {
        return entries.map(item => `${item.title}\nDescription: ${item.subtitle}\nScore: ${item.score}\n`).join('\n');
    }

    const onItemSelect = (index) => {
        setSelectedEntry(index);
        setIsModalVisible(true);
        // alert(item.title);
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

            // Overall cycle time 550ms for consistency with PEACE
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

    const onNext = () => {
        if (selectedEntry === entries.length - 1) {
            setIsModalVisible(false);
        } else {
            setSelectedEntry(selectedEntry + 1);
        }
    };

    let isDone = !entries.some(entry => entry.score === 0);
    setStatusBarStyle(colorScheme === 'light' ? (isDone ? "light" : "dark") : "light", true);

    let title = "Score \"" + entries[selectedEntry].title + "\"";

    // Calculate score using standard calculator
    let score = calculate(entries);
    // Get UI result (color, label, action)
    let result = getResult(score);

    // Helper to render action which might be a function (component) or string
    const renderAction = (action) => {
        if (typeof action === 'function') {
            return action(styles);
        }
        return action;
    }

    return (
        <View style={Platform.OS === 'web' ? styles.containerWeb : styles.container}>
            <RiskHeader
                sharedTransitionTag="sectionTitle"
                title="Severity, Probability, Exposure"
                subtitle={isDone ? renderAction(result.action) : "Tap each element below to assign a risk score"}
                riskText={isDone ? result.label : ''}
                riskColor={isDone ? result.color : colorTheme.surfaceContainer}
                complete={isDone}
                menu={isDone && <ShareButton title="SPE Results" content={"SPE results\nOverall score: " + result.label + "\n" + (typeof result.action === 'string' ? result.action : 'See app for details') + "\n\n" + getResultString()} color="#ffffff" />}
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
                <RiskInput
                    selected={selectedEntry}
                    entries={entries}
                    onChangeValue={onChangeValue}
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
        listContainer: {
        },
        boldText: {
            fontWeight: 'bold',
        },
    });
}

function RiskInput({ selected, entries, onChangeValue, isAdvancing }) {
    const { colorTheme } = useContext(ThemeContext);
    const riskStyles = getRiskInputStyles(colorTheme);

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

    const disabledColor = colorTheme.onSurfaceVariant;
    const disabledBackgroundColor = colorTheme.surfaceVariant;

    let item = entries[selected];

    return (
        <Animated.View
            renderToHardwareTextureAndroid={true}
            style={[
                riskStyles.container,
                { opacity, transform: [{ translateY }] }
            ]}
        >
            <Text style={riskStyles.subtitle}>{item.subtitle}</Text>
            {item.title === "Severity" && <BannerGroup marginHorizontal={0}>
                <Banner
                    backgroundColor={item.score === 1 ? '#b9f0b8' : disabledBackgroundColor}
                    color={item.score === 1 ? '#002107' : disabledColor}
                    icon={<Ionicons name="remove-circle" size={24} color={item.score === 1 ? '#002107' : disabledColor} />}
                    title={<><Text style={item.score === 1 && riskStyles.boldText}>None or Slight</Text>: Discomfort or nuisance.</>}
                    onPress={() => { onChangeValue(1, <><Text style={item.score === 1 && riskStyles.boldText}>None or Slight</Text>: Discomfort or nuisance.</>) }}
                />
                <Banner
                    backgroundColor={item.score === 2 ? '#ffdeae' : disabledBackgroundColor}
                    color={item.score === 2 ? '#281900' : disabledColor}
                    icon={<Ionicons name="heart-circle" size={24} color={item.score === 2 ? '#281900' : disabledColor} />}
                    title={<><Text style={item.score === 2 && riskStyles.boldText}>Minimal</Text>: First aid required.</>}
                    onPress={() => { onChangeValue(2, <><Text style={item.score === 2 && riskStyles.boldText}>Minimal</Text>: First aid required.</>) }}
                />
                <Banner
                    backgroundColor={item.score === 3 ? '#ffdeae' : disabledBackgroundColor}
                    color={item.score === 3 ? '#281900' : disabledColor}
                    icon={<Ionicons name="alert-circle" size={24} color={item.score === 3 ? '#281900' : disabledColor} />}
                    title={<><Text style={item.score === 3 && riskStyles.boldText}>Significant</Text>: IWI/searcher leaves the field early (e.g., urgent care type of medical visit).</>}
                    onPress={() => { onChangeValue(3, <><Text style={item.score === 3 && riskStyles.boldText}>Significant</Text>: IWI/searcher leaves the field early (e.g., urgent care type of medical visit).</>) }}
                />
                <Banner
                    backgroundColor={item.score === 4 ? '#ffdad6' : disabledBackgroundColor}
                    color={item.score === 4 ? '#410002' : disabledColor}
                    icon={<Ionicons name="stop-circle" size={24} color={item.score === 4 ? '#410002' : disabledColor} />}
                    title={<><Text style={item.score === 4 && riskStyles.boldText}>Major</Text>: IWI with &gt; 1 week recovery (e.g., emergency room type of medical visit).</>}
                    onPress={() => { onChangeValue(4, <><Text style={item.score === 4 && riskStyles.boldText}>Major</Text>: IWI with &gt; 1 week recovery (e.g., emergency room type of medical visit).</>) }}
                />
                <Banner
                    backgroundColor={item.score === 5 ? '#ffb4ab' : disabledBackgroundColor}
                    color={item.score === 5 ? '#690005' : disabledColor}
                    icon={<Ionicons name="close-circle" size={24} color={item.score === 5 ? '#690005' : disabledColor} />}
                    title={<><Text style={item.score === 5 && riskStyles.boldText}>Catastrophic</Text>: Death or permanent disability.</>}
                    onPress={() => { onChangeValue(5, <><Text style={item.score === 5 && riskStyles.boldText}>Catastrophic</Text>: Death or permanent disability.</>) }}
                />
            </BannerGroup>}
            {item.title === "Probability" && <BannerGroup marginHorizontal={0}>
                <Banner
                    backgroundColor={item.score === 1 ? '#b9f0b8' : disabledBackgroundColor}
                    color={item.score === 1 ? '#002107' : disabledColor}
                    icon={<Ionicons name="remove-circle" size={24} color={item.score === 1 ? '#002107' : disabledColor} />}
                    title={<><Text style={item.score === 1 && riskStyles.boldText}>Impossible/Remote</Text></>}
                    onPress={() => { onChangeValue(1, <><Text style={item.score === 1 && riskStyles.boldText}>Impossible/Remote</Text></>) }}
                />
                <Banner
                    backgroundColor={item.score === 2 ? '#ffdeae' : disabledBackgroundColor}
                    color={item.score === 2 ? '#281900' : disabledColor}
                    icon={<Ionicons name="heart-circle" size={24} color={item.score === 2 ? '#281900' : disabledColor} />}
                    title={<><Text style={item.score === 2 && riskStyles.boldText}>Unlikely under normal conditions</Text></>}
                    onPress={() => { onChangeValue(2, <><Text style={item.score === 2 && riskStyles.boldText}>Unlikely under normal conditions</Text></>) }}
                />
                <Banner
                    backgroundColor={item.score === 3 ? '#ffdeae' : disabledBackgroundColor}
                    color={item.score === 3 ? '#281900' : disabledColor}
                    icon={<Ionicons name="alert-circle" size={24} color={item.score === 3 ? '#281900' : disabledColor} />}
                    title={<><Text style={item.score === 3 && riskStyles.boldText}>About 50/50</Text></>}
                    onPress={() => { onChangeValue(3, <><Text style={item.score === 3 && riskStyles.boldText}>About 50/50</Text></>) }}
                />
                <Banner
                    backgroundColor={item.score === 4 ? '#ffdad6' : disabledBackgroundColor}
                    color={item.score === 4 ? '#410002' : disabledColor}
                    icon={<Ionicons name="stop-circle" size={24} color={item.score === 4 ? '#410002' : disabledColor} />}
                    title={<><Text style={item.score === 4 && riskStyles.boldText}>Greater than 50%</Text></>}
                    onPress={() => { onChangeValue(4, <><Text style={item.score === 4 && riskStyles.boldText}>Greater than 50%</Text></>) }}
                />
                <Banner
                    backgroundColor={item.score === 5 ? '#ffb4ab' : disabledBackgroundColor}
                    color={item.score === 5 ? '#690005' : disabledColor}
                    icon={<Ionicons name="close-circle" size={24} color={item.score === 5 ? '#690005' : disabledColor} />}
                    title={<><Text style={item.score === 5 && riskStyles.boldText}>Likely to happen</Text></>}
                    onPress={() => { onChangeValue(5, <><Text style={item.score === 5 && riskStyles.boldText}>Likely to happen</Text></>) }}
                />
            </BannerGroup>}
            {item.title === "Exposure" && <>
                <Text style={{ paddingVertical: 8, color: colorTheme.onSurface }}>These definitions are used by CALSAR. Your agency may have different definitions based on risk tolerance and activity type. </Text>
                <BannerGroup marginHorizontal={0}>
                    <Banner
                        backgroundColor={item.score === 1 ? '#b9f0b8' : disabledBackgroundColor}
                        color={item.score === 1 ? '#002107' : disabledColor}
                        icon={<Ionicons name="remove-circle" size={24} color={item.score === 1 ? '#002107' : disabledColor} />}
                        title={<><Text style={item.score === 1 && riskStyles.boldText}>None or below average</Text>: One member of the team exposed for a short time.</>}
                        onPress={() => { onChangeValue(1, <><Text style={item.score === 1 && riskStyles.boldText}>None or below average</Text>: One member of the team exposed for a short time.</>) }}
                    />
                    <Banner
                        backgroundColor={item.score === 2 ? '#ffdeae' : disabledBackgroundColor}
                        color={item.score === 2 ? '#281900' : disabledColor}
                        icon={<Ionicons name="alert-circle" size={24} color={item.score === 2 ? '#281900' : disabledColor} />}
                        title={<><Text style={item.score === 2 && riskStyles.boldText}>Average</Text>: More than one member exposed for a short time, or one member exposed for a longer time.</>}
                        onPress={() => { onChangeValue(2, <><Text style={item.score === 2 && riskStyles.boldText}>Average</Text>: More than one member exposed for a short time, or one member exposed for a longer time.</>) }}
                    />
                    <Banner
                        backgroundColor={item.score === 3 ? '#ffdad6' : disabledBackgroundColor}
                        color={item.score === 3 ? '#410002' : disabledColor}
                        icon={<Ionicons name="stop-circle" size={24} color={item.score === 3 ? '#410002' : disabledColor} />}
                        title={<><Text style={item.score === 3 && riskStyles.boldText}>Above average</Text>: One or more members exposed multiple times, or for long periods.</>}
                        onPress={() => { onChangeValue(3, <><Text style={item.score === 3 && riskStyles.boldText}>Above average</Text>: One or more members exposed multiple times, or for long periods.</>) }}
                    />
                    <Banner
                        backgroundColor={item.score === 4 ? '#ffb4ab' : disabledBackgroundColor}
                        color={item.score === 4 ? '#690005' : disabledColor}
                        icon={<Ionicons name="close-circle" size={24} color={item.score === 4 ? '#690005' : disabledColor} />}
                        title={<><Text style={item.score === 4 && riskStyles.boldText}>Great</Text>: Long or repeated exposure to multiple team members.</>}
                        onPress={() => { onChangeValue(4, <><Text style={item.score === 4 && riskStyles.boldText}>Great</Text>: Long or repeated exposure to multiple team members.</>) }}
                    />
                </BannerGroup>
            </>}
        </Animated.View>
    );
}

const getRiskInputStyles = (colorTheme) => {

    return StyleSheet.create({
        container: {
            paddingBottom: 8, // Give the button shadow some "room" inside the animated view
            paddingHorizontal: 4, // Prevents side-shadow clipping
            gap: 10
        },
        subtitle: {
            color: colorTheme.onSurface,
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
}
