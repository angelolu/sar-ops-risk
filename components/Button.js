import { View, Text, StyleSheet, Pressable } from 'react-native';

const Button = ({ text, onPress, disabled = false }) => {
    const disabledFun = () => { };
    return (
        <View style={[styles.baseContainer, disabled && { backgroundColor: "#dad9e0" }]}>
            <Pressable
                onPress={disabled ? disabledFun : onPress}
                android_ripple={disabled || { color: '#d9e2ff' }}
                style={styles.pressable}>
                <Text style={styles.text}>{text}</Text>
            </Pressable >
        </View >
    );
};

const styles = StyleSheet.create({
    baseContainer: {
        marginTop: 15,
        alignSelf: 'flex-end',
        height: 40,
        backgroundColor: "#475d92",
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
        color: "#ffffff"
    }
});

export default Button;