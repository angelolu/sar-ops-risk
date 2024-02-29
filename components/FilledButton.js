import { View, Text, StyleSheet, Pressable } from 'react-native';

const FilledButton = ({ text, onPress, disabled = false, primary = false }) => {
    const disabledFun = () => { };
    return (
        <View style={[styles.baseContainer, disabled && buttonColors.disabled, primary && buttonColors.primary]}>
            <Pressable
                onPress={disabled ? disabledFun : onPress}
                android_ripple={disabled || { color: '#ffffff' }}
                style={styles.pressable}>
                <Text style={[styles.text, disabled && textColors.disabled, primary && textColors.primary]}>{text}</Text>
            </Pressable >
        </View >
    );
};

const buttonColors = StyleSheet.create({
    primary: {
        backgroundColor: "#475d92" // md.sys.color.primary
    },
    disabled: {
        backgroundColor: "#1a1b20", // md.sys.color.on-surface
        opacity: 0.12
    }
});

const textColors = StyleSheet.create({
    primary: {
        color: "#ffffff" // md.sys.color.on-primary
    },
    disabled: {
        color: "#1a1b20", // md.sys.color.on-surface
        opacity: 0.38
    }
});

const styles = StyleSheet.create({
    baseContainer: {
        marginTop: 15,
        alignSelf: 'flex-end',
        height: 40,
        backgroundColor: "#dce2f9", // md.sys.color.secondary-container
        borderRadius: 20,
        overflow: 'hidden',
    },
    pressable: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24
    },
    text: {
        color: "#141b2c" // md.sys.color.on-secondary-container
    }
});

export default FilledButton;