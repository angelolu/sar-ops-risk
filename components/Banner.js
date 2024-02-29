import { View, Text, StyleSheet } from 'react-native';

const Banner = ({ title, icon, backgroundColor = '#eeedf4', color = '#eeedf4' }) => {
    return (
        <View style={[styles.card, { backgroundColor: backgroundColor }]}>
            {icon}
            {title && <Text style={{ color: color, flex: 1 }}>{title}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        columnGap: 12,
        alignItems: 'center',
        borderRadius: 26, // Rounded corners
        overflow: 'hidden',
        paddingHorizontal: 24,
        paddingVertical: 12,
        marginLeft: 20,
        marginRight: 20
    },
});

export default Banner;