import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from 'calsar-ui';
import React, { useContext, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export function TabButton({ icon, title, active, onClick }) {
    const { colorTheme } = useContext(ThemeContext);
    const [focus, setFocus] = useState(false);

    let focusColor = active ? colorTheme.secondaryFixed + Math.round(0.8 * 255).toString(16).toUpperCase() : colorTheme.primary + Math.round(0.3 * 255).toString(16).toUpperCase();
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
                flexGrow: 1,
                flexBasis: 0,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                paddingVertical: 12
            }]}>
            {active ?
                <View style={[{ backgroundColor: colorTheme.secondaryFixed, height: 28, justifyContent: "center", alignItems: "center", width: 50, borderRadius: 14 }, focusTheme]}>
                    <Ionicons name={icon} size={20} color={colorTheme.onSecondaryFixed} />
                </View>
                :
                <View style={[{ height: 28, justifyContent: "center", alignItems: "center", width: 50, borderRadius: 14 }, focusTheme]}>
                    <Ionicons name={`${icon}-outline`} size={22} color={colorTheme.primary} />
                </View>
            }
            {title && <Text style={{ color: colorTheme.primary, textAlign: 'center', fontSize: 12, fontWeight: active ? "bold" : "normal" }}>{title}</Text>}
            {false && active && <View style={{
                marginTop: 7,
                backgroundColor: colorTheme.primary,
                height: 3,
                width: 56,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3
            }} />}
        </Pressable>
    );
}

export default function TabContainer({ tabs, activeTab, setActiveTab, readOnly = false }) {
    const { colorTheme } = useContext(ThemeContext);
    const activeTabContent = tabs.find(tab => tab.name === activeTab)?.content;

    return (
        <View style={{ flexGrow: 1, flexShrink: 1 }}>
            {activeTabContent}
            {!readOnly && <View style={{ flexDirection: "row", height: 80, backgroundColor: colorTheme.surfaceContainerLow }}>
                {tabs.filter(item => !item.bottom).map(item => (
                    <TabButton key={item.name} title={item.name} icon={item.icon} active={item.name === activeTab} onClick={() => { setActiveTab(item.name) }} />
                ))}
            </View>}
        </View>
    );
}