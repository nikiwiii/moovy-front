import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Check, Clock, Film, Handshake, Heart, LucideIcon, Palette, Plus, ScanEye, Cog, Sparkle, Sparkles, UserRound, UsersRound, Tag, EllipsisVertical, Tv, Ban, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useState, useEffect } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { getVibeColor } from '../constants/vibes';
import { metadataService } from '../services/metadataService';
import * as SecureStore from 'expo-secure-store';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn, LinearTransition, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import CollapsibleSection from '../components/CollapsibleSection';
import GenreSelection from '../components/GenreSelection';
import GroupSelector from '../components/GroupSelector';
import TouchableOpacity from '../components/TouchableOpacity';
import VibeBars from '../components/VibeBars';
import VibeBadge from '../components/VibeBadge';
import Moodboard, { MOOD_ZONES, TAG_TERRITORIES } from '../components/Moodboard';
import { FillStyles } from '../constants/themeStyles';
import { Colors } from '@/constants/theme';
import { updateBackgroundHighlightColors } from '../components/AnimatedBackground';
import MoovyLogo from '../components/MoovyLogo';

const ACCENT = Colors.dark.accent;

interface Group {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
}

const getAverageColor = (colors: string[]): string => {
    if (colors.length === 0) return Colors.dark.accent;

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    for (const color of colors) {
        const hex = color.replace('#', '');
        if (hex.length === 6) {
            totalR += parseInt(hex.substring(0, 2), 16);
            totalG += parseInt(hex.substring(2, 4), 16);
            totalB += parseInt(hex.substring(4, 6), 16);
            count++;
        } else if (hex.length === 3) {
            totalR += parseInt(hex.charAt(0) + hex.charAt(0), 16);
            totalG += parseInt(hex.charAt(1) + hex.charAt(1), 16);
            totalB += parseInt(hex.charAt(2) + hex.charAt(2), 16);
            count++;
        }
    }

    if (count === 0) return Colors.dark.accent;

    const avgR = Math.round(totalR / count);
    const avgG = Math.round(totalG / count);
    const avgB = Math.round(totalB / count);

    const rHex = avgR.toString(16).padStart(2, '0');
    const gHex = avgG.toString(16).padStart(2, '0');
    const bHex = avgB.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
};

let cachedParametersState: any = null;

