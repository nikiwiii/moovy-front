import { useRouter } from 'expo-router';
import { ArrowRight, Cloud, Plus, Search, Smartphone, Sparkles, UserRound, UsersRound } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState, useEffect } from 'react';
import { Dimensions, SafeAreaView, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { LinearTransition } from 'react-native-reanimated';
import TouchableOpacity from '../components/TouchableOpacity';
import { FillStyles } from '../constants/themeStyles';
import { storageService } from '../services/storageService';
import { Colors } from '@/constants/theme';
import { APP_NAME } from '../constants/app';

const ACCENT = Colors.dark.accent;

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<'cloud' | 'local' | null>('local');
    const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

    useEffect(() => {
        const checkExistingPrefs = async () => {
            const lp = await storageService.getLocalPreferences();
            const token = await storageService.getToken();
            const userId = await storageService.getUserId();
            const API_URL = process.env.EXPO_PUBLIC_API_URL;

            if (lp) {
                router.replace('/home');
                return;
            }

            if (token && userId && API_URL) {
                try {
                    const response = await fetch(`${API_URL}/preferences/get?user_id=${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const hasData = data && (
                            (data.vibes && data.vibes.length > 0) ||
                            (data.hard_nos && data.hard_nos.length > 0) ||
                            (data.eras && data.eras.length > 0) ||
                            (data.movies && data.movies.length > 0)
                        );
                        if (hasData) {
                            router.replace('/idea');
                        }
                    }
                } catch (e) {
                    console.log('Skip server redirect on startup');
                }
            }
        };
        checkExistingPrefs();
    }, []);

    return (
        <View className="flex-1 bg-transparent pt-10">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-8 pt-4">
                    <MotiView
                        from={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 300 }}
                    >
                        <Text className="font-outfit-bold text-[24px] tracking-tighter">{APP_NAME}®</Text>
                    </MotiView>
                </View>

                {/* Main Content */}
                <View className="flex-1 px-8 justify-center">
                    <MotiView
                        from={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'timing', duration: 1000, delay: 500 }}
                        className="mb-12"
                    >
                        <Text className="font-outfit text-[42px] leading-[48px] tracking-tight text-white/90">
                            welcome to{'\n'}{APP_NAME.includes('.') ? APP_NAME.split('.')[0] : APP_NAME}{'\n'}
                            {APP_NAME.includes('.') && <Text style={{ color: ACCENT }}>{APP_NAME.split('.')[1]} </Text>}
                            <Text style={{ color: ACCENT }}>(alpha*)</Text>
                        </Text>

                        {/* Decorative line */}
                        <View className="w-16 h-[1px] bg-white/20 mt-6" />
                    </MotiView>

                    {/* Interactive Elements inspired by the design */}
                    <View className="flex-row justify-center gap-x-20">
                        {/* "Find Movie" Large Circle Button */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', delay: 800 }}
                        >
                            <TouchableOpacity
                                onPress={() => router.push('/login')}
                                className="h-[140px] mt-10 items-center justify-center overflow-hidden"
                            >
                                <View className="items-center">
                                    <UserRound color={ACCENT} size={32} strokeWidth={1.5} />
                                    <Text className="font-outfit-bold text-white/90 border-b border-white/50 text-[18px] uppercase mt-3 text-center">
                                        Log In
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </MotiView>
                        <MotiView
                            from={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', delay: 800 }}
                        >
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: '/login', params: { mode: 'register' } })}
                                className="h-[140px] items-center justify-center overflow-hidden"
                            >
                                <View className="items-center">
                                    <Plus color={ACCENT} size={32} strokeWidth={1.5} />
                                    <Text className="font-outfit-bold text-white/90 border-b border-white/50 text-[18px] uppercase mt-3 text-center">
                                        Sign Up
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </MotiView>
                    </View>
                </View>

                {/* Bottom Actions */}
                <View className="px-8 pb-12 flex-row justify-between items-end">
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1500 }}
                    >
                        <Text className="font-outfit text-[10px] uppercase tracking-[2px] opacity-30">{APP_NAME} © 2026</Text>
                        <Text className="font-outfit text-[10px] text-white/40 mt-1 max-w-[150px]">
                            we'll find your{'\n'}perfect screening
                        </Text>
                    </MotiView>
                </View>
            </SafeAreaView>
        </View>
    );
}
