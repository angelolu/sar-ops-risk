import { router } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const MaterialCard = ({ title, subtitle, children, href = "" }) => {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => { router.navigate(href) }}
        android_ripple={href === "" ? {} : { color: '#e2e2e9' }}
        style={{ flexGrow: 1, padding: 24 }}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {children}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 26, // Rounded corners
    overflow: 'hidden',
    backgroundColor: '#eeedf4',
  },
  title: {
    fontSize: 20,
    color: '#475d92', // Primary text color
  },
  subtitle: {
    color: '#1a1b20', // On surface var
    marginTop: 8,
  },
});

export default MaterialCard;