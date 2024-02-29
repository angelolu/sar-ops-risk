import { View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Modal from "react-native-modal";

export default function RiskModal({ isVisible, children, onClose, height, item }) {
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            onRequestClose={onClose}
            style={{ margin: 0, alignItems: 'center' }}
            propagateSwipe>
            <View style={[styles.modalContent]}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Score "{item.title}"</Text>
                    <View style={styles.backButtonContainer}>
                        <Pressable
                            style={styles.circleButton}
                            android_ripple={{ color: '#e2e2e9' }}
                            onPress={onClose}>
                            <MaterialIcons name="close" color="#1a1b20" size={22} />
                        </Pressable>
                    </View>
                </View>
                {children}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        width: '100%',
        backgroundColor: '#faf8ff',
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
        position: 'absolute',
        bottom: 0,
        maxWidth: 600,
    },
    titleContainer: {
        height: 56,
        backgroundColor: '#faf8ff',
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        color: '#1a1b20', // Primary text color
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
