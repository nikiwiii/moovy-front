import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Toast } from '@/components/Toast';
import Animated, {
    Easing,
    runOnJS,
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
import MoovyLogo from '@/components/MoovyLogo';

const ACCENT = Colors.dark.accent;

const HINTS = [
    'Analyzing your movie taste...',
    'Looking for cinematic gems...',
    'Almost ready...',
];

function AnimatedVibeBar({ color, delay }: { color: string; delay: number }) {
    const scaleY = useSharedValue(0.35);
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        scaleY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1.0, { duration: 500, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
                    withTiming(0.35, { duration: 500, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
                ),
                -1,
            ),
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1.0, { duration: 500 }),
                    withTiming(0.3, { duration: 500 }),
                ),
                -1,
            ),
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scaleY: scaleY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width: 6,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: color,
                },
                animatedStyle,
            ]}
        />
    );
}

function VibeLoadingBars({ colors }: { colors: string[] }) {
    const defaultColors = [ACCENT, '#2699E0', '#F5C719', '#F06292'];
    const displayColors = colors.length > 0
        ? (colors.length >= 4 ? colors.slice(0, 4) : Array.from({ length: 4 }, (_, i) => colors[i % colors.length]))
        : defaultColors;

    const delays = [0, 200, 350, 500];

    return (
        <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', marginTop: 20, height: 40 }}>
            {displayColors.map((color, i) => (
                <AnimatedVibeBar key={i} color={color} delay={delays[i]} />
            ))}
        </View>
    );
}

function PulsingLogo() {
    const scale = useSharedValue(0.82);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.18, { duration: 1000, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
                withTiming(0.82, { duration: 1000, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
            ),
            -1,
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={style}>
            <MoovyLogo width={30} height={30} color={ACCENT} />
        </Animated.View>
    );
}

function RotatingRing({ colors }: { colors: string[] }) {
    const rotate = useSharedValue(0);

    useEffect(() => {
        let isMounted = true;
        const step = () => {
            if (!isMounted) return;
            rotate.value = withTiming(
                rotate.value + 90,
                { duration: 1000, easing: Easing.bezier(0.25, 1, 0.5, 1) },
                (finished) => {
                    if (finished && isMounted) {
                        runOnJS(step)();
                    }
                }
            );
        };
        step();
        return () => {
            isMounted = false;
        };
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }],
    }));

    const size = 100;
    const strokeWidth = 3;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;

    const displayColors = colors.length > 0 ? colors : [ACCENT, '#2699E0', '#F5C719', '#F06292'];
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
                    const errorData = await res.json().catch(() => ({}));
                    const detail = errorData?.detail;
                    let errMsg = `Server error while creating session (${res.status}).`;
                    if (typeof detail === 'string') errMsg = detail;
                    else if (detail) errMsg = JSON.stringify(detail);

                    showToast(errMsg, `Session Error (${res.status})`, 'error');
                    setTimeout(() => {
                        router.back();
                    }, 3000);
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
                    const errorData = await recRes.json().catch(() => ({}));
                    let errMsg =
                        recRes.status === 404
                            ? 'No movies found matching your criteria. Try increasing the maximum duration.'
                            : `Server error (${recRes.status}). Please try again later.`;

                    const detail = errorData?.detail;
                    if (typeof detail === 'string') {
                        errMsg = detail;
                    } else if (Array.isArray(detail)) {
                        errMsg = detail
                            .map((e: any) => {
                                const field = e?.loc ? `${e.loc.slice(1).join('.')}: ` : '';
                                return `${field}${e.msg || JSON.stringify(e)}`;
                            })
                            .join('\n');
                    } else if (detail) {
                        errMsg = JSON.stringify(detail);
                    }

                    const toastTitle = recRes.status === 404 ? 'No movies found' : `Error (${recRes.status})`;
                    showToast(errMsg, toastTitle, 'error');
                    setTimeout(() => {
                        router.back();
                    }, 3000);
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
            } catch (err: any) {
                console.error('LoadingScreen fetch failed:', err);
                showToast(err?.message || 'Network error occurred. Please check your connection.', 'Connection Error', 'error');
                setTimeout(() => {
                    router.back();
                }, 3000);
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
                    <PulsingLogo />
                </View>
            </View>

            {/* 4 Animated Vibe Bars */}
            <VibeLoadingBars colors={vibeColorsList} />

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
