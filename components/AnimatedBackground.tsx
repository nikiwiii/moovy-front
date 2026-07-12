import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
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
    vibeActive?: boolean;
}

const AnimatedOrb = ({ color, size, startPos, animDuration, translateRange, opacity = 0.5, vibeActive = false }: AnimatedOrbProps) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const animatedOpacity = useSharedValue(0);

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

    useEffect(() => {
        // Smoothly dim default orbs when custom vibe corner highlights are active
        animatedOpacity.value = withTiming(vibeActive ? 0.05 : opacity, { duration: 1000 });
    }, [vibeActive, opacity]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: animatedOpacity.value,
            transform: [
                { scale: scale.value },
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    return (
        <Animated.View
            renderToHardwareTextureAndroid={true}
            shouldRasterizeIOS={true}
            style={[
                {
                    position: 'absolute',
                    top: startPos.y - size / 2,
                    left: startPos.x - size / 2,
                    width: size,
                    height: size,
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

interface VibeCornerLightProps {
    color: string | undefined;
    size: number;
    startPos: { x: number; y: number };
    animDuration: number;
    translateRange: { x: number; y: number };
    opacity?: number;
}

const VibeCornerLight = ({ color, size, startPos, animDuration, translateRange, opacity = 0.5 }: VibeCornerLightProps) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const animatedOpacity = useSharedValue(0);

    const [displayColor, setDisplayColor] = useState<string | undefined>(color);

    const gradientId = useMemo(() => `glow-vibe-${(displayColor || '#000').replace('#', '')}-${Math.random()}`, [displayColor]);

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
    }, [animDuration, translateRange.x, translateRange.y]);

    useEffect(() => {
        if (color !== displayColor) {
            animatedOpacity.value = withTiming(0, { duration: 600 }, () => {
                runOnJS(setDisplayColor)(color);
            });
        } else if (color) {
            animatedOpacity.value = withTiming(opacity, { duration: 800 });
        }
    }, [color, opacity]);

    useEffect(() => {
        if (displayColor === color && color) {
            animatedOpacity.value = withTiming(opacity, { duration: 800 });
        }
    }, [displayColor, opacity]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: animatedOpacity.value,
            transform: [
                { scale: scale.value },
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    if (!displayColor) return null;

    return (
        <Animated.View
            renderToHardwareTextureAndroid={true}
            shouldRasterizeIOS={true}
            style={[
                {
                    position: 'absolute',
                    top: startPos.y - size / 2,
                    left: startPos.x - size / 2,
                    width: size,
                    height: size,
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
                        <Stop offset="0%" stopColor={displayColor} stopOpacity="1" />
                        <Stop offset="40%" stopColor={displayColor} stopOpacity="0.5" />
                        <Stop offset="100%" stopColor={displayColor} stopOpacity="0" />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
            </Svg>
        </Animated.View>
    );
};

export type BackgroundTheme = 'default' | 'ocean' | 'cyberpunk' | 'sunset' | 'aurora' | 'monochrome' | 'nebula' | 'midnight' | 'emerald' | 'day' | 'cloudy' | 'black';

export const BACKGROUND_THEMES: Record<BackgroundTheme, string[]> = {
    default: ['#1E1B4B', '#0F172A', '#312E81', '#0C0A1D', '#1E1B4B'],
    ocean: ['#0E4D64', '#0B3142', '#164E63', '#0C1E2D', '#155E75'],
    cyberpunk: ['#A21CAF', '#6D28D9', '#0E7490', '#1E1B4B', '#4C1D95'],
    sunset: ['#B91C1C', '#C2410C', '#4f0c0aff', '#000000ff', '#7C2D12'],
    aurora: ['#065F46', '#0F766E', '#1E3A5F', '#1A1A40', '#134E4A'],
    monochrome: ['#1E293B', '#0F172A', '#0F172A', '#020617', '#1E293B'],
    nebula: ['#DC2626', '#7C3AED', '#2563EB', '#9333EA', '#B91C1C'],
    midnight: ['#1A103C', '#0D0B24', '#2D1B69', '#060412', '#1A0F3C'],
    emerald: ['#064E3B', '#065F46', '#0F3B2F', '#0A1A14', '#047857'],
    day: ['#FAD0C4', '#FCE38A', '#FAD0C4', '#FCE38A', '#FAD0C4'],
    cloudy: ['#D7D2CC', '#1A0F3C', '#2D1B69', '#060412', '#1A0F3C'],
    black: ['#102325', '#102325', '#102325', '#102325', '#102325'],
};

// Global state for background highlight colors
type HighlightColorsListener = (colors: string[]) => void;
const listeners = new Set<HighlightColorsListener>();
let currentHighlightColors: string[] = [];

export const updateBackgroundHighlightColors = (colors: string[]) => {
    currentHighlightColors = colors;
    listeners.forEach(listener => listener(colors));
};

interface AnimatedBackgroundProps {
    theme?: BackgroundTheme;
}

export default function AnimatedBackground({ theme = 'cloudy' }: AnimatedBackgroundProps) {
    const colors = BACKGROUND_THEMES[theme] || BACKGROUND_THEMES.default;
    const [highlights, setHighlights] = useState<string[]>(currentHighlightColors);

    useEffect(() => {
        const listener = (newColors: string[]) => {
            setHighlights(newColors);
        };
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    const vibeActive = highlights.length > 0;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#040210', overflow: 'hidden' }}>
            {/* Deep purple top-left */}
            <AnimatedOrb
                color={colors[0]}
                size={width * 1.8}
                startPos={{ x: -width * 0.3, y: -height * 0.05 }}
                animDuration={14000}
                translateRange={{ x: 60, y: 80 }}
                opacity={0.45}
                vibeActive={vibeActive}
            />
            {/* Indigo right */}
            <AnimatedOrb
                color={colors[1]}
                size={width * 1.4}
                startPos={{ x: width * 0.8, y: height * 0.25 }}
                animDuration={18000}
                translateRange={{ x: -70, y: 60 }}
                opacity={0.35}
                vibeActive={vibeActive}
            />
            {/* Deep violet bottom-left */}
            <AnimatedOrb
                color={colors[2]}
                size={width * 1.6}
                startPos={{ x: -width * 0.15, y: height * 0.85 }}
                animDuration={16000}
                translateRange={{ x: 80, y: -70 }}
                opacity={0.4}
                vibeActive={vibeActive}
            />
            {/* Dark base bottom-right */}
            <AnimatedOrb
                color={colors[3]}
                size={width * 1.8}
                startPos={{ x: width * 1, y: height * 1.05 }}
                animDuration={20000}
                translateRange={{ x: -100, y: -90 }}
                opacity={0.3}
                vibeActive={vibeActive}
            />
            {/* Subtle center fill */}
            <AnimatedOrb
                color={colors[4]}
                size={width * 1.2}
                startPos={{ x: width * 0.5, y: height * 0.5 }}
                animDuration={22000}
                translateRange={{ x: -40, y: -50 }}
                opacity={0.25}
                vibeActive={vibeActive}
            />

            {/* Vibe corner highlight 1: Bottom Right */}
            <VibeCornerLight
                color={highlights[0]}
                size={width * 1.2}
                startPos={{ x: width * 0.95, y: height * 0.95 }}
                animDuration={15000}
                translateRange={{ x: -35, y: -35 }}
                opacity={0.45}
            />

            {/* Vibe corner highlight 2: Bottom Center-Right */}
            <VibeCornerLight
                color={highlights[1]}
                size={width * 1.1}
                startPos={{ x: width * 0.75, y: height * 0.75 }}
                animDuration={17000}
                translateRange={{ x: -30, y: -30 }}
                opacity={0.4}
            />

            {/* Vibe corner highlight 3: Center Right */}
            <VibeCornerLight
                color={highlights[2]}
                size={width * 1.2}
                startPos={{ x: width * 0.9, y: height * 0.45 }}
                animDuration={16000}
                translateRange={{ x: -40, y: 20 }}
                opacity={0.45}
            />

            {/* Vibe corner highlight 4: Center Left */}
            <VibeCornerLight
                color={highlights[3]}
                size={width * 1.2}
                startPos={{ x: width * 0.1, y: height * 0.55 }}
                animDuration={18000}
                translateRange={{ x: 35, y: -20 }}
                opacity={0.45}
            />

            {/* Vibe corner highlight 5: Top Center-Left */}
            <VibeCornerLight
                color={highlights[4]}
                size={width * 1.1}
                startPos={{ x: width * 0.25, y: height * 0.25 }}
                animDuration={19000}
                translateRange={{ x: 30, y: 30 }}
                opacity={0.4}
            />

            {/* Vibe corner highlight 6: Top Left */}
            <VibeCornerLight
                color={highlights[5]}
                size={width * 1.2}
                startPos={{ x: width * 0.05, y: height * 0.05 }}
                animDuration={14000}
                translateRange={{ x: 30, y: 30 }}
                opacity={0.45}
            />
        </View>
    );
}
