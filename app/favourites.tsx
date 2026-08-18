import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, Film, Heart, Plus, Search, Trash2, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { AppText as Text } from '@/components/AppText';
import Toast from '@/components/Toast';
import TouchableOpacity from '@/components/TouchableOpacity';
import { Colors } from '@/constants/theme';
import { sanitizeVibesForBackend } from '@/constants/vibes';
import { storageService } from '@/services/storageService';

const ACCENT = Colors.dark.accent;

interface MovieItem {
    id: string;
    title: string;
    tmdb_id?: number;
    poster_path?: string;
    year?: number | string;
}

export default function FavouritesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const fromStep1 = params.fromStep1 === 'true';
    const isLocal = params.storageType === 'local';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [favoriteMovies, setFavoriteMovies] = useState<MovieItem[]>([]);
    const [vibes, setVibes] = useState<{ liked: string[]; disliked: string[] }>({ liked: [], disliked: [] });
    const [eras, setEras] = useState<string[]>([]);
    const [noAnime, setNoAnime] = useState(false);
    const [noAnimation, setNoAnimation] = useState(false);
    const [favouriteTmdbIds, setFavouriteTmdbIds] = useState<number[]>([]);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
        title?: string;
    }>({ visible: false, message: '', type: 'info' });

    const showToast = (message: string, type: 'success' | 'error' | 'info', title?: string) => {
        setToast({ visible: true, message, type, title });
    };

    // Load initial preferences
    useEffect(() => {
        const loadPreferences = async () => {
            setLoading(true);
            try {
                const lp = await storageService.getLocalPreferences();
                const token = await storageService.getToken();
                const userId = await storageService.getUserId();
                const API_URL = process.env.EXPO_PUBLIC_API_URL;

                let loadedFromCloud = false;

                if (!isLocal && token && userId && API_URL) {
                    try {
                        const response = await fetch(`${API_URL}/preferences/get?user_id=${userId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data) {
                                setVibes({ liked: data.vibes || [], disliked: data.hard_nos || [] });
                                setEras(data.eras || []);
                                setNoAnime(data.no_anime || false);
                                setNoAnimation(data.no_animation || false);

                                const rawMovies: string[] = data.movies || [];
                                const parsedMovies: MovieItem[] = rawMovies.map((m, idx) => ({
                                    id: `fav-${idx}-${Date.now()}`,
                                    title: m
                                }));
                                setFavoriteMovies(parsedMovies);
                                loadedFromCloud = true;
                            }
                        }
                    } catch (err) {
                        console.error('Failed to load preferences from server:', err);
                    }
                }

                if (!loadedFromCloud && lp) {
                    setVibes({ liked: lp.vibes || [], disliked: lp.hard_nos || [] });
                    setEras(lp.eras || []);
                    setNoAnime(lp.no_anime || false);
                    setNoAnimation(lp.no_animation || false);
                    const rawMovies: string[] = lp.movies || [];
                    setFavoriteMovies(rawMovies.map((m, idx) => ({ id: `local-${idx}`, title: m })));
                }
            } catch (err) {
                console.error('Error loading favorite movies:', err);
                showToast('Failed to load favorite movies', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, [isLocal]);

    // Live movie search effect
    useEffect(() => {
        const searchMovies = async () => {
            const q = searchQuery.trim();
            if (q.length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const token = await storageService.getToken();
                const API_URL = process.env.EXPO_PUBLIC_API_URL;
                const response = await fetch(`${API_URL}/movies/search?title=${encodeURIComponent(q)}&limit=6`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token || ''}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data || []);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Movie search error:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        };

        const timer = setTimeout(() => {
            searchMovies();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Check if movie title already in favorites
    const isMovieInFavorites = (title: string) => {
        return favoriteMovies.some(m => m.title.toLowerCase() === title.toLowerCase());
    };

    // Add movie from search or input
    const handleAddMovie = (movieObj?: any) => {
        let titleToAdd = '';
        let tmdbId: number | undefined;
        let posterPath: string | undefined;
        let releaseYear: number | string | undefined;

        if (movieObj) {
            titleToAdd = movieObj.year ? `${movieObj.title} (${movieObj.year})` : movieObj.title;
            tmdbId = movieObj.tmdb_id;
            posterPath = movieObj.poster_path;
            releaseYear = movieObj.year;
        } else {
            titleToAdd = searchQuery.trim();
        }

        if (!titleToAdd) return;

        if (isMovieInFavorites(titleToAdd)) {
            showToast('Movie is already in your favorites', 'info');
            return;
        }

        const newItem: MovieItem = {
            id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: titleToAdd,
            tmdb_id: tmdbId,
            poster_path: posterPath,
            year: releaseYear
        };

        setFavoriteMovies(prev => [newItem, ...prev]);

        if (tmdbId && !favouriteTmdbIds.includes(tmdbId)) {
            setFavouriteTmdbIds(prev => [...prev, tmdbId]);
        }

        setSearchQuery('');
        setSearchResults([]);
        showToast(`Added "${movieObj ? movieObj.title : titleToAdd}"`, 'success');
    };

    // Remove movie
    const handleRemoveMovie = (id: string, title: string) => {
        setFavoriteMovies(prev => prev.filter(m => m.id !== id));
        showToast(`Removed "${title}"`, 'info');
    };

    // Save changes to cloud & local storage
    const handleSave = async () => {
        setSaving(true);
        try {
            const movieTitles = favoriteMovies.map(m => m.title);
            const payload = {
                vibes: sanitizeVibesForBackend(vibes.liked),
                hard_nos: vibes.disliked,
                eras: eras,
                movies: movieTitles,
                no_anime: noAnime,
                no_animation: noAnimation
            };

            await storageService.saveLocalPreferences(payload);

            const token = await storageService.getToken();
            const userId = await storageService.getUserId();
            const API_URL = process.env.EXPO_PUBLIC_API_URL;

            if (token && userId && API_URL && !isLocal) {
                const response = await fetch(`${API_URL}/preferences/save?user_id=${userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    if (favouriteTmdbIds.length > 0) {
                        try {
                            await fetch(`${API_URL}/preferences/favourite?user_id=${userId}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify(favouriteTmdbIds)
                            });
                        } catch (e) {
                            console.error('Failed to sync vector favorites:', e);
                        }
                    }
                    showToast('Favorite movies saved successfully!', 'success', 'Saved');
                } else {
                    showToast('Saved locally. Cloud sync failed.', 'info');
                }
            } else {
                showToast('Favorite movies saved locally.', 'success');
            }

            // Route user depending on context
            if (fromStep1) {
                setTimeout(() => {
                    router.push('/parameters');
                }, 1000);
            }
        } catch (err: any) {
            console.error('Error saving favorite movies:', err);
            showToast('Failed to save changes', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-transparent pt-10">
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />

            <SafeAreaView className="flex-1">
                {/* Top Header */}
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-6 pt-4 pb-3 gap-y-2.5"
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-x-2">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-9 h-9 rounded-full bg-white/[0.06] items-center justify-center border border-white/[0.08] mr-1"
                            >
                                <ArrowLeft color="#fff" size={18} />
                            </TouchableOpacity>
                            {fromStep1 ? (
                                <View className="px-3 py-1 rounded-full bg-accent/15 border border-accent/30">
                                    <Text style={{ color: ACCENT }} className="font-outfit-bold text-[11px] uppercase tracking-wider">
                                        Step 2 of 2 • Favorite Movies
                                    </Text>
                                </View>
                            ) : (
                                <Text className="font-outfit text-[22px] uppercase tracking-wide text-white/80">Favorite Movies</Text>
                            )}
                        </View>
                    </View>

                    {fromStep1 && (
                        <>
                            {/* Progress Bar (100%) */}
                            <View className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                                <View className="h-full w-full bg-accent rounded-full" />
                            </View>

                            <View className="mt-1">
                                <Text className="font-outfit text-[22px] uppercase tracking-wide text-white/80">Favorite Movies</Text>
                                <Text className="font-outfit text-[13px] opacity-40 mt-0.5">
                                    Search and add your favorite movies to complete your profile.
                                </Text>
                            </View>
                        </>
                    )}
                </MotiView>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color={ACCENT} size="large" />
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                        className="mt-1"
                    >
                        <MotiView
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ duration: 500 }}
                            className="gap-y-5"
                        >
                            {/* Search Engine Card */}
                            <View className="bg-white/[0.04] border border-white/[0.08] p-4 rounded-3xl gap-y-3">
                                <Text className="font-outfit-semi text-[13px] opacity-50 uppercase tracking-[1px]">
                                    Search & Add Movies
                                </Text>

                                <View className="flex-row gap-x-2 items-center">
                                    <View className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-2xl flex-row items-center px-3.5 py-2.5">
                                        <Search color="#707080" size={18} className="mr-2" />
                                        <TextInput
                                            className="flex-1 text-white font-outfit text-[14px]"
                                            placeholder="Type movie title (e.g. Inception)..."
                                            placeholderTextColor="#ffffff40"
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                            onSubmitEditing={() => handleAddMovie()}
                                            returnKeyType="search"
                                        />
                                        {searching ? (
                                            <ActivityIndicator size="small" color={ACCENT} />
                                        ) : searchQuery ? (
                                            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                                                <X color="#ffffff60" size={16} />
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>

                                    {searchQuery.trim().length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => handleAddMovie()}
                                            className="w-12 h-12 rounded-2xl bg-accent items-center justify-center"
                                        >
                                            <Plus color="#000" size={22} strokeWidth={2.5} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Live Search Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <View className="bg-black/40 rounded-2xl border border-white/[0.08] p-1.5 gap-y-1">
                                        {searchResults.map((movie) => {
                                            const formattedTitle = movie.year ? `${movie.title} (${movie.year})` : movie.title;
                                            const isAdded = isMovieInFavorites(formattedTitle);
                                            const posterUrl = movie.poster_path
                                                ? (movie.poster_path.startsWith('http')
                                                    ? movie.poster_path
                                                    : `https://image.tmdb.org/t/p/w92${movie.poster_path}`)
                                                : null;

                                            return (
                                                <TouchableOpacity
                                                    key={movie.movie_id || movie.tmdb_id || movie.title}
                                                    onPress={() => handleAddMovie(movie)}
                                                    disabled={isAdded}
                                                    className={`flex-row items-center p-2.5 rounded-xl justify-between ${isAdded ? 'opacity-40 bg-white/[0.02]' : 'active:bg-white/[0.08] bg-white/[0.04]'
                                                        }`}
                                                >
                                                    <View className="flex-row items-center gap-x-3 flex-1 mr-2">
                                                        {posterUrl ? (
                                                            <Image
                                                                source={{ uri: posterUrl }}
                                                                className="w-9 h-12 rounded-lg bg-white/10"
                                                            />
                                                        ) : (
                                                            <View className="w-9 h-12 rounded-lg bg-white/10 items-center justify-center">
                                                                <Film color="#707080" size={16} />
                                                            </View>
                                                        )}
                                                        <View className="flex-1">
                                                            <Text className="font-outfit-bold text-[14px] text-white" numberOfLines={1}>
                                                                {movie.title}
                                                            </Text>
                                                            {movie.year && (
                                                                <Text className="font-outfit text-[11px] opacity-40 mt-0.5">
                                                                    {movie.year}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>

                                                    <View className={`px-3 py-1.5 rounded-full flex-row items-center gap-x-1 ${isAdded ? 'bg-white/10' : 'bg-accent/20 border border-accent/40'
                                                        }`}>
                                                        {isAdded ? (
                                                            <Text className="font-outfit-semi text-[11px] text-white/50">Added</Text>
                                                        ) : (
                                                            <>
                                                                <Plus color={ACCENT} size={14} />
                                                                <Text style={{ color: ACCENT }} className="font-outfit-bold text-[11px] uppercase tracking-wider">
                                                                    Add
                                                                </Text>
                                                            </>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>

                            {/* Current Favorite Movies List */}
                            <View className="gap-y-3">
                                <View className="flex-row justify-between items-center px-1">
                                    <Text className="font-outfit-bold text-[16px]">
                                        Your Favorites ({favoriteMovies.length})
                                    </Text>
                                    <Text className="font-outfit text-[11px] opacity-35">
                                        Tap trash icon to remove
                                    </Text>
                                </View>

                                {favoriteMovies.length === 0 ? (
                                    <View className="bg-white/[0.02] border border-white/[0.06] p-8 rounded-3xl items-center">
                                        <Heart color="#707080" size={32} className="mb-3 opacity-40" />
                                        <Text className="font-outfit-semi text-[15px] text-white/80">
                                            No favorite movies added yet
                                        </Text>
                                        <Text className="font-outfit text-[12px] opacity-35 text-center mt-1 leading-[20px]">
                                            Use the search bar above to find and save your favorite movies!
                                        </Text>
                                    </View>
                                ) : (
                                    <Animated.View layout={LinearTransition} className="gap-y-2.5">
                                        {favoriteMovies.map((movie) => (
                                            <Animated.View
                                                entering={FadeIn}
                                                exiting={FadeOut.duration(200)}
                                                layout={LinearTransition}
                                                key={movie.id}
                                                className="bg-white/[0.04] border border-white/[0.08] p-4 rounded-2xl flex-row justify-between items-center"
                                            >
                                                <View className="flex-row items-center gap-x-3.5 flex-1 mr-3">
                                                    {movie.poster_path ? (
                                                        <Image
                                                            source={{
                                                                uri: movie.poster_path.startsWith('http')
                                                                    ? movie.poster_path
                                                                    : `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                                                            }}
                                                            className="w-10 h-14 rounded-xl bg-white/10"
                                                        />
                                                    ) : (
                                                        <View className="w-10 h-14 rounded-xl bg-accent/15 items-center justify-center border border-accent/25">
                                                            <Film color={ACCENT} size={20} />
                                                        </View>
                                                    )}
                                                    <View className="flex-1">
                                                        <Text className="font-outfit-bold text-[15px] text-white" numberOfLines={2}>
                                                            {movie.title}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    onPress={() => handleRemoveMovie(movie.id, movie.title)}
                                                    className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 active:bg-red-500/25"
                                                >
                                                    <Trash2 color="#ef4444" size={18} />
                                                </TouchableOpacity>
                                            </Animated.View>
                                        ))}
                                    </Animated.View>
                                )}
                            </View>
                        </MotiView>
                    </ScrollView>
                )}

                {/* Fixed Bottom Action Bar */}
                <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 300, type: 'spring' }}
                    className="absolute bottom-8 right-6 left-6"
                >
                    <TouchableOpacity
                        className="py-4 px-6 rounded-2xl bg-accent flex-row items-center justify-between shadow-lg"
                        onPress={handleSave}
                        disabled={saving || loading}
                    >
                        {saving ? (
                            <View className="flex-1 items-center justify-center py-0.5">
                                <ActivityIndicator color="#000" size="small" />
                            </View>
                        ) : (
                            <>
                                <View>
                                    <Text className="font-outfit-bold text-[15px] text-black uppercase tracking-wider">
                                        {fromStep1 ? 'Save & Finish' : 'Save Preferences'}
                                    </Text>
                                </View>
                                <View className="w-9 h-9 rounded-full bg-black/10 items-center justify-center">
                                    <Check color="#000" size={20} strokeWidth={2.5} />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                </MotiView>
            </SafeAreaView>
        </View>
    );
}
