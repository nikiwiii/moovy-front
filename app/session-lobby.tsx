import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft, Check, CheckCheck, ChevronRight, Clock, Cog, Crown,
    Film, Heart, Home, Loader2, RefreshCw, Smile, Sparkles, Trash2, UserRound, UsersRound, X, Zap,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, SafeAreaView, ScrollView, View, Dimensions,
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, {
    Easing, FadeIn, FadeOut, LinearTransition,
    useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import TouchableOpacity from '../components/TouchableOpacity';
import CollapsibleSection from '../components/CollapsibleSection';
import GenreSelection from '../components/GenreSelection';
import { FillStyles } from '../constants/themeStyles';
import {
    sessionService, SessionResponse, SessionPreferences, SessionMember,
} from '../services/sessionService';
import { storageService } from '../services/storageService';
import Slider from '@react-native-community/slider';
import FilmView, { MovieViewProps } from '@/components/FilmView';
import { Colors } from '@/constants/theme';
import StatusBadge from '@/components/StatusBadge';

const ACCENT = Colors.dark.accent;

const { width } = Dimensions.get('window');

/* ─── Member card ───────────────────────────────────────────────────── */
function MemberCard({ member, isHost }: { member: SessionMember; isHost: boolean }) {
    const isReady = member.status === 'ready';
    return (
        <Animated.View
            entering={FadeIn.duration(400)}
            layout={LinearTransition}
            className={`${FillStyles.pillBase} ${isReady ? FillStyles.pillActive : FillStyles.pillInactive} flex-row items-center gap-3 py-3.5 px-4 rounded-[24px]`}
        >
            <View className={`w-9 h-9 rounded-full items-center justify-center ${isReady ? 'bg-accent/15' : 'bg-white/[0.06]'}`}>
                {isHost ? (
                    <Crown color={isReady ? ACCENT : '#707080'} size={16} strokeWidth={2} />
                ) : (
                    <UserRound color={isReady ? ACCENT : '#707080'} size={16} strokeWidth={2} />
                )}
            </View>
            <View className="flex-1">
                <Text className="font-outfit-semi text-[14px]">{member.user_name}</Text>
                <Text style={isReady ? { color: `${ACCENT}99` } : {}} className={`font-outfit text-[11px] mt-0.5 ${!isReady ? 'opacity-30' : ''}`}>
                    {isReady ? 'Gotowy' : 'Oczekiwanie na preferencje...'}
                </Text>
            </View>
            <View className={`w-7 h-7 rounded-full items-center justify-center ${isReady ? 'bg-accent' : 'bg-white/[0.06] border border-white/[0.08]'}`}>
                {isReady ? (
                    <Check color="#000" size={14} strokeWidth={3} />
                ) : (
                    <Clock color="#707080" size={12} strokeWidth={2} />
                )}
            </View>
        </Animated.View>
    );
}

/* ─── Recommending animation overlay ─────────────────────────────────── */
function RecommendingOverlay() {
    const rotation = useSharedValue(0);
    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 2000, easing: Easing.linear }),
            -1, false
        );
    }, []);
    const rotateStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="items-center py-8"
        >
            <Animated.View style={[rotateStyle, { marginBottom: 16 }]}>
                <Sparkles color={ACCENT} size={32} strokeWidth={1.5} />
            </Animated.View>
            <Text className="font-outfit-semi text-[16px] mb-1">AI myśli nad filmem</Text>
            <Text className="font-outfit text-[13px] opacity-35">To może potrwać chwilę...</Text>
        </MotiView>
    );
}


