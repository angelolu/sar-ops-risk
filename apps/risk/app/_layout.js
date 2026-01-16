import { ThemeProvider } from 'calsar-ui';
import 'expo-dev-client';
import { Stack } from 'expo-router';
import { BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

if (BackHandler?.addEventListener) {
    const originalAddEventListener = BackHandler.addEventListener;
    const subscriptions = new Map();

    BackHandler.addEventListener = (eventName, handler) => {
        const subscription = originalAddEventListener(eventName, handler);
        if (!subscriptions.has(eventName)) {
            subscriptions.set(eventName, new Map());
        }
        subscriptions.get(eventName).set(handler, subscription);
        return subscription;
    };

    if (!BackHandler.removeEventListener) {
        BackHandler.removeEventListener = (eventName, handler) => {
            const eventSubs = subscriptions.get(eventName);
            if (eventSubs && eventSubs.has(handler)) {
                eventSubs.get(handler).remove();
                eventSubs.delete(handler);
            }
        };
    }
}

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
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
