import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header({ children, style }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[style, { paddingTop: insets.top }]}>
            {children}
        </View>
    );
}