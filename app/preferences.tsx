import { useRouter } from 'expo-router';
import { Check, ChevronDown, ChevronUp, Plus, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';

const defaultGenres = [
    'Sci-fi', 'Akcja', 'Dramat', 'Przygodowy',
    'Horror', 'Thriller', 'Animacja', 'Familijny',
    'Fantasy', 'Komedia', 'Kryminał', '18+'
];

const eras = ['Złota Era Hollywood', 'Lata 80.', 'Lata 90.', 'Kino współczesne'];

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Animated.View layout={LinearTransition} className="bg-[#14141e]/40 border border-white/5 rounded-2xl mb-4 overflow-hidden">
            <TouchableOpacity
                className="flex-row justify-between items-center p-[18px]"
                onPress={() => setOpen(!open)}
                activeOpacity={0.7}
            >
                <Text className="font-outfit-semi text-[16px] text-white">{title}</Text>
                {open ? <ChevronUp color="#fff" size={20} /> : <ChevronDown color="#888" size={20} />}
            </TouchableOpacity>
            {open && (
                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="px-4 pb-5">
                    {children}
                </Animated.View>
            )}
        </Animated.View>
    );
}

export default function PreferencesScreen() {
    const router = useRouter();
    const [preferences, setPreferences] = useState({
        genres: ['Akcja', 'Kryminał'],
        era: 'Lata 90.',
        movies: [] as string[]
    });

    const [customGenre, setCustomGenre] = useState('');
    const [movieInput, setMovieInput] = useState('');

    const toggleGenre = (genre: string) => {
        if (preferences.genres.includes(genre)) {
            setPreferences(prev => ({ ...prev, genres: prev.genres.filter(g => g !== genre) }));
        } else {
            setPreferences(prev => ({ ...prev, genres: [...prev.genres, genre] }));
        }
    };

    const addCustomGenre = () => {
        const val = customGenre.trim();
        if (val && !preferences.genres.includes(val)) {
            setPreferences(prev => ({ ...prev, genres: [...prev.genres, val] }));
        }
        setCustomGenre('');
    };

    const addMovie = () => {
        const val = movieInput.trim();
        if (val && !preferences.movies.includes(val)) {
            setPreferences(prev => ({ ...prev, movies: [...prev.movies, val] }));
        }
        setMovieInput('');
    };

    const removeMovie = (movie: string) => {
        setPreferences(prev => ({ ...prev, movies: prev.movies.filter(m => m !== movie) }));
    };

    const handleSave = () => {
        // Zapis danych (w konsoli jako demonstracja)
        console.log('Zapisane preferencje:', preferences);
        router.push('/parameters');
    };

    const allDisplayedGenres = Array.from(new Set([...defaultGenres, ...preferences.genres]));

    return (
        <View className="flex-1 bg-[#070314] pt-10">
            <AnimatedBackground />
            <SafeAreaView className="flex-1">
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="flex-row justify-between items-center px-6 pt-5 pb-5"
                >
                    <Text className="font-outfit-bold text-[24px] text-white">Krótko o sobie</Text>
                    <TouchableOpacity onPress={() => router.push('/parameters')}>
                        <Text className="font-outfit text-[15px] text-[#aaa]">Pomiń</Text>
                    </TouchableOpacity>
                </MotiView>

                <ScrollView contentContainerClassName="px-6 pb-[100px]" showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200, duration: 600 }}
                    >
                        <CollapsibleSection title="Lubiane przez Ciebie gatunki" defaultOpen={true}>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {allDisplayedGenres.map(genre => {
                                    const isSelected = preferences.genres.includes(genre);
                                    return (
                                        <TouchableOpacity
                                            key={genre}
                                            className={`py-1.5 px-3 rounded-[20px] border border-white/15 bg-transparent ${isSelected ? 'bg-white border-white' : ''}`}
                                            onPress={() => toggleGenre(genre)}
                                        >
                                            <Text className={`font-outfit text-[13px] text-[#ccc] ${isSelected ? 'text-black font-outfit-semi' : ''}`}>{genre}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <View className="flex-row gap-2.5">
                                <TextInput
                                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3.5 h-[44px] text-white font-outfit"
                                    placeholder="Dodaj własne..."
                                    placeholderTextColor="#666"
                                    value={customGenre}
                                    onChangeText={setCustomGenre}
                                    onSubmitEditing={addCustomGenre}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    className="w-[44px] h-[44px] bg-white/5 border border-white/10 rounded-xl justify-center items-center"
                                    onPress={addCustomGenre}
                                >
                                    <Plus color="#fff" size={20} />
                                </TouchableOpacity>
                            </View>
                        </CollapsibleSection>

                        <CollapsibleSection title="Ulubiona epoka filmowa" defaultOpen={false}>
                            <View className="gap-3.5">
                                {eras.map(ep => (
                                    <TouchableOpacity
                                        key={ep}
                                        className="flex-row items-center gap-3"
                                        onPress={() => setPreferences(prev => ({ ...prev, era: ep }))}
                                    >
                                        <View className="w-5 h-5 rounded-full border border-white/50 justify-center items-center">
                                            <View className={preferences.era === ep ? "w-2.5 h-2.5 rounded-full bg-white" : ""} />
                                        </View>
                                        <Text className={`font-outfit text-[15px] ${preferences.era === ep ? 'text-white' : 'text-[#ccc]'}`}>{ep}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </CollapsibleSection>

                        <CollapsibleSection title="Ulubione filmy (tytuł, rok)" defaultOpen={false}>
                            <Animated.View layout={LinearTransition} className="gap-2.5">
                                {preferences.movies.map((movie, index) => (
                                    <Animated.View
                                        entering={FadeIn}
                                        exiting={FadeOut.duration(200)}
                                        layout={LinearTransition}
                                        key={index}
                                        className="flex-row justify-between items-center bg-black/40 border border-white/10 rounded-xl py-3 px-4"
                                    >
                                        <Text className="font-outfit text-white text-[14px] flex-1 mr-3">{movie}</Text>
                                        <TouchableOpacity onPress={() => removeMovie(movie)} className="p-1">
                                            <X color="#aaa" size={18} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}

                                <View className="flex-row gap-2.5 mt-1.5">
                                    <TextInput
                                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3.5 h-[44px] text-white font-outfit"
                                        placeholder="Np. Matrix, 1999"
                                        placeholderTextColor="#666"
                                        value={movieInput}
                                        onChangeText={setMovieInput}
                                        onSubmitEditing={addMovie}
                                        returnKeyType="done"
                                    />
                                    <TouchableOpacity
                                        className="w-[44px] h-[44px] bg-white/5 border border-white/10 rounded-xl justify-center items-center"
                                        onPress={addMovie}
                                    >
                                        <Plus color="#fff" size={20} />
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </CollapsibleSection>
                    </MotiView>
                </ScrollView>

                <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 400, type: 'spring' }}
                    className="absolute bottom-10 right-6"
                >
                    <TouchableOpacity
                        className="flex-row gap-x-2 items-center bg-white py-3.5 px-5 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.3)] elevation-5"
                        onPress={handleSave}
                    >
                        <Check color="#000" size={20} strokeWidth={2} className="mr-2" />
                        <Text className="font-outfit-semi text-[16px] text-black">Zapisz preferencje</Text>
                    </TouchableOpacity>
                </MotiView>
            </SafeAreaView>
        </View>
    );
}
