import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, Film, Star, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, ActivityIndicator } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import VibeSelection from '../components/GenreSelection';
import TouchableOpacity from '../components/TouchableOpacity';
import { defaultVibes, sanitizeVibesForBackend } from '../constants/vibes';
import { FillStyles } from '../constants/themeStyles';
import { storageService } from '../services/storageService';
import { metadataService } from '../services/metadataService';
import { Toast } from '@/components/Toast';
import { Colors } from '@/constants/theme';
import { API_URL } from '@/constants/config';

const ACCENT = Colors.dark.accent;

export default function PreferencesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isLocal = params.storageType === 'local';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
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
    const [noAnime, setNoAnime] = useState(false);
    const [noAnimation, setNoAnimation] = useState(false);
    const [availableVibes, setAvailableVibes] = useState<string[]>(defaultVibes);

    useEffect(() => {
        const loadPrefs = async () => {
            setLoading(true);
            try {
                try {
                    const data = await metadataService.getPreferencesOptions();
                    if (data && data.vibes && data.vibes.length > 0) {
                        setAvailableVibes(data.vibes);
                    }
                } catch (e) {
                    console.warn('Failed to load preferences options from server, using local fallbacks:', e);
                }

                const lp = await storageService.getLocalPreferences();
                const token = await storageService.getToken();
                const userId = await storageService.getUserId();

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
                            if (data) {
                                setPreferences({
                                    vibes: { liked: data.vibes || [], disliked: data.hard_nos || [] },
                                    eras: data.eras || [],
                                    movies: data.movies || []
                                });
                                setNoAnime(data.no_anime || false);
                                setNoAnimation(data.no_animation || false);
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
                    setNoAnime(lp.no_anime || false);
                    setNoAnimation(lp.no_animation || false);
                }
            } finally {
                setLoading(false);
            }
        };
        loadPrefs();
    }, [isLocal]);

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

    const handleNextStage = async () => {
        setSaving(true);
        try {
            const payload = {
                vibes: sanitizeVibesForBackend(preferences.vibes.liked),
                hard_nos: preferences.vibes.disliked,
                eras: preferences.eras,
                movies: preferences.movies,
                no_anime: noAnime,
                no_animation: noAnimation
            };

            await storageService.saveLocalPreferences(payload);

            if (!isLocal) {
                const token = await storageService.getToken();
                const userId = await storageService.getUserId();

                if (token && userId && API_URL) {
                    await fetch(`${API_URL}/preferences/save?user_id=${userId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload),
                    });
                }
            }

            router.push({
                pathname: '/favourites',
                params: {
                    fromStep1: 'true',
                    storageType: isLocal ? 'local' : 'cloud'
                }
            });
        } catch (error) {
            console.error('Save error:', error);
            // Proceed to stage 2 even if cloud sync fails
            router.push({
                pathname: '/favourites',
                params: {
                    fromStep1: 'true',
                    storageType: isLocal ? 'local' : 'cloud'
                }
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="flex-1 bg-transparent pt-10">
            <SafeAreaView className="flex-1">
                {/* Step 1 Header & Progress Bar */}
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
                            <View className="px-3 py-1 rounded-full bg-accent/15 border border-accent/30">
                                <Text style={{ color: ACCENT }} className="font-outfit-bold text-[11px] uppercase tracking-wider">
                                    Step 1 of 2 • Movie Tags
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => router.push({ pathname: '/favourites', params: { fromStep1: 'true', storageType: isLocal ? 'local' : 'cloud' } })}>
                            <Text className="font-outfit text-[13px] opacity-35 uppercase tracking-[2px]">Skip</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar (50%) */}
                    <View className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                        <View className="h-full w-1/2 bg-accent rounded-full" />
                    </View>

                    <View className="mt-1">
                        <Text className="font-outfit text-[22px] uppercase tracking-wide text-white/80">Movie Vibes & Tags</Text>
                        <Text className="font-outfit text-[13px] opacity-40 mt-0.5">
                            Select vibes and themes you love, and those you avoid.
                        </Text>
                    </View>
                </MotiView>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color={ACCENT} size="large" />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 200, duration: 600 }}
                            className="mt-2"
                        >
                            <VibeSelection
                                liked={preferences.vibes.liked}
                                disliked={preferences.vibes.disliked}
                                onToggleVibe={(vibe, type) => toggleVibe(vibe, type)}
                                label1="I love"
                                label2="I avoid"
                                options={availableVibes}
                                revealed
                            />

                            <View className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl gap-y-3 mt-4">
                                <Text className="font-outfit-bold text-[12px] text-white/80 uppercase tracking-wider">
                                    Content Restrictions
                                </Text>
                                <View className="gap-y-2">
                                    <TouchableOpacity
                                        onPress={() => setNoAnime(!noAnime)}
                                        className="flex-row items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                                    >
                                        <Text className="font-outfit text-[13px]">Exclude Anime</Text>
                                        <View className={`w-5 h-5 rounded border items-center justify-center ${noAnime ? 'bg-accent border-accent' : 'border-white/40'}`}>
                                            {noAnime && <Check color="#000" size={14} strokeWidth={3} />}
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setNoAnimation(!noAnimation)}
                                        className="flex-row items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                                    >
                                        <Text className="font-outfit text-[13px]">Exclude Animated Movies</Text>
                                        <View className={`w-5 h-5 rounded border items-center justify-center ${noAnimation ? 'bg-accent border-accent' : 'border-white/40'}`}>
                                            {noAnimation && <Check color="#000" size={14} strokeWidth={3} />}
                                        </View>
                                    </TouchableOpacity>
                                </View>
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
                        onPress={handleNextStage}
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
                                        Next: Favorite Movies
                                    </Text>
                                </View>
                                <View className="w-9 h-9 rounded-full bg-black/10 items-center justify-center">
                                    <ArrowRight color="#000" size={20} strokeWidth={2.5} />
                                </View>
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
