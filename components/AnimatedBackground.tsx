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

export type BackgroundTheme = 'default' | 'ocean' | 'cyberpunk' | 'sunset' | 'aurora' | 'monochrome' | 'nebula';

export const BACKGROUND_THEMES: Record<BackgroundTheme, string[]> = {
    default: ['#2d0a5e', '#0f0a3e', '#4a1068', '#0a0628', '#1a0842'],
    ocean: ['#0284c7', '#0369a1', '#1e3a8a', '#172554', '#1e40af'],
    cyberpunk: ['#be185d', '#86198f', '#4c1d95', '#0e7490', '#3730a3'],
    sunset: ['#9f1239', '#ea580c', '#c2410c', '#6b21a8', '#4c1d95'],
    aurora: ['#047857', '#0f766e', '#1e3a8a', '#312e81', '#115e59'],
    monochrome: ['#334155', '#1e293b', '#0f172a', '#020617', '#1e293b'],
    nebula: ['#ea580c', '#7c3aed', '#2563eb', '#9333ea', '#c2410c']
};

interface AnimatedBackgroundProps {
    theme?: BackgroundTheme;
}

export default function AnimatedBackground({ theme = 'aurora' }: AnimatedBackgroundProps) {
    const colors = BACKGROUND_THEMES[theme] || BACKGROUND_THEMES.default;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#030108', overflow: 'hidden' }}>
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
