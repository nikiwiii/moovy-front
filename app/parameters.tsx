import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Check, Clock, Film, Handshake, Heart, LucideIcon, Palette, Plus, ScanEye, Cog, Sparkle, Sparkles, UserRound, UsersRound, Tag, EllipsisVertical } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn, LinearTransition, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import CollapsibleSection from '../components/CollapsibleSection';
import GenreSelection from '../components/GenreSelection';
import GroupSelector from '../components/GroupSelector';
import TouchableOpacity from '../components/TouchableOpacity';
import MoodPalette, { MOOD_ZONES } from '../components/MoodPalette';
import { FillStyles } from '../constants/themeStyles';
import { Colors } from '@/constants/theme';
import { APP_NAME } from '../constants/app';

const ACCENT = Colors.dark.accent;


const posters = [
    'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg',
    'https://image.tmdb.org/t/p/w500/yF1eOkaYvwiORauRCPWznV9xVvi.jpg',
    'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
];

interface Group {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
}

export default function ParametersScreen() {
    const router = useRouter();
    const [selectedGroup, setSelectedGroup] = useState<string | null>('solo');
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const [vibeMethod, setVibeMethod] = useState<'tags' | 'palette'>('palette');

    const [groups, setGroups] = useState<Group[]>([
        { id: 'solo', icon: UserRound, title: 'Solo', description: 'movies for you, just you and your preferences' },
        { id: 'tlum', icon: UsersRound, title: 'Crowd', description: 'engaging movies, great for matching different tastes' },
        { id: 'randewu', icon: Heart, title: 'Rendezvous', description: 'engaging, touching movies' }
    ]);
    const [settings, setSettings] = useState([
        { icon: Heart, title: "Use profile preferences", value: true },
        { icon: ScanEye, title: "Watched movies", value: false },
        { icon: Clock, title: "Max runtime", value: 240 },
    ])

    const setSettingValue = (title: string, value: boolean | number) => {
        setSettings(prev => prev.map(setting => setting.title === title ? { ...setting, value } : setting));
    }

    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const [genres, setGenres] = useState({ liked: [] as string[], disliked: [] as string[] });
    const [moodLabel, setMoodLabel] = useState<string | null>(null);

    const handleMoodSelected = (vibes: string[], label: string) => {
        setMoodLabel(label);
        setGenres(prev => ({
            ...prev,
            liked: vibes
        }));
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
                        vibes: genres.liked,
                        hard_nos: genres.disliked,
                        max_runtime: settings.find(s => s.title === "Max runtime")?.value || 120,
                        allow_seen: settings.find(s => s.title === "Watched movies")?.value || false,
                        eras: []
                    }
                }
            ],
            final_preferences: {
                vibes: genres.liked,
                hard_nos: genres.disliked,
                max_runtime: settings.find(s => s.title === "Max runtime")?.value || 120,
                allow_seen: settings.find(s => s.title === "Watched movies")?.value || false,
                eras: []
            }
        };

        const criteriaData = {
            preset: groups.find(g => g.id === selectedGroup)?.title || "Crowd",
            genres: genres.liked,
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
                <View className="px-2 pt-4 mb-4 flex-row justify-between items-center gap-2">
                    <Text className="font-outfit-bold text-[24px] tracking-tighter pl-4">{APP_NAME}®</Text>

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

                <ScrollView contentContainerClassName="px-2 pb-[120px]" showsVerticalScrollIndicator={false} scrollEnabled={scrollEnabled}>
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
                            value={vibeMethod === 'palette' ? (moodLabel || '-') : (genres.liked.length + genres.disliked.length)}
                            icon={Film}
                            defaultOpen={true}
                        >
                            <Animated.View layout={LinearTransition} className="flex-row w-full mt-2">
                                {/* Left Column: The selector view */}
                                <Animated.View layout={LinearTransition} className="flex-[1.5] justify-start">
                                    {vibeMethod === 'tags' ? (
                                        <GenreSelection
                                            liked={genres.liked}
                                            disliked={genres.disliked}
                                            onToggleVibe={toggleGenre}
                                            label1="Include"
                                            label2="Exclude"
                                        />
                                    ) : (
                                        <MoodPalette
                                            hideDetails={true}
                                            onMoodSelected={handleMoodSelected}
                                            onTouchStart={() => setScrollEnabled(false)}
                                            onTouchEnd={() => setScrollEnabled(true)}
                                        />
                                    )}
                                </Animated.View>

                                {/* Right Column: Details & Mode selector stacked vertically */}
                                <Animated.View layout={LinearTransition} className="flex-[1] flex-col justify-between pl-3">
                                    {/* Top: Info display */}
                                    <Animated.View layout={LinearTransition}>
                                        {vibeMethod === 'palette' ? (() => {
                                            const activeZone = MOOD_ZONES.find(zone => zone.label === moodLabel);
                                            if (activeZone) {
                                                return (
                                                    <MotiView
                                                        key={activeZone.id}
                                                        from={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="mb-4"
                                                    >
                                                        <View className="flex-row items-center gap-2 mb-2.5">
                                                            <View
                                                                style={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: 16,
                                                                    backgroundColor: activeZone.color + '20',
                                                                    borderWidth: 1,
                                                                    borderColor: activeZone.color + '40',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                <activeZone.icon color={activeZone.color} size={15} strokeWidth={2} />
                                                            </View>
                                                            <Text className="font-outfit-bold text-[13px] text-white uppercase tracking-wider">
                                                                {activeZone.label}
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row flex-wrap gap-1">
                                                            {activeZone.vibes.map(v => (
                                                                <View key={v} className="bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-[6px]">
                                                                    <Text className="font-outfit text-[9px] text-white/50 uppercase tracking-[1px]">
                                                                        {v.replace('_', ' ').toLowerCase()}
                                                                    </Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    </MotiView>
                                                );
                                            }
                                            return (
                                                <View className="mb-4">
                                                    <View className="flex-row items-center gap-1 mb-2">
                                                        <EllipsisVertical color="#ffffff" size={16} opacity={0.4} />
                                                        <Text className="font-outfit-bold text-[13px] text-white/40 uppercase tracking-wider">
                                                            no vibe chosen
                                                        </Text>
                                                    </View>
                                                    <Text className="font-outfit text-[12px] text-white/30">
                                                        Here the vibe tags will show
                                                    </Text>
                                                </View>
                                            );
                                        })() : (
                                            <View className="mb-4">
                                                <View className="flex-row items-center gap-2 mb-2.5">
                                                    <View style={{ width: 32, height: 32 }} className="rounded-full bg-accent/10 border border-accent/30 items-center justify-center">
                                                        <Tag color={ACCENT} size={15} strokeWidth={2} />
                                                    </View>
                                                    <Text className="font-outfit-bold text-[13px] text-white uppercase tracking-wider">
                                                        Custom Vibe
                                                    </Text>
                                                </View>
                                                <View className="flex-row flex-wrap gap-1">
                                                    {genres.liked.length > 0 ? (
                                                        genres.liked.slice(0, 3).map(g => (
                                                            <View key={g} className="bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-[6px]">
                                                                <Text className="font-outfit text-[9px] text-white/50 uppercase tracking-[1px]">
                                                                    {g.replace('_', ' ').toLowerCase()}
                                                                </Text>
                                                            </View>
                                                        ))
                                                    ) : (
                                                        <Text className="font-outfit text-[12px] text-white/30">
                                                            No tags selected
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        )}
                                    </Animated.View>

                                    {/* Bottom: vertical stacked buttons */}
                                    <Animated.View layout={LinearTransition} className="flex-col gap-1 mt-auto">
                                        <TouchableOpacity
                                            onPress={() => setVibeMethod('palette')}
                                            className={`py-2 px-3 rounded-[14px] items-center justify-center border ${vibeMethod === 'palette'
                                                ? 'bg-accent border-accent'
                                                : 'bg-white/[0.03] border-white/[0.08] opacity-50'
                                                }`}
                                        >
                                            <Text className={`font-outfit-bold text-[10px] tracking-[1px] uppercase ${vibeMethod === 'palette' ? 'text-black' : 'text-white/70'
                                                }`}>
                                                Mood Palette
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => setVibeMethod('tags')}
                                            className={`py-2 px-3 rounded-[14px] items-center justify-center border ${vibeMethod === 'tags'
                                                ? 'bg-accent border-accent'
                                                : 'bg-white/[0.03] border-white/[0.08] opacity-50'
                                                }`}
                                        >
                                            <Text className={`font-outfit-bold text-[10px] tracking-[1px] uppercase ${vibeMethod === 'tags' ? 'text-black' : 'text-white/70'
                                                }`}>
                                                Tag Selection
                                            </Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                </Animated.View>
                            </Animated.View>
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
                            <View className="flex-col items-end gap-4 mb-10 z-50">
                                <TouchableOpacity
                                    className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} bg-accent`}
                                    onPress={handleFindMovie}
                                >
                                    <Text className="font-outfit-semi text-[15px] text-black">Find Movie</Text>
                                    <Check color="#000" size={18} strokeWidth={2.5} />
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
