import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Check, Clock, Film, Handshake, Heart, LucideIcon, Plus, ScanEye, Cog, Sparkle, Sparkles, UserRound, UsersRound } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn, LinearTransition, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import CollapsibleSection from '../components/CollapsibleSection';
import GenreSelection from '../components/GenreSelection';
import GroupSelector from '../components/GroupSelector';
import TouchableOpacity from '../components/TouchableOpacity';
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
                <View className="px-8 pt-4 mb-4 flex-row justify-between items-center">
                    <MotiView
                        from={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 300 }}
                    >
                        <Text className="font-outfit-bold text-[24px] tracking-tighter">{APP_NAME}®</Text>
                    </MotiView>
                </View>

                <ScrollView contentContainerClassName="px-4 pb-[120px]" showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200, duration: 600 }}
                        className="flex flex-col gap-3"
                    >
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => router.push('/session-create')}
                                className="flex-1 rounded-full bg-white/[0.1] flex-row gap-x-2 items-center justify-center py-5 px-4"
                            >
                                <Plus color={ACCENT} size={22} strokeWidth={2.5} />
                                <Text className="font-outfit-bold text-[14px] uppercase tracking-[2px] mt-0.5 mr-3">
                                    Create session
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/session-join')}
                                className="flex-2 rounded-full bg-white/[0.1] aspect-square flex-row items-center justify-center"
                            >
                                <Handshake color={ACCENT} size={22} strokeWidth={2} />
                            </TouchableOpacity>
                        </View>
                        <CollapsibleSection
                            title="Select group"
                            subtitle="For whom?"
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
                            subtitle="Categories"
                            value={genres.liked.length + genres.disliked.length}
                            icon={Film}
                            defaultOpen={false}
                        >
                            <GenreSelection
                                liked={genres.liked}
                                disliked={genres.disliked}
                                onToggleVibe={toggleGenre}
                                label1="Include"
                                label2="Exclude"
                            />
                        </CollapsibleSection>
                        <CollapsibleSection
                            title="Settings"
                            subtitle="final touches"
                            icon={Cog}
                            defaultOpen={true}
                        >
                            <View className="flex-col gap-2">
                                {settings.map((setting, i) =>
                                    <TouchableOpacity
                                        key={setting.title}
                                        className={`${FillStyles.pillBase} ${setting.value ? FillStyles.pillActive : FillStyles.pillInactive} flex-row items-center justify-between gap-x-1 min-h-14 ${i === 0 ? FillStyles.pillFirst : ''} ${i === settings.length - 1 ? FillStyles.pillLast : ''}`}
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
                                                    style={{ flex: 1, minWidth: 100, height: 40 }}
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
