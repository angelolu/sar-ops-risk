import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Modal from "react-native-modal";
import { ThemeContext } from './ThemeContext';
import { textStyles } from './styles';

export function RiskModal({ isVisible, children, onClose, height = 0, title, overrideWidth }) {
    const { colorTheme } = useContext(ThemeContext);
    const styles = modalStyles();
    const textStyle = textStyles();

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            onRequestClose={onClose}
            onBackButtonPress={onClose}
            style={{ margin: 0, alignItems: 'center' }}
            propagateSwipe>
            <View style={[styles.modalContent, overrideWidth && { maxWidth: overrideWidth }, height > 0 && { height: height }, { backgroundColor: colorTheme.surfaceContainerHigh }]}>
                <View style={styles.titleContainer}>
                    <Text style={textStyle.pageNameText}>{title}</Text>
                    <View style={styles.backButtonContainer}>
                        <Pressable
                            style={styles.circleButton}
                            android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                            onPress={onClose}>
                            <Ionicons name="close" color={colorTheme.onBackground} size={22} />
                        </Pressable>
                    </View>
                </View>
                {children}
            </View>
        </Modal >
    );
}

const modalStyles = () => {
    const { colorTheme } = useContext(ThemeContext);

    return StyleSheet.create({
        modalContent: {
            width: '100%',
            borderTopRightRadius: 16,
            borderTopLeftRadius: 16,
            position: 'absolute',
            bottom: 0,
            maxWidth: 600,
            paddingBottom: Platform.OS === "ios" ? 20 : 0
        },
        titleContainer: {
            marginTop: 16,
            marginBottom: 8,
            borderTopRightRadius: 16,
            borderTopLeftRadius: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'space-between',
        },
        title: {
            fontSize: 20,
            flex: -1,
            color: colorTheme.onSurface,
        },
        pickerContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 50,
            paddingVertical: 20,
        },
        backButtonContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
        },
        circleButton: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
}