export default function ParametersScreen() {
    const router = useRouter();
    const [selectedGroup, setSelectedGroup] = useState<string | null>(() => cachedParametersState?.selectedGroup ?? 'solo');
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [vibeMethod, setVibeMethod] = useState<'tags' | 'moodboard'>(() => (cachedParametersState?.vibeMethod as any) === 'tags' ? 'tags' : 'moodboard');

    const [backendColors, setBackendColors] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    const [groups, setGroups] = useState<Group[]>([
        { id: 'solo', icon: UserRound, title: 'Solo', description: 'movies for you, just you and your preferences' },
        { id: 'tlum', icon: UsersRound, title: 'Crowd', description: 'engaging movies, great for matching different tastes' },
        { id: 'randewu', icon: Heart, title: 'Rendezvous', description: 'engaging, touching movies' }
    ]);
    const [settings, setSettings] = useState<{ icon: LucideIcon; title: string; value: boolean | number; }[]>(() => cachedParametersState?.settings ?? [
        { icon: Heart, title: "Use profile preferences", value: true },
        { icon: ScanEye, title: "Watched movies", value: false },
        { icon: Tv, title: "No anime", value: false },
        { icon: Ban, title: "No animation", value: false },
        { icon: Clock, title: "Max runtime", value: 240 },
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const [genres, setGenres] = useState<{ liked: string[]; disliked: string[]; }>(() => cachedParametersState?.genres ?? { liked: [] as string[], disliked: [] as string[] });
    const [moodLabel, setMoodLabel] = useState<string | null>(() => cachedParametersState?.moodLabel ?? null);
    const [paletteVibes, setPaletteVibes] = useState<string[]>(() => cachedParametersState?.paletteVibes ?? []);

    const resolveVibeColor = (vibe: string): string => {
        return backendColors[vibe.toUpperCase()] || getVibeColor(vibe);
    };

    const getVibeBarSegments = (likedVibes: string[]): { color: string; opacity: number }[] => {
        const segments: { color: string; opacity: number }[] = [];
        const L = likedVibes.length;

        if (L === 0) {
            for (let i = 0; i < 6; i++) {
                segments.push({ color: 'rgba(255, 255, 255, 0.05)', opacity: 1 });
            }
            return segments;
        }

        const opacityFactors = [1.0, 0.6, 0.35, 0.2, 0.1, 0.05];

        for (let i = 0; i < 6; i++) {
            const vibeIndex = i % L;
            const cycle = Math.floor(i / L);
            const color = resolveVibeColor(likedVibes[vibeIndex]);
            const opacity = opacityFactors[cycle] !== undefined ? opacityFactors[cycle] : 0.05;
            segments.push({ color, opacity });
        }
        return segments;
    };

    const getCustomVibeIconColor = (): string => {
        if (genres && genres.liked && genres.liked.length === 0) return ACCENT;
        const colors = (genres?.liked || []).map(v => resolveVibeColor(v));
        return getAverageColor(colors);
    };

    const avgVibeColor = getCustomVibeIconColor();

    const setSettingValue = (title: string, value: boolean | number) => {
        setSettings(prev => prev.map(setting => setting.title === title ? { ...setting, value } : setting));
    };

    useEffect(() => {
        const loadStateAndColors = async () => {
            try {
                // 1. Fetch colors
                const data = await metadataService.getPreferencesOptions();
                if (data && data.vibe_colors) {
                    setBackendColors(data.vibe_colors);
                }
            } catch (e) {
                console.warn('Failed to load vibe colors for header bar:', e);
            }

            try {
                // 2. Load saved parameters
                const saved = await SecureStore.getItemAsync('parameters_state');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.selectedGroup !== undefined) setSelectedGroup(parsed.selectedGroup);
                    if (parsed.vibeMethod !== undefined) setVibeMethod(parsed.vibeMethod);
                    if (parsed.genres !== undefined) setGenres(parsed.genres);
                    if (parsed.paletteVibes !== undefined) setPaletteVibes(parsed.paletteVibes);
                    if (parsed.moodLabel !== undefined) setMoodLabel(parsed.moodLabel);
                    if (parsed.settings !== undefined) {
                        setSettings(prev => {
                            const updated = prev.map(s => {
                                const savedSetting = parsed.settings.find((ps: any) => ps.title === s.title);
                                return savedSetting ? { ...s, value: savedSetting.value } : s;
                            });
                            cachedParametersState = {
                                selectedGroup: parsed.selectedGroup,
                                vibeMethod: parsed.vibeMethod,
                                genres: parsed.genres,
                                paletteVibes: parsed.paletteVibes,
                                moodLabel: parsed.moodLabel,
                                settings: updated
                            };
                            return updated;
                        });
                    }
                }
            } catch (e) {
                console.warn('Failed to load parameters state:', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadStateAndColors();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const state = {
            selectedGroup,
            vibeMethod,
            genres,
            paletteVibes,
            moodLabel,
            settings
        };
        cachedParametersState = state; // Sync memory cache
        SecureStore.setItemAsync('parameters_state', JSON.stringify(state)).catch(err => {
            console.warn('Error saving parameters state:', err);
        });
    }, [selectedGroup, vibeMethod, genres, paletteVibes, moodLabel, settings, isLoaded]);

    useEffect(() => {
        const activeLikedVibes = (vibeMethod as string) === 'moodboard' || (vibeMethod as string) === 'palette' ? paletteVibes : genres.liked;
        const colors = activeLikedVibes.slice(0, 6).map(v => resolveVibeColor(v));
        updateBackgroundHighlightColors(colors);
    }, [genres.liked, paletteVibes, vibeMethod, backendColors]);

    const handleMoodSelected = (vibes: string[], label: string) => {
        setMoodLabel(label);
        setPaletteVibes(vibes);
    };

    const toggleGenre = (genre: string, type: 'liked' | 'disliked') => {
        setGenres(prev => {
            const newGenres = [...prev[type]];
            if (newGenres.includes(genre)) {
                newGenres.splice(newGenres.indexOf(genre), 1);
            } else {
                newGenres.push(genre);
            }
            return { ...prev, [type]: newGenres };
        });
    };

    const handleFindMovie = () => {
        const activeVibes = (vibeMethod as string) === 'moodboard' || (vibeMethod as string) === 'palette' ? paletteVibes : genres.liked;
        const activeHardNos = (vibeMethod as string) === 'moodboard' || (vibeMethod as string) === 'palette' ? [] : genres.disliked;

        const maxRuntimeVal = settings.find(s => s.title === "Max runtime")?.value || 120;
        const allowSeenVal = settings.find(s => s.title === "Watched movies")?.value || false;
        const noAnimeVal = settings.find(s => s.title === "No anime")?.value || false;
        const noAnimationVal = settings.find(s => s.title === "No animation")?.value || false;

        const payload = {
            host_id: "00000000-0000-0000-0000-000000000000",
            invite_code: "12345",
            meeting_type: selectedGroup === 'randewu' ? 'RANDKA' : 'EKIPA',
            is_active: true,
            users: [
                {
                    user_id: "00000000-0000-0000-0000-000000000000",
                    user_name: 'Guest',
                    personal_vibe: {
                        vibes: activeVibes,
                        hard_nos: activeHardNos,
                        max_runtime: maxRuntimeVal,
                        allow_seen: allowSeenVal,
                        eras: [],
                        no_anime: noAnimeVal,
                        no_animation: noAnimationVal
                    }
                }
            ],
            final_preferences: {
                vibes: activeVibes,
                hard_nos: activeHardNos,
                max_runtime: maxRuntimeVal,
                allow_seen: allowSeenVal,
                eras: [],
                no_anime: noAnimeVal,
                no_animation: noAnimationVal
            }
        };

        const criteriaData = {
            preset: groups.find(g => g.id === selectedGroup)?.title || "Crowd",
            genres: activeVibes,
            duration: `${settings.find(s => s.title === "Max runtime")?.value} min`,
            friendsAdded: 0,
        };

        router.push({
            pathname: '/loading',
            params: {
                payload: JSON.stringify(payload),
                groups: JSON.stringify(criteriaData),
            },
        });
    };


    const handleAddGroup = () => {
        if (newTitle.trim()) {
            const newId = newTitle.toLowerCase().replace(/\s+/g, '-');
            setGroups(prev => [...prev, { id: newId, icon: Sparkle, title: newTitle.trim(), description: newDesc.trim() }]);
            setSelectedGroup(newId);
            setModalVisible(false);
            setNewTitle('');
            setNewDesc('');
        }
    };

    const handleCancelGroup = () => {
        setModalVisible(false);
        setNewTitle('');
        setNewDesc('');
    };

    return (
        <View className="flex-1 bg-transparent pt-10">
            <SafeAreaView className="flex-1">
                <View className="px-2 pt-4 mb-2 flex-row justify-between items-center gap-2">
                    <View className="pl-2">
                        <MoovyLogo width={32} height={32} color="#FFFFFF" />
                    </View>
                    <View className='flex-row items-center gap-x-2'>
                        <TouchableOpacity
                            onPress={() => router.push('/session-create')}
                            className="rounded-full bg-white/[0.1] flex-row gap-x-1 items-center justify-center py-1 px-2"
                        >
                            <Plus color={ACCENT} size={16} strokeWidth={2.5} />
                            <Text className="font-outfit-bold text-[14px] uppercase tracking-[2px] mt-0.5 mr-1">
                                Create session
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/session-join')}
                            className="rounded-full bg-white/[0.1] flex-row gap-x-1 items-center justify-center py-1 px-2"
                        >
                            <Handshake color={ACCENT} size={16} strokeWidth={2} />
                            <Text className="font-outfit-bold text-[14px] uppercase tracking-[2px] mt-0.5 mr-1">
                                Join
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Colored vibe indicators bar */}
                <View style={{ height: 3, flexDirection: 'row' }}>
                    {getVibeBarSegments(vibeMethod === 'moodboard' ? paletteVibes : genres.liked).map((seg, idx) => (
                        <View
                            key={idx}
                            style={{
                                flex: 1,
                                height: 2,
                                backgroundColor: seg.color,
                                opacity: seg.opacity,
                            }}
                        />
                    ))}
                </View>

                <ScrollView contentContainerClassName="px-2 pb-[120px] pt-2.5" showsVerticalScrollIndicator={false} scrollEnabled={scrollEnabled}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200, duration: 600 }}
                        className="flex flex-col gap-3"
                    >
                        <CollapsibleSection
                            title="Select group"
                            value={groups.find(g => g.id === selectedGroup)?.title || '-'}
                            icon={UsersRound}
                            defaultOpen={false}
                            rightIcon={<Plus size={16} color={ACCENT} />}
                            onRightIconPress={() => setModalVisible(true)}
                        >
                            <GroupSelector
                                items={groups}
                                selectedId={selectedGroup}
                                onSelect={setSelectedGroup}
                            />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Select vibe"
                            value={vibeMethod === 'moodboard' ? (moodLabel || '-') : (genres.liked.length + genres.disliked.length)}
                            icon={Film}
                            defaultOpen={true}
                        >
                            <View className="flex-col gap-3 mt-2">
                                {/* Mode Switcher Tabs (Full Width) */}
                                <View className="flex-row bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
                                    <TouchableOpacity
                                        onPress={() => setVibeMethod('moodboard')}
                                        className={`flex-1 py-2 px-3 rounded-xl items-center justify-center border transition-all ${vibeMethod === 'moodboard'
                                            ? 'bg-accent border-accent'
                                            : 'bg-transparent border-transparent opacity-60'
                                            }`}
                                    >
                                        <Text className={`font-outfit-bold text-[11px] tracking-[1px] uppercase ${vibeMethod === 'moodboard' ? 'text-black' : 'text-white'
                                            }`}>
                                            Moodboard
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setVibeMethod('tags')}
                                        className={`flex-1 py-2 px-3 rounded-xl items-center justify-center border transition-all ${vibeMethod === 'tags'
                                            ? 'bg-accent border-accent'
                                            : 'bg-transparent border-transparent opacity-60'
                                            }`}
                                    >
                                        <Text className={`font-outfit-bold text-[11px] tracking-[1px] uppercase ${vibeMethod === 'tags' ? 'text-black' : 'text-white'
                                            }`}>
                                            Tag Selection
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Full Width Selection Content */}
                                {vibeMethod === 'tags' ? (
                                    <GenreSelection
                                        liked={genres.liked}
                                        disliked={genres.disliked}
                                        onToggleVibe={toggleGenre}
                                        label1="Include"
                                        label2="Exclude"
                                    />
                                ) : (
                                    <View className="gap-3">
                                        <Moodboard
                                            hideDetails={true}
                                            onMoodSelected={handleMoodSelected}
                                            onTouchStart={() => setScrollEnabled(false)}
                                            onTouchEnd={() => setScrollEnabled(true)}
                                        />

                                        {/* Selected Vibe Info Display (Full Width Below Palette) */}
                                        {(() => {
                                            const activeTerritory = TAG_TERRITORIES.find(t => t.label === moodLabel || t.vibe === paletteVibes[0]);
                                            if (activeTerritory || paletteVibes.length > 0) {
                                                const displayColor = activeTerritory?.color || ACCENT;
                                                const IconComponent = activeTerritory?.icon || Sparkles;
                                                return (
                                                    <MotiView
                                                        key={activeTerritory?.id || 'palette-active'}
                                                        from={{ opacity: 0, translateY: 6 }}
                                                        animate={{ opacity: 1, translateY: 0 }}
                                                        className="bg-white/[0.04] border border-white/[0.08] p-3.5 rounded-2xl gap-y-2"
                                                    >
                                                        <View className="flex-row items-center justify-between">
                                                            <View className="flex-row items-center gap-2">
                                                                <View
                                                                    style={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        borderRadius: 16,
                                                                        backgroundColor: displayColor + '20',
                                                                        borderWidth: 1,
                                                                        borderColor: displayColor + '40',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}
                                                                >
                                                                    <IconComponent color={displayColor} size={15} strokeWidth={2} />
                                                                </View>
                                                                <Text className="font-outfit-bold text-[14px] text-white uppercase tracking-wider">
                                                                    {activeTerritory?.label || moodLabel || 'Palette Vibe'}
                                                                </Text>
                                                            </View>

                                                            {activeTerritory && (
                                                                <Text style={{ color: ACCENT }} className="font-outfit text-[11px] font-outfit-semi">
                                                                    {activeTerritory.description}
                                                                </Text>
                                                            )}
                                                        </View>

                                                        <View className="flex-row flex-wrap gap-1.5 pt-1.5 border-t border-white/[0.06]">
                                                            {paletteVibes.map(v => (
                                                                <VibeBadge key={v} vibe={v} />
                                                            ))}
                                                        </View>
                                                    </MotiView>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </View>
                                )}
                            </View>
                        </CollapsibleSection>
                        <CollapsibleSection
                            title="Settings"
                            icon={Cog}
                            defaultOpen={true}
                        >
                            <View className="flex-col gap-1">
                                {settings.map((setting, i) =>
                                    <TouchableOpacity
                                        key={setting.title}
                                        className={`${FillStyles.pillBase} ${setting.value ? FillStyles.pillActive : FillStyles.pillInactive} flex-row items-center justify-between gap-x-1 min-h-10 ${i === 0 ? FillStyles.pillFirst : ''} ${i === settings.length - 1 ? FillStyles.pillLast : ''}`}
                                        onPress={() => {
                                            if (typeof setting.value === 'boolean') {
                                                setSettingValue(setting.title, !setting.value)
                                            }
                                        }}
                                        disabled={typeof setting.value !== 'boolean'}
                                    >
                                        <View className="flex-row items-center gap-x-2.5">
                                            <setting.icon size={18} fill={setting.value && typeof setting.value === 'boolean' ? ACCENT : "transparent"} color={setting.value ? ACCENT : "#707080"} />
                                            <Text className={`font-outfit text-[13px]`}>{setting.title}</Text>
                                        </View>
                                        {typeof setting.value === 'boolean' ? (
                                            <Text style={setting.value ? { color: ACCENT } : {}} className={`font-outfit uppercase tracking-wider text-[11px] ${setting.value ? 'font-outfit-semi' : 'opacity-40'}`}>{setting.value ? 'Allow' : 'Disallow'}</Text>
                                        ) : (
                                            <View className="flex-row items-center gap-x-1 justify-end flex-1 pl-4">
                                                <Slider
                                                    style={{ flex: 1, minWidth: 100, height: 30 }}
                                                    minimumValue={60}
                                                    maximumValue={240}
                                                    step={10}
                                                    value={setting.value as number}
                                                    onValueChange={(val) => setSettingValue(setting.title, val)}
                                                    minimumTrackTintColor={ACCENT}
                                                    maximumTrackTintColor="#ffffff15"
                                                    thumbTintColor={ACCENT}
                                                />
                                                <Text className="font-outfit text-[12px] w-14 text-right opacity-60">{setting.value} min</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </CollapsibleSection>

                        <Animated.View layout={LinearTransition}>
                            <View className="flex-col items-stretch gap-4 mb-10 z-50">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    className="w-full rounded-2xl overflow-hidden shadow-xl"
                                    onPress={handleFindMovie}
                                >
                                    <LinearGradient
                                        colors={['#60D394', '#4ade80', '#38bdf8']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                                    >
                                        <Sparkles color="#000" size={18} strokeWidth={2.5} />
                                        <Text className="font-outfit-bold text-[13px] text-black uppercase tracking-[2.5px]">Find Matching Movies</Text>
                                        <ArrowRight color="#000" size={18} strokeWidth={2.5} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        {/* <Animated.View layout={LinearTransition}>
                            <View className="mt-2">
                                <Text className="font-outfit text-[11px] uppercase tracking-[3px] opacity-40 mb-4">Poprzednie pomysły</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-6" decelerationRate="fast" snapToInterval={126}>
                                    {posters.map((url, i) => (
                                        <MotiView
                                            key={i}
                                            from={{ opacity: 0, translateX: 50 }}
                                            animate={{ opacity: 1, translateX: 0 }}
                                            transition={{ delay: 800 + i * 150, type: 'timing', duration: 500 }}
                                        >
                                            <Image source={{ uri: url }} className="w-[110px] h-[160px] rounded-2xl bg-white/[0.03]" />
                                        </MotiView>
                                    ))}
                                </ScrollView>
                            </View>
                        </Animated.View> */}

                    </MotiView>
                </ScrollView>
            </SafeAreaView>

            <Modal visible={modalVisible} transparent animationType="fade">
                <View className='bg-black/80' style={StyleSheet.absoluteFill}>
                    <View className="flex-1 justify-center items-center px-6">
                        <Text className="font-outfit-bold text-2xl mb-5">Add new group</Text>

                        <TextInput
                            className={`${FillStyles.inputLarge} mb-3 w-2/3`}
                            placeholder="Title (e.g., Work friends)"
                            placeholderTextColor="#ffffff30"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />

                        <TextInput
                            className={`${FillStyles.inputLarge} mb-6 w-2/3`}
                            placeholder="Short description"
                            placeholderTextColor="#ffffff30"
                            value={newDesc}
                            onChangeText={setNewDesc}
                        />

                        <View className="flex-row justify-end gap-3">
                            <TouchableOpacity onPress={handleCancelGroup} className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnSecondary}`}>
                                <Text className="font-outfit opacity-60">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddGroup} className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary}`}>
                                <Text className="font-outfit-semi text-black">Add group</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
