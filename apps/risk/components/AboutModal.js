import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHeader, BannerGroup, BrandingBar, FilledButton, ThemeContext, Tile, textStyles } from 'calsar-ui';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AboutModal({ isVisible, onClose, dismissible = true }) {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isLargeScreen = width > 800;
    const styles = getStyles(colorTheme, insets, isLargeScreen);
    const textStyle = textStyles(colorTheme, width);
    const [step, setStep] = useState(1);

    // Reset step when modal opens
    useEffect(() => {
        if (isVisible) {
            setStep(1);
        }
    }, [isVisible]);

    const handleDone = async () => {
        await AsyncStorage.setItem('hasSeenQuickstart', 'true');
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => {
                if (dismissible) onClose();
            }}
        >
            <View style={styles.background}>
                {dismissible ? (
                    <BackHeader
                        title="About this App"
                        color={colorTheme.white}
                        hideBack={!dismissible}
                        onPressBack={() => onClose()}
                        omitTopInset={Platform.OS === 'ios'}
                    />
                ) : (
                    <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 14 : insets.top }]}>
                        <BrandingBar textColor={styles.header.color} title="Risk Assessment Tools" />
                    </View>
                )}
                <ScrollView contentContainerStyle={styles.mainScroll}>
                    {isLargeScreen ? (
                        <View style={{ flexDirection: 'row', flex: 1, justifyContent: "center", gap: 32, maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
                            {/* Column 1: Overview */}
                            <View style={[styles.content, { flex: 1.5 }]}>
                                <View style={[styles.placeholderLogo, { width: 140, height: 140, borderRadius: 70, alignSelf: 'center', overflow: 'hidden' }]}>
                                    <Image
                                        source={require('../assets/icon.png')}
                                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                                    />
                                </View>

                                <Text style={textStyle.bodyLarge}>Risk management is a continuous process of identifying hazards, assessing their severity, and developing mitigations. Use the tools in this app to guide discussions around your team's safety.</Text>
                                <Text style={[textStyle.bodyMedium, { marginTop: 8 }]}><Text style={{ fontWeight: 'bold' }}>Before</Text> entering the field:</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={[styles.card, { flex: 1 }]}>
                                        <Text style={textStyle.titleMedium}>ORMA / GAR</Text>
                                        <Text style={textStyle.bodyMedium}>The legacy baseline. Highly interoperable between agencies.</Text>
                                    </View>

                                    <View style={[styles.card, { flex: 1 }]}>
                                        <Text style={textStyle.titleMedium}>PEAACE</Text>
                                        <Text style={textStyle.bodyMedium}>A modernized, simplified alternative developed by USCG.</Text>
                                    </View>
                                </View>

                                <Text style={[textStyle.bodyMedium, { marginTop: 8 }]}>When a <Text style={{ fontWeight: 'bold' }}>specific new</Text> risk appears:</Text>
                                <View style={styles.card}>
                                    <Text style={textStyle.titleMedium}>Severity, Probability, Exposure (SPE)</Text>
                                    <Text style={textStyle.bodyMedium}>Use this to quickly categorize a new risk when the situation in the field changes (e.g., deciding whether to cross a swollen stream).</Text>
                                </View>
                            </View>

                            {/* Column 2: Brought to you by */}
                            <View style={[styles.content, { flex: 1 }]}>
                                <View style={styles.logosContainer}>
                                    <View style={styles.endorsementContainer}>
                                        <View style={styles.logoRow}>
                                            <TouchableOpacity
                                                style={[styles.placeholderLogo, { backgroundColor: '#ffffff', padding: 0 }]}
                                                onPress={() => Linking.openURL('https://www.cal-esar.org/')}
                                            >
                                                <Image
                                                    source={require('calsar-ui/assets/calsar_150.png')}
                                                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.placeholderLogo, { backgroundColor: colorTheme.brand, padding: 18 }]}
                                                onPress={() => Linking.openURL('https://www.caloes.ca.gov/')}
                                            >
                                                <Image
                                                    source={require('../assets/caloes-vertical.png')}
                                                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={[textStyle.bodyMedium, { marginTop: 16, textAlign: 'center' }]}>This app was created by California Search and Rescue, which operates at the direction of the California Governor's Office of Emergency Services, for the SAR community.</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.endorsementContainer, { flexDirection: 'row', alignItems: 'center' }]}
                                        onPress={() => Linking.openURL('https://nasar.org/')}
                                    >
                                        <View style={[styles.placeholderLogo, { backgroundColor: '#ffffff', width: 120, height: 120, borderRadius: 120 / 2 }]}>
                                            <Image
                                                source={require('../assets/nasar.png')}
                                                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                            />
                                        </View>
                                        <Text style={[textStyle.bodyMedium, { flex: 1, textAlign: 'left', marginLeft: 16 }]}>
                                            NASAR has formally endorsed this application in recognition of its alignment with standardized SAR risk management practices.
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={[textStyle.bodySmall, { color: colorTheme.onSurfaceVariant, textAlign: 'center' }]}>
                                    Tools this app are intended to facilitate team conversation and aren't a decision-making authority. A 'green' result does not guarantee safety. All scores should be interpreted in the context of your team's experience, policies, the specific environment, and the guidance of qualified leadership. Logos used with permission.
                                </Text>
                                <View style={{ marginTop: 16 }}>
                                    <BannerGroup marginHorizontal={0}>
                                        <Tile
                                            onPress={async () => {
                                                await AsyncStorage.setItem('hasSeenQuickstart', 'true');
                                                router.navigate('/privacy');
                                                onClose();
                                            }}
                                            icon={<Ionicons name="shield-checkmark" size={20} />}
                                            title="Your input is not saved"
                                            subtitle="Tap to view the privacy policy"
                                        />
                                    </BannerGroup>
                                </View>
                            </View>
                        </View>
                    ) : (
                        step === 1 ? (
                            <View style={styles.content}>
                                <View style={[styles.placeholderLogo, { width: 140, height: 140, borderRadius: 70, alignSelf: 'center', overflow: 'hidden' }]}>
                                    <Image
                                        source={require('../assets/icon.png')}
                                        style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                                    />
                                </View>

                                <Text style={textStyle.bodyLarge}>Risk management is a continuous process of identifying hazards, assessing their severity, and developing mitigations. Use the tools in this app to guide discussions around your team's safety.</Text>
                                <Text style={[textStyle.bodyMedium, { marginTop: 8 }]}><Text style={{ fontWeight: 'bold' }}>Before</Text> entering the field:</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={[styles.card, { flex: 1 }]}>
                                        <Text style={textStyle.titleMedium}>ORMA / GAR</Text>
                                        <Text style={textStyle.bodyMedium}>The legacy baseline. Highly interoperable between agencies.</Text>
                                    </View>

                                    <View style={[styles.card, { flex: 1 }]}>
                                        <Text style={textStyle.titleMedium}>PEAACE</Text>
                                        <Text style={textStyle.bodyMedium}>A modernized, simplified alternative developed by USCG.</Text>
                                    </View>
                                </View>

                                <Text style={[textStyle.bodyMedium, { marginTop: 8 }]}>When a <Text style={{ fontWeight: 'bold' }}>specific new</Text> risk appears:</Text>
                                <View style={styles.card}>
                                    <Text style={textStyle.titleMedium}>Severity, Probability, Exposure (SPE)</Text>
                                    <Text style={textStyle.bodyMedium}>Use this to quickly categorize a new risk when the situation in the field changes (e.g., deciding whether to cross a swollen stream).</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.content}>
                                <View style={styles.logosContainer}>
                                    <View style={styles.endorsementContainer}>
                                        <View style={styles.logoRow}>
                                            <TouchableOpacity
                                                style={[styles.placeholderLogo, { backgroundColor: '#ffffff', padding: 0 }]}
                                                onPress={() => Linking.openURL('https://www.cal-esar.org/')}
                                            >
                                                <Image
                                                    source={require('calsar-ui/assets/calsar_150.png')}
                                                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.placeholderLogo, { backgroundColor: colorTheme.brand, padding: 18 }]}
                                                onPress={() => Linking.openURL('https://www.caloes.ca.gov/')}
                                            >
                                                <Image
                                                    source={require('../assets/caloes-vertical.png')}
                                                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={[textStyle.bodyMedium, { marginTop: 16, textAlign: 'center' }]}>This app was created by California Search and Rescue, which operates at the direction of the California Governor's Office of Emergency Services, for the SAR community.</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.endorsementContainer, { flexDirection: 'row', alignItems: 'center' }]}
                                        onPress={() => Linking.openURL('https://nasar.org/')}
                                    >
                                        <View style={[styles.placeholderLogo, { backgroundColor: '#ffffff', width: 120, height: 120, borderRadius: 120 / 2 }]}>
                                            <Image
                                                source={require('../assets/nasar.png')}
                                                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                            />
                                        </View>
                                        <Text style={[textStyle.bodyMedium, { flex: 1, textAlign: 'left', marginLeft: 16 }]}>
                                            NASAR has formally endorsed this application in recognition of its alignment with standardized SAR risk management practices.
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={[textStyle.bodySmall, { color: colorTheme.onSurfaceVariant, textAlign: 'center' }]}>
                                    Tools this app are intended to facilitate team conversation and aren't a decision-making authority. A 'green' result does not guarantee safety. All scores should be interpreted in the context of your team's experience, policies, the specific environment, and the guidance of qualified leadership. Logos used with permission.
                                </Text>
                                <View style={{ marginTop: 16 }}>
                                    <BannerGroup marginHorizontal={0}>
                                        <Tile
                                            onPress={async () => {
                                                await AsyncStorage.setItem('hasSeenQuickstart', 'true');
                                                router.navigate('/privacy');
                                                onClose();
                                            }}
                                            icon={<Ionicons name="shield-checkmark" size={20} />}
                                            title="Your input is not saved"
                                            subtitle="Tap to view the privacy policy"
                                        />
                                    </BannerGroup>
                                </View>
                            </View>
                        )
                    )}
                </ScrollView >
                <View style={[styles.footer, { borderTopColor: colorTheme.surfaceVariant }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                        {!isLargeScreen && step === 2 && (
                            <FilledButton text={"Back"} onPress={() => setStep(1)} />
                        )}
                        {!isLargeScreen && step === 1 ? (
                            <FilledButton primary text={"Next"} onPress={() => setStep(2)} />
                        ) : (
                            <FilledButton primary text={"Close"} onPress={handleDone} />
                        )}
                    </View>
                </View>
            </View >
        </Modal>
    );
}

