import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Toast } from '@/components/Toast';
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
import { getVibeColor } from '@/constants/vibes';
import Svg, { Circle } from 'react-native-svg';

const ACCENT = Colors.dark.accent;

const HINTS = [
    'Analyzing your movie taste...',
    'Looking for cinematic gems...',
    'Adjusting the vibe...',
    'Consulting with AI...',
    'Almost ready...',
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

function RotatingRing({ colors }: { colors: string[] }) {
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

    const size = 100;
    const strokeWidth = 3;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;

    const displayColors = colors.length > 0 ? colors : [ACCENT];
    const N = displayColors.length;
    const segmentLength = circumference / N;

    return (
        <Animated.View style={[{ width: size, height: size, position: 'absolute' }, style]}>
            <Svg width={size} height={size}>
                {displayColors.map((color, i) => {
                    const strokeDasharray = `${segmentLength} ${circumference}`;
                    const strokeDashoffset = -i * segmentLength;
                    return (
                        <Circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                        />
                    );
                })}
            </Svg>
        </Animated.View>
    );
}

export default function LoadingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ payload: string; groups: string; settings: string }>();
    const [hintIndex, setHintIndex] = React.useState(0);

    const vibeColorsList = React.useMemo(() => {
        try {
            if (!params.groups) return [];
            const criteriaData = JSON.parse(params.groups as string);
            const vibes: string[] = criteriaData.genres || [];
            return vibes.map(v => getVibeColor(v));
        } catch (e) {
            return [];
        }
    }, [params.groups]);
    const fetchDone = useRef(false);
    const [toast, setToast] = React.useState<{ visible: boolean; message: string; title?: string; type: 'success' | 'error' | 'info' }>({
        visible: false,
        message: '',
        title: '',
        type: 'info'
    });

    const showToast = (message: string, title?: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ visible: true, message, title, type });
    };

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

                const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://34.118.42.82:8010';
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
                            'No movies found matching your criteria. Try increasing the maximum duration.';
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
                        showToast(errMsg, 'No movies found', 'error');
                        setTimeout(() => {
                            router.back();
                        }, 2500);
                    } else {
                        router.back();
                    }
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
            <BlurView 
                intensity={18} 
                tint="dark" 
                experimentalBlurMethod="dimezisBlurView" 
                style={StyleSheet.absoluteFill} 
            />

            {/* Glow behind spinner */}
            <MotiView
                from={{ opacity: 0.00, scale: 0.8 }}
                animate={{ opacity: 0.02, scale: 1.1 }}
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
                <RotatingRing colors={vibeColorsList} />
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

            <Toast
                visible={toast.visible}
                message={toast.message}
                title={toast.title}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
}
