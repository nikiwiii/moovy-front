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
    withSequence,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {
    Laugh,
    Sparkles,
    Heart,
    Brain,
    Flame,
    Waves,
    Skull,
    Swords,
    Zap,
    Users,
    Landmark,
    type LucideIcon,
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;

/* ─── Tag Territory Definition (Harmonious 3x3/5 Spatial Grid) ─────── */

export interface TagTerritory {
    id: string;
    vibe: string;
    label: string;
    icon: LucideIcon;
    color: string;
    x: number; // normalized [0..1]: 0.14 = Slow, 0.50 = Moderate, 0.86 = High
    y: number; // normalized [0..1]: 0.22 = Light, 0.50 = Warm/Dramatic, 0.78 = Dark/Intense
    description: string;
}

export const TAG_TERRITORIES: TagTerritory[] = [
    // ── Row 1: Light & Fun (Y = 0.22) ──────────────────────────
    {
        id: 'family_fun', vibe: 'FAMILY_FUN', label: 'Family Fun', icon: Users,
        color: '#2699E0', x: 0.18, y: 0.22, description: 'Heartwarming & fun for all ages'
    },
    {
        id: 'laugh_riot', vibe: 'LAUGH_RIOT', label: 'Laugh Riot', icon: Laugh,
        color: '#F5C719', x: 0.50, y: 0.22, description: 'Hilarious, high-energy comedy'
    },
    {
        id: 'guilty_pleasure', vibe: 'GUILTY_PLEASURE', label: 'Guilty Pleasure', icon: Zap,
        color: '#F06292', x: 0.82, y: 0.22, description: 'Wild, entertaining & unpretentious'
    },

    // ── Row 2: Warm, Cinematic & Philosophical (Y = 0.50) ───────────
    {
        id: 'history_lesson', vibe: 'HISTORY_LESSON', label: 'History Lesson', icon: Landmark,
        color: '#E3AC36', x: 0.14, y: 0.50, description: 'Fascinating period pieces & real stories'
    },
    {
        id: 'existential', vibe: 'EXISTENTIAL', label: 'Existential', icon: Sparkles,
        color: '#0B4B5C', x: 0.38, y: 0.50, description: 'Thought-provoking, philosophical & deep'
    },
    {
        id: 'date_night', vibe: 'DATE_NIGHT', label: 'Date Night', icon: Heart,
        color: '#C22E6C', x: 0.62, y: 0.50, description: 'Romantic, charming & warm'
    },
    {
        id: 'epic_journey', vibe: 'EPIC_JOURNEY', label: 'Epic Journey', icon: Swords,
        color: '#A17142', x: 0.86, y: 0.50, description: 'Grand adventure & world-building'
    },

    // ── Row 3: Deep, Dark & Intense (Y = 0.78) ────────────────
    {
        id: 'deep_feels', vibe: 'DEEP_FEELS', label: 'Deep Feels', icon: Waves,
        color: '#3B5284', x: 0.14, y: 0.78, description: 'Emotional, dramatic & poignant'
    },
    {
        id: 'mind_bender', vibe: 'MIND_BENDER', label: 'Mind Bender', icon: Brain,
        color: '#7029B8', x: 0.38, y: 0.78, description: 'Complex, cerebral & twisty'
    },
    {
        id: 'spine_chilling', vibe: 'SPINE_CHILLING', label: 'Spine Chilling', icon: Skull,
        color: '#4E7259', x: 0.62, y: 0.78, description: 'Terrifying, dark & eerie'
    },
    {
        id: 'adrenaline', vibe: 'ADRENALINE', label: 'Adrenaline', icon: Flame,
        color: '#DD1C1C', x: 0.86, y: 0.78, description: 'High-octane action & non-stop thrill'
    },
];

export const MOOD_ZONES = TAG_TERRITORIES.map(t => ({
    id: t.id,
    label: t.label,
    icon: t.icon,
    vibes: [t.vibe],
    color: t.color,
    x: [Math.max(0, t.x - 0.12), Math.min(1, t.x + 0.12)] as [number, number],
    y: [Math.max(0, t.y - 0.14), Math.min(1, t.y + 0.14)] as [number, number],
}));

export interface TerritorySelectionResult {
    primaryTerritory: TagTerritory;
    nearbyTerritories: TagTerritory[];
    allVibes: string[];
    tempo: number; // 0..100
    tone: number;  // 0..100
}

export function evaluateSpatialPosition(nx: number, ny: number): TerritorySelectionResult {
    const cx = Math.max(0, Math.min(1, nx));
    const cy = Math.max(0, Math.min(1, ny));

    // Calculate distance to each territory node
    const distances = TAG_TERRITORIES.map(t => {
        const dx = cx - t.x;
        const dy = cy - t.y;
        return { territory: t, dist: Math.sqrt(dx * dx + dy * dy) };
    });

    distances.sort((a, b) => a.dist - b.dist);

    const primary = distances[0].territory;
    const PROXIMITY_THRESHOLD = 0.28;
    const nearby = distances
        .slice(1)
        .filter(d => d.dist <= PROXIMITY_THRESHOLD)
        .slice(0, 2)
        .map(d => d.territory);

    const allVibes = [primary.vibe, ...nearby.map(n => n.vibe)];

    return {
        primaryTerritory: primary,
        nearbyTerritories: nearby,
        allVibes,
        tempo: Math.round(cx * 100),
        tone: Math.round(cy * 100),
    };
}

export interface MoodboardProps {
    onMoodSelected: (vibes: string[], label: string) => void;
    onTouchStart?: () => void;
    onTouchEnd?: () => void;
    hideDetails?: boolean;
}

export default function Moodboard({ onMoodSelected, onTouchStart, onTouchEnd, hideDetails = false }: MoodboardProps) {
    const [selection, setSelection] = useState<TerritorySelectionResult | null>(null);
    const [isActive, setIsActive] = useState(false);

    const cursorX = useSharedValue(-100);
    const cursorY = useSharedValue(-100);
    const cursorScale = useSharedValue(0);
    const cursorOpacity = useSharedValue(0);

    const [paletteLayout, setPaletteLayout] = useState({ width: 0, height: 0 });

    const updatePosition = useCallback((nx: number, ny: number) => {
        const res = evaluateSpatialPosition(nx, ny);
        setSelection(res);
    }, []);

    const confirmSelection = useCallback(() => {
        if (selection) {
            onMoodSelected(selection.allVibes, selection.primaryTerritory.label);
        }
    }, [selection, onMoodSelected]);

    const beginTouch = useCallback(() => {
        setIsActive(true);
        onTouchStart?.();
    }, [onTouchStart]);

    const endTouch = useCallback(() => {
        setIsActive(false);
        onTouchEnd?.();
    }, [onTouchEnd]);

    const panGesture = Gesture.Pan()
        .minDistance(0)
        .onBegin((e) => {
            cursorX.value = e.x;
            cursorY.value = e.y;
            cursorScale.value = withSpring(1, { damping: 12, stiffness: 200 });
            cursorOpacity.value = withSpring(1, { damping: 15 });
            runOnJS(beginTouch)();
            if (paletteLayout.width > 0 && paletteLayout.height > 0) {
                const nx = e.x / paletteLayout.width;
                const ny = e.y / paletteLayout.height;
                runOnJS(updatePosition)(nx, ny);
            }
        })
        .onUpdate((e) => {
            cursorX.value = e.x;
            cursorY.value = e.y;
            if (paletteLayout.width > 0 && paletteLayout.height > 0) {
                const nx = Math.max(0, Math.min(1, e.x / paletteLayout.width));
                const ny = Math.max(0, Math.min(1, e.y / paletteLayout.height));
                runOnJS(updatePosition)(nx, ny);
            }
        })
        .onEnd(() => {
            cursorScale.value = withSequence(
                withSpring(1.3, { damping: 8 }),
                withSpring(0.8, { damping: 15 })
            );
            cursorOpacity.value = withSpring(0.2, { damping: 15 });
            runOnJS(confirmSelection)();
            runOnJS(endTouch)();
        })
        .onFinalize(() => {
            runOnJS(endTouch)();
        });

    const cursorStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: cursorX.value - 18 },
            { translateY: cursorY.value - 18 },
            { scale: cursorScale.value },
        ],
        opacity: cursorOpacity.value,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: cursorX.value - 36 },
            { translateY: cursorY.value - 36 },
            { scale: cursorScale.value * 1.4 },
        ],
        opacity: cursorOpacity.value * 0.5,
    }));

    const primaryColor = selection?.primaryTerritory.color ?? ACCENT;

    return (
        <View className="gap-3">
            {/* The 2D Spatial Canvas */}
            <GestureHandlerRootView style={{ flex: 1 }}>
                <GestureDetector gesture={panGesture}>
                    <View
                        className="rounded-[14px] overflow-hidden border border-white/[0.12] bg-[#09071a] relative"
                        style={{ height: 280 }}
                        onLayout={(e) => {
                            setPaletteLayout({
                                width: e.nativeEvent.layout.width,
                                height: e.nativeEvent.layout.height,
                            });
                        }}
                    >
                        {/* Multi-tone ambient gradients for 4 quadrants */}
                        <LinearGradient
                            colors={['#2699E033', '#F5C71925', '#F0629230']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[StyleSheet.absoluteFill, { opacity: 0.8 }]}
                        />
                        <LinearGradient
                            colors={['#E3AC3625', '#0B4B5C35', '#C22E6C40']}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <LinearGradient
                            colors={['#09071a10', '#050210f0']}
                            start={{ x: 0.5, y: 0.3 }}
                            end={{ x: 0.5, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* Axis Header Bar */}
                        <View style={styles.axisRow} pointerEvents="none">
                            <Text style={styles.axisLabel}>Slow Tempo</Text>
                            <View style={styles.axisLine} />
                            <Text style={styles.axisLabel}>Fast Tempo</Text>
                        </View>

                        {/* Axis Side Labels */}
                        <View style={[styles.axisVertical, { top: 24 }]} pointerEvents="none">
                            <Text style={styles.axisLabelVertical}>Light</Text>
                        </View>
                        <View style={[styles.axisVertical, { bottom: 24 }]} pointerEvents="none">
                            <Text style={styles.axisLabelVertical}>Dark</Text>
                        </View>

                        {/* Render Glassmorphic Tag Territory Badges at exact grid coordinates */}
                        {TAG_TERRITORIES.map((territory) => {
                            const isPrimary = selection?.primaryTerritory.id === territory.id;
                            const isNearby = selection?.nearbyTerritories.some(n => n.id === territory.id);
                            const IconComponent = territory.icon;

                            const posX = territory.x * 100;
                            const posY = territory.y * 100;

                            return (
                                <View
                                    key={territory.id}
                                    style={{
                                        position: 'absolute',
                                        left: `${posX}%`,
                                        top: `${posY}%`,
                                        width: 100,
                                        height: 40,
                                        transform: [{ translateX: -50 }, { translateY: -20 }],
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: isPrimary ? 25 : isNearby ? 15 : 5,
                                    }}
                                    pointerEvents="none"
                                >
                                    <View
                                        style={{
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 3,
                                        }}
                                    >
                                        <IconComponent
                                            color={isPrimary || isNearby ? territory.color : `${territory.color}60`}
                                            size={isPrimary ? 14 : 12}
                                            strokeWidth={isPrimary ? 2.5 : 1.8}
                                        />
                                        <Text
                                            style={{
                                                fontSize: isPrimary ? 11 : 9.5,
                                                color: isPrimary ? '#FFFFFF' : isNearby ? territory.color : `${territory.color}60`,
                                                fontFamily: isPrimary ? 'Outfit_700Bold' : 'Outfit_400Regular',
                                                textAlign: 'center',
                                            }}
                                            numberOfLines={1}
                                        >
                                            {territory.label}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}

                        {/* Glow behind cursor */}
                        <Animated.View
                            style={[
                                glowStyle,
                                {
                                    position: 'absolute',
                                    width: 72,
                                    height: 72,
                                    borderRadius: 36,
                                    backgroundColor: primaryColor,
                                },
                            ]}
                            pointerEvents="none"
                        />

                        {/* Animated Touch Cursor */}
                        <Animated.View
                            style={[
                                cursorStyle,
                                {
                                    position: 'absolute',
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    borderWidth: 2,
                                    borderColor: '#ffffffed',
                                    backgroundColor: `${primaryColor}50`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                            ]}
                            pointerEvents="none"
                        >
                            <View
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: '#fff',
                                }}
                            />
                        </Animated.View>

                        {/* Touch hint overlay when inactive */}
                        {!isActive && !selection && (
                            <MotiView
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 600, delay: 200 }}
                                style={StyleSheet.absoluteFill}
                                className="items-center justify-center pointer-events-none"
                            >
                                <BlurView
                                    intensity={30}
                                    tint="dark"
                                    experimentalBlurMethod="dimezisBlurView"
                                    className="rounded-full overflow-hidden border border-white/[0.12] mx-6 py-2.5 px-5 bg-black/50"
                                >
                                    <Text className="font-outfit-bold text-[10px] text-white/90 uppercase tracking-[2px] text-center">
                                        Drag anywhere to select moodboard vibes
                                    </Text>
                                </BlurView>
                            </MotiView>
                        )}
                    </View>
                </GestureDetector>
            </GestureHandlerRootView>

            {/* Selected Territory Details Card */}
            {!hideDetails && selection && (
                <MotiView
                    key={selection.primaryTerritory.id}
                    from={{ opacity: 0, translateY: 8, scale: 0.97 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 16, stiffness: 140 }}
                    className="rounded-[20px] overflow-hidden border border-white/[0.08] bg-white/[0.04] p-4 gap-y-3"
                >
                    <View className="flex-row items-center gap-3">
                        <View
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 21,
                                backgroundColor: `${selection.primaryTerritory.color}25`,
                                borderWidth: 1,
                                borderColor: `${selection.primaryTerritory.color}50`,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <selection.primaryTerritory.icon
                                color={selection.primaryTerritory.color}
                                size={20}
                                strokeWidth={2}
                            />
                        </View>

                        <View className="flex-1">
                            <Text className="font-outfit-bold text-[16px] text-white">
                                {selection.primaryTerritory.label}
                            </Text>
                            <Text className="font-outfit text-[12px] opacity-40 mt-0.5">
                                {selection.primaryTerritory.description}
                            </Text>
                        </View>

                        <View className="items-end">
                            <Text className="font-outfit-bold text-[11px] text-accent uppercase tracking-wider">
                                {selection.tempo > 75 ? 'Max' : selection.tempo > 50 ? 'High' : selection.tempo > 25 ? 'Moderate' : 'Chill'} Tempo
                            </Text>
                            <Text className="font-outfit text-[10px] opacity-35 mt-0.5">
                                {selection.tone > 66 ? 'Dark' : selection.tone > 33 ? 'Dramatic' : 'Light'} Tone
                            </Text>
                        </View>
                    </View>

                    {/* Nearby territories */}
                    {selection.nearbyTerritories.length > 0 && (
                        <View className="flex-row items-center gap-x-2 pt-1 border-t border-white/[0.06]">
                            <Text className="font-outfit text-[11px] opacity-35 uppercase tracking-wider">
                                Proximity Vibes:
                            </Text>
                            <View className="flex-row gap-x-1.5 flex-wrap">
                                {selection.nearbyTerritories.map(n => (
                                    <View
                                        key={n.id}
                                        style={{ backgroundColor: `${n.color}15`, borderColor: `${n.color}35` }}
                                        className="px-2 py-0.5 rounded-full border flex-row items-center gap-x-1"
                                    >
                                        <View style={{ backgroundColor: n.color }} className="w-1.5 h-1.5 rounded-full" />
                                        <Text className="font-outfit-bold text-[10px] text-white/70">
                                            {n.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </MotiView>
            )}
        </View>
    );
}



const styles = StyleSheet.create({
    axisRow: {
        position: 'absolute',
        top: 6,
        left: 24,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    axisLabel: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 9,
        color: 'rgba(255,255,255,0.40)',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    axisLabelVertical: {
        fontFamily: 'Outfit_700Bold',
        fontSize: 9,
        color: 'rgba(255,255,255,0.40)',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        transform: [{ rotate: '-90deg' }],
        textAlign: 'center',
        width: 40,
    },
    axisLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginHorizontal: 12,
    },
    axisVertical: {
        position: 'absolute',
        zIndex: 10,
        left: 0,
        height: 40,
        width: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
