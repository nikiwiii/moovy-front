import { BlurView } from 'expo-blur';
import { Film, Plus, X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn } from 'react-native-reanimated';
import MiniCollapsibleSection from './MiniCollapsibleSection';
import TouchableOpacity from './TouchableOpacity';
import { defaultVibes, getVibeColor } from '../constants/vibes';
import { storageService } from '../services/storageService';
import { metadataService } from '../services/metadataService';
import { Colors } from '@/constants/theme';
import { FillStyles } from '@/constants/themeStyles';
import VibeBars from './VibeBars';

const ACCENT = Colors.dark.accent;

interface GenreSelectionProps {
    liked: string[];
    disliked: string[];
    onToggleVibe: (vibe: string, type: 'liked' | 'disliked') => void;
    label1: string;
    label2: string;
    options?: string[];
    revealed?: boolean;
}

export default function VibeSelection({ liked, disliked, onToggleVibe, label1, label2, options, revealed }: GenreSelectionProps) {
    const [modalState, setModalState] = useState<'liked' | 'disliked' | ''>('');
    const [internalVibes, setInternalVibes] = useState<string[]>(defaultVibes);
    const [backendColors, setBackendColors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchVibes = async () => {
            try {
                const data = await metadataService.getPreferencesOptions();
                if (data) {
                    if (data.vibe_colors) {
                        setBackendColors(data.vibe_colors);
                    }
                    if (!options || options.length === 0) {
                        if (Array.isArray(data.vibes) && data.vibes.length > 0) {
                            setInternalVibes(data.vibes);
                        }
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch vibes from backend, using local fallbacks:', error);
            }
        };
        fetchVibes();
    }, [options]);

    const resolveVibeColor = (vibe: string): string => {
        const uppercaseVibe = vibe.toUpperCase();
        return backendColors[uppercaseVibe] || getVibeColor(vibe);
    };

    const vibesToUse = options && options.length > 0 ? options : internalVibes;


    return (
        <View className="flex-col gap-1">
            <MiniCollapsibleSection
                title={label1 + ":"}
                value={liked.length}
                defaultOpen={revealed}
                rightIcon={<Plus size={14} color={ACCENT} />}
                onRightIconPress={() => setModalState('liked')}
                className="rounded-b-[10px]"
            >
                <View className="flex-col gap-2">
                    {liked.map(vibe => {
                        const vibeColor = resolveVibeColor(vibe);
                        return (
                            <View
                                style={{
                                    backgroundColor: vibeColor + '15',
                                    borderColor: vibeColor + '40',
                                    borderWidth: 1,
                                    borderRadius: 12,
                                }}
                                className="py-2.5 px-4 flex flex-row justify-between items-center"
                                key={vibe}
                            >
                                <View className="flex-row items-center gap-2.5">
                                    <VibeBars color={vibeColor} />
                                    <Text className="font-outfit text-[14px] text-white">
                                        {vibe.replace("_", " ")}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => onToggleVibe(vibe, 'liked')}>
                                    <X size={16} color={vibeColor + 'bb'} />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </MiniCollapsibleSection>
            <MiniCollapsibleSection
                title={label2 + ":"}
                value={disliked.length}
                defaultOpen={revealed}
                rightIcon={<Plus size={14} color={ACCENT} />}
                onRightIconPress={() => setModalState('disliked')}
                className="rounded-t-[10px]"
            >
                <View className="flex-col gap-2">
                    {disliked.map(vibe => {
                        const vibeColor = resolveVibeColor(vibe);
                        const dislikeColor = '#EF476F';
                        return (
                            <View
                                style={{
                                    backgroundColor: dislikeColor + '15',
                                    borderColor: dislikeColor + '35',
                                    borderWidth: 1,
                                    borderRadius: 12,
                                }}
                                className="py-2.5 px-4 flex flex-row justify-between items-center"
                                key={vibe}
                            >
                                <View className="flex-row items-center gap-2.5">
                                    <VibeBars color={vibeColor} opacityMultiplier={0.6} />
                                    <Text className="font-outfit text-[14px] text-white/65" style={{ textDecorationLine: 'line-through', textDecorationColor: dislikeColor + '80' }}>
                                        {vibe.replace("_", " ")}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => onToggleVibe(vibe, 'disliked')}>
                                    <X size={16} color={dislikeColor + 'bb'} />
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </MiniCollapsibleSection>

            <Modal visible={modalState !== ''} animationType="fade" transparent>
                <View className="bg-black/80" style={StyleSheet.absoluteFill}>
                    <View className="flex-1 justify-center items-center px-6">
                        <Text className="font-outfit-bold text-2xl mb-5 self-center">Select vibe</Text>
                        <View className="flex-row flex-wrap items-center justify-center gap-2 mb-6">
                            {vibesToUse
                                .filter(vibe => {
                                    const oppositeArray = modalState === 'liked' ? disliked : liked;
                                    return !oppositeArray.includes(vibe);
                                })
                                .map(vibe => {
                                    const currentArray = modalState === 'liked' ? liked : disliked;
                                    const isActive = currentArray.includes(vibe);
                                    const vibeColor = resolveVibeColor(vibe);
                                    const selectColor = modalState === 'liked' ? vibeColor : '#EF476F';
                                    return (
                                        <TouchableOpacity
                                            key={vibe}
                                            onPress={() => modalState && onToggleVibe(vibe, modalState)}
                                            style={
                                                isActive
                                                    ? {
                                                        backgroundColor: selectColor + '20',
                                                        borderColor: selectColor + '60',
                                                        borderWidth: 1,
                                                        borderRadius: 10,
                                                    }
                                                    : {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                                        borderColor: 'rgba(255, 255, 255, 0.08)',
                                                        borderWidth: 1,
                                                        borderRadius: 10,
                                                    }
                                            }
                                            className="py-2 px-3.5 flex-row items-center gap-2"
                                        >
                                            <VibeBars color={vibeColor} opacityMultiplier={isActive ? 1 : 0.4} />
                                            <Text
                                                className="font-outfit text-[13px]"
                                                style={{
                                                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                                                    textDecorationLine: (modalState === 'disliked' && isActive) ? 'line-through' : 'none',
                                                    textDecorationColor: selectColor + 'aa'
                                                }}
                                            >
                                                {vibe.replace("_", " ")}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                        </View>
                        <View className="flex-row justify-end gap-3">
                            <TouchableOpacity onPress={() => setModalState('')} className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary}`}>
                                <Text className="font-outfit-semi text-[15px] text-black">Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
