import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Check, Clock, Film, Heart, LucideIcon, Plus, ScanEye, Settings, Sparkle, Users } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';
import CollapsibleSection from '../components/CollapsibleSection';
import Navbar from '../components/Navbar';
import TouchableOpacity from '../components/TouchableOpacity';
import { FillStyles } from '../constants/themeStyles';

const defaultGenres = [
    'Sci-fi', 'Akcja', 'Dramat', 'Przygodowy',
    'Horror', 'Thriller', 'Animacja', 'Familijny',
    'Fantasy', 'Komedia', 'Kryminał', '18+'
];

const posters = [
    'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg', // Lord of the rings
    'https://image.tmdb.org/t/p/w500/yF1eOkaYvwiORauRCPWznV9xVvi.jpg', // Action movie
    'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
    'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // Dark Knight
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
    //checklist ustawień
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

    const [selectedMixGenres, setSelectedMixGenres] = useState<string[]>([]);

    const toggleMixGenre = (genre: string) => {
        if (selectedMixGenres.includes(genre)) {
            setSelectedMixGenres(prev => prev.filter(g => g !== genre));
        } else {
            setSelectedMixGenres(prev => [...prev, genre]);
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
        <View className="flex-1 bg-background pt-10">
            <AnimatedBackground />
            <SafeAreaView className="flex-1">
                <Navbar />

                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-6 pt-5 pb-5 flex-row justify-between items-center"
                >
                    <Text className="font-outfit-bold text-[24px] text-white">MN</Text>
                </MotiView>

                <ScrollView contentContainerClassName="px-4 pb-[120px]" showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200, duration: 600 }}
                        className="flex flex-col gap-2"
                    >
                        <CollapsibleSection
                            title="Wybierz grono"
                            subtitle="Dla kogo?"
                            value={groups.find(g => g.id === selectedGroup)?.title || '-'}
                            icon={Users}
                            defaultOpen={true}
                            rightIcon={<Plus size={18} />}
                            onRightIconPress={() => setModalVisible(true)}
                        >
                            <Animated.View layout={LinearTransition} className="gap-2">
                                {groups.map((group, i) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        className={`${FillStyles.pillBase} ${selectedGroup === group.id ? FillStyles.pillActive : FillStyles.pillInactive} py-3 px-4 ${i === 0 ? FillStyles.pillFirst : ''} ${i === groups.length - 1 ? FillStyles.pillLast : ''} flex-row gap-4`}
                                        onPress={() => setSelectedGroup(group.id)}
                                    >
                                        <View className="flex-row items-center gap-2">
                                            {selectedGroup === group.id ? <group.icon size={18} fill="currentColor" /> : <group.icon size={18} />}
                                        </View>
                                        <View>
                                            <Text className="font-outfit uppercase text-[16px] opacity-70">{group.title}</Text>
                                            <Text className="font-outfit text-[14px]">{group.description}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </Animated.View>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Wybierz gatunki"
                            subtitle="Kategorie"
                            value={selectedMixGenres.length}
                            icon={Film}
                            defaultOpen={false}
                        >
                            <View className="flex-row flex-wrap gap-2">
                                {defaultGenres.map(genre => {
                                    const isSelected = selectedMixGenres.includes(genre);
                                    return (
                                        <TouchableOpacity
                                            key={genre}
                                            className={`${FillStyles.pillBase} ${isSelected ? FillStyles.pillActive : FillStyles.pillInactive}`}
                                            onPress={() => toggleMixGenre(genre)}
                                        >
                                            <Text className={`font-outfit text-[13px]`}>{genre}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
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
                                        className={`${FillStyles.pillBase} ${setting.value ? FillStyles.pillActive : FillStyles.pillInactive} flex-row items-center justify-between gap-x-2 min-h-16 ${i === 0 ? FillStyles.pillFirst : ''} ${i === settings.length - 1 ? FillStyles.pillLast : ''}`}
                                        onPress={() => {
                                            if (typeof setting.value === 'boolean') {
                                                setSettingValue(setting.title, !setting.value)
                                            }
                                        }}
                                        disabled={typeof setting.value !== 'boolean'}
                                    >
                                        <View className="flex-row items-center gap-x-2">
                                            {setting.value && typeof setting.value === 'boolean' ? <setting.icon size={18} fill="currentColor" /> : <setting.icon size={18} />}
                                            <Text className={`font-outfit text-[13px]`}>{setting.title}</Text>
                                        </View>
                                        {typeof setting.value === 'boolean' ? (
                                            <Text className={`font-outfit uppercase tracking-wider opacity-70 text-[13px] ${setting.value ? 'font-outfit-bold' : ''}`}>{setting.value ? 'Zezwalaj' : 'Nie zezwalaj'}</Text>
                                        ) : (
                                            <View className="flex-row items-center gap-x-2 justify-end flex-1 pl-4">
                                                <Slider
                                                    style={{ flex: 1, minWidth: 100, height: 40 }}
                                                    minimumValue={60}
                                                    maximumValue={240}
                                                    step={10}
                                                    value={setting.value as number}
                                                    onValueChange={(val) => setSettingValue(setting.title, val)}
                                                    minimumTrackTintColor="#FFFFFF"
                                                    maximumTrackTintColor="#ffffff50"
                                                    thumbTintColor="#FFFFFF"
                                                />
                                                <Text className="font-outfit text-[13px] w-14 text-right">{setting.value} min</Text>
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
                            />

                            <View className="flex-col items-end gap-4 mb-10 z-50">
                                <TouchableOpacity className="flex-row gap-x-2 items-center bg-white py-3.5 px-6 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.3)] elevation-5"
                                    onPress={() => router.push('/idea')}>
                                    <Check color="#000" size={20} strokeWidth={2} className="mr-2" />
                                    <Text className="font-outfit-semi text-[16px] text-black">Znajdź film</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        <Animated.View layout={LinearTransition}>
                            <View className="mt-2.5">
                                <Text className="font-outfit-semi text-[16px] text-white">Poprzednie pomysły</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 mt-4 pr-6" decelerationRate="fast" snapToInterval={126}>
                                    {posters.map((url, i) => (
                                        <MotiView
                                            key={i}
                                            from={{ opacity: 0, translateX: 50 }}
                                            animate={{ opacity: 1, translateX: 0 }}
                                            transition={{ delay: 800 + i * 150, type: 'timing', duration: 500 }}
                                        >
                                            <Image source={{ uri: url }} className="w-[110px] h-[160px] rounded-xl bg-[#222]" />
                                        </MotiView>
                                    ))}
                                </ScrollView>
                            </View>
                        </Animated.View>

                    </MotiView>
                </ScrollView>
            </SafeAreaView>

            <Modal visible={modalVisible} transparent animationType="fade">
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                    <View className="flex-1 justify-center items-center px-6">
                        <Animated.View entering={FadeIn} className="w-full bg-[#14141e]/90 border border-white/10 rounded-[28px] p-6 overflow-hidden">
                            <Text className="font-outfit-bold text-xl text-white mb-4">Dodaj nowe grono</Text>

                            <TextInput
                                className="bg-black/40 border border-white/5 rounded-xl px-4 h-[44px] text-white font-outfit mb-3"
                                placeholder="Tytuł (np. Znajomi z pracy)"
                                placeholderTextColor="#666"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />

                            <TextInput
                                className="bg-black/40 border border-white/5 rounded-xl px-4 h-[44px] text-white font-outfit mb-6"
                                placeholder="Krótki opis"
                                placeholderTextColor="#666"
                                value={newDesc}
                                onChangeText={setNewDesc}
                            />

                            <View className="flex-row justify-end gap-3">
                                <TouchableOpacity onPress={handleCancelGroup} className="py-2.5 px-4 rounded-xl border border-white/5 justify-center">
                                    <Text className="font-outfit text-text-dim">Anuluj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleAddGroup} className="py-2.5 px-5 rounded-xl bg-white justify-center shadow-[0_0_10px_rgba(255,255,255,0.3)]">
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
