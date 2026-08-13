import { useRouter } from 'expo-router';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import FilmView, { MovieViewProps } from '@/components/FilmView';
import { ratingService, WatchlistMovie } from '@/services/ratingService';
import { Colors } from '@/constants/theme';
import TouchableOpacity from '@/components/TouchableOpacity';

const ACCENT = Colors.dark.accent;

export default function WatchlistScreen() {
    const router = useRouter();
    const [movies, setMovies] = useState<WatchlistMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWatchlist = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const data = await ratingService.getWatchlist();
            setMovies(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load watchlist');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWatchlist(false);
    };

    return (
        <View className="flex-1 bg-transparent pt-10">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-6 pt-5 pb-3 flex-row justify-between items-center"
                >
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                        <ArrowLeft color="#fff" size={20} strokeWidth={2} />
                        <Text className="font-outfit text-[13px] opacity-40 uppercase tracking-[2px]">Back</Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full">
                        <Bookmark color={ACCENT} size={12} fill={ACCENT} />
                        <Text className="font-outfit-bold text-[10px] text-white uppercase tracking-wider">Watchlist</Text>
                    </View>
                </MotiView>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color={ACCENT} size="large" />
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="font-outfit-semi text-[18px] mb-2 text-red-400">Error</Text>
                        <Text className="font-outfit text-[14px] opacity-40 text-center mb-6">{error}</Text>
                        <TouchableOpacity
                            onPress={() => fetchWatchlist()}
                            className="bg-accent px-6 py-3 rounded-full"
                        >
                            <Text className="font-outfit-semi text-black">Try again</Text>
                        </TouchableOpacity>
                    </View>
                ) : movies.length === 0 ? (
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
                        className="px-6"
                    >
                        <MotiView
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="items-center"
                        >
                            <View className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] items-center justify-center mb-5">
                                <Bookmark color="#707080" size={28} />
                            </View>
                            <Text className="font-outfit-bold text-[20px] mb-2 text-white/90">Your watchlist is empty</Text>
                            <Text className="font-outfit text-[13px] opacity-35 text-center px-6 leading-[20px]">
                                Add films you want to see later to keep them here and customize your recommendations.
                            </Text>
                        </MotiView>
                    </ScrollView>
                ) : (
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
                        className="px-5 mt-2"
                    >
                        <MotiView
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ duration: 500 }}
                            className="gap-y-4"
                        >
                            <View className="mb-2">
                                <Text className="font-outfit text-[22px] uppercase tracking-wide text-white/80">Saved Movies</Text>
                                <Text className="font-outfit text-[12px] opacity-30 mt-0.5">
                                    You have {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in your list
                                </Text>
                            </View>

                            {movies.map((item) => {
                                const mappedMovie: MovieViewProps = {
                                    movie_id: item.movie_id,
                                    title: item.title,
                                    poster_path: item.poster_path,
                                    genres: item.genre || [],
                                    duration: item.runtime ? `${item.runtime} min` : undefined,
                                    release_date: item.release_date || undefined,
                                    initialReaction: 'WATCHLIST'
                                };
                                return <FilmView key={item.movie_id} movieData={mappedMovie} groupName="Watchlist" />;
                            })}
                        </MotiView>
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}
