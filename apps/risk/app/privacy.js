import { BackHeader, ThemeContext, textStyles } from 'calsar-ui';
import { setStatusBarStyle } from 'expo-status-bar';
import { useContext } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function PrivacyPolicy() {
    const { colorTheme } = useContext(ThemeContext);
    const { width } = useWindowDimensions();
    const styles = getStyles(colorTheme);
    const textStyle = textStyles(colorTheme, width);

    setStatusBarStyle("light", true);

    return (
        <View style={styles.background}>
            <BackHeader
                title="Risk App Privacy Policy"
                backgroundColor={colorTheme.primaryContainer}
                color={colorTheme.onPrimaryContainer}
            />
            <ScrollView
                style={[
                    styles.container,
                    { maxWidth: (width > 850 ? 850 : width) }
                ]}
                contentContainerStyle={styles.mainScroll}>
                <View style={styles.content}>
                    <Text style={[textStyle.titleMedium, { fontWeight: 'bold' }]}>Effective Date: March 19, 2026</Text>

                    <Text style={[textStyle.titleLarge, styles.sectionHeader]}>Introduction</Text>
                    <Text style={textStyle.bodyMedium}>This Privacy Policy describes the data collection and usage practices of the Risk: SAR Risk Assessment mobile and web application (the "App") developed by California Search and Rescue, "CALSAR" ("we," "us," or "our"). We are committed to protecting the privacy of our users.</Text>

                    <Text style={[textStyle.titleLarge, styles.sectionHeader]}>Data Accessed & Collected</Text>
                    <Text style={textStyle.bodyMedium}>You may input data about ongoing operations, which may include the physical and mental health status of team members, for tools like PEAACE or GAR. This data is only used within the app to calculate a risk score and facilitate situational awareness and discussion during an operation. The app works entirely offline: it does not collect, transmit, or share any personal information off your device.</Text>

                    <Text style={[textStyle.titleLarge, styles.sectionHeader]}>Data Retention</Text>
                    <Text style={textStyle.bodyMedium}>Any data you enter is only kept temporarily in memory while the app is open. We do not save or store any user data permanently after you close the app or clear an assessment.</Text>

                    <Text style={[textStyle.titleLarge, styles.sectionHeader]}>Data Deletion</Text>
                    <Text style={textStyle.bodyMedium}>Since the app doesn't save any data to our servers or permanently to your device, there is nothing for us to delete. You can instantly clear your data by closing or uninstalling the app.</Text>

                    <Text style={[textStyle.titleLarge, styles.sectionHeader]}>Information Collected by Expo</Text>
                    <Text style={textStyle.bodyMedium}>We use Expo to build and deliver updates for this app. To ensure updates work correctly, Expo may collect basic device info (like an anonymous device ID, OS version, and app version). This is standard for app functionality and isn't used to identify you. Learn more at https://expo.dev/privacy.</Text>

                    <Text style={[textStyle.titleLarge, styles.sectionHeader]}>Use & Sharing of Information</Text>
                    <Text style={textStyle.bodyMedium}>We only use Expo's collected info to keep the app working, and we never share any identifying information with third parties.</Text>

                    <Text style={[textStyle.titleLarge, styles.sectionHeader]}>Contact Us</Text>
                    <Text style={textStyle.bodyMedium}>If you have any questions, please contact us at: developer@ca-sar.org</Text>

                    <Text style={[textStyle.titleLarge, styles.sectionHeader]}>Disclaimer</Text>
                    <Text style={textStyle.bodyMedium}>This policy only applies to this app. We aren't responsible for the privacy practices of any linked external websites.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const getStyles = (colorTheme) => {
    return StyleSheet.create({
        background: {
            backgroundColor: colorTheme.background,
            height: '100%'
        },
        header: {
            padding: 14,
            backgroundColor: colorTheme.brand,
            color: colorTheme.white,
        },
        container: {
            backgroundColor: colorTheme.background,
            height: '100%',
            alignSelf: 'center',
            width: '100%'
        },
        mainScroll: {
            paddingTop: 20,
            paddingBottom: Platform.OS === "ios" ? 40 : 20,
        },
        content: {
            paddingHorizontal: 20,
            gap: 12
        },
        sectionHeader: {
            fontWeight: 'bold',
            marginTop: 8,
            color: colorTheme.onBackground
        }
    });
}
