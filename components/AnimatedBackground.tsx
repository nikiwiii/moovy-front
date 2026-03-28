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
}

const AnimatedOrb = ({ color, size, startPos, animDuration, translateRange }: AnimatedOrbProps) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const gradientId = useMemo(() => `glow-${color.replace('#', '')}-${Math.random()}`, [color]);

    useEffect(() => {
        // Płynne skalowanie promienia
        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: animDuration * 0.8, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: animDuration * 0.8, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Pływanie w poziomie
        translateX.value = withRepeat(
            withTiming(translateRange.x, { duration: animDuration, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        // Pływanie w pionie
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
                    opacity: 0.65,
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
                        <Stop offset="50%" stopColor={color} stopOpacity="0.5" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
            </Svg>
        </Animated.View>
    );
};

export type BackgroundTheme = 'default' | 'ocean' | 'cyberpunk' | 'sunset' | 'aurora' | 'monochrome';

export const BACKGROUND_THEMES: Record<BackgroundTheme, string[]> = {
    default: ['#701a40', '#92400e', '#3b0764', '#1e1b4b', '#4c1d95'], // Oryginalny (ciemny, stonowany)
    ocean: ['#0284c7', '#0369a1', '#1e3a8a', '#172554', '#1e40af'], // Oceaniczny głęboki
    cyberpunk: ['#be185d', '#86198f', '#4c1d95', '#0e7490', '#3730a3'], // Cyberpunk
    sunset: ['#9f1239', '#ea580c', '#c2410c', '#6b21a8', '#4c1d95'], // Ciepły zachód słońca
    aurora: ['#047857', '#0f766e', '#1e3a8a', '#312e81', '#115e59'], // Zorza polarna
    monochrome: ['#334155', '#1e293b', '#0f172a', '#020617', '#1e293b'] // Odcienie szarości i granatu
};

interface AnimatedBackgroundProps {
    theme?: BackgroundTheme;
}

export default function AnimatedBackground({ theme = 'default' }: AnimatedBackgroundProps) {
    const colors = BACKGROUND_THEMES[theme] || BACKGROUND_THEMES.default;

    return (
        <View className="absolute inset-0 bg-background-dark overflow-hidden">
            {/* Lewy górny */}
            <AnimatedOrb
                color={colors[0]}
                size={width * 2.2}
                startPos={{ x: -width * 0.2, y: -height * 0.1 }}
                animDuration={12000}
                translateRange={{ x: 80, y: 120 }}
            />
            {/* Prawy górny */}
            <AnimatedOrb
                color={colors[1]}
                size={width * 1.8}
                startPos={{ x: width * 0.9, y: height * 0.2 }}
                animDuration={15000}
                translateRange={{ x: -100, y: 80 }}
            />
            {/* Lewy dolny */}
            <AnimatedOrb
                color={colors[2]}
                size={width * 2}
                startPos={{ x: -width * 0.1, y: height * 0.9 }}
                animDuration={13000}
                translateRange={{ x: 120, y: -100 }}
            />
            {/* Prawy dolny */}
            <AnimatedOrb
                color={colors[3]}
                size={width * 2.5}
                startPos={{ x: width * 1.1, y: height * 1.1 }}
                animDuration={16000}
                translateRange={{ x: -150, y: -150 }}
            />
            {/* Centralny wypełniający */}
            <AnimatedOrb
                color={colors[4]}
                size={width * 1.6}
                startPos={{ x: width * 0.5, y: height * 0.5 }}
                animDuration={20000}
                translateRange={{ x: -60, y: -80 }}
            />
        </View>
    );
}
