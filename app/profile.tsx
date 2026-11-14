import { useRouter } from 'expo-router';
import { Cog, Bookmark, UserRound, LogIn, Star, Users, Edit3, X, Check, Trash2, Camera, Search, SlidersHorizontal, ArrowUpDown, Heart } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, SafeAreaView, ScrollView, TextInput, Image, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import FilmView, { MovieViewProps } from '@/components/FilmView';
import { ratingService, WatchlistMovie, RatingHistoryItem } from '@/services/ratingService';
import { profileService, UserProfile } from '@/services/profileService';
import { storageService } from '@/services/storageService';
import { Colors } from '@/constants/theme';
import { API_URL } from '@/constants/config';
import { getVibeColor } from '@/constants/vibes';
import { LinearGradient } from 'expo-linear-gradient';
import TouchableOpacity from '@/components/TouchableOpacity';
import Toast from '@/components/Toast';

import * as ImagePicker from 'expo-image-picker';

const ACCENT = Colors.dark.accent;

export default function ProfileScreen() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [movies, setMovies] = useState<WatchlistMovie[]>([]);
    const [ratings, setRatings] = useState<RatingHistoryItem[]>([]);
    const [activeTab, setActiveTab] = useState<'watchlist' | 'ratings'>('watchlist');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search, Filter & Sort states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, LOVE, LIKE, DISLIKE, HATE, WATCHED
    const [sortBy, setSortBy] = useState<'default' | 'title_asc' | 'title_desc'>('default');

    // Edit Profile Modal states
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editNickname, setEditNickname] = useState('');
    const [editPicture, setEditPicture] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
        title?: string;
    }>({ visible: false, message: '', type: 'info' });

    const [userVibes, setUserVibes] = useState<string[]>([]);
    const [userNoAnime, setUserNoAnime] = useState(false);
    const [userNoAnimation, setUserNoAnimation] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' | 'info', title?: string) => {
        setToast({ visible: true, message, type, title });
    };

    const checkAuthAndFetch = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const token = await storageService.getToken();
            const logged = !!token;
            setIsLoggedIn(logged);

            if (logged) {
                const userEmail = await storageService.getUserEmail();
                setEmail(userEmail);

                const userId = await storageService.getUserId();

                // Fetch profile, watchlist, rating history and user preferences in parallel
                const [userProf, watchlistData, historyData] = await Promise.all([
                    profileService.getProfile().catch(e => {
                        console.error('Error fetching profile:', e);
                        return null;
                    }),
                    ratingService.getWatchlist(),
                    ratingService.getHistory()
                ]);

                if (userProf) setProfile(userProf);
                setMovies(watchlistData);
                setRatings(historyData.filter(item => item.status !== 'WATCHLIST'));

                // Fetch user preferences for border styling & restriction badges
                try {
                    let prefVibes: string[] = [];
                    let noAnimePref = false;
                    let noAnimationPref = false;
                    if (token && userId && API_URL) {
                        const res = await fetch(`${API_URL}/preferences/get?user_id=${userId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data?.vibes && Array.isArray(data.vibes)) {
                                prefVibes = data.vibes;
                            }
                            noAnimePref = !!data?.no_anime;
                            noAnimationPref = !!data?.no_animation;
                        }
                    }
                    if (prefVibes.length === 0) {
                        const lp = await storageService.getLocalPreferences();
                        if (lp?.vibes && Array.isArray(lp.vibes)) {
                            prefVibes = lp.vibes;
                        }
                        if (lp?.no_anime) noAnimePref = true;
                        if (lp?.no_animation) noAnimationPref = true;
                    }
                    setUserVibes(prefVibes);
                    setUserNoAnime(noAnimePref);
                    setUserNoAnimation(noAnimationPref);
                } catch (e) {
                    console.error('Error fetching user preference vibes for profile:', e);
                }
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

    const vibeBorderColors: [string, string, ...string[]] = useMemo(() => {
        if (!userVibes || userVibes.length === 0) {
            return [ACCENT, '#2699E0', '#F5C719', '#F06292'];
        }
        const colors = userVibes.map(v => getVibeColor(v));
        if (colors.length === 1) {
            return [colors[0], colors[0]];
        }
        return [colors[0], colors[1], ...colors.slice(2)];
    }, [userVibes]);

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        checkAuthAndFetch(false);
    };

    const filteredMovies = useMemo(() => {
        let list = [...movies];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(m => m.title.toLowerCase().includes(q));
        }
        if (sortBy === 'title_asc') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'title_desc') {
            list.sort((a, b) => b.title.localeCompare(a.title));
        }
        return list;
    }, [movies, searchQuery, sortBy]);

    const filteredRatings = useMemo(() => {
        let list = [...ratings];
        if (statusFilter !== 'ALL') {
            list = list.filter(r => r.status.toUpperCase() === statusFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(r => r.title.toLowerCase().includes(q));
        }
        if (sortBy === 'title_asc') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'title_desc') {
            list.sort((a, b) => b.title.localeCompare(a.title));
        }
        return list;
    }, [ratings, searchQuery, statusFilter, sortBy]);

    const cycleSort = () => {
        if (sortBy === 'default') setSortBy('title_asc');
        else if (sortBy === 'title_asc') setSortBy('title_desc');
        else setSortBy('default');
    };

    const handleOpenEditModal = () => {
        setEditNickname(profile?.nickname || (email ? email.split('@')[0] : ''));
        setEditPicture(profile?.profile_picture || '');
        setIsEditModalVisible(true);
    };

    const handlePickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                showToast('Permission to access photo gallery is required', 'error', 'Permission Denied');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const asset = result.assets[0];
                if (asset.base64) {
                    setEditPicture(`data:image/jpeg;base64,${asset.base64}`);
                } else if (asset.uri) {
                    setEditPicture(asset.uri);
                }
            }
        } catch (err: any) {
            console.error('Error picking image:', err);
            showToast('Failed to pick image from gallery', 'error', 'Error');
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            if (editNickname.trim() && editNickname !== profile?.nickname) {
                await profileService.updateNickname(editNickname.trim());
            }

            if (editPicture !== profile?.profile_picture) {
                if (editPicture) {
                    await profileService.updateProfilePicture(editPicture);
                } else {
                    await profileService.deleteProfilePicture();
                }
            }

            showToast('Profile updated successfully', 'success', 'Saved');
            setIsEditModalVisible(false);
            checkAuthAndFetch(false);
        } catch (err: any) {
            showToast(err.message || 'Failed to update profile', 'error', 'Error');
        } finally {
            setSavingProfile(false);
        }
    };

    const username = profile?.nickname || (email ? email.split('@')[0] : 'moovy user');
    const avatarUri = profile?.profile_picture
        ? (profile.profile_picture.startsWith('http') || profile.profile_picture.startsWith('data:')
            ? profile.profile_picture
            : `data:image/png;base64,${profile.profile_picture}`)
        : null;

    const modalAvatarUri = editPicture
        ? (editPicture.startsWith('http') || editPicture.startsWith('data:')
            ? editPicture
            : `data:image/png;base64,${editPicture}`)
        : null;

    return (
        <View className="flex-1 bg-transparent pt-10">
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
            />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-6 pt-5 pb-3 flex-row justify-between items-center"
                >
                    <Text className="font-outfit text-[22px] uppercase tracking-wide text-white/80">My Space</Text>
                    <View className="flex-row items-center gap-x-2.5">
                        <TouchableOpacity
                            onPress={() => router.push('/favourites' as any)}
                            className="w-10 h-10 rounded-full bg-white/[0.06] items-center justify-center border border-white/[0.08]"
                        >
                            <Heart color="#fff" size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/settings' as any)}
                            className="w-10 h-10 rounded-full bg-white/[0.06] items-center justify-center border border-white/[0.08]"
                        >
                            <Cog color="#fff" size={20} />
                        </TouchableOpacity>
                    </View>
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
                            className="items-center"
                        >
                            <Text className="font-outfit-bold text-[20px] mb-2 text-center text-white">Join Moovy!</Text>
                            <Text className="font-outfit text-[13px] opacity-35 text-center mb-8 px-4 leading-[20px]">
                                this app is real fucking good
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/login')}
                                className="bg-accent py-4 px-8 rounded-2xl flex-row justify-center items-center w-full"
                            >
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
                            {/* Profile card with vibe preference gradient border */}
                            <LinearGradient
                                colors={vibeBorderColors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ padding: 1, borderRadius: 16 }}
                            >
                                <View className="bg-[#0c0a1d] p-[18px] rounded-[15px] flex-row items-center justify-between gap-x-4">
                                    <View className="flex-row items-center gap-x-4 flex-1">
                                        {avatarUri ? (
                                            <Image source={{ uri: avatarUri }} className="w-[70px] h-[70px] rounded-full border border-accent/40" />
                                        ) : (
                                            <View className="w-[70px] h-[70px] rounded-full bg-accent/15 items-center justify-center border border-accent/25">
                                                <UserRound color={ACCENT} size={26} strokeWidth={2} />
                                            </View>
                                        )}
                                        <View className="flex-1">
                                            <Text className="font-outfit-bold text-[18px] text-white capitalize">{username}</Text>
                                            <Text className="font-outfit text-[12px] opacity-35 mt-0.5">{email}</Text>
                                            {(userNoAnime || userNoAnimation) && (
                                                <View className="flex-row flex-wrap gap-1 mt-1.5">
                                                    {userNoAnime && (
                                                        <View className="px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40">
                                                            <Text style={{ color: ACCENT }} className="font-outfit-bold text-[10px] uppercase tracking-wider">No Anime</Text>
                                                        </View>
                                                    )}
                                                    {userNoAnimation && (
                                                        <View className="px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40">
                                                            <Text style={{ color: ACCENT }} className="font-outfit-bold text-[10px] uppercase tracking-wider">No Animation</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={handleOpenEditModal}
                                        className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08]"
                                    >
                                        <Edit3 color={ACCENT} size={18} />
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>

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
                                    <Text className="font-outfit text-[10px] uppercase tracking-[1px] mt-0.5" style={{ opacity: 0.35 }}>Ratings</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => router.push('/friendboard' as any)}
                                    className="flex-1 bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl items-center opacity-60 active:opacity-100"
                                >
                                    <Users color={ACCENT} size={20} className="mb-1" />
                                    <Text className="font-outfit-bold text-[22px] text-white">∞</Text>
                                    <Text className="font-outfit text-[10px] opacity-35 uppercase tracking-[1px] mt-0.5">Friends</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Section content */}
                            <View className="gap-y-3">

                                {/* Search Bar & Sort Button */}
                                <View className="flex-row gap-x-2 items-center">
                                    <View className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex-row items-center px-3 py-2">
                                        <Search color="#707080" size={16} className="mr-2" />
                                        <TextInput
                                            className="flex-1 text-white font-outfit text-[13px] p-1.5"
                                            placeholder="Search movies..."
                                            placeholderTextColor="#ffffff30"
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                        />
                                        {searchQuery ? (
                                            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                                                <X color="#ffffff60" size={14} />
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>

                                    <TouchableOpacity
                                        onPress={cycleSort}
                                        className={`px-3 h-full rounded-2xl flex-row items-center gap-x-1.5 border ${sortBy !== 'default'
                                            ? 'bg-accent/15 border-accent'
                                            : 'bg-white/[0.04] border-white/[0.08]'
                                            }`}
                                    >
                                        <ArrowUpDown color={sortBy !== 'default' ? ACCENT : "#707080"} size={16} />
                                        <Text className={`font-outfit-bold text-[11px] uppercase tracking-wider`} style={{ color: sortBy !== 'default' ? ACCENT : '#ffffff99' }}>
                                            {sortBy === 'title_asc' ? 'A-Z' : sortBy === 'title_desc' ? 'Z-A' : 'Sort'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Ratings Status Filter Chips */}
                                {activeTab === 'ratings' && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                                        {['ALL', 'LOVE', 'LIKE', 'DISLIKE', 'HATE'].map((st) => (
                                            <TouchableOpacity
                                                key={st}
                                                onPress={() => setStatusFilter(st)}
                                                className={`px-3.5 py-1.5 rounded-full border mr-2 ${statusFilter === st
                                                    ? 'bg-accent border-accent'
                                                    : 'bg-white/[0.03] border-white/[0.08]'
                                                    }`}
                                            >
                                                <Text className={`font-outfit-bold text-[11px] uppercase tracking-wider ${statusFilter === st ? 'text-black' : 'text-white/60'
                                                    }`}>
                                                    {st}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}

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
                                    filteredMovies.length === 0 ? (
                                        <View className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl items-center">
                                            <Bookmark color="#707080" size={24} className="mb-3 opacity-60" />
                                            <Text className="font-outfit-semi text-[14px] text-white/80">
                                                {searchQuery ? 'No matching movies found' : 'Watchlist is empty'}
                                            </Text>
                                            <Text className="font-outfit text-[11px] opacity-30 text-center mt-1 leading-[18px]">
                                                {searchQuery ? 'Try clearing your search query' : 'Films you save will show up here.'}
                                            </Text>
                                        </View>
                                    ) : (
                                        filteredMovies.map((item) => {
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
                                        })
                                    )
                                ) : (
                                    filteredRatings.length === 0 ? (
                                        <View className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl items-center">
                                            <Star color="#707080" size={24} className="mb-3 opacity-60" />
                                            <Text className="font-outfit-semi text-[14px] text-white/80">
                                                {searchQuery || statusFilter !== 'ALL' ? 'No matching ratings found' : 'No rated movies'}
                                            </Text>
                                            <Text className="font-outfit text-[11px] opacity-30 text-center mt-1 leading-[18px]">
                                                {searchQuery || statusFilter !== 'ALL'
                                                    ? 'Try changing your search or status filter'
                                                    : 'Movies you rate Love, Like, Dislike, or Hate will show up here.'
                                                }
                                            </Text>
                                        </View>
                                    ) : (
                                        filteredRatings.map((item) => {
                                            const mappedMovie: MovieViewProps = {
                                                movie_id: item.movie_id,
                                                title: item.title,
                                                poster_path: item.poster_path,
                                                genres: [],
                                                initialReaction: item.status as any
                                            };
                                            return <FilmView key={item.movie_id} movieData={mappedMovie} groupName="Rating" />;
                                        })
                                    )
                                )}
                            </View>
                        </MotiView>
                    </ScrollView>
                )}
            </SafeAreaView>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <Pressable
                    className="flex-1 justify-end bg-black/50"
                    onPress={() => setIsEditModalVisible(false)}
                >
                    <Pressable
                        onPress={(e) => e.stopPropagation()}
                        className="bg-[#000313]/70 border-t border-white/10 p-6 gap-y-3"
                    >
                        <View className="flex-row justify-between items-center">
                            <Text className="font-outfit-bold text-[20px] text-white">Edit Profile</Text>
                            <TouchableOpacity
                                onPress={() => setIsEditModalVisible(false)}
                                className="p-2 rounded-full bg-white/5 border border-white/10"
                            >
                                <X color="#fff" size={18} />
                            </TouchableOpacity>
                        </View>

                        {/* Avatar preview & gallery picker */}
                        <View className="items-center mt-2 mb-4 gap-y-3">
                            <TouchableOpacity onPress={handlePickImage} className="relative">
                                {modalAvatarUri ? (
                                    <Image source={{ uri: modalAvatarUri }} className="w-24 h-24 rounded-full border-2 border-accent" />
                                ) : (
                                    <View className="w-24 h-24 rounded-full bg-accent/15 items-center justify-center border-2 border-accent/30">
                                        <UserRound color={ACCENT} size={42} />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <View className="flex-row gap-x-2">
                                <TouchableOpacity
                                    onPress={handlePickImage}
                                    className="px-4 py-2 rounded-full bg-accent/15 border border-accent/30 flex-row items-center gap-x-1.5"
                                >
                                    <Camera color={ACCENT} size={15} />
                                    <Text style={{ color: ACCENT }} className="font-outfit-bold text-[12px] uppercase tracking-wider">
                                        Choose Photo
                                    </Text>
                                </TouchableOpacity>

                                {editPicture ? (
                                    <TouchableOpacity
                                        onPress={() => setEditPicture('')}
                                        className="px-3 py-2 rounded-full bg-red-500/10 border border-red-500/20 flex-row items-center gap-x-1.5"
                                    >
                                        <Trash2 color="#ef4444" size={15} />
                                        <Text className="font-outfit-semi text-red-400 text-[12px]">Remove</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>

                        {/* Nickname input */}
                        <View className="gap-y-1.5">
                            <Text className="font-outfit text-[12px] opacity-40 uppercase tracking-[1px]">Nickname</Text>
                            <TextInput
                                className="bg-white/[0.06] border border-white/[0.12] rounded-2xl p-4 text-white font-outfit text-[15px]"
                                placeholder="Enter nickname"
                                placeholderTextColor="#ffffff40"
                                value={editNickname}
                                onChangeText={setEditNickname}
                            />
                        </View>

                        {/* Save / Cancel actions */}
                        <View className="flex-row gap-x-3 mb-6">
                            <TouchableOpacity
                                onPress={() => setIsEditModalVisible(false)}
                                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 items-center"
                            >
                                <Text className="font-outfit-semi text-white text-[14px]">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveProfile}
                                disabled={savingProfile}
                                className="flex-1 py-4 rounded-2xl bg-accent items-center flex-row justify-center gap-x-2"
                            >
                                {savingProfile ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <>
                                        <Check color="#000" size={18} strokeWidth={2.5} />
                                        <Text className="font-outfit-bold text-black text-[14px] uppercase tracking-wider">Save</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
