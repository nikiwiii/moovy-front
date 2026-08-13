import { useRouter } from 'expo-router';
import {
    ArrowLeft, Check, Copy, Crown, Heart, Sparkles,
    Users, Baby, User, ChevronRight,
    UserRoundCheck,
    UsersRound,
    UserRound,
    LucideIcon,
    Hand
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
import { Toast } from '@/components/Toast';

const ACCENT = Colors.dark.accent;

const meetingTypes: { id: MeetingType; icon: LucideIcon; title: string; description: string }[] = [
    { id: 'EKIPA', icon: UsersRound, title: 'Crew', description: 'Movie night with friends' },
    { id: 'RANDKA', icon: Heart, title: 'Date', description: 'Romantic screening for two' },
    { id: 'RODZINA', icon: Baby, title: 'Family', description: 'Movie for the whole family' },
];

export default function SessionCreateScreen() {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<MeetingType>('EKIPA');
    const [isLoading, setIsLoading] = useState(false);
    const [createdSession, setCreatedSession] = useState<{ session_id: string; invite_code: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        visible: false,
        message: '',
        type: 'info'
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ visible: true, message, type });
    };

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const result = await sessionService.createSession(selectedType);
            setCreatedSession({ session_id: result.session_id, invite_code: result.invite_code });
        } catch (error: any) {
            showToast(error.message, 'error');
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
                        <Text className="font-outfit text-[13px] opacity-40 uppercase tracking-[2px]">Back</Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-2">
                        <Crown color={ACCENT} size={18} strokeWidth={2} />
                        <Text className="font-outfit-semi text-accent text-[13px] uppercase tracking-[2px]">Host</Text>
                    </View>
                </MotiView>

                <View className="flex-1 px-8 mt-24">
                    {!createdSession ? (
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 200, duration: 600 }}
                            className="flex flex-col gap-4"
                        >
                            {/* Title */}
                            <View className="items-center mb-4">
                                <MotiView
                                    from={{ scale: 0, rotate: '-180deg' }}
                                    animate={{ scale: 1, rotate: '0deg' }}
                                    transition={{ type: 'spring', delay: 300, damping: 30 }}
                                    className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/[0.1] items-center justify-center mb-5"
                                >
                                    <Hand color={ACCENT} size={28} strokeWidth={1.5} />
                                </MotiView>
                                <Text className="font-outfit text-[24px] uppercase tracking-wide text-white/80 text-center">Create session</Text>
                                <Text className="font-outfit text-[14px] opacity-35 mt-2 text-center">Select meeting type and invite friends</Text>
                            </View>

                            {/* Meeting type selection */}
                            <GroupSelector
                                items={meetingTypes}
                                selectedId={selectedType}
                                onSelect={(id) => setSelectedType(id as MeetingType)}
                            />

                            {/* Create button */}
                            <View className="flex-row justify-end mt-8">
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
                                            <Text className="font-outfit-semi text-[15px] text-black">Create session</Text>
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
                                <Text className="font-outfit text-[22px] uppercase tracking-wide text-white/80">Session created!</Text>
                                <Text className="font-outfit text-[14px] opacity-35 mt-1 text-center">Share invite code with friends</Text>
                            </View>

                            {/* Invite code card */}
                            <View className={`overflow-hidden`}>
                                <View className="p-6 items-center">
                                    <Text className="font-outfit text-[11px] uppercase tracking-[4px] opacity-40 mb-4">Invite code</Text>
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
                                            {copied ? 'Copied!' : 'Copy code'}
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
                                    <ChevronRight color="#000" size={18} strokeWidth={2.5} />
                                    <Text className="font-outfit-semi text-[15px] text-black">Go to lobby</Text>
                                </TouchableOpacity>
                            </View>
                        </MotiView>
                    )}
                </View>
            </SafeAreaView>

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </View >
    );
}
