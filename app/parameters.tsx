import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Check, Clock, Film, Handshake, Heart, LucideIcon, Plus, ScanEye, Settings, Sparkle, Sparkles, Users } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, TextInput, View, ActivityIndicator } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import CollapsibleSection from '../components/CollapsibleSection';
import GenreSelection from '../components/GenreSelection';
import TouchableOpacity from '../components/TouchableOpacity';
import { FillStyles } from '../constants/themeStyles';
import { storageService } from '../services/storageService';
import { Colors } from '@/constants/theme';

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
    const [selectedGroup, setSelectedGroup] = useState<string | null>('tlum');
    const [groups, setGroups] = useState<Group[]>([
        { id: 'tlum', icon: Users, title: 'Tłum', description: 'nienudne filmy, skuteczne przy wielu gustach' },
        { id: 'randewu', icon: Heart, title: 'Randewu', description: 'angażujące, wzruszające kino' }
    ]);
    const [settings, setSettings] = useState([
        { icon: ScanEye, title: "Filmy które widziałeś", value: false },
        { icon: Clock, title: "Długość", value: 120 },
        { icon: Heart, title: "Używaj preferencji profilu", value: false },
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

    const [isLoading, setIsLoading] = useState(false);

    const handleFindMovie = async () => {
        setIsLoading(true);
        try {
            const payload = {
                host_id: "00000000-0000-0000-0000-000000000000",
                invite_code: "12345",
                meeting_type: selectedGroup === 'randewu' ? 'RANDKA' : 'EKIPA',
                is_active: true,
                users: [
                    {
                        user_id: "00000000-0000-0000-0000-000000000000",
                        user_name: 'Gość',
                        personal_vibe: {
                            vibes: genres.liked,
                            hard_nos: genres.disliked,
                            max_runtime: settings.find(s => s.title === "Długość")?.value || 120,
                            allow_seen: settings.find(s => s.title === "Filmy które widziałeś")?.value || false,
                            eras: []
                        }
                    }
                ],
                final_preferences: {
                    vibes: genres.liked,
                    hard_nos: genres.disliked,
                    max_runtime: settings.find(s => s.title === "Długość")?.value || 120,
                    allow_seen: settings.find(s => s.title === "Filmy które widziałeś")?.value || false,
                    eras: []
                }
            };
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.1:8000'; // Fallback
            const token = await storageService.getToken();

            const res = await fetch(`${API_URL}/recommendation/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                console.error("Error fetching recommendation:", res.status);
                setIsLoading(false);
                return;
            }
            const sessionData = await res.json();
            const sessionId = sessionData.session_id;

            // KROK 2: Pobranie właściwej rekomendacji AI
            const recRes = await fetch(`${API_URL}/recommendation/${sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!recRes.ok) {
                console.error("Error fetching actual recommendation:", recRes.status);
                setIsLoading(false);
                if (recRes.status === 404) {
                    const errorData = await recRes.json().catch(() => ({}));
                    import('react-native').then(({ Alert }) => {
                        Alert.alert("Brak filmów", errorData.detail || "Nie znaleziono filmów spełniających Twoje kryteria. Spróbuj zwiększyć dozwolony czas trwania (Długość).");
                    });
                }
                return;
            }

            const finalRecommendation = await recRes.json();

            router.push({
                pathname: '/idea',
                params: {
                    recommendationData: JSON.stringify(finalRecommendation),
                    criteriaData: JSON.stringify({
                        preset: groups.find(g => g.id === selectedGroup)?.title || "Tłum",
                        genres: genres.liked,
                        duration: `${settings.find(s => s.title === "Długość")?.value} min`,
                        friendsAdded: 0
                    })
                }
            });
        } catch (error) {
            console.error("Failed to find movie", error);
        } finally {
            setIsLoading(false);
        }
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

                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-6 pt-5 pb-3 flex-row justify-between items-center"
                >
                    <View className="flex-row items-center gap-2">
                        <Text className="font-outfit-bold text-[22px]">MN</Text>
                    </View>
                </MotiView>

                <ScrollView contentContainerClassName="px-4 pb-[120px]" showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200, duration: 600 }}
                        className="flex flex-col gap-3"
                    >
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => router.push('/session-create')}
                                className="flex-1 overflow-hidden rounded-[28px]"
                            >
                                <BlurView intensity={20} tint="light" className="flex-row gap-x-3 items-center justify-center py-5 px-4 border border-white/[0.08] bg-white/[0.04]">
                                    <Handshake color={ACCENT} size={22} strokeWidth={2} />
                                    <Text className="font-outfit-bold text-[14px] uppercase tracking-[2px]">
                                        Utwórz sesję
                                    </Text>
                                </BlurView>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push('/session-join')}
                                className="overflow-hidden rounded-[28px]"
                            >
                                <BlurView intensity={20} tint="light" style={{ borderColor: `${ACCENT}33`, backgroundColor: `${ACCENT}10` }} className="flex-row gap-x-3 items-center justify-center py-5 px-5 border">
                                    <Plus color={ACCENT} size={20} strokeWidth={2.5} />
                                </BlurView>
                            </TouchableOpacity>
                        </View>
                        <CollapsibleSection
                            title="Wybierz grono"
                            subtitle="Dla kogo?"
                            value={groups.find(g => g.id === selectedGroup)?.title || '-'}
                            icon={Users}
                            defaultOpen={true}
                            rightIcon={<Plus size={16} color={ACCENT} />}
                            onRightIconPress={() => setModalVisible(true)}
                        >
                            <Animated.View layout={LinearTransition} className="gap-2">
                                {groups.map((group, i) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        className={`${FillStyles.pillBase} ${selectedGroup === group.id ? FillStyles.pillActive : FillStyles.pillInactive} py-3.5 px-4 ${i === 0 ? FillStyles.pillFirst : ''} ${i === groups.length - 1 ? FillStyles.pillLast : ''} flex-row gap-4`}
                                        onPress={() => setSelectedGroup(group.id)}
                                    >
                                        <View className="flex-row items-center gap-2">
                                            <group.icon color={selectedGroup === group.id ? ACCENT : "#707080"} size={18} strokeWidth={2} fill={selectedGroup === group.id ? ACCENT : "transparent"} />
                                        </View>
                                        <View>
                                            <Text className="font-outfit-semi text-[15px]">{group.title}</Text>
                                            <Text className="font-outfit text-[13px] opacity-40">{group.description}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </Animated.View>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Wybierz vibe"
                            subtitle="Kategorie"
                            value={genres.liked.length + genres.disliked.length}
                            icon={Film}
                            defaultOpen={false}
                        >
                            <GenreSelection
                                liked={genres.liked}
                                disliked={genres.disliked}
                                onToggleVibe={toggleGenre}
                                label1="Uwzględniaj"
                                label2="Wyklucz"
                            />
                        </CollapsibleSection>
                        <CollapsibleSection
                            title="Ustawienia"
                            subtitle="Dostosuj preferencje"
                            icon={Settings}
                            defaultOpen={false}
                        >
                            <View className="flex-col gap-2">
                                {settings.map((setting, i) =>
                                    <TouchableOpacity
                                        key={setting.title}
                                        className={`${FillStyles.pillBase} ${setting.value ? FillStyles.pillActive : FillStyles.pillInactive} flex-row items-center justify-between gap-x-2 min-h-14 ${i === 0 ? FillStyles.pillFirst : ''} ${i === settings.length - 1 ? FillStyles.pillLast : ''}`}
                                        onPress={() => {
                                            if (typeof setting.value === 'boolean') {
                                                setSettingValue(setting.title, !setting.value)
                                            }
                                        }}
                                        disabled={typeof setting.value !== 'boolean'}
                                    >
                                        <View className="flex-row items-center gap-x-2">
                                            <setting.icon size={16} fill={setting.value && typeof setting.value === 'boolean' ? ACCENT : "transparent"} color={setting.value && typeof setting.value === 'boolean' ? ACCENT : "#707080"} />
                                            <Text className={`font-outfit text-[13px]`}>{setting.title}</Text>
                                        </View>
                                        {typeof setting.value === 'boolean' ? (
                                            <Text style={setting.value ? { color: ACCENT } : {}} className={`font-outfit uppercase tracking-wider text-[11px] ${setting.value ? 'font-outfit-semi' : 'opacity-40'}`}>{setting.value ? 'Zezwalaj' : 'Nie zezwalaj'}</Text>
                                        ) : (
                                            <View className="flex-row items-center gap-x-2 justify-end flex-1 pl-4">
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
                            <TextInput
                                className={`${FillStyles.inputLarge} mb-4`}
                                placeholder="Specjalne wymagania..."
                                placeholderTextColor="#ffffff30"
                            />

                            <View className="flex-col items-end gap-4 mb-10 z-50">
                                <TouchableOpacity
                                    className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} bg-accent`}
                                    onPress={handleFindMovie}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#000" size="small" />
                                    ) : (
                                        <>
                                            <Text className="font-outfit-semi text-[15px] text-black">Znajdź film</Text>
                                            <Check color="#000" size={18} strokeWidth={2.5} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        <Animated.View layout={LinearTransition}>
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
                        </Animated.View>

                    </MotiView>
                </ScrollView>
            </SafeAreaView>

            <Modal visible={modalVisible} transparent animationType="fade">
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
                    <View className="flex-1 justify-center items-center px-6">
                        <Animated.View entering={FadeIn} className="w-full bg-[#0d0b1a]/95 border border-white/[0.08] rounded-[28px] p-6 overflow-hidden">
                            <Text className="font-outfit-bold text-xl mb-5">Dodaj nowe grono</Text>

                            <TextInput
                                className={`${FillStyles.inputLarge} mb-3`}
                                placeholder="Tytuł (np. Znajomi z pracy)"
                                placeholderTextColor="#ffffff30"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />

                            <TextInput
                                className={`${FillStyles.inputLarge} mb-6`}
                                placeholder="Krótki opis"
                                placeholderTextColor="#ffffff30"
                                value={newDesc}
                                onChangeText={setNewDesc}
                            />

                            <View className="flex-row justify-end gap-3">
                                <TouchableOpacity onPress={handleCancelGroup} className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnSecondary}`}>
                                    <Text className="font-outfit opacity-60">Anuluj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleAddGroup} className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary}`}>
                                    <Text className="font-outfit-semi text-black">Dodaj grono</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}
