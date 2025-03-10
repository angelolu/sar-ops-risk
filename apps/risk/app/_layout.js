import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'expo-dev-client';
import { ThemeProvider } from 'calsar-ui';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: 'index',
};

export default function RootLayout() {
    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <Stack
                    screenOptions={{
                        // Hide the header for all other routes.
                        headerShown: false,
                    }}
                >
                    <Stack.Screen
                        name="index"
                        options={{
                            // Hide the header for this route
                            headerShown: false,
                        }}
                    />
                </Stack>
            </SafeAreaProvider>
        </ThemeProvider>
    );
}
