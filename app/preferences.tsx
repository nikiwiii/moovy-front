import { useRouter } from 'expo-router';
import { Calendar, Check, Film, Plus, Star, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import MiniCollapsibleSection from '../components/MiniCollapsibleSection';
import TouchableOpacity from '../components/TouchableOpacity';
import { defaultVibes } from '../constants/vibes';
import { FillStyles } from '../constants/themeStyles';


const eras = [
    { id: 1, name: 'Złota Era Hollywood', short: 'Z.E.H.' },
    { id: 2, name: 'Lata 80.', short: 'L.80.' },
    { id: 3, name: 'Lata 90.', short: 'L.90.' },
    { id: 4, name: 'Kino współczesne', short: 'K.W.' }
];

import { BlurView } from 'expo-blur';
import CollapsibleSection from '../components/CollapsibleSection';
import VibeSelection from '../components/GenreSelection';

export default function PreferencesScreen() {
    const router = useRouter();
    const [preferences, setPreferences] = useState({
        vibes: { liked: [] as string[], disliked: [] as string[] },
        eras: new Set<number>(),
        movies: [] as string[]
    });
    const [movieInput, setMovieInput] = useState('');

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

    //add liked and disliked categories
    const toggleVibe = (vibe: string, type: 'liked' | 'disliked' | '') => {
        if (!type) return;
        setPreferences(prev => {
            const newVibes = [...prev.vibes[type]];
            if (newVibes.includes(vibe)) {
                newVibes.splice(newVibes.indexOf(vibe), 1);
            } else {
                newVibes.push(vibe);
            }
            return { ...prev, vibes: { ...prev.vibes, [type]: newVibes } };
        });
    };


    return (
        <View className="flex-1 bg-transparent pt-10">
            <SafeAreaView className="flex-1">
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="flex-row justify-between items-center px-6 pt-5 pb-5"
                >
                    <Text className="font-outfit-bold text-[24px] text-white">Krótko o sobie</Text>
                    <TouchableOpacity onPress={() => router.push('/parameters')}>
                        <Text className="font-outfit text-md text-white/70">Pomiń</Text>
                    </TouchableOpacity>
                </MotiView>

                <ScrollView contentContainerClassName="px-4 pb-[100px]" showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200, duration: 600 }}
                        className="flex flex-col gap-2"
                    >
                        <CollapsibleSection
                            title="Lubiany/nielubiany vibe"
                            subtitle="Kategorie"
                            icon={Film}
                            defaultOpen={true}
                        >
                            <VibeSelection
                                liked={preferences.vibes.liked}
                                disliked={preferences.vibes.disliked}
                                onToggleVibe={(vibe, type) => toggleVibe(vibe, type)}
                                label1="Lubiane"
                                label2="Nielubiane"
                            />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Ulubione epoki filmowe"
                            subtitle="Czas produkcji"
                            value={preferences.eras.size}
                            icon={Calendar}
                            defaultOpen={false}
                        >
                            <View className="flex flex-wrap flex-row gap-2">
                                {eras.map(ep => (
                                    <TouchableOpacity
                                        key={ep.id}
                                        className="flex-row items-center gap-3"
                                        onPress={() => setPreferences(prev => {
                                            const newEras = new Set(prev.eras);
                                            if (newEras.has(ep.id)) {
                                                newEras.delete(ep.id);
                                            } else {
                                                newEras.add(ep.id);
                                            }
                                            return { ...prev, eras: newEras };
                                        })}
                                    >
                                        <Text className={`font-outfit ${FillStyles.pillBase} ${preferences.eras.has(ep.id) ? FillStyles.pillActive : FillStyles.pillInactive}`}>{ep.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Ulubione filmy (tytuł, rok)"
                            subtitle="Twoja baza"
                            value={preferences.movies.length}
                            icon={Star}
                            defaultOpen={false}
                        >
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
                                        className={FillStyles.inputInline}
                                        placeholder="Np. Matrix, 1999"
                                        value={movieInput}
                                        onChangeText={setMovieInput}
                                        onSubmitEditing={addMovie}
                                        returnKeyType="done"
                                    />
                                    <TouchableOpacity
                                        className={FillStyles.inputIconBtn}
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
