import { useRouter } from 'expo-router';
import {
    ArrowLeft, Check, Copy, Crown, Heart, Sparkles,
    Users, Baby, User, ChevronRight,
    UserRoundCheck,
    UsersRound,
    UserRound,
    LucideIcon
} from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert, Clipboard, SafeAreaView, ScrollView, View
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn, LinearTransition, useAnimatedStyle } from 'react-native-reanimated';
import TouchableOpacity from '../components/TouchableOpacity';
import GroupSelector from '../components/GroupSelector';
import { FillStyles } from '../constants/themeStyles';
import { sessionService, MeetingType } from '../services/sessionService';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;

const meetingTypes: { id: MeetingType; icon: LucideIcon; title: string; description: string }[] = [
    { id: 'EKIPA', icon: UsersRound, title: 'Ekipa', description: 'Wieczór filmowy z przyjaciółmi' },
    { id: 'RANDKA', icon: Heart, title: 'Randka', description: 'Romantyczny seans we dwoje' },
    { id: 'RODZINA', icon: Baby, title: 'Rodzina', description: 'Film dla całej rodziny' },
];

export default function SessionCreateScreen() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<MeetingType>('EKIPA');
    const [isLoading, setIsLoading] = useState(false);
    const [createdSession, setCreatedSession] = useState<{ session_id: string; invite_code: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const result = await sessionService.createSession(selectedType);
            setCreatedSession({ session_id: result.session_id, invite_code: result.invite_code });
        } catch (error: any) {
            Alert.alert('Błąd', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = async () => {
        if (createdSession) {
            Clipboard.setString(createdSession.invite_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleGoToLobby = () => {
        if (createdSession) {
            router.push({
                pathname: '/session-lobby',
                params: {
                    sessionId: createdSession.session_id,
                    isHost: 'true',
                },
            });
        }
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
                        <Text className="font-outfit text-[13px] opacity-40 uppercase tracking-[2px]">Wróć</Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-2">
                        <Crown color={ACCENT} size={18} strokeWidth={2} />
                        <Text style={{ color: `${ACCENT}CC` }} className="font-outfit-semi text-[13px] uppercase tracking-[2px]">Host</Text>
                    </View>
                </MotiView>

                <ScrollView contentContainerClassName="px-4 pb-[120px]" showsVerticalScrollIndicator={false}>
                    {!createdSession ? (
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 200, duration: 600 }}
                            className="flex flex-col gap-4"
                        >
                            {/* Title */}
                            <View className="px-2 mb-4">
                                <Text className="font-outfit-bold text-[28px] leading-tight">Utwórz sesję{'\n'}filmową</Text>
                                <Text className="font-outfit text-[14px] opacity-35 mt-2">Wybierz typ spotkania i zaproś znajomych</Text>
                            </View>

                            {/* Meeting type selection */}
                            <View className={`${FillStyles.section} overflow-hidden`}>
                                <View className="p-5">
                                    <Text className="font-outfit text-[11px] uppercase tracking-[3px] opacity-40 mb-4">Typ spotkania</Text>
                                    <GroupSelector
                                        items={meetingTypes}
                                        selectedId={selectedType}
                                        onSelect={(id) => setSelectedType(id as MeetingType)}
                                    />
                                </View>
                            </View>

                            {/* Create button */}
                            <View className="flex-row justify-end mt-2">
                                <TouchableOpacity
                                    className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} bg-accent`}
                                    onPress={handleCreate}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#000" size="small" />
                                    ) : (
                                        <>
                                            <UserRoundCheck color="#000" size={18} strokeWidth={2.5} />
                                            <Text className="font-outfit-semi text-[15px] text-black">Utwórz sesję</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </MotiView>
                    ) : (
                        /* Created — show invite code */
                        <MotiView
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="flex flex-col gap-5"
                        >
                            {/* Success badge */}
                            <View className="items-center pt-6 pb-2">
                                <MotiView
                                    from={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 200, damping: 10 }}
                                    className="w-20 h-20 rounded-full bg-accent/15 items-center justify-center mb-5"
                                >
                                    <Check color={ACCENT} size={36} strokeWidth={2.5} />
                                </MotiView>
                                <Text className="font-outfit-bold text-[24px]">Sesja utworzona!</Text>
                                <Text className="font-outfit text-[14px] opacity-35 mt-1 text-center">Udostępnij kod zaproszenia znajomym</Text>
                            </View>

                            {/* Invite code card */}
                            <View className={`overflow-hidden`}>
                                <View className="p-6 items-center">
                                    <Text className="font-outfit text-[11px] uppercase tracking-[4px] opacity-40 mb-4">Kod zaproszenia</Text>
                                    <View className="flex-row items-center gap-3 mb-5">
                                        {createdSession.invite_code.split('').map((char, i) => (
                                            <MotiView
                                                key={i}
                                                from={{ opacity: 0, translateY: 20 }}
                                                animate={{ opacity: 1, translateY: 0 }}
                                                transition={{ delay: 400 + i * 100, type: 'spring', damping: 12 }}
                                                className="w-12 h-14 rounded-xl bg-white/[0.06] border border-white/[0.1] items-center justify-center"
                                            >
                                                <Text style={{ color: ACCENT }} className="font-outfit-bold text-[24px]">{char}</Text>
                                            </MotiView>
                                        ))}
                                    </View>
                                    <TouchableOpacity
                                        onPress={handleCopyCode}
                                        className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnSecondary}`}
                                    >
                                        <Copy color={copied ? ACCENT : '#fff'} size={16} strokeWidth={2} />
                                        <Text style={copied ? { color: ACCENT } : {}} className={`font-outfit text-[13px] ${copied ? '' : 'opacity-60'}`}>
                                            {copied ? 'Skopiowano!' : 'Kopiuj kod'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Go to lobby */}
                            <View className="flex-row justify-end">
                                <TouchableOpacity
                                    className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} bg-accent`}
                                    onPress={handleGoToLobby}
                                >
                                    <Text className="font-outfit-semi text-[15px] text-black">Przejdź do lobby</Text>
                                    <ChevronRight color="#000" size={18} strokeWidth={2.5} />
                                </TouchableOpacity>
                            </View>
                        </MotiView>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
