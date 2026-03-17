import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeContext } from './ThemeContext';

function TabButton({ icon, label, isActive, onPress }) {
    const { colorTheme } = useContext(ThemeContext);
    const [isHovered, setIsHovered] = useState(false);

    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const activeAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(activeAnim, {
            toValue: isActive ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }).start();

        if (isActive) {
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 0.92, duration: 50, useNativeDriver: false }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: false })
            ]).start();
        }
    }, [isActive]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: false,
            speed: 20,
            bounciness: 0
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: false
        }).start();
    };

    // Interpolations
    const backgroundColor = activeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [isHovered ? colorTheme.surfaceContainerHigh : 'transparent', colorTheme.primary]
    });

    return (
        <Pressable
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            android_ripple={{ color: colorTheme.surfaceContainerHighest, borderless: true, radius: 32 }}
            style={styles.tabButton}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
        >
            <Animated.View style={[
                styles.iconContainer,
                {
                    backgroundColor,
                    transform: [{ scale: scaleAnim }]
                }
            ]}>
                <Ionicons
                    name={isActive ? icon : `${icon}-outline`}
                    size={22}
                    color={isActive ? colorTheme.onPrimary : colorTheme.onSurfaceVariant}
                />
            </Animated.View>
            {label && (
                <Animated.Text style={[
                    styles.label,
                    {
                        color: isActive ? colorTheme.onSurface : colorTheme.onSurfaceVariant,
                        fontWeight: isActive ? '700' : '500',
                        opacity: activeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] })
                    }
                ]}>
                    {label}
                </Animated.Text>
            )}
        </Pressable>
    );
}

export function TabContainer({ items, selectedId, onSelect, readOnly = false }) {
    const { colorTheme } = useContext(ThemeContext);
    const insets = useSafeAreaInsets();

    const activeContent = items.find(item => item.id === selectedId)?.content;
    const visibleTabs = items.filter(item => !item.hidden);

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {activeContent}
            </View>

            {!readOnly && (
                <View style={[
                    styles.tabBar,
                    {
                        backgroundColor: colorTheme.surfaceContainer,
                        paddingBottom: Platform.OS === 'ios' ? 0 : insets.bottom,
                        height: 80 + (Platform.OS === 'ios' ? 0 : insets.bottom)
                    }
                ]}>
                    {visibleTabs.map(item => (
                        <TabButton
                            key={item.id}
                            label={item.label}
                            icon={item.icon}
                            isActive={item.id === selectedId}
                            onPress={() => onSelect(item.id)}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    tabBar: {
        flexDirection: "row",
        width: '100%',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        paddingTop: 12,
        paddingHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    iconContainer: {
        height: 32,
        width: 64,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        overflow: 'hidden',
    },
    label: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 4
    }
});
