import { Ionicons } from '@expo/vector-icons';
import { textStyles, ThemeContext } from 'calsar-ui';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import MapPanel from './MapPanel';
import { RxDBContext } from './RxDBContext';
import { TicketRailPanel } from './TicketRailPanel';

const HikerBG = require('../assets/images/hiker.svg');

export function RailButton({ icon, title, active, onClick, notification }) {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const [focus, setFocus] = useState(false);
    const textStyle = textStyles();

    let focusColor = active ? getHoverColor(colorTheme.secondaryFixed, 0.8) : getHoverColor(colorTheme.primary, 0.3);
    const focusTheme = (focus) ? {
        backgroundColor: focusColor,
    } : {};

    return (
        <Pressable
            onHoverIn={() => { setFocus(true) }}
            onHoverOut={() => { setFocus(false) }}
            onPress={onClick}
            android_ripple={{ color: colorTheme.surfaceContainerHigh }}
            style={[{
                width: 90,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                paddingVertical: 12
            },

            ]}>
            <View style={[{ backgroundColor: active ? colorTheme.secondaryFixed : "transparent", height: 28, justifyContent: "center", alignItems: "center", width: 50, borderRadius: 14 }, focusTheme]}>
                <Ionicons name={active ? icon : `${icon}-outline`} size={active ? 20 : 22} color={active ? colorTheme.onSecondaryFixed : colorTheme.primary} />
            </View>
            {notification && <View style={[{
                position: 'absolute',
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colorTheme.garRedLight,
                top: 8,
                right: 16,
                outlineStyle: "solid",
                outlineWidth: 3,
                outlineColor: colorTheme.primaryContainer
            }]} />}
            {title && <Text style={[textStyle.tertiaryText, { color: colorTheme.onPrimaryContainer, textAlign: 'center', fontWeight: active ? "bold" : "normal" }]}>{title}</Text>}
        </Pressable>

    );
}

export const AnimatedBG = ({ children, image = false, colorOnly = false, error = false, warn = false }) => {
    const { colorTheme, colorScheme } = useContext(ThemeContext);
    const styles = pageStyles();

    const [errorSate, setErrorState] = useState(false);
    const [warnState, setWarnState] = useState(false);
    const [currentAB, setCurrentAB] = useState(0); // 0 is A, 1 is B
    const [colorA, setColorA] = useState(colorTheme.background);
    const [colorB, setColorB] = useState(colorTheme.background);

    // Animation stuff
    const bgOpacity = useSharedValue(1); // Shared value for opacity
    const progress = useSharedValue(0); // Shared value for color
    const bgAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: bgOpacity.value,
            backgroundColor: interpolateColor(progress.value, [0, 1], [colorA, colorB])
        };
    });

    const animateBanner = () => {
        if (image > bgOpacity.value) {
            bgOpacity.value = withTiming(image || 0, { duration: 250, easing: Easing.linear });
        } else {
            bgOpacity.value = withTiming(image || 0, { duration: 750, easing: Easing.linear });
        }
        if (image === 1) {
            setColor(colorTheme.background, 250);
        } else {
            setColor(getColor(error, warn))
        }
    }

    const setColor = (color, duration = 500) => {
        if (currentAB === 0) {
            setColorB(color);
            setCurrentAB(1);
            setTimeout(() => {
                progress.value = withTiming(1, { duration: duration, easing: Easing.linear });
            }, 250);
        } else {
            setColorA(color);
            setCurrentAB(0);
            setTimeout(() => {
                progress.value = withTiming(0, { duration: duration, easing: Easing.linear });
            }, 250);
        }
    }

    const getColor = (error, warn) => {
        if (error) {
            return (colorScheme === 'dark' ? "#1A0001" : "#fff0ef");
        } else if (warn) {
            return (colorScheme === 'dark' ? "#261900" : "#fff5e7");
        }
        else {
            return (colorTheme.background);
        }
    }
    useEffect(() => {
        if (error != errorSate || warn != warnState) {
            setColor(getColor(error, warn));
            setErrorState(error);
            setWarnState(warn);
        }
    }, [error, errorSate, warn, warnState]);

    useEffect(() => {
        if (image) animateBanner();
    }, [image]);

    return <ImageBackground source={image && !colorOnly && HikerBG} resizeMode="cover" style={[styles.image]}>
        <Animated.View style={[styles.overlayView, bgAnimatedStyle]} />
        {children}
    </ImageBackground>
}

