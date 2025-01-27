import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from 'calsar-ui';

export function TabButton({ title, active, onClick }) {
    const { colorTheme, getHoverColor } = useContext(ThemeContext);
    const [focus, setFocus] = useState(false);

    let focusColor = active ? colorTheme.primary + Math.round(0.8 * 255).toString(16).toUpperCase() : colorTheme.primary + Math.round(0.3 * 255).toString(16).toUpperCase();
    const focusTheme = (focus) ? {
        backgroundColor: focusColor,
    } : {};


    return (
        <Pressable
            onHoverIn={() => { setFocus(true) }}
            onHoverOut={() => { setFocus(false) }}
            onPress={onClick}
            android_ripple={{ color: colorTheme.surfaceContainerHigh }}
            style={[{}]}>
            <View style={[{ paddingVertical: 6, paddingHorizontal: 12, justifyContent: "center", alignItems: "center", borderRadius: 8, backgroundColor: active ? colorTheme.primary : getHoverColor(colorTheme.surfaceContainerHigh, 0.3) }, focusTheme]}>
                <Text style={{ color: active ? colorTheme.onPrimary : colorTheme.onBackground, textAlign: 'center', fontWeight: active ? "bold" : "normal" }}>{title}</Text>
            </View>
        </Pressable>

    );
}

export default function SwitcherContainer({ tabs, activeTab, setActiveTab }) {
    const styles = pageStyles();
    const { colorTheme } = useContext(ThemeContext);
    const activeTabContent = tabs.find(tab => tab.name === activeTab)?.content;

    return (
        <View style={{ flexGrow: 1, flexShrink: 1 }}>
            {<View style={{ flexDirection: "row", justifyContent: "flex-start", gap: 12 }}>
                {tabs.filter(item => !item.bottom).map(item => (
                    <TabButton key={item.name} title={item.name} icon={item.icon} active={item.name === activeTab} onClick={() => { setActiveTab(item.name) }} />
                ))}
            </View>}
            <ScrollView
                contentContainerStyle={[styles.mainScroll]}>
                {activeTabContent}
            </ScrollView>
        </View>
    );
}

const pageStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        background: {
            backgroundColor: colorTheme.background,
            height: '100%'
        },
        mainScroll: {
            paddingTop: 16,
            paddingBottom: 16,
            gap: 20,
        },
        container: {
            flex: 1,
            backgroundColor: colorTheme.background,
            height: '100%',
            alignSelf: 'center',
            paddingHorizontal: 20,
        },
        text: {
            color: colorTheme.onBackground
        },
        sectionTitle: {
            color: colorTheme.onBackground,
            fontSize: 20,
            //fontWeight: '500',
        },
        timerSection: {
            gap: 4,
            borderRadius: 26,
            overflow: 'hidden',
        },
    });
}