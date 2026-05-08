import { useRouter } from 'expo-router';
import { ArrowRight, Cloud, Smartphone, Sparkles } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState, useEffect } from 'react';
import { Dimensions, SafeAreaView, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { LinearTransition } from 'react-native-reanimated';
import TouchableOpacity from '../components/TouchableOpacity';
import { FillStyles } from '../constants/themeStyles';
import { storageService } from '../services/storageService';
import { Colors } from '@/constants/theme';

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
                router.replace('/parameters');
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
                            router.replace('/parameters');
                        }
                    }
                } catch (e) {
                    console.log('Skip server redirect on startup');
                }
            }
        };
        checkExistingPrefs();
    }, []);

    const handleNext = () => {
        if (selected === 'cloud') {
            router.push('/login');
        } else if (selected === 'local') {
            router.push({ pathname: '/preferences', params: { storageType: 'local' } });
        }
    };

    return (
        <View className="flex-1 bg-transparent">
            <SafeAreaView className="flex-1">
                <View className="flex-1 px-5 justify-center">
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200, type: 'timing', duration: 800 }}
                        className="mb-12 px-2"
                    >
                        <View className="flex-row items-center gap-2 mb-4">
                            <Sparkles color={ACCENT} size={20} strokeWidth={2} />
                            <Text style={{ color: `${ACCENT}CC` }} className="font-outfit text-[12px] uppercase tracking-[4px]">MovieNight</Text>
                        </View>
                        <Text className="font-outfit-bold text-[34px] leading-[40px] mb-2">Witamy w{'\n'}MovieNight</Text>
                        <Text className="font-outfit text-[15px] opacity-40">Gdzie chcesz zapisywać swoje preferencje?</Text>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400, type: 'timing', duration: 800 }}
                        className="gap-3"
                    >
                        <Animated.View
                            layout={LinearTransition}
                            className={`${FillStyles.cardBase} ${selected === 'cloud' ? FillStyles.cardActive : FillStyles.cardInactive} rounded-b-2xl`}
                        >
                            <AnimatedTouchableOpacity
                                layout={LinearTransition}
                                className="flex-row gap-4 items-center p-5"
                                onPress={() => setSelected('cloud')}
                            >
                                <View className={FillStyles.cardIcon}>
                                    <Cloud color={selected === 'cloud' ? ACCENT : '#707080'} size={26} strokeWidth={selected === 'cloud' ? 2.5 : 1.5} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[17px] font-outfit-semi tracking-wider">Chmura</Text>
                                    <Text className="font-outfit text-[13px] opacity-40 leading-[18px] mt-0.5">Preferencje filmowe powiązane z kontem</Text>
                                </View>
                            </AnimatedTouchableOpacity>
                        </Animated.View>

                        <Animated.View
                            layout={LinearTransition}
                            className={`${FillStyles.cardBase} ${selected === 'local' ? FillStyles.cardActive : FillStyles.cardInactive} rounded-t-2xl`}
                        >
                            <AnimatedTouchableOpacity
                                layout={LinearTransition}
                                className="flex-row gap-4 items-center p-5"
                                onPress={() => setSelected('local')}
                            >
                                <View className={FillStyles.cardIcon}>
                                    <Smartphone color={selected === 'local' ? ACCENT : '#707080'} size={26} strokeWidth={selected === 'local' ? 2.5 : 1.5} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[17px] font-outfit-semi tracking-wider">Lokalnie</Text>
                                    <Text className="font-outfit text-[13px] opacity-40 leading-[18px] mt-0.5">Preferencje filmowe tylko na urządzeniu</Text>
                                </View>
                            </AnimatedTouchableOpacity>
                        </Animated.View>

                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.9 }}
                        transition={{ type: 'spring' }}
                        className="absolute bottom-10 right-5"
                    >
                        <TouchableOpacity onPress={handleNext} className="flex-row gap-x-2 items-center bg-accent py-3.5 px-6 rounded-full">
                            <Text className="font-outfit-semi text-[15px] text-black">Potwierdź wybór</Text>
                            <ArrowRight color="#000" size={18} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </MotiView>
                </View>
            </SafeAreaView>
        </View>
    );
}