/* ─── Main lobby screen ─────────────────────────────────────────────── */
export default function SessionLobbyScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const sessionId = params.sessionId as string;
    const isHostParam = params.isHost === 'true';

    const [session, setSession] = useState<SessionResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recommendLoading, setRecommendLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Preferences state for the current user
    const [prefsSubmitted, setPrefsSubmitted] = useState(false);
    const [genres, setGenres] = useState({ liked: [] as string[], disliked: [] as string[] });
    const [maxRuntime, setMaxRuntime] = useState(240);
    const [allowSeen, setAllowSeen] = useState(false);
    const [submittingPrefs, setSubmittingPrefs] = useState(false);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load user id
    useEffect(() => {
        storageService.getUserId().then(id => setUserId(id));
    }, []);

    // Fetch session data
    const fetchSession = useCallback(async () => {
        try {
            const data = await sessionService.getSession(sessionId);
            setSession(data);
            setError(null);
            // Check if current user already submitted prefs
            if (userId) {
                const me = data.members.find(m => m.user_id === userId);
                if (me?.status === 'ready') {
                    setPrefsSubmitted(true);
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sessionId, userId]);

    // Initial load + polling
    useEffect(() => {
        fetchSession();
        pollRef.current = setInterval(fetchSession, 4000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchSession]);

    // Toggle genres
    const toggleGenre = (genre: string, type: 'liked' | 'disliked') => {
        setGenres(prev => {
            const arr = [...prev[type]];
            if (arr.includes(genre)) arr.splice(arr.indexOf(genre), 1);
            else arr.push(genre);
            return { ...prev, [type]: arr };
        });
    };

    // Submit preferences
    const handleSubmitPreferences = async () => {
        setSubmittingPrefs(true);
        try {
            const prefs: SessionPreferences = {
                vibes: genres.liked,
                hard_nos: genres.disliked,
                max_runtime: maxRuntime,
                allow_seen: allowSeen,
                eras: [],
            };
            await sessionService.setPreferences(sessionId, prefs);
            setPrefsSubmitted(true);
            await fetchSession();
        } catch (err: any) {
            Alert.alert('Błąd', err.message);
        } finally {
            setSubmittingPrefs(false);
        }
    };

    // Trigger recommendations (host only)
    const handleRecommend = async () => {
        setRecommendLoading(true);
        try {
            await sessionService.triggerRecommendations(sessionId);
            await fetchSession();
        } catch (err: any) {
            Alert.alert('Błąd', err.message);
        } finally {
            setRecommendLoading(false);
        }
    };

    // Delete session (host only)
    const handleDelete = () => {
        Alert.alert(
            'Zamknij sesję',
            'Czy na pewno chcesz zamknąć tę sesję? Ta akcja jest nieodwracalna.',
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Zamknij', style: 'destructive', onPress: async () => {
                        setDeleteLoading(true);
                        try {
                            await sessionService.deleteSession(sessionId);
                            router.back();
                        } catch (err: any) {
                            Alert.alert('Błąd', err.message);
                            setDeleteLoading(false);
                        }
                    }
                },
            ]
        );
    };

    const isHost = session ? userId === session.host_id : isHostParam;
    const allReady = session?.members.every(m => m.status === 'ready') ?? false;
    const memberCount = session?.members.length ?? 0;
    const readyCount = session?.members.filter(m => m.status === 'ready').length ?? 0;

    // Build array of movies from recommendations
    const moviesData: MovieViewProps[] = (() => {
        if (!session?.recommendations?.length) return [];
        const rec = session.recommendations[0];

        const data: MovieViewProps[] = [{
            title: rec.movie_title,
            description: rec.reasoning_pl,
            genres: rec.genres,
            poster_path: rec.poster_path,
            release_date: rec.release_date,
            rating: rec.rating,
            duration: rec.runtime ? `${rec.runtime} min` : undefined,
        }];

        if (rec.extra_movies && Array.isArray(rec.extra_movies)) {
            rec.extra_movies.forEach((extra: any) => {
                data.push({
                    title: extra.movie_title,
                    description: "Alternatywna propozycja od naszego systemu, dobrana pod Wasz gust.",
                    genres: extra.genres,
                    poster_path: extra.poster_path,
                    release_date: extra.release_date,
                    rating: extra.rating,
                    duration: extra.runtime ? `${extra.runtime} min` : undefined,
                });
            });
        }
        return data;
    })();

    if (loading) {
        return (
            <View className="flex-1 bg-transparent items-center justify-center">
                <ActivityIndicator color={ACCENT} size="large" />
            </View>
        );
    }

    if (error || !session) {
        return (
            <View className="flex-1 bg-transparent items-center justify-center px-6">
                <Text className="font-outfit-semi text-[18px] mb-2">Nie znaleziono sesji</Text>
                <Text className="font-outfit text-[14px] opacity-40 text-center mb-6">{error || 'Sesja nie istnieje'}</Text>
                <TouchableOpacity onPress={() => router.back()} className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnSecondary}`}>
                    <Text className="font-outfit opacity-60">Wróć</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                        <Text className="font-outfit text-[13px] opacity-40 uppercase tracking-[2px]">Wróć</Text>
                    </TouchableOpacity>
                    <StatusBadge accent={ACCENT} status={session.status} />
                </MotiView>

                <ScrollView contentContainerClassName="px-4 pb-[120px]" showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 200, duration: 600 }}
                        className="flex flex-col gap-3"
                    >
                        {/* Session info header */}
                        <View className="px-2 mb-2">
                            <View className="flex-row items-center gap-2 mb-2">
                                <Text style={{ color: `${ACCENT}99` }} className="font-outfit text-[11px] uppercase tracking-[3px]">Sesja filmowa</Text>
                            </View>
                            <View className="flex-row items-center gap-3">
                                {session.meeting_type === 'RANDKA' ? <Heart color={ACCENT} size={24} fill={`${ACCENT}33`} strokeWidth={2.5} /> :
                                    session.meeting_type === 'EKIPA' ? <UsersRound color={ACCENT} size={24} strokeWidth={2.5} /> :
                                        session.meeting_type === 'RODZINA' ? <Home color={ACCENT} size={24} strokeWidth={2.5} /> :
                                            <UserRound color={ACCENT} size={24} strokeWidth={2.5} />}
                                <Text className="font-outfit-bold text-[28px] leading-tight">
                                    {session.meeting_type === 'RANDKA' ? 'Randka' :
                                        session.meeting_type === 'EKIPA' ? 'Ekipa' :
                                            session.meeting_type === 'RODZINA' ? 'Rodzina' : 'Solo'}
                                </Text>
                            </View>
                            <Text className="font-outfit text-[13px] opacity-30 mt-1">
                                Kod: {session.invite_code} • {memberCount} {memberCount === 1 ? 'osoba' : memberCount < 5 ? 'osoby' : 'osób'}
                            </Text>
                        </View>

                        {/* Members section */}
                        <CollapsibleSection
                            title="Członkowie"
                            subtitle="Kto jest w sesji?"
                            value={`${readyCount}/${memberCount}`}
                            icon={UsersRound}
                            defaultOpen={true}
                        >
                            <Animated.View layout={LinearTransition} className="gap-2">
                                {session.members.map((member) => (
                                    <MemberCard
                                        key={member.user_id}
                                        member={member}
                                        isHost={member.user_id === session.host_id}
                                    />
                                ))}
                            </Animated.View>
                        </CollapsibleSection>

                        {/* Preferences section — only if not ready yet */}
                        {!prefsSubmitted && session.status === 'LOBBY' && (
                            <>
                                <CollapsibleSection
                                    title="Twoje preferencje"
                                    subtitle="Co chcesz oglądać?"
                                    icon={Film}
                                    defaultOpen={true}
                                >
                                    <GenreSelection
                                        liked={genres.liked}
                                        disliked={genres.disliked}
                                        onToggleVibe={toggleGenre}
                                        label1="Uwzględniaj"
                                        label2="Wyklucz"
                                    />
                                </CollapsibleSection>

                                <CollapsibleSection title="Ustawienia" subtitle="Ostatnie szlify" icon={Cog}>
                                    <View className="gap-2">
                                        {/* Runtime slider */}
                                        <View className={`${FillStyles.pillBase} ${FillStyles.pillInactive} flex-row items-center justify-between gap-x-2 min-h-14 ${FillStyles.pillFirst}`}>
                                            <View className="flex-row items-center gap-x-2">
                                                <Clock size={16} color="#707080" />
                                                <Text className="font-outfit text-[13px]">Maks. czas</Text>
                                            </View>
                                            <View className="flex-row items-center gap-x-2 justify-end flex-1 pl-4">
                                                <Slider
                                                    style={{ flex: 1, minWidth: 100, height: 40 }}
                                                    minimumValue={60}
                                                    maximumValue={240}
                                                    step={10}
                                                    value={maxRuntime}
                                                    onValueChange={setMaxRuntime}
                                                    minimumTrackTintColor={ACCENT}
                                                    maximumTrackTintColor="#ffffff15"
                                                    thumbTintColor={ACCENT}
                                                />
                                                <Text className="font-outfit text-[12px] w-14 text-right opacity-60">{maxRuntime} min</Text>
                                            </View>
                                        </View>

                                        {/* Allow seen toggle */}
                                        <TouchableOpacity
                                            className={`${FillStyles.pillBase} ${allowSeen ? FillStyles.pillActive : FillStyles.pillInactive} flex-row items-center justify-between gap-x-2 min-h-14 ${FillStyles.pillLast}`}
                                            onPress={() => setAllowSeen(!allowSeen)}
                                        >
                                            <View className="flex-row items-center gap-x-2">
                                                <Film size={16} fill={allowSeen ? ACCENT : 'transparent'} color={allowSeen ? ACCENT : '#707080'} />
                                                <Text className="font-outfit text-[13px]">Filmy widziane</Text>
                                            </View>
                                            <Text style={allowSeen ? { color: ACCENT } : {}} className={`font-outfit uppercase tracking-wider text-[11px] ${allowSeen ? 'font-outfit-semi' : 'opacity-40'}`}>
                                                {allowSeen ? 'Zezwalaj' : 'Nie zezwalaj'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </CollapsibleSection>

                                {/* Submit preferences button */}
                                <Animated.View layout={LinearTransition} className="flex-row justify-end mt-1">
                                    <TouchableOpacity
                                        className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} bg-accent`}
                                        onPress={handleSubmitPreferences}
                                        disabled={submittingPrefs}
                                    >
                                        {submittingPrefs ? (
                                            <ActivityIndicator color="#000" size="small" />
                                        ) : (
                                            <>
                                                <Text className="font-outfit-semi text-[15px] text-black">Zatwierdź preferencje</Text>
                                                <CheckCheck color="#000" size={18} strokeWidth={2.5} />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            </>
                        )}

                        {/* Waiting / submitted state */}
                        {prefsSubmitted && session.status === 'LOBBY' && (
                            <MotiView
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                className={`${FillStyles.section} overflow-hidden p-6 items-center`}
                            >
                                <View className="w-14 h-14 rounded-full bg-accent/10 items-center justify-center mb-4">
                                    <Check color={ACCENT} size={24} strokeWidth={2} />
                                </View>
                                <Text className="font-outfit-semi text-[16px] mb-1">Preferencje zapisane</Text>
                                <Text className="font-outfit text-[13px] opacity-35 text-center">
                                    Oczekiwanie na pozostałych członków...
                                </Text>
                            </MotiView>
                        )}

                        {/* Recommending state */}
                        {session.status === 'RECOMMENDING' && (
                            <View className={`${FillStyles.section} overflow-hidden`}>
                                <RecommendingOverlay />
                            </View>
                        )}

                        {/* Host actions */}
                        {isHost && (
                            <Animated.View layout={LinearTransition} className="gap-3 mt-2">
                                {/* Generate recommendations button */}
                                {(session.status === 'ALL_READY') && (
                                    <TouchableOpacity
                                        className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} justify-center bg-accent`}
                                        onPress={handleRecommend}
                                        disabled={recommendLoading || !allReady}
                                    >
                                        {recommendLoading ? (
                                            <ActivityIndicator color="#000" size="small" />
                                        ) : (
                                            <>
                                                <Zap color="#000" size={18} strokeWidth={2.5} />
                                                <Text className="font-outfit-semi text-[15px] text-black">Generuj rekomendacje</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}

                                {/* Delete session */}
                                <TouchableOpacity
                                    className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnSecondary} justify-center`}
                                    onPress={handleDelete}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <Trash2 color="#FF6B6B" size={16} strokeWidth={2} />
                                            <Text className="font-outfit text-[13px] text-[#FF6B6B]/80">Zamknij sesję</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Recommendations result */}
                        {session.status === 'COMPLETED' && moviesData.length > 0 && (
                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: 200, type: 'spring', damping: 14 }}
                                className="gap-3"
                            >
                                <View className="flex-row items-center gap-2 px-2 mt-2">
                                    <Sparkles color={ACCENT} size={16} strokeWidth={2} />
                                    <Text style={{ color: `${ACCENT}99` }} className="font-outfit text-[11px] uppercase tracking-[3px]">Rekomendacje AI</Text>
                                </View>
                                <View className="gap-3">
                                    {moviesData.map((movie, index) => (
                                        <FilmView key={index} movieData={movie} />
                                    ))}
                                </View>
                            </MotiView>
                        )}

                        {/* Refresh button */}
                        <Animated.View layout={LinearTransition} className="items-center mt-4">
                            <TouchableOpacity
                                onPress={fetchSession}
                                className="flex-row items-center gap-2 py-2 px-4"
                            >
                                <RefreshCw color="#707080" size={14} strokeWidth={2} />
                                <Text className="font-outfit text-[12px] opacity-30">Odśwież</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </MotiView>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
