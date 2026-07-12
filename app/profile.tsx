import { useRouter } from 'expo-router';
import { Cog, Bookmark, UserRound, LogIn, Star, Users } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import FilmView, { MovieViewProps } from '@/components/FilmView';
import { ratingService, WatchlistMovie, RatingHistoryItem } from '@/services/ratingService';
import { storageService } from '@/services/storageService';
import { Colors } from '@/constants/theme';
import TouchableOpacity from '@/components/TouchableOpacity';

const ACCENT = Colors.dark.accent;

export default function ProfileScreen() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [movies, setMovies] = useState<WatchlistMovie[]>([]);
    const [ratings, setRatings] = useState<RatingHistoryItem[]>([]);
    const [activeTab, setActiveTab] = useState<'watchlist' | 'ratings'>('watchlist');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkAuthAndFetch = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const token = await storageService.getToken();
            const logged = !!token;
            setIsLoggedIn(logged);

            if (logged) {
                const userEmail = await storageService.getUserEmail();
                setEmail(userEmail);

                // Fetch both watchlist and rating history in parallel
                const [watchlistData, historyData] = await Promise.all([
                    ratingService.getWatchlist(),
                    ratingService.getHistory()
                ]);

                setMovies(watchlistData);
                setRatings(historyData);
            }
            setError(null);
        } catch (err: any) {
            console.error('Failed to load profile data:', err);
            setError(err.message || 'Failed to load profile data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        checkAuthAndFetch(false);
    };

    const username = email ? email.split('@')[0] : 'moovy user';

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
                    <Text className="font-outfit-bold text-[24px]">My Space</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/settings' as any)}
                        className="w-10 h-10 rounded-full bg-white/[0.06] items-center justify-center border border-white/[0.08]"
                    >
                        <Cog color="#fff" size={20} />
                    </TouchableOpacity>
                </MotiView>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color={ACCENT} size="large" />
                    </View>
                ) : !isLoggedIn ? (
                    <View className="flex-1 justify-center px-6">
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/[0.04] border border-white/[0.08] p-8 rounded-[32px] items-center"
                        >
                            <View className="bg-accent/15 p-4 rounded-full mb-5">
                                <UserRound color={ACCENT} size={36} />
                            </View>
                            <Text className="font-outfit-bold text-[20px] mb-2 text-center text-white">Join the Movie Night Cloud</Text>
                            <Text className="font-outfit text-[13px] opacity-35 text-center mb-8 px-4 leading-[20px]">
                                Log in to sync your personal vibe, build a watchlist of movies to see later, and matching tastes with your friends!
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/login')}
                                className="bg-accent py-4 px-8 rounded-2xl flex-row justify-center items-center w-full"
                            >
                                <LogIn color="#000" size={18} strokeWidth={2.5} className="mr-2" />
                                <Text className="font-outfit-bold text-black text-[15px] uppercase tracking-wider">Log In or Sign Up</Text>
                            </TouchableOpacity>
                        </MotiView>
                    </View>
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
                            className="gap-y-3"
                        >
                            {/* Profile card */}
                            <View className="bg-white/[0.04] border border-white/[0.08] p-5 rounded-2xl flex-row items-center gap-x-4">
                                <View className="w-14 h-14 rounded-full bg-accent/15 items-center justify-center border border-accent/25">
                                    <UserRound color={ACCENT} size={26} strokeWidth={2} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-outfit-bold text-[18px] text-white capitalize">{username}</Text>
                                    <Text className="font-outfit text-[12px] opacity-35 mt-0.5">{email}</Text>
                                </View>
                            </View>

                            {/* Stats & Nav Cards */}
                            <View className="flex-row gap-x-3">
                                <TouchableOpacity
                                    onPress={() => setActiveTab('watchlist')}
                                    className={`flex-1 p-4 rounded-2xl items-center border transition-all ${activeTab === 'watchlist'
                                        ? 'bg-accent/15 border-accent'
                                        : 'bg-white/[0.02] border-white/[0.06] opacity-60'
                                        }`}
                                >
                                    <Bookmark color={ACCENT} size={20} fill={activeTab === 'watchlist' ? `${ACCENT}33` : "transparent"} className="mb-1" />
                                    <Text className="font-outfit-bold text-[22px] text-white">{movies.length}</Text>
                                    <Text className="font-outfit text-[10px] opacity-35 uppercase tracking-[1px] mt-0.5">Watchlist</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setActiveTab('ratings')}
                                    className={`flex-1 p-4 rounded-2xl items-center border transition-all ${activeTab === 'ratings'
                                        ? 'bg-accent/15 border-accent'
                                        : 'bg-white/[0.02] border-white/[0.06] opacity-60'
                                        }`}
                                >
                                    <Star color={ACCENT} size={20} fill={activeTab === 'ratings' ? `${ACCENT}33` : "transparent"} className="mb-1" />
                                    <Text className="font-outfit-bold text-[22px] text-white">{ratings.length}</Text>
                                    <Text className="font-outfit text-[10px] opacity-35 uppercase tracking-[1px] mt-0.5">Ratings</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => router.push('/friendboard' as any)}
                                    className="flex-1 bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl items-center opacity-60 active:opacity-100"
                                >
                                    <Users color={ACCENT} size={20} className="mb-1" />
                                    <Text className="font-outfit-bold text-[22px] text-white">8</Text>
                                    <Text className="font-outfit text-[10px] opacity-35 uppercase tracking-[1px] mt-0.5">Friends</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Section content */}
                            <View className="gap-y-4">
                                <View>
                                    <Text className="font-outfit-bold text-[20px]">
                                        {activeTab === 'watchlist' ? 'My Watchlist' : 'My Ratings'}
                                    </Text>
                                    <Text className="font-outfit text-[12px] opacity-30 mt-0.5">
                                        {activeTab === 'watchlist'
                                            ? 'Your saved movies to watch later'
                                            : 'Movies you have rated'
                                        }
                                    </Text>
                                </View>

                                {error ? (
                                    <View className="py-8 items-center">
                                        <Text className="font-outfit text-[13px] text-red-400 mb-4">{error}</Text>
                                        <TouchableOpacity
                                            onPress={onRefresh}
                                            className="bg-white/[0.06] border border-white/[0.1] px-4 py-2 rounded-full"
                                        >
                                            <Text className="font-outfit-semi text-[12px]">Retry</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : activeTab === 'watchlist' ? (
                                    movies.length === 0 ? (
                                        <View className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl items-center">
                                            <Bookmark color="#707080" size={24} className="mb-3 opacity-60" />
                                            <Text className="font-outfit-semi text-[14px] text-white/80">Watchlist is empty</Text>
                                            <Text className="font-outfit text-[11px] opacity-30 text-center mt-1 leading-[18px]">
                                                Films you save will show up here.
                                            </Text>
                                        </View>
                                    ) : (
                                        movies.map((item) => {
                                            const mappedMovie: MovieViewProps = {
                                                movie_id: item.movie_id,
                                                title: item.title,
                                                poster_path: item.poster_path,
                                                genres: item.genre || [],
                                                duration: item.runtime ? `${item.runtime} min` : undefined,
                                                release_date: item.release_date || undefined,
                                                initialReaction: 'WATCHLIST'
                                            };
                                            return <FilmView key={item.movie_id} movieData={mappedMovie} />;
                                        })
                                    )
                                ) : (
                                    ratings.length === 0 ? (
                                        <View className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl items-center">
                                            <Star color="#707080" size={24} className="mb-3 opacity-60" />
                                            <Text className="font-outfit-semi text-[14px] text-white/80">No rated movies</Text>
                                            <Text className="font-outfit text-[11px] opacity-30 text-center mt-1 leading-[18px]">
                                                Movies you rate Love, Like, Dislike, or Hate will show up here.
                                            </Text>
                                        </View>
                                    ) : (
                                        ratings.map((item) => {
                                            const mappedMovie: MovieViewProps = {
                                                movie_id: item.movie_id,
                                                title: item.title,
                                                poster_path: item.poster_path,
                                                genres: [],
                                                initialReaction: item.status as any
                                            };
                                            return <FilmView key={item.movie_id} movieData={mappedMovie} />;
                                        })
                                    )
                                )}
                            </View>
                        </MotiView>
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}
