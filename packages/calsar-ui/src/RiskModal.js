import { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Modal from "react-native-modal";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from './IconButton';
import { ThemeContext } from './ThemeContext';
import { textStyles } from './styles';

export function RiskModal({ isVisible, children, onClose, title, overrideWidth }) {
    const { colorTheme } = useContext(ThemeContext);
    const insets = useSafeAreaInsets();
    const { height: screenHeight, width } = useWindowDimensions();
    const textStyle = textStyles(colorTheme, width);

    // 1. Constrain height so ScrollView has a boundary to scroll within
    const modalMaxHeight = screenHeight - insets.top - 60;

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            // 2. propagateSwipe is key, but some Android versions still struggle
            // if swipeDirection is overly aggressive.
            propagateSwipe={true}
            swipeDirection="down"
            onSwipeComplete={onClose}
            style={styles.modalWrapper}
            // 3. Flicker Fixes
            backdropOpacity={0.5}
            backdropColor="#000000" // Use a solid hex
            useNativeDriver={true}
            useNativeDriverForBackdrop={true}
            hideModalContentWhileAnimating={true}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropTransitionOutTiming={0}
        >
            <View
                collapsable={false}
                style={[
                    styles.modalContent,
                    { maxHeight: modalMaxHeight, backgroundColor: colorTheme.surfaceContainerHigh },
                    overrideWidth && { maxWidth: overrideWidth }
                ]}
            >

                <View style={styles.header}>
                    <Text style={[textStyle.pageNameText, { flex: 1 }]}>{title}</Text>
                    <IconButton ionicons_name={"close"} color={colorTheme.onBackground} onPress={onClose} />
                </View>

                <ScrollView
                    // 4. Android Scroll Fixes
                    nestedScrollEnabled={true}
                    overScrollMode="never"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[
                        styles.scrollPadding,
                        { paddingBottom: insets.bottom + 24 }
                    ]}
                >
                    {/* 5. Pressable wrapper around children sometimes helps Android
                           register the initial touch inside the scroll area */}
                    <Pressable>{children}</Pressable>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalWrapper: {
        margin: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        maxWidth: 600,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    scrollPadding: {
        paddingHorizontal: 16,
    }
});