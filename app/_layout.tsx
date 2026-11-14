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
import { API_URL } from '@/constants/config';
import { storageService } from '../services/storageService';
import ConfirmDialog from '../components/ConfirmDialog';

let sessionExpiredCallback: (() => void) | null = null;
let refreshTokenPromise: Promise<string | null> | null = null;

const originalFetch = global.fetch;

async function executeTokenRefresh(): Promise<string | null> {
    if (refreshTokenPromise) {
        return refreshTokenPromise;
    }

    refreshTokenPromise = (async () => {
        try {
            const refreshToken = await storageService.getRefreshToken();
            if (!refreshToken) {
                return null;
            }

            const response = await originalFetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                return null;
            }

            const text = await response.text();
            let data: any;
            try {
                data = JSON.parse(text);
            } catch {
                return null;
            }

            if (data.access_token && data.refresh_token) {
                await storageService.saveToken(data.access_token);
                await storageService.saveRefreshToken(data.refresh_token);
                return data.access_token;
            }
            return null;
        } catch (error) {
            console.error('[httpInterceptor] Background refresh error:', error);
            return null;
        } finally {
            refreshTokenPromise = null;
        }
    })();

    return refreshTokenPromise;
}

// Global HTTP Interceptor
global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string'
        ? input
        : (input instanceof Request ? input.url : String(input));

    let options: RequestInit = init || {};
    const isAuthEndpoint = urlStr.includes('/auth/login') || urlStr.includes('/auth/register') || urlStr.includes('/auth/refresh');

    // Automatically add Authorization header if token exists and not already set
    if (!isAuthEndpoint) {
        const token = await storageService.getToken();
        if (token) {
            const headers = new Headers(options.headers || {});
            if (!headers.has('Authorization')) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            options = { ...options, headers };
        }
    }

    let response = await originalFetch(input, options);

    // If API returns 401 Unauthorized, intercept and attempt refresh
    if (response.status === 401 && !isAuthEndpoint) {
        console.warn(`[httpInterceptor] 401 Unauthorized for ${urlStr}. Refreshing token...`);
        const newAccessToken = await executeTokenRefresh();

        if (newAccessToken) {
            // Token refresh succeeded! Retry original request with new token
            const headers = new Headers(options.headers || {});
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            const newOptions = { ...options, headers };
            console.log(`[httpInterceptor] Token refreshed successfully. Retrying ${urlStr}`);
            response = await originalFetch(input, newOptions);
        } else {
            // Token refresh failed or refresh token expired -> Logout
            console.warn('[httpInterceptor] Refresh token expired or invalid. Logging out...');
            await storageService.logout();

            if (sessionExpiredCallback) {
                sessionExpiredCallback();
            } else {
                router.replace('/login');
            }
        }
    }

    return response;
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
