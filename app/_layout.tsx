import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack, usePathname, router } from 'expo-router';
import { MotiScrollView, MotiView } from 'moti';
import { cssInterop } from 'nativewind';
import { ActivityIndicator, View, Text, TextInput, Alert, Platform } from 'react-native';
import '../global.css';


cssInterop(MotiView, { className: 'style' });
cssInterop(MotiScrollView, { className: 'style', contentContainerClassName: 'contentContainerStyle' });

import React from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import { Colors } from '@/constants/theme';
import { storageService } from '../services/storageService';
import ConfirmDialog from '../components/ConfirmDialog';

let sessionExpiredCallback: (() => void) | null = null;

// Intercept global fetch to handle expired/invalid tokens (401 Unauthorized)
const originalFetch = global.fetch;
global.fetch = async (input, init) => {
    try {
        const response = await originalFetch(input, init);
        if (response.status === 401) {
            const urlStr = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
            // Only trigger logout/redirect for endpoints other than login and registration
            if (!urlStr.includes('/auth/login') && !urlStr.includes('/auth/register')) {
                console.warn('[fetch interceptor] 401 Unauthorized received. Logging out...');
                await storageService.logout();

                if (sessionExpiredCallback) {
                    sessionExpiredCallback();
                } else {
                    router.replace('/');
                }
            }
        }
        return response;
    } catch (error) {
        throw error;
    }
};

const ACCENT = Colors.dark.accent;

export default function RootLayout() {
    const pathname = usePathname();
    const [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_600SemiBold,
        Outfit_700Bold,
    });
    const [showExpiredDialog, setShowExpiredDialog] = React.useState(false);

    React.useEffect(() => {
        sessionExpiredCallback = () => {
            setShowExpiredDialog(true);
        };
        return () => {
            sessionExpiredCallback = null;
        };
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, backgroundColor: '#030108', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={ACCENT} />
            </View>
        );
    }

    const showNavbar = !['/', '/home', '/preferences', '/favourites', '/login', '/session-create', '/session-join', '/session-lobby'].includes(pathname);

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

            <ConfirmDialog
                visible={showExpiredDialog}
                title="Session expired"
                message="Your login session has expired. Log in again to continue."
                confirmText="Log in"
                onConfirm={() => {
                    setShowExpiredDialog(false);
                    router.replace('/login');
                }}
                onCancel={() => {
                    setShowExpiredDialog(false);
                    router.replace('/');
                }}
            />
        </View>
    );
}
