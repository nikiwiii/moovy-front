import { BlurView } from 'expo-blur';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Check, Film, Plus, Star, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, TextInput, View, ActivityIndicator, Alert } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import CollapsibleSection from '../components/CollapsibleSection';
import VibeSelection from '../components/GenreSelection';
import TouchableOpacity from '../components/TouchableOpacity';
import { defaultVibes } from '../constants/vibes';
import { FillStyles } from '../constants/themeStyles';
import { storageService } from '../services/storageService';

const eras = [
    'Złota Era Hollywood',
    'Lata 80.',
    'Lata 90.',
    'Kino współczesne',
    'Nowości (Lata 20.)'
];

export default function PreferencesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isLocal = params.storageType === 'local';

    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        vibes: { liked: [] as string[], disliked: [] as string[] },
        eras: [] as string[],
        movies: [] as string[]
    });
    const [movieInput, setMovieInput] = useState('');

    useEffect(() => {
        const loadPrefs = async () => {
            setLoading(true);
            try {
                const lp = await storageService.getLocalPreferences();
                const token = await storageService.getToken();
                const userId = await storageService.getUserId();
                const API_URL = process.env.EXPO_PUBLIC_API_URL;

                let prefsFound = false;

                if (!isLocal && token && userId && API_URL) {
                    try {
                        const response = await fetch(`${API_URL}/preferences/get?user_id=${userId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            const hasData = data && (
                                (data.vibes && data.vibes.length > 0) ||
                                (data.hard_nos && data.hard_nos.length > 0) ||
                                (data.eras && data.eras.length > 0) ||
                                (data.movies && data.movies.length > 0)
                            );

                            if (hasData) {
                                setPreferences({
                                    vibes: { liked: data.vibes || [], disliked: data.hard_nos || [] },
                                    eras: data.eras || [],
                                    movies: data.movies || []
                                });
                                prefsFound = true;
                            }
                        }
                    } catch (e) {
                        console.error('Server sync failed, falling back to local storage', e);
                    }
                }

                if (!prefsFound && lp) {
                    setPreferences({
                        vibes: { liked: lp.vibes || [], disliked: lp.hard_nos || [] },
                        eras: lp.eras || [],
                        movies: lp.movies || []
                    });
                }
            } finally {
                setLoading(false);
            }
        };
        loadPrefs();
    }, [isLocal]);

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

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                vibes: preferences.vibes.liked,
                hard_nos: preferences.vibes.disliked,
                eras: preferences.eras,
                movies: preferences.movies
            };

            if (isLocal) {
                await storageService.saveLocalPreferences(payload);
                Alert.alert("Sukces!", "Pomyślnie zapisano preferencje na urządzeniu.");
                router.push('/parameters');
            } else {
                const token = await storageService.getToken();
                const userId = await storageService.getUserId();
                const API_URL = process.env.EXPO_PUBLIC_API_URL;

                if (!token || !userId) {
                    Alert.alert("Błąd logowania", "Zaloguj się ponownie, aby zapisać preferencje.");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_URL}/preferences/save?user_id=${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    Alert.alert("Sukces!", "Pomyślnie zapisano preferencje w chmurze.");
                    router.push('/parameters');
                } else {
                    const errorData = await response.json();
                    Alert.alert("Błąd zapisu", errorData.detail || "Wystąpił problem podczas komunikacji z serwerem.");
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert("Błąd", isLocal ? "Nie udało się zapisać preferencji lokalnie." : "Nie udało się połączyć z serwerem.");
        } finally {
            setLoading(false);
        }
    };

    const toggleVibe = (vibe: string, type: 'liked' | 'disliked' | '') => {
        if (!type) return;
        setPreferences(prev => {
            const newLiked = prev.vibes.liked.filter(v => v !== vibe);
            const newDisliked = prev.vibes.disliked.filter(v => v !== vibe);

            if (type === 'liked') {
                newLiked.push(vibe);
            } else if (type === 'disliked') {
                newDisliked.push(vibe);
            }

            return { ...prev, vibes: { liked: newLiked, disliked: newDisliked } };
        });
    };

    return (
        <View className="flex-1 bg-transparent pt-10">
            <SafeAreaView className="flex-1">
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="flex-row justify-between items-center px-6 pt-5 pb-3"
                >
                    <Text className="font-outfit-bold text-[24px]">Krótko o sobie</Text>
                    <TouchableOpacity onPress={() => router.push('/parameters')}>
                        <Text className="font-outfit text-[13px] opacity-35 uppercase tracking-[2px]">Pomiń</Text>
                    </TouchableOpacity>
                </MotiView>

                <ScrollView contentContainerClassName="px-4 pb-[100px]" showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200, duration: 600 }}
                        className="flex flex-col gap-3"
                    >
                        <CollapsibleSection
                            title="Mój vibe filmowy"
                            subtitle="Kategorie"
                            icon={Film}
                            defaultOpen={true}
                        >
                            <VibeSelection
                                liked={preferences.vibes.liked}
                                disliked={preferences.vibes.disliked}
                                onToggleVibe={(vibe, type) => toggleVibe(vibe, type)}
                                label1="Uwielbiam"
                                label2="Unikam"
                            />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title="Ulubione epoki filmowe"
                            subtitle="Czas produkcji"
                            value={preferences.eras.length}
                            icon={Calendar}
                            defaultOpen={false}
                        >
                            <View className="flex flex-wrap flex-row gap-2">
                                {eras.map(era => (
                                    <TouchableOpacity
                                        key={era}
                                        onPress={() => setPreferences(prev => {
                                            const newEras = prev.eras.includes(era)
                                                ? prev.eras.filter(e => e !== era)
                                                : [...prev.eras, era];
                                            return { ...prev, eras: newEras };
                                        })}
                                    >
                                        <Text className={`font-outfit text-[13px] ${FillStyles.pillBase} ${preferences.eras.includes(era) ? FillStyles.pillActive : FillStyles.pillInactive}`}>{era}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </CollapsibleSection>


                        <CollapsibleSection
                            title="Ulubione filmy"
                            subtitle="Tytyły, Baza rekomendacji"
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
                                        className="flex-row justify-between items-center bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 px-4"
                                    >
                                        <Text className="font-outfit text-[14px] flex-1 mr-3">{movie}</Text>
                                        <TouchableOpacity onPress={() => removeMovie(movie)} className="p-1">
                                            <X color="#707080" size={16} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}

                                <View className="flex-row gap-2.5 mt-1.5">
                                    <TextInput
                                        className={FillStyles.inputInline}
                                        placeholder="Np. Matrix (1999)"
                                        placeholderTextColor="#ffffff30"
                                        value={movieInput}
                                        onChangeText={setMovieInput}
                                        onSubmitEditing={addMovie}
                                        returnKeyType="done"
                                    />
                                    <TouchableOpacity
                                        className={`${FillStyles.inputIconBtn} bg-accent`}
                                        onPress={addMovie}
                                    >
                                        <Plus color="#000" size={20} />
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
                    className="absolute bottom-10 right-5"
                >
                    <TouchableOpacity
                        className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} bg-accent`}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" size="small" />
                        ) : (
                            <>
                                <Text className="font-outfit-semi text-[15px] text-black">Zapisz preferencje</Text>
                                <Check color="#000" size={18} strokeWidth={2.5} />
                            </>
                        )}
                    </TouchableOpacity>
                </MotiView>
            </SafeAreaView>
        </View>
    );
}
