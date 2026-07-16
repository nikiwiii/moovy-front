import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Check, Film, Plus, Star, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, TextInput, View, ActivityIndicator, Alert, Image } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import CollapsibleSection from '../components/CollapsibleSection';
import VibeSelection from '../components/GenreSelection';
import TouchableOpacity from '../components/TouchableOpacity';
import { defaultVibes } from '../constants/vibes';
import { FillStyles } from '../constants/themeStyles';
import { storageService } from '../services/storageService';
import { metadataService } from '../services/metadataService';
import { Toast } from '@/components/Toast';

const DEFAULT_ERAS = [
    'Golden Age of Hollywood',
    '80s',
    '90s',
    'Modern Cinema',
    'New Releases (2020s)'
];

export default function PreferencesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isLocal = params.storageType === 'local';

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        visible: false,
        message: '',
        type: 'info'
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ visible: true, message, type });
    };

    const [preferences, setPreferences] = useState({
        vibes: { liked: [] as string[], disliked: [] as string[] },
        eras: [] as string[],
        movies: [] as string[]
    });
    const [movieInput, setMovieInput] = useState('');
    const [availableVibes, setAvailableVibes] = useState<string[]>(defaultVibes);
    const [availableEras, setAvailableEras] = useState<string[]>(DEFAULT_ERAS);

    useEffect(() => {
        const loadPrefs = async () => {
            setLoading(true);
            try {
                try {
                    const data = await metadataService.getPreferencesOptions();
                    if (data) {
                        if (data.vibes && data.vibes.length > 0) {
                            setAvailableVibes(data.vibes);
                        }
                        if (data.eras && data.eras.length > 0) {
                            setAvailableEras(data.eras);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to load preferences options from server, using local fallbacks:', e);
                }

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

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [favouriteTmdbIds, setFavouriteTmdbIds] = useState<number[]>([]);

    useEffect(() => {
        const searchMovies = async () => {
            const query = movieInput.trim();
            if (query.length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const token = await storageService.getToken();
                const API_URL = process.env.EXPO_PUBLIC_API_URL;
                const response = await fetch(`${API_URL}/movies/search?title=${encodeURIComponent(query)}&limit=5`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token || ''}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            searchMovies();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [movieInput]);

    const selectSearchedMovie = (movie: any) => {
        const titleWithYear = movie.year ? `${movie.title} (${movie.year})` : movie.title;
        if (!preferences.movies.includes(titleWithYear)) {
            setPreferences(prev => ({ ...prev, movies: [...prev.movies, titleWithYear] }));
            if (movie.tmdb_id) {
                setFavouriteTmdbIds(prev => [...prev, movie.tmdb_id]);
            }
        }
        setMovieInput('');
        setSearchResults([]);
    };

    const addMovie = () => {
        const val = movieInput.trim();
        if (val && !preferences.movies.includes(val)) {
            setPreferences(prev => ({ ...prev, movies: [...prev.movies, val] }));
        }
        setMovieInput('');
        setSearchResults([]);
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
            console.log(payload)

            if (isLocal) {
                await storageService.saveLocalPreferences(payload);
                showToast("Preferences saved successfully on your device.", "success");
                setTimeout(() => router.push('/parameters'), 1500);
            } else {
                const token = await storageService.getToken();
                const userId = await storageService.getUserId();
                const API_URL = process.env.EXPO_PUBLIC_API_URL;

                if (!token || !userId) {
                    showToast("Please log in again to save preferences.", "error");
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
                    // Save vector taste profile if we have TMDB IDs
                    if (favouriteTmdbIds.length > 0) {
                        try {
                            await fetch(`${API_URL}/preferences/favourite?user_id=${userId}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(favouriteTmdbIds),
                            });
                        } catch (e) {
                            console.error('Failed to sync vector favourites:', e);
                        }
                    }
                    showToast("Preferences saved successfully in the cloud.", "success");
                    setTimeout(() => router.push('/parameters'), 1500);
                } else {
                    const errorData = await response.json();
                    let errMsg = "There was a problem communicating with the server.";
                    if (errorData) {
                        const detail = errorData.detail;
                        if (typeof detail === 'string') {
                            errMsg = detail;
                        } else if (Array.isArray(detail)) {
                            errMsg = detail.map((e: any) => {
                                if (e && typeof e === 'object') {
                                    const field = e.loc ? `${e.loc.slice(1).join('.')}: ` : '';
                                    return `${field}${e.msg || JSON.stringify(e)}`;
                                }
                                return String(e);
                            }).join('\n');
                        } else if (detail) {
                            errMsg = JSON.stringify(detail);
                        } else if (errorData.message) {
                            errMsg = String(errorData.message);
                        } else {
                            errMsg = JSON.stringify(errorData);
                        }
                    }
                    showToast(errMsg, "error");
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            showToast(isLocal ? "Failed to save preferences locally." : "Failed to connect to the server.", "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleVibe = (vibe: string, type: 'liked' | 'disliked' | '') => {
        if (!type) return;
        setPreferences(prev => {
            const isCurrentlyLiked = prev.vibes.liked.includes(vibe);
            const isCurrentlyDisliked = prev.vibes.disliked.includes(vibe);

            const newLiked = prev.vibes.liked.filter(v => v !== vibe);
            const newDisliked = prev.vibes.disliked.filter(v => v !== vibe);

            if (type === 'liked' && !isCurrentlyLiked) {
                newLiked.push(vibe);
            } else if (type === 'disliked' && !isCurrentlyDisliked) {
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
                    <Text className="font-outfit-bold text-[24px]">A bit about yourself</Text>
                    <TouchableOpacity onPress={() => router.push('/parameters')}>
                        <Text className="font-outfit text-[13px] opacity-35 uppercase tracking-[2px]">Skip</Text>
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
                            title="My movie vibe"
                            icon={Film}
                            defaultOpen={true}
                        >
                            <VibeSelection
                                liked={preferences.vibes.liked}
                                disliked={preferences.vibes.disliked}
                                onToggleVibe={(vibe, type) => toggleVibe(vibe, type)}
                                label1="I love"
                                label2="I avoid"
                                options={availableVibes}
                            />
                        </CollapsibleSection>

                        {/* <CollapsibleSection
                            title="Ulubione epoki filmowe"
                            subtitle="Czas produkcji"
                            value={preferences.eras.length}
                            icon={Calendar}
                            defaultOpen={false}
                        >
                            <View className="flex flex-wrap flex-row gap-2">
                                {availableEras.map(era => (
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
                        </CollapsibleSection> */}


                        <CollapsibleSection
                            title="Favorite movies"
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

                                <View className="mt-1.5 gap-2">
                                    <View className="flex-row gap-2.5">
                                        <View style={{ flex: 1, position: 'relative', justifyContent: 'center' }}>
                                            <TextInput
                                                className={FillStyles.inputInline}
                                                placeholder="E.g., Matrix (1999)"
                                                placeholderTextColor="#ffffff30"
                                                value={movieInput}
                                                onChangeText={setMovieInput}
                                                onSubmitEditing={addMovie}
                                                returnKeyType="done"
                                                style={{ paddingRight: 40, color: '#fff' }}
                                            />
                                            {searching && (
                                                <ActivityIndicator
                                                    size="small"
                                                    color="#fff"
                                                    style={{ position: 'absolute', right: 12 }}
                                                />
                                            )}
                                        </View>
                                        <TouchableOpacity
                                            className={`${FillStyles.inputIconBtn} bg-accent`}
                                            onPress={addMovie}
                                        >
                                            <Plus color="#000" size={20} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Search Results List (inline to prevent overflow clipping) */}
                                    {searchResults.length > 0 && (
                                        <View
                                            className="bg-white/[0.03] rounded-3xl border border-white/[0.06] p-1 mt-1"
                                        >
                                            {searchResults.map((movie) => (
                                                <TouchableOpacity
                                                    key={movie.movie_id}
                                                    onPress={() => selectSearchedMovie(movie)}
                                                    className="flex-row items-center p-2 rounded-[10px] active:bg-white/[0.06]"
                                                    style={{ gap: 10 }}
                                                >
                                                    {movie.poster_path ? (
                                                        <Image
                                                            source={{ uri: movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w92${movie.poster_path}` }}
                                                            style={{ width: 36, height: 50, borderRadius: 6 }}
                                                        />
                                                    ) : (
                                                        <View style={{ width: 28, height: 40, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Film size={14} color="#707080" />
                                                        </View>
                                                    )}
                                                    <View style={{ flex: 1 }}>
                                                        <Text className="font-outfit-bold text-[14px] text-white" numberOfLines={1}>
                                                            {movie.title}
                                                        </Text>
                                                        {movie.year && (
                                                            <Text className="font-outfit text-[11px] text-white/40 mt-0.5">
                                                                {movie.year}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
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
                                <Text className="font-outfit-semi text-[15px] text-black">Save preferences</Text>
                                <Check color="#000" size={18} strokeWidth={2.5} />
                            </>
                        )}
                    </TouchableOpacity>
                </MotiView>
            </SafeAreaView>

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
}
