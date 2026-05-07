import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack, usePathname } from 'expo-router';
import { MotiScrollView, MotiView } from 'moti';
import { cssInterop } from 'nativewind';
import { ActivityIndicator, View, Text, TextInput } from 'react-native';
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
            <View style={{ flex: 1, backgroundColor: '#030108', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#CDFF64" />
            </View>
        );
    }

    const showNavbar = !['/', '/preferences', '/login', '/session-create', '/session-join', '/session-lobby'].includes(pathname);

    return (
        <View style={{ flex: 1, backgroundColor: '#030108' }} className="text-white">
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
