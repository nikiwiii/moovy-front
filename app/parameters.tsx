import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Check, ChevronDown, ChevronUp, Heart, Plus } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';

function CollapsibleSection({ title, children, defaultOpen = false, rightIcon = null, onRightIconPress }: { title: string, children: React.ReactNode, defaultOpen?: boolean, rightIcon?: React.ReactNode, onRightIconPress?: () => void }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Animated.View layout={LinearTransition} className="bg-[#14141e]/40 border border-white/5 rounded-2xl mb-4 overflow-hidden">
            <TouchableOpacity
                className="flex-row justify-between items-center p-[18px]"
                onPress={() => setOpen(!open)}
                activeOpacity={0.7}
            >
                <Text className="font-outfit-semi text-[16px] text-white">{title}</Text>
                <View className="flex-row items-center">
                    {rightIcon && (
                        <TouchableOpacity onPress={onRightIconPress} className="w-7 h-7 border border-white/10 rounded-md justify-center items-center mr-3">
                            {rightIcon}
                        </TouchableOpacity>
                    )}
                    {open ? <ChevronUp color="#fff" size={20} /> : <ChevronDown color="#888" size={20} />}
                </View>
            </TouchableOpacity>
            {open && (
                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="px-4 pb-5">
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

    const allDisplayedMixGenres = Array.from(new Set([...defaultGenres]));

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
        <View className="flex-1 bg-[#070314] pt-10">
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
                            title="Pod grono"
                            defaultOpen={true}
                            rightIcon={<Plus color="#fff" size={16} />}
                            onRightIconPress={() => setModalVisible(true)}
                        >
                            <Animated.View layout={LinearTransition} className="gap-2.5">
                                {groups.map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        className={`border rounded-xl p-4 bg-white/2 ${selectedGroup === group.id ? 'bg-[#28323c]/20 border-[#00e5ff]' : 'border-white/5'}`}
                                        onPress={() => setSelectedGroup(group.id)}
                                    >
                                        <Text className="font-outfit-semi text-[15px] text-white mb-1">{group.title}</Text>
                                        <Text className="font-outfit text-[13px] text-[#888]">{group.description}</Text>
                                    </TouchableOpacity>
                                ))}
                            </Animated.View>
                        </CollapsibleSection>

                        <CollapsibleSection title="Mieszanie gatunków" defaultOpen={false}>
                            <View className="flex-row flex-wrap gap-2">
                                {allDisplayedMixGenres.map(genre => {
                                    const isSelected = selectedMixGenres.includes(genre);
                                    return (
                                        <TouchableOpacity
                                            key={genre}
                                            className={`py-1.5 px-3 rounded-[20px] border border-white/15 bg-transparent ${isSelected ? 'bg-white border-white' : ''}`}
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
                                className="bg-[#14141e]/40 border border-white/5 rounded-2xl px-4 h-[52px] text-white font-outfit mb-6"
                                placeholder="Specjalne wymagania..."
                                placeholderTextColor="#667"
                            />

                            <View className="flex-col items-end gap-4 mb-10 z-50">
                                <TouchableOpacity
                                    onPress={() => setUseMyPreferences(!useMyPreferences)}
                                    className={`flex-row gap-x-2 items-center border py-3 px-5 rounded-full ${useMyPreferences
                                            ? 'bg-[#28323c]/40 border-[#00e5ff]/50'
                                            : 'bg-[#141e28]/50 border-white/10'
                                        }`}
                                >
                                    <Heart color={useMyPreferences ? "#00e5ff" : "#888"} size={18} className="mr-0" />
                                    <Text className={`font-outfit text-[15px] ${useMyPreferences ? 'text-white' : 'text-[#888]'}`}>
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
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 mt-4 pr-6">
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
                        <Animated.View entering={FadeIn} className="w-full bg-[#14141e]/70 border border-white/5 rounded-2xl p-6 overflow-hidden">
                            <Text className="font-outfit-bold text-xl text-white mb-4">Dodaj nowe grono</Text>

                            <TextInput
                                className="bg-[#14141e] border border-white/5 rounded-xl px-4 h-[44px] text-white font-outfit mb-3"
                                placeholder="Tytuł (np. Znajomi z pracy)"
                                placeholderTextColor="#666"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />

                            <TextInput
                                className="bg-[#14141e] border border-white/5 rounded-xl px-4 h-[44px] text-white font-outfit mb-6"
                                placeholder="Krótki opis"
                                placeholderTextColor="#666"
                                value={newDesc}
                                onChangeText={setNewDesc}
                            />

                            <View className="flex-row justify-end gap-3">
                                <TouchableOpacity onPress={handleCancelGroup} className="py-2.5 px-4 rounded-xl border border-white/5 justify-center">
                                    <Text className="font-outfit text-[#aaa]">Anuluj</Text>
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
