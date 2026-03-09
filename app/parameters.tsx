import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Check, ChevronDown, ChevronUp, Film, Heart, Plus, Users } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';

interface CollapsibleSectionProps {
    title: string;
    subtitle: string;
    value: number | string;
    icon: any;
    children: React.ReactNode;
    defaultOpen?: boolean;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

function CollapsibleSection({ title, subtitle, value, icon: IconComponent, children, defaultOpen = false, rightIcon = null, onRightIconPress }: CollapsibleSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Animated.View layout={LinearTransition} className="bg-[#14141e]/50 border border-white/5 rounded-[36px] mb-4 overflow-hidden">
            <TouchableOpacity
                className="p-5 flex-col justify-between min-h-[140px]"
                onPress={() => setOpen(!open)}
                activeOpacity={0.7}
            >
                <View className="flex-row justify-between items-start">
                    <View className="w-[48px] h-[48px] rounded-full bg-white/5 items-center justify-center border border-white/5">
                        <IconComponent color="#ccc" size={22} />
                    </View>
                    <View className="flex-row items-center">
                        {rightIcon && (
                            <TouchableOpacity onPress={onRightIconPress} className="w-9 h-9 bg-white/5 rounded-full justify-center items-center mr-3 border border-white/5">
                                {rightIcon}
                            </TouchableOpacity>
                        )}
                        <View className="w-9 h-9 rounded-full bg-white/5 items-center justify-center border border-white/5">
                            {open ? <ChevronUp color="#888" size={18} /> : <ChevronDown color="#888" size={18} />}
                        </View>
                    </View>
                </View>
                <View className="flex-row justify-between items-end mt-6 mb-1.5">
                    <View className="flex-1 mr-4">
                        <Text className="font-outfit text-[12px] text-[#888] uppercase tracking-widest">{subtitle}</Text>
                        <Text className="font-outfit-semi text-[18px] text-white leading-tight">{title}</Text>
                    </View>
                    <Text className="font-outfit-bold text-[28px] text-white relative top-[8px]">{value}</Text>
                </View>
            </TouchableOpacity>
            {open && (
                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="px-5 pb-6 pt-2">
                    {children}
                </Animated.View>
            )}
        </Animated.View>
    );
}

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
}

export default function ParametersScreen() {
    const router = useRouter();
    const [selectedGroup, setSelectedGroup] = useState<string | null>('tlum');
    const [groups, setGroups] = useState<Group[]>([
        { id: 'tlum', title: 'Tłum', description: 'nienudne filmy, skuteczne przy wielu gustach' },
        { id: 'randewu', title: 'Randewu', description: 'angażujące, wzruszające kino' }
    ]);

    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const [selectedMixGenres, setSelectedMixGenres] = useState<string[]>([]);

    const [useMyPreferences, setUseMyPreferences] = useState(true);

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
            setGroups(prev => [...prev, { id: newId, title: newTitle.trim(), description: newDesc.trim() }]);
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
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-6 pt-5 pb-5"
                >
                    <Text className="font-outfit-bold text-[24px] text-white">Pomysł na film</Text>
                </MotiView>

                <ScrollView contentContainerClassName="px-6 pb-[60px]" showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200, duration: 600 }}
                    >
                        <CollapsibleSection
                            title="Wybierz grono"
                            subtitle="Dla kogo?"
                            value={groups.find(g => g.id === selectedGroup)?.title || '-'}
                            icon={Users}
                            defaultOpen={true}
                            rightIcon={<Plus color="#fff" size={18} />}
                            onRightIconPress={() => setModalVisible(true)}
                        >
                            <Animated.View layout={LinearTransition} className="gap-2.5">
                                {groups.map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        className={`border rounded-3xl p-4 ${selectedGroup === group.id ? 'bg-black/10 border-accent' : 'border-white/5 bg-black/20'}`}
                                        onPress={() => setSelectedGroup(group.id)}
                                    >
                                        <Text className="font-outfit-semi text-[15px] text-white mb-1">{group.title}</Text>
                                        <Text className="font-outfit text-[13px] text-text-muted">{group.description}</Text>
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
                                            className={`py-1.5 px-3 rounded-[12px] border border-white/15 ${isSelected ? 'bg-white border-white' : 'bg-black/20'}`}
                                            onPress={() => toggleMixGenre(genre)}
                                        >
                                            <Text className={`font-outfit text-[13px] text-[#ccc] ${isSelected ? 'text-black font-outfit-semi' : ''}`}>{genre}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </CollapsibleSection>

                        <Animated.View layout={LinearTransition}>
                            <TextInput
                                className="bg-[#14141e]/40 border border-white/5 rounded-3xl px-4 h-[52px] text-white font-outfit mb-6"
                                placeholder="Specjalne wymagania..."
                                placeholderTextColor="#667"
                            />

                            <View className="flex-col items-end gap-4 mb-10 z-50">
                                <TouchableOpacity
                                    onPress={() => setUseMyPreferences(!useMyPreferences)}
                                    className={`flex-row gap-x-2 items-center border py-3 px-5 rounded-full ${useMyPreferences
                                        ? 'bg-card-active/40 border-[#8800ff]/50'//what
                                        : 'bg-card/50 border-white/10'
                                        }`}
                                >
                                    <Heart color={useMyPreferences ? "#8800ff" : "#888"} size={18} className="mr-0" />
                                    <Text className={`font-outfit text-[15px] ${useMyPreferences ? 'text-white' : 'text-text-muted'}`}>
                                        Dla moich preferencji
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity className="flex-row gap-x-2 items-center bg-white py-3.5 px-6 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.3)] elevation-5">
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
