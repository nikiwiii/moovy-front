import React, { useEffect, useMemo } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface AnimatedOrbProps {
    color: string;
    size: number;
    startPos: { x: number; y: number };
    animDuration: number;
    translateRange: { x: number; y: number };
    opacity?: number;
}

const AnimatedOrb = ({ color, size, startPos, animDuration, translateRange, opacity = 0.5 }: AnimatedOrbProps) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const gradientId = useMemo(() => `glow-${color.replace('#', '')}-${Math.random()}`, [color]);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: animDuration * 0.8, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: animDuration * 0.8, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        translateX.value = withRepeat(
            withTiming(translateRange.x, { duration: animDuration, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        translateY.value = withRepeat(
            withTiming(translateRange.y, { duration: animDuration * 1.1, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, [animDuration, translateRange.x, translateRange.y, scale, translateX, translateY]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    top: startPos.y - size / 2,
                    left: startPos.x - size / 2,
                    width: size,
                    height: size,
                    opacity,
                },
                animatedStyle
            ]}
        >
            <Svg width="100%" height="100%">
                <Defs>
                    <RadialGradient
                        id={gradientId}
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                    >
                        <Stop offset="0%" stopColor={color} stopOpacity="1" />
                        <Stop offset="40%" stopColor={color} stopOpacity="0.5" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
            </Svg>
        </Animated.View>
    );
};

export type BackgroundTheme = 'default' | 'ocean' | 'cyberpunk' | 'sunset' | 'aurora' | 'monochrome' | 'nebula' | 'midnight' | 'emerald';

export const BACKGROUND_THEMES: Record<BackgroundTheme, string[]> = {
    // Nowy domyślny — ciepły indygo z akcentem lime
    default: ['#1E1B4B', '#0F172A', '#312E81', '#0C0A1D', '#1E1B4B'],
    // Głęboki ocean — teal i slate blue
    ocean: ['#0E4D64', '#0B3142', '#164E63', '#0C1E2D', '#155E75'],
    // Cyberpunk — magenta / fiolet / cyan
    cyberpunk: ['#A21CAF', '#6D28D9', '#0E7490', '#1E1B4B', '#4C1D95'],
    // Zachód słońca — amber / rose
    sunset: ['#B91C1C', '#C2410C', '#4f0c0aff', '#000000ff', '#7C2D12'],
    // Aurora — szmaragd i indygo, bardziej wyraziste kolory
    aurora: ['#065F46', '#0F766E', '#1E3A5F', '#1A1A40', '#134E4A'],
    // Monochrome — elegancki szary
    monochrome: ['#1E293B', '#0F172A', '#0F172A', '#020617', '#1E293B'],
    // Mgławica — ognisty + fioletowy
    nebula: ['#DC2626', '#7C3AED', '#2563EB', '#9333EA', '#B91C1C'],
    // Midnight — głęboka czerń z delikatnym fioletem
    midnight: ['#1A103C', '#0D0B24', '#2D1B69', '#060412', '#1A0F3C'],
    // Szmaragd — zielony z ciemnym tłem
    emerald: ['#064E3B', '#065F46', '#0F3B2F', '#0A1A14', '#047857'],
};

interface AnimatedBackgroundProps {
    theme?: BackgroundTheme;
}

export default function AnimatedBackground({ theme = 'sunset' }: AnimatedBackgroundProps) {
    const colors = BACKGROUND_THEMES[theme] || BACKGROUND_THEMES.default;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#040210', overflow: 'hidden' }}>
            {/* Deep purple top-left */}
            <AnimatedOrb
                color={colors[0]}
                size={width * 2}
                startPos={{ x: -width * 0.3, y: -height * 0.05 }}
                animDuration={14000}
                translateRange={{ x: 60, y: 80 }}
                opacity={0.45}
            />
            {/* Indigo right */}
            <AnimatedOrb
                color={colors[1]}
                size={width * 1.6}
                startPos={{ x: width * 0.8, y: height * 0.25 }}
                animDuration={18000}
                translateRange={{ x: -70, y: 60 }}
                opacity={0.35}
            />
            {/* Deep violet bottom-left */}
            <AnimatedOrb
                color={colors[2]}
                size={width * 1.8}
                startPos={{ x: -width * 0.15, y: height * 0.85 }}
                animDuration={16000}
                translateRange={{ x: 80, y: -70 }}
                opacity={0.4}
            />
            {/* Dark base bottom-right */}
            <AnimatedOrb
                color={colors[3]}
                size={width * 2.2}
                startPos={{ x: width * 1, y: height * 1.05 }}
                animDuration={20000}
                translateRange={{ x: -100, y: -90 }}
                opacity={0.3}
            />
            {/* Subtle center fill */}
            <AnimatedOrb
                color={colors[4]}
                size={width * 1.4}
                startPos={{ x: width * 0.5, y: height * 0.5 }}
                animDuration={22000}
                translateRange={{ x: -40, y: -50 }}
                opacity={0.25}
            />
        </View>
    );
}
