import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Modal from "react-native-modal";

import { ThemeContext } from '../components/ThemeContext';

export default function RiskModal({ isVisible, children, onClose, height = 0, title }) {
    const { colorTheme } = useContext(ThemeContext);
    const styles = modalStyles();

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            onRequestClose={onClose}
            style={{ margin: 0, alignItems: 'center' }}
            propagateSwipe>
            <View style={[styles.modalContent, height > 0 && { height: height }]}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.backButtonContainer}>
                        <Pressable
                            style={styles.circleButton}
                            android_ripple={{ color: colorTheme.surfaceContainerHighest }}
                            onPress={onClose}>
                            <MaterialIcons name="close" color={colorTheme.onBackground} size={22} />
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
            backgroundColor: colorTheme.surfaceContainer,
            borderTopRightRadius: 16,
            borderTopLeftRadius: 16,
            position: 'absolute',
            bottom: 0,
            maxWidth: 600,
        },
        titleContainer: {
            marginTop: 16,
            marginBottom: 8,
            backgroundColor: colorTheme.surfaceContainer,
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