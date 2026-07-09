import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { BlurView } from 'expo-blur';
import { AppText as Text } from './AppText';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
    Sofa,
    Laugh,
    Sparkles,
    Heart,
    Brain,
    Flame,
    Waves,
    Skull,
    Swords,
    type LucideIcon,
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;

/* ─── Mood Zone Definitions ─────────────────────────────────────────── */

interface MoodZone {
    id: string;
    label: string;
    icon: LucideIcon;
    vibes: string[];
    color: string;
    x: [number, number];  // normalized range [0..1]
    y: [number, number];
}

const MOOD_ZONES: MoodZone[] = [
    {
        id: 'chill', label: 'Cozy Chill', icon: Sofa,
        vibes: ['PIZZA_CHILL', 'FAMILY_FUN'],
        color: '#60D394', x: [0, 0.35], y: [0, 0.35],
    },
    {
        id: 'comedy', label: 'Laugh Riot', icon: Laugh,
        vibes: ['LAUGH_RIOT', 'GUILTY_PLEASURE'],
        color: '#FFD166', x: [0.35, 0.65], y: [0, 0.35],
    },
    {
        id: 'inspiring', label: 'Inspiring', icon: Sparkles,
        vibes: ['INSPIRING', 'EPIC_JOURNEY'],
        color: '#F9A826', x: [0.65, 1], y: [0, 0.35],
    },
    {
        id: 'romance', label: 'Date Night', icon: Heart,
        vibes: ['DATE_NIGHT', 'DEEP_FEELS'],
        color: '#EF476F', x: [0, 0.35], y: [0.35, 0.65],
    },
    {
        id: 'mindbender', label: 'Mind Bender', icon: Brain,
        vibes: ['MIND_BENDER', 'AMBITIOUS'],
        color: '#9B5DE5', x: [0.35, 0.65], y: [0.35, 0.65],
    },
    {
        id: 'adrenaline', label: 'Adrenaline', icon: Flame,
        vibes: ['ADRENALINE', 'EPIC_JOURNEY'],
        color: '#FF6B35', x: [0.65, 1], y: [0.35, 0.65],
    },
    {
        id: 'deepfeels', label: 'Deep Feels', icon: Waves,
        vibes: ['DEEP_FEELS', 'AMBITIOUS'],
        color: '#457B9D', x: [0, 0.35], y: [0.65, 1],
    },
    {
        id: 'horror', label: 'Spine Chilling', icon: Skull,
        vibes: ['SPINE_CHILLING'],
        color: '#2D6A4F', x: [0.35, 0.65], y: [0.65, 1],
    },
    {
        id: 'thriller', label: 'Dark Thriller', icon: Swords,
        vibes: ['SPINE_CHILLING', 'ADRENALINE', 'MIND_BENDER'],
        color: '#6A040F', x: [0.65, 1], y: [0.65, 1],
    },
];

function getZoneAtPosition(nx: number, ny: number): MoodZone {
    const cx = Math.max(0, Math.min(1, nx));
    const cy = Math.max(0, Math.min(1, ny));
    for (const zone of MOOD_ZONES) {
        if (cx >= zone.x[0] && cx < zone.x[1] && cy >= zone.y[0] && cy < zone.y[1]) {
            return zone;
        }
    }
    return MOOD_ZONES[4]; // fallback: center
}

/* ─── Component ─────────────────────────────────────────────────────── */

interface MoodPaletteProps {
    onMoodSelected: (vibes: string[], label: string) => void;
    onTouchStart?: () => void;
    onTouchEnd?: () => void;
}

export default function MoodPalette({ onMoodSelected, onTouchStart, onTouchEnd }: MoodPaletteProps) {
    const [currentZone, setCurrentZone] = useState<MoodZone | null>(null);
    const [isActive, setIsActive] = useState(false);

    const cursorX = useSharedValue(-100);
    const cursorY = useSharedValue(-100);
    const cursorScale = useSharedValue(0);
    const cursorOpacity = useSharedValue(0);

    const [paletteLayout, setPaletteLayout] = useState({ width: 0, height: 0 });

    const updateZone = useCallback((nx: number, ny: number) => {
        const zone = getZoneAtPosition(nx, ny);
        setCurrentZone(zone);
    }, []);

    const confirmSelection = useCallback(() => {
        if (currentZone) {
            onMoodSelected(currentZone.vibes, currentZone.label);
        }
    }, [currentZone, onMoodSelected]);

    const beginTouch = useCallback(() => {
        setIsActive(true);
        onTouchStart?.();
    }, [onTouchStart]);

    const endTouch = useCallback(() => {
        setIsActive(false);
        onTouchEnd?.();
    }, [onTouchEnd]);

    const panGesture = Gesture.Pan()
        .onBegin((e) => {
            cursorX.value = e.x;
            cursorY.value = e.y;
            cursorScale.value = withSpring(1, { damping: 12, stiffness: 200 });
            cursorOpacity.value = withSpring(1, { damping: 15 });
            runOnJS(beginTouch)();
            if (paletteLayout.width > 0) {
                const nx = e.x / paletteLayout.width;
                const ny = e.y / paletteLayout.height;
                runOnJS(updateZone)(nx, ny);
            }
        })
        .onUpdate((e) => {
            cursorX.value = e.x;
            cursorY.value = e.y;
            if (paletteLayout.width > 0) {
                const nx = Math.max(0, Math.min(1, e.x / paletteLayout.width));
                const ny = Math.max(0, Math.min(1, e.y / paletteLayout.height));
                runOnJS(updateZone)(nx, ny);
            }
        })
        .onEnd(() => {
            cursorScale.value = withSpring(1.3, { damping: 8 }, () => {
                cursorScale.value = withSpring(0, { damping: 15 });
                cursorOpacity.value = withSpring(0, { damping: 15 });
            });
            runOnJS(confirmSelection)();
            runOnJS(endTouch)();
        })
        .onFinalize(() => {
            runOnJS(endTouch)();
        });

    const cursorStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: cursorX.value - 28 },
            { translateY: cursorY.value - 28 },
            { scale: cursorScale.value },
        ],
        opacity: cursorOpacity.value,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: cursorX.value - 50 },
            { translateY: cursorY.value - 50 },
            { scale: cursorScale.value * 1.2 },
        ],
        opacity: cursorOpacity.value * 0.4,
    }));

    return (
        <View className="gap-3">
            {/* The gradient canvas */}
            <GestureHandlerRootView style={{ flex: 1 }}>
                <GestureDetector gesture={panGesture}>
                    <View
                        className="rounded-[24px] overflow-hidden border border-white/[0.08]"
                        style={{ height: 260 }}
                        onLayout={(e) => {
                            setPaletteLayout({
                                width: e.nativeEvent.layout.width,
                                height: e.nativeEvent.layout.height,
                            });
                        }}
                    >
                        {/* Multi-layer gradient background */}
                        <LinearGradient
                            colors={['#60D394', '#FFD166', '#F9A826']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[StyleSheet.absoluteFill, { opacity: 0.7 }]}
                        />
                        <LinearGradient
                            colors={['transparent', '#050210']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <LinearGradient
                            colors={['#EF476F22', '#9B5DE544', '#FF6B3533']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <LinearGradient
                            colors={['#6A040F55', 'transparent']}
                            start={{ x: 1, y: 1 }}
                            end={{ x: 0, y: 0 }}
                            style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
                        />

                        {/* ── Axis labels on the field ── */}
                        {/* Top edge: X axis */}
                        <View style={styles.axisRow} pointerEvents="none">
                            <Text style={styles.axisLabel}>calm</Text>
                            <View style={styles.axisLine} />
                            <Text style={styles.axisLabel}>intense</Text>
                        </View>
                        {/* Left edge: Y label "light" */}
                        <View style={[styles.axisVertical, { top: 48 }]} pointerEvents="none">
                            <Text style={styles.axisLabelVertical}>light</Text>
                        </View>
                        {/* Vertical line between light and dark */}
                        <View style={styles.axisVerticalLine} pointerEvents="none" />
                        {/* Left edge: Y label "dark" */}
                        <View style={[styles.axisVertical, { bottom: 20 }]} pointerEvents="none">
                            <Text style={styles.axisLabelVertical}>dark</Text>
                        </View>

                        {/* Zone Lucide icons */}
                        {MOOD_ZONES.map((zone) => {
                            // Shift visual positions of icons away from the edges to prevent collision with axis labels
                            let cx = 50;
                            if (zone.x[0] === 0) cx = 23; // Column 1
                            else if (zone.x[1] === 1) cx = 77; // Column 3

                            let cy = 50;
                            if (zone.y[0] === 0) cy = 26; // Row 1 (Light)
                            else if (zone.y[1] === 1) cy = 74; // Row 3 (Dark)

                            const IconComp = zone.icon;
                            const isHighlighted = currentZone?.id === zone.id;
                            return (
                                <View
                                    key={zone.id}
                                    style={{
                                        position: 'absolute',
                                        left: `${cx}%`,
                                        top: `${cy}%`,
                                        transform: [{ translateX: -18 }, { translateY: -18 }],
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: isHighlighted ? `${zone.color}35` : 'rgba(255,255,255,0.03)',
                                        borderWidth: 1,
                                        borderColor: isHighlighted ? `${zone.color}70` : 'rgba(255,255,255,0.07)',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: isHighlighted ? 1 : 0.55,
                                    }}
                                >
                                    <IconComp
                                        color={isHighlighted ? '#fff' : zone.color}
                                        size={isHighlighted ? 18 : 15}
                                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                                    />
                                </View>
                            );
                        })}

                        {/* Glow behind cursor */}
                        <Animated.View
                            style={[
                                glowStyle,
                                {
                                    position: 'absolute',
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    backgroundColor: currentZone?.color ?? ACCENT,
                                },
                            ]}
                            pointerEvents="none"
                        />

                        {/* Cursor */}
                        <Animated.View
                            style={[
                                cursorStyle,
                                {
                                    position: 'absolute',
                                    width: 56,
                                    height: 56,
                                    borderRadius: 28,
                                    borderWidth: 2,
                                    borderColor: '#ffffffcc',
                                    backgroundColor: (currentZone?.color ?? ACCENT) + '30',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                            ]}
                            pointerEvents="none"
                        >
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: '#fff',
                                }}
                            />
                        </Animated.View>

                        {/* Touch hint when inactive */}
                        {!isActive && !currentZone && (
                            <MotiView
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 600, delay: 300 }}
                                style={StyleSheet.absoluteFill}
                                className="items-center justify-center pointer-events-none"
                            >
                                <BlurView
                                    intensity={25}
                                    tint="dark"
                                    experimentalBlurMethod="dimezisBlurView"
                                    className="rounded-full overflow-hidden border border-white/[0.08] px-5 py-2.5 bg-black/35"
                                >
                                    <Text className="font-outfit-bold text-[10px] text-white/80 uppercase tracking-[2px] text-center">
                                        Touch & drag to feel the mood
                                    </Text>
                                </BlurView>
                            </MotiView>
                        )}
                    </View>
                </GestureDetector>
            </GestureHandlerRootView>

            {/* Selected mood display */}
            {currentZone && (
                <MotiView
                    key={currentZone.id}
                    from={{ opacity: 0, translateY: 8, scale: 0.97 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 16, stiffness: 140 }}
                    className="rounded-[20px] overflow-hidden border border-white/[0.08] bg-white/[0.04]"
                >
                    <View className="flex-row items-center gap-3 px-5 py-4">
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: currentZone.color + '20',
                                borderWidth: 1,
                                borderColor: currentZone.color + '40',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <currentZone.icon color={currentZone.color} size={22} strokeWidth={1.5} />
                        </View>
                        <View className="flex-1">
                            <Text className="font-outfit-bold text-[16px] text-white">
                                {currentZone.label}
                            </Text>
                            <Text className="font-outfit text-[11px] opacity-40 mt-0.5">
                                {currentZone.vibes.map(v => v.replace('_', ' ').toLowerCase()).join(' · ')}
                            </Text>
                        </View>
                        <View
                            style={{ backgroundColor: currentZone.color }}
                            className="w-2.5 h-2.5 rounded-full"
                        />
                    </View>
                </MotiView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    axisRow: {
        position: 'absolute',
        top: 14,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    axisLabel: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 9,
        color: 'rgba(255,255,255,0.45)',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    axisLabelVertical: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 9,
        color: 'rgba(255,255,255,0.45)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        transform: [{ rotate: '-90deg' }],
        textAlign: 'center',
        width: 40,
    },
    axisLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        marginHorizontal: 12,
    },
    axisVertical: {
        position: 'absolute',
        zIndex: 10,
        left: 12,
        height: 40,
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    axisVerticalLine: {
        position: 'absolute',
        left: 24,
        top: 92,
        bottom: 64,
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        zIndex: 10,
    },
});