const TAB_TO_TEAM_MAP = {
    "Resources": "ops",
    "Tasks": "planning",
    "Clues": "investigations",
    "Comms": "comms"
}

export default function RailContainer({ file, tabs, activeTab, setActiveTab, readOnly = false, markers, removeMarker, teams }) {
    const styles = pageStyles();
    const { colorTheme } = useContext(ThemeContext);
    const ref = useRef(null);
    const { getCommsQueueMessagesByFileId } = useContext(RxDBContext);

    const [draggingPanel, setDraggingPanel] = useState(false);
    const [draggingBottomPanel, setDraggingBottomPanel] = useState(false);
    const [draggingLeftPanel, setDraggingLeftPanel] = useState(false);
    const [resizeRequest, setResizeRequest] = useState(false);
    const [commsQueueMessages, setCommsQueueMessages] = useState([]);
    const [filteredCommsQueue, setFilteredCommsQueue] = useState([]);
    const [tabHasNotification, setTabHasNotification] = useState({});

    const activeTabContent = tabs.find(tab => tab.name === activeTab)?.content;
    const rightPanel = tabs.find(tab => tab.name === activeTab)?.rightPanel || false;

    const resizeDone = () => {
        setResizeRequest(false);
    }

    useEffect(() => {
        // Resize map whenever new markers are added until we have better logic for this
        if (markers && markers.length > 0) {
            setResizeRequest(true);
        }
    }, [markers]);

    useEffect(() => {
        setResizeRequest(true);
    }, [activeTab]);

    useEffect(() => {
        if (file?.id) {
            getCommsQueueMessagesByFileId(file.id).then(query => {
                query.$.subscribe(result => {
                    setCommsQueueMessages(result);
                    return () => { query.$.unsubscribe() };
                });
            });
        }
    }, [file]);

    useEffect(() => {
        let filteredQueue = commsQueueMessages;
        let newTabHasNotifications = {};

        // Go through the queue and add the superseded flag to items where there is a newer request to the same toFieldTeamId of the same type and subtype
        // At the same time, check if any of the tabs should show a notification badge, which indicates that there is an outstanding request
        filteredQueue = filteredQueue.map(item => {
            const newerRequests = filteredQueue.filter(req =>
                req.toFieldTeamId === item.toFieldTeamId &&
                req.type === item.type &&
                req.subtype === item.subtype &&
                new Date(req.created) > new Date(item.created)
            );
            const superseded = newerRequests.length > 0;
            if (!superseded && !item.closed) {
                newTabHasNotifications[item.toOpsTeam] = true;
            }
            return { doc: item, superseded: superseded };
        });

        setTabHasNotification(newTabHasNotifications);

        switch (activeTab) {
            case "Resources":
                filteredQueue = filteredQueue.filter(item => item.doc.type === "Resource" || item.doc.toOpsTeam === "ops");
                break;
            case "Tasks":
                // Show only type == Task or toOpsTeam == planning
                filteredQueue = filteredQueue.filter(item => item.doc.type === "Task" || item.doc.toOpsTeam === "planning");
                break;
            case "Clues":
                // Show only type == Clue
                filteredQueue = filteredQueue.filter(item => item.doc.type === "Clue" || item.doc.toOpsTeam === "investigations");
                break;
            case "Comms":
                // Show only type == General
                // filteredQueue = filteredQueue;
                break;
            default:
            // filteredQueue = filteredQueue;
        }

        setFilteredCommsQueue(filteredQueue);
        handleUpdateQueueLength(filteredQueue.length);
    }, [activeTab, commsQueueMessages])

    const handleUpdateQueueLength = (length) => {
        if (ref.current) {
            if (length > 0 && ref.current.getSize() < 10) {
                ref.current.resize(13);
            }
            if (length === 0 && ref.current.getSize() > 5) {
                ref.current.resize(5);
            }
        }
    }

    return (
        <View style={{ flexGrow: 1, flexShrink: 1, flexDirection: "row", backgroundColor: colorTheme.primaryContainer }}>
            {!readOnly &&
                <ScrollView
                    style={{ flexGrow: 0, width: 90 }}
                    contentContainerStyle={{ flexGrow: 1, flexDirection: "column", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "column" }}>
                        {tabs.filter(item => !item.bottom).map(item => (
                            <RailButton notification={tabHasNotification[TAB_TO_TEAM_MAP[item.name]]} key={item.name} title={item.name} icon={item.icon} active={item.name === activeTab} onClick={() => { item.function ? item.function() : setActiveTab(item.name) }} bottom={item.bottom} />
                        ))}
                    </View>
                    <View style={{ flexDirection: "column" }}>
                        {tabs.filter(item => item.bottom).map(item => (
                            <RailButton key={item.name} title={item.name} icon={item.icon} active={item.name === activeTab} onClick={() => { item.function ? item.function() : setActiveTab(item.name) }} bottom={item.bottom} />
                        ))}
                    </View>
                </ScrollView>}
            <View style={[styles.container, { marginRight: 2, paddingBottom: 2 }]}>
                <PanelGroup
                    autoSaveId={"verticalGroup"}
                    direction="vertical">
                    <Panel>
                        <PanelGroup
                            direction="horizontal"
                            autoSaveId={"defaultTab"}
                            style={{ width: "100%", backgroundColor: colorTheme.primaryContainer }}
                        >
                            {markers && markers.length > 0 && <>
                                <Panel
                                    id="left"
                                    order={1}
                                    defaultSize={20}
                                    minSize={10}
                                    style={{ height: "100%", backgroundColor: colorTheme.background, borderRadius: 20, borderTopRightRadius: 20 }}>
                                    <MapPanel markers={markers} removeMarker={removeMarker} resizeDone={resizeDone} resizeRequest={resizeRequest} />
                                </Panel>
                                <PanelResizeHandle
                                    style={{ width: 3, backgroundColor: draggingLeftPanel ? colorTheme.outline : colorTheme.primaryContainer }}
                                    onDragging={(ev) => {
                                        if (!ev) setResizeRequest(true);
                                        setDraggingLeftPanel(ev);
                                    }} />
                            </>
                            }
                            <Panel
                                id="main"
                                order={2}
                                minSize={30}
                                style={{ height: "100%", backgroundColor: colorTheme.background, borderRadius: 20, borderTopRightRadius: 20, }}>
                                {activeTabContent}
                            </Panel>
                            {rightPanel && <>
                                <PanelResizeHandle
                                    style={{ width: 3, backgroundColor: draggingPanel ? colorTheme.outline : colorTheme.primaryContainer }}
                                    onDragging={setDraggingPanel} />
                                <Panel
                                    id="right"
                                    order={3}
                                    defaultSize={30}
                                    minSize={20}
                                    style={{ height: "100%", backgroundColor: colorTheme.background, borderRadius: 20, borderTopRightRadius: 20 }}>
                                    {rightPanel}
                                </Panel>
                            </>}
                        </PanelGroup >
                    </Panel>
                    {activeTab !== "Loading" && <>
                        <PanelResizeHandle
                            style={{ height: 3, backgroundColor: draggingBottomPanel ? colorTheme.outline : colorTheme.primaryContainer }}
                            onDragging={setDraggingBottomPanel} />
                        <Panel
                            ref={ref}
                            id="bottom"
                            order={4}
                            defaultSize={5}
                            minSize={5}
                            style={{ height: "100%", backgroundColor: colorTheme.background, borderRadius: 20, borderTopRightRadius: 20 }}>
                            <TicketRailPanel file={file} teams={teams} activeTab={activeTab} filteredCommsQueue={filteredCommsQueue} />
                        </Panel>
                    </>}
                </PanelGroup >
            </View>
        </View >
    );
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        mainScroll: {
            paddingTop: 20,
            paddingBottom: 20,
            paddingRight: 10,
            paddingLeft: 20,
            gap: 20,
            alignSelf: 'center',
        },
        image: {
            flex: 1,
            height: '100%',
            alignSelf: 'center',
            backgroundColor: colorTheme.background,
            borderTopLeftRadius: 20,
            width: "100%"
        },
        overlayView: {
            height: "100%",
            width: "100%",
            position: 'absolute',
            borderTopLeftRadius: 20,
            backgroundColor: colorTheme.background
        },
        container: {
            flex: 1,
            height: '100%',
        },
        text: {
            color: colorTheme.onPrimaryContainer
        },
        timerSection: {
            gap: 4,
            borderRadius: 26,
            overflow: 'hidden',
        },
    });
}