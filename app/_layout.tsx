import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import { MotiScrollView, MotiView } from 'moti';
import { cssInterop } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';
import '../global.css';

cssInterop(MotiView, { className: 'style' });
cssInterop(MotiScrollView, { className: 'style', contentContainerClassName: 'contentContainerStyle' });

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_600SemiBold,
        Outfit_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, backgroundColor: '#070314', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#ffffff" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: { backgroundColor: '#070314' }
            }}
        />
    );
}