const getStyles = (colorTheme, insets, isLargeScreen) => StyleSheet.create({
    background: { backgroundColor: colorTheme.background, height: '100%' },
    header: { padding: 14, backgroundColor: colorTheme.brand, color: colorTheme.white },
    mainScroll: { padding: 20 },
    content: { gap: 16, maxWidth: isLargeScreen ? '100%' : 600, width: isLargeScreen ? undefined : '100%', alignSelf: isLargeScreen ? 'flex-start' : 'center' },
    card: { backgroundColor: colorTheme.surfaceContainerLow, padding: 16, borderRadius: 20, gap: 4 },
    footer: { padding: 16, paddingBottom: 16 + insets.bottom, borderTopWidth: 1, backgroundColor: colorTheme.surface },
    logosContainer: { gap: 16, marginVertical: 16, alignItems: 'center' },
    logoRow: { flexDirection: 'row', gap: 36, justifyContent: 'center' },
    endorsementContainer: { alignItems: 'center', backgroundColor: colorTheme.surfaceContainer, padding: 16, borderRadius: 20, width: '100%' },
    placeholderLogo: { width: 130, height: 130, borderRadius: 130 / 2, alignItems: 'center', justifyContent: 'center' },
    headings: {
        color: colorTheme.onPrimaryContainer,
        fontWeight: 'bold',
        marginLeft: 0,
        marginRight: 0,
    },
});
