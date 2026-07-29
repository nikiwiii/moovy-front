import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft, Check, CheckCheck, ChevronRight, Clapperboard, Clock, Cog, Crown,
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
    useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence,
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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';

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
                    {isReady ? 'Ready' : 'Waiting for preferences...'}
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
    const dotRotation = useSharedValue(0);
    const reelRotation = useSharedValue(0);

    useEffect(() => {
        dotRotation.value = withRepeat(
            withTiming(360, { duration: 3000, easing: Easing.linear }),
            -1,
            false
        );
        reelRotation.value = withRepeat(
            withTiming(360, { duration: 7000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const dotStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${dotRotation.value}deg` }],
    }));

    const reelStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${reelRotation.value}deg` }],
    }));

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 500 }}
            className="items-center w-full"
        >
            <View className="relative w-32 h-32 items-center justify-center">
                {/* Outer pulsing ring 1 */}
                <MotiView
                    from={{ scale: 0.7, opacity: 0.6 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{
                        type: 'timing',
                        duration: 2000,
                        loop: true,
                    }}
                    style={{
                        position: 'absolute',
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        borderWidth: 1.5,
                        borderColor: `${ACCENT}40`,
                    }}
                />

                {/* Inner pulsing ring 2 */}
                <MotiView
                    from={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: 1.1, opacity: 0 }}
                    transition={{
                        type: 'timing',
                        duration: 2000,
                        delay: 700,
                        loop: true,
                    }}
                    style={{
                        position: 'absolute',
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        borderWidth: 1,
                        borderColor: `${ACCENT}60`,
                    }}
                />

                {/* Orbiting dot */}
                <Animated.View
                    style={[
                        dotStyle,
                        {
                            position: 'absolute',
                            width: 86,
                            height: 86,
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                        }
                    ]}
                >
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT }} />
                </Animated.View>

                {/* Central glowing background */}
                <View className="absolute w-[60px] h-[60px] rounded-full bg-accent/5 border border-accent/20 items-center justify-center shadow-lg shadow-accent/25" />

                {/* Rotating film reel in background */}
                <Animated.View
                    style={[
                        reelStyle,
                        { position: 'absolute' }
                    ]}
                >
                    <Film color={ACCENT} size={50} strokeWidth={1.2} style={{ opacity: 0.18 }} />
                </Animated.View>

                {/* Tilting & Pulsing clapperboard in foreground */}
                <MotiView
                    animate={{
                        rotate: ['-10deg', '10deg'],
                        scale: [0.92, 1.08]
                    }}
                    transition={{
                        type: 'timing',
                        duration: 1100,
                        loop: true,
                        easing: Easing.bezier(0.25, 1, 0.5, 1),
                    }}
                    style={{ position: 'absolute' }}
                >
                    <Clapperboard color={ACCENT} size={30} strokeWidth={1.8} />
                </MotiView>
            </View>

            <Text className="font-outfit-bold text-[18px] mb-1.5 tracking-tight text-white">
                AI is choosing a movie
            </Text>
            <Text className="font-outfit text-[13px] opacity-40 text-center px-8">
                Mixing your group preferences to find the perfect match...
            </Text>
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
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

    const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        visible: false,
        message: '',
        type: 'info'
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ visible: true, message, type });
    };

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
            showToast(err.message, 'error');
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
            showToast(err.message, 'error');
        } finally {
            setRecommendLoading(false);
        }
    };

    // Delete session (host only)
    const handleDelete = () => {
        setDeleteConfirmVisible(true);
    };

    const confirmDelete = async () => {
        setDeleteConfirmVisible(false);
        setDeleteLoading(true);
        try {
            await sessionService.deleteSession(sessionId);
            router.replace('/home');
        } catch (err: any) {
            showToast(err.message, 'error');
            setDeleteLoading(false);
        }
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
            movie_id: rec.movie_id,
            tmdb_id: rec.tmdb_id,
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
                    movie_id: extra.movie_id,
                    tmdb_id: extra.tmdb_id,
                    title: extra.movie_title,
                    description: "An alternative suggestion from our system, tailored to your taste.",
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
                <Text className="font-outfit-semi text-[18px] mb-2">Session not found</Text>
                <Text className="font-outfit text-[14px] opacity-40 text-center mb-6">{error || 'Session does not exist'}</Text>
                <TouchableOpacity onPress={() => router.back()} className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnSecondary}`}>
                    <Text className="font-outfit opacity-60">Back</Text>
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
                        <Text className="font-outfit text-[13px] opacity-40 uppercase tracking-[2px]">Back</Text>
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
                                <Text style={{ color: `${ACCENT}99` }} className="font-outfit text-[11px] uppercase tracking-[3px]">Movie session</Text>
                            </View>
                            <View className="flex-row items-center gap-3">
                                {session.meeting_type === 'RANDKA' ? <Heart color={ACCENT} size={24} fill={`${ACCENT}33`} strokeWidth={2.5} /> :
                                    session.meeting_type === 'EKIPA' ? <UsersRound color={ACCENT} size={24} strokeWidth={2.5} /> :
                                        session.meeting_type === 'RODZINA' ? <Home color={ACCENT} size={24} strokeWidth={2.5} /> :
                                            <UserRound color={ACCENT} size={24} strokeWidth={2.5} />}
                                <Text className="font-outfit-bold text-[28px] leading-tight">
                                    {session.meeting_type === 'RANDKA' ? 'Date' :
                                        session.meeting_type === 'EKIPA' ? 'Crew' :
                                            session.meeting_type === 'RODZINA' ? 'Family' : 'Solo'}
                                </Text>
                            </View>
                            <Text className="font-outfit text-[13px] opacity-30 mt-1">
                                Code: {session.invite_code} • {memberCount} {memberCount === 1 ? 'member' : 'members'}
                            </Text>
                        </View>

                        {/* Members section */}
                        <CollapsibleSection
                            title="Members"
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
                                    title="Your preferences"
                                    icon={Film}
                                    defaultOpen={true}
                                >
                                    <GenreSelection
                                        liked={genres.liked}
                                        disliked={genres.disliked}
                                        onToggleVibe={toggleGenre}
                                        label1="Include"
                                        label2="Exclude"
                                    />
                                </CollapsibleSection>

                                <CollapsibleSection title="Settings" icon={Cog}>
                                    <View className="gap-2">
                                        {/* Runtime slider */}
                                        <View className={`${FillStyles.pillBase} ${FillStyles.pillActive} flex-row items-center justify-between gap-x-1 min-h-14 ${FillStyles.pillFirst}`}>
                                            <View className="flex-row items-center gap-x-2.5">
                                                <Clock size={18} color={ACCENT} />
                                                <Text className="font-outfit text-[13px]">Max runtime</Text>
                                            </View>
                                            <View className="flex-row items-center gap-x-1 justify-end flex-1 pl-4">
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
                                            <View className="flex-row items-center gap-x-2.5">
                                                <Film size={18} color={allowSeen ? ACCENT : '#707080'} />
                                                <Text className="font-outfit text-[13px]">Watched movies</Text>
                                            </View>
                                            <Text style={allowSeen ? { color: ACCENT } : {}} className={`font-outfit uppercase tracking-wider text-[11px] ${allowSeen ? 'font-outfit-semi' : 'opacity-40'}`}>
                                                {allowSeen ? 'Allow' : 'Disallow'}
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
                                                <Text className="font-outfit-semi text-[15px] text-black">Submit preferences</Text>
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
                                <Text className="font-outfit-semi text-[16px] mb-1">Preferences saved</Text>
                                <Text className="font-outfit text-[13px] opacity-35 text-center">
                                    Waiting for other members...
                                </Text>
                            </MotiView>
                        )}

                        {/* Recommending state */}
                        {session.status === 'RECOMMENDING' && (
                            <RecommendingOverlay />
                        )}

                        {/* Host actions */}
                        {isHost && (
                            <Animated.View layout={LinearTransition} className="flex-col items-center gap-3">
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
                                                <Text className="font-outfit-semi text-[15px] text-black">Generate ideas</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}

                                {/* Delete session */}
                                <TouchableOpacity
                                    className={`${FillStyles.actionBtnBase} justify-center`}
                                    onPress={handleDelete}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <Trash2 color="#FF6B6B" size={16} strokeWidth={2} />
                                            <Text className="font-outfit text-[13px] text-[#FF6B6B]/80">Close session</Text>
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
                                <View className="gap-3">
                                    {moviesData.map((movie, index) => (
                                        <FilmView 
                                            key={index} 
                                            movieData={movie} 
                                            groupName={
                                                session.meeting_type === 'RANDKA' ? 'Rendezvous' :
                                                session.meeting_type === 'EKIPA' ? 'Crowd' :
                                                session.meeting_type === 'RODZINA' ? 'Family' : 'Solo'
                                            }
                                        />
                                    ))}
                                </View>
                            </MotiView>
                        )}

                        {/* Refresh button */}
                        <Animated.View layout={LinearTransition} className="items-center">
                            <TouchableOpacity
                                onPress={fetchSession}
                                className="flex-row items-center gap-2 py-2 px-4"
                            >
                                <RefreshCw color="#707080" size={14} strokeWidth={2} />
                                <Text className="font-outfit text-[12px] opacity-30">Refresh</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </MotiView>
                </ScrollView>
            </SafeAreaView>

            <ConfirmDialog
                visible={deleteConfirmVisible}
                title="Close session"
                message="Are you sure you want to close this session? This action cannot be undone."
                confirmText="Close"
                isDestructive
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmVisible(false)}
            />

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
}
