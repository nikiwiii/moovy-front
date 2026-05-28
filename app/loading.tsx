import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { AppText as Text } from '@/components/AppText';
import { Colors } from '@/constants/theme';
import { storageService } from '@/services/storageService';

const ACCENT = Colors.dark.accent;

const HINTS = [
    'Analizujemy Twój gust filmowy…',
    'Szukamy perełek kina…',
    'Dopasowujemy nastrój…',
    'Konsultujemy z AI…',
    'Prawie gotowe…',
];

function PulsingDot({ delay }: { delay: number }) {
    const scale = useSharedValue(0.6);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        scale.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1.3, { duration: 600, easing: Easing.out(Easing.sin) }),
                    withTiming(0.6, { duration: 600, easing: Easing.in(Easing.sin) }),
                ),
                -1,
            ),
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 600 }),
                    withTiming(0.3, { duration: 600 }),
                ),
                -1,
            ),
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: ACCENT,
                },
                style,
            ]}
        />
    );
}

function RotatingRing() {
    const rotate = useSharedValue(0);

    useEffect(() => {
        rotate.value = withRepeat(
            withTiming(360, { duration: 2800, easing: Easing.linear }),
            -1,
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }],
    }));

    return (
        <Animated.View
            style={[
                {
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    borderWidth: 2,
                    borderColor: 'transparent',
                    borderTopColor: ACCENT,
                    borderRightColor: `${ACCENT}44`,
                    position: 'absolute',
                },
                style,
            ]}
        />
    );
}

export default function LoadingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ payload: string; groups: string; settings: string }>();
    const [hintIndex, setHintIndex] = React.useState(0);
    const fetchDone = useRef(false);

    // Rotate hints
    useEffect(() => {
        const id = setInterval(() => {
            setHintIndex((i) => (i + 1) % HINTS.length);
        }, 2200);
        return () => clearInterval(id);
    }, []);

    // Execute fetch
    useEffect(() => {
        if (fetchDone.current) return;
        fetchDone.current = true;

        (async () => {
            try {
                const payload = JSON.parse(params.payload as string);
                const criteriaData = JSON.parse(params.groups as string);

                const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.1:8000';
                const token = await storageService.getToken();

                // Step 1 — create session
                const res = await fetch(`${API_URL}/recommendation/session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    console.error('Error creating session:', res.status);
                    router.back();
                    return;
                }

                const sessionData = await res.json();
                const sessionId = sessionData.session_id;

                // Step 2 — get recommendation
                const recRes = await fetch(`${API_URL}/recommendation/${sessionId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!recRes.ok) {
                    console.error('Error fetching recommendation:', recRes.status);
                    if (recRes.status === 404) {
                        const errorData = await recRes.json().catch(() => ({}));
                        let errMsg =
                            'Nie znaleziono filmów spełniających Twoje kryteria. Spróbuj zwiększyć dozwolony czas trwania.';
                        const detail = errorData?.detail;
                        if (typeof detail === 'string') errMsg = detail;
                        else if (Array.isArray(detail))
                            errMsg = detail
                                .map((e: any) => {
                                    const field = e?.loc ? `${e.loc.slice(1).join('.')}: ` : '';
                                    return `${field}${e.msg || JSON.stringify(e)}`;
                                })
                                .join('\n');
                        else if (detail) errMsg = JSON.stringify(detail);
                        Alert.alert('Brak filmów', errMsg);
                    }
                    router.back();
                    return;
                }

                const finalRecommendation = await recRes.json();

                router.replace({
                    pathname: '/idea',
                    params: {
                        recommendationData: JSON.stringify(finalRecommendation),
                        criteriaData: JSON.stringify(criteriaData),
                    },
                });
            } catch (err) {
                console.error('LoadingScreen fetch failed:', err);
                router.back();
            }
        })();
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} className="flex-1 items-center justify-center">
            {/* Background blur overlay */}
            <BlurView intensity={18} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Glow behind spinner */}
            <MotiView
                from={{ opacity: 0.2, scale: 0.8 }}
                animate={{ opacity: 0.55, scale: 1.1 }}
                transition={{ loop: true, type: 'timing', duration: 1800 }}
                style={{
                    position: 'absolute',
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    backgroundColor: ACCENT,
                    opacity: 0.12,
                }}
            />

            {/* Spinner ring */}
            <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                <RotatingRing />
                <View
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: `${ACCENT}18`,
                        borderWidth: 1,
                        borderColor: `${ACCENT}30`,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Sparkles color={ACCENT} size={26} strokeWidth={1.5} />
                </View>
            </View>

            {/* Dots */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 36 }}>
                <PulsingDot delay={0} />
                <PulsingDot delay={220} />
                <PulsingDot delay={440} />
            </View>

            {/* Hint text */}
            <MotiView
                key={hintIndex}
                from={{ opacity: 0, translateY: 6 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -6 }}
                transition={{ type: 'timing', duration: 400 }}
                style={{ marginTop: 20, paddingHorizontal: 40 }}
            >
                <Text
                    style={{ textAlign: 'center', fontSize: 14, opacity: 0.55, fontFamily: 'Outfit_400Regular' }}
                >
                    {HINTS[hintIndex]}
                </Text>
            </MotiView>
        </View>
    );
}
