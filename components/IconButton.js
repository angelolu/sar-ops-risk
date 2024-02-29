import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Pressable } from 'react-native';

const IconButton = ({ ionicons_name, onPress, disabled = false, primary = false, tonal = false }) => {
    const disabledFun = () => { };
    return (
        <View style={[styles.baseContainer, disabled && (primary || tonal) && buttonColors.disabled, primary && buttonColors.primary, tonal && buttonColors.tonal]}>
            <Pressable
                onPress={disabled ? disabledFun : onPress}
                android_ripple={disabled || { color: '#ffffff' }}
                style={styles.pressable}>
                <Ionicons name={ionicons_name} size={24} color={(disabled && textColors.disabled) ||  (primary && textColors.primary) || tonal && textColors.tonal || textColors.basic} />
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
    },
    tonal:{
        backgroundColor: "#dce2f9", // md.sys.color.secondary-container
    }
});

const textColors = {
    basic: "#44464f",
    primary: "#ffffff",// md.sys.color.on-primary
    disabled: "#1a1b20", // md.sys.color.on-surface
    tonal: "#141b2c", // md.sys.color.on-secondary-container
};

const styles = StyleSheet.create({
    baseContainer: {
        marginTop: 15,
        alignSelf: 'flex-end',
        height: 40,
        width: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    pressable: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default IconButton;