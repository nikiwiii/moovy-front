import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack, usePathname } from 'expo-router';
import { MotiScrollView, MotiView } from 'moti';
import { cssInterop } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';
import '../global.css';

cssInterop(MotiView, { className: 'style' });
cssInterop(MotiScrollView, { className: 'style', contentContainerClassName: 'contentContainerStyle' });

import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';

export default function RootLayout() {
    const pathname = usePathname();
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

    const showNavbar = !['/', '/preferences', '/login'].includes(pathname);

    return (
        <View style={{ flex: 1, backgroundColor: '#070314' }}>
            <AnimatedBackground />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                    contentStyle: { backgroundColor: 'transparent' }
                }}
            />
            {showNavbar && <Navbar />}
        </View>
    );
}
