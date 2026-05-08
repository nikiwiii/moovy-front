import { BlurView } from 'expo-blur';
import { Film, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn } from 'react-native-reanimated';
import MiniCollapsibleSection from './MiniCollapsibleSection';
import TouchableOpacity from './TouchableOpacity';
import { defaultVibes } from '../constants/vibes';
import { storageService } from '../services/storageService';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;

interface GenreSelectionProps {
    liked: string[];
    disliked: string[];
    onToggleVibe: (vibe: string, type: 'liked' | 'disliked') => void;
    label1: string;
    label2: string;
}

export default function VibeSelection({ liked, disliked, onToggleVibe, label1, label2 }: GenreSelectionProps) {
    const [modalState, setModalState] = useState<'liked' | 'disliked' | ''>('');

    return (
        <View className="flex-col gap-2">
            <MiniCollapsibleSection
                title={label1 + ":"}
                value={liked.length}
                defaultOpen={false}
                rightIcon={<Plus size={14} color={ACCENT} />}
                onRightIconPress={() => setModalState('liked')}
                className="rounded-b-[10px]"
            >
                <View className="flex-col gap-2 divide-y divide-text-muted">
                    {liked.map(vibe => (
                        <View className="flex flex-row justify-between items-center py-1" key={vibe}>
                            <Text className="font-outfit text-[14px]">{vibe}</Text>
                            <TouchableOpacity onPress={() => onToggleVibe(vibe, 'liked')}>
                                <X size={16} color="#707080" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </MiniCollapsibleSection>
            <MiniCollapsibleSection
                title={label2 + ":"}
                value={disliked.length}
                defaultOpen={false}
                rightIcon={<Plus size={14} color={ACCENT} />}
                onRightIconPress={() => setModalState('disliked')}
                className="rounded-t-[10px]"
            >
                <View className="flex-col gap-2 divide-y divide-text-muted">
                    {disliked.map(vibe => (
                        <View className="flex flex-row justify-between items-center py-1" key={vibe}>
                            <Text className="font-outfit text-[14px]">{vibe}</Text>
                            <TouchableOpacity onPress={() => onToggleVibe(vibe, 'disliked')}>
                                <X size={16} color="#707080" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </MiniCollapsibleSection>

            <Modal visible={modalState !== ''} animationType="fade" transparent>
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill}>
                    <View className="flex-1 justify-center items-center px-6">
                        <Animated.View entering={FadeIn} className="w-full bg-[#0d0b1a]/95 border border-white/[0.08] rounded-[28px] p-6 overflow-hidden">
                            <Text className="font-outfit-bold text-xl mb-5">Wybierz vibe</Text>
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {defaultVibes
                                    .filter(vibe => {
                                        const oppositeArray = modalState === 'liked' ? disliked : liked;
                                        return !oppositeArray.includes(vibe);
                                    })
                                    .map(vibe => {
                                        const currentArray = modalState === 'liked' ? liked : disliked;
                                        const isActive = currentArray.includes(vibe);
                                        return (
                                            <TouchableOpacity
                                                key={vibe}
                                                className="flex-row items-center gap-3"
                                                onPress={() => modalState && onToggleVibe(vibe, modalState)}
                                            >
                                                <Text className={`font-outfit text-[13px] ${FillStyles.pillBase} ${isActive ? FillStyles.pillActive : FillStyles.pillInactive}`}>{vibe}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                            </View>
                            <View className="flex-row justify-end gap-3">
                                <TouchableOpacity onPress={() => setModalState('')} className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnSecondary}`}>
                                    <Text className="font-outfit opacity-60">Wyjdź</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
}
