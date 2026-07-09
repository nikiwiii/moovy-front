import { BlurView } from 'expo-blur';
import { Film, Plus, X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn } from 'react-native-reanimated';
import MiniCollapsibleSection from './MiniCollapsibleSection';
import TouchableOpacity from './TouchableOpacity';
import { defaultVibes } from '../constants/vibes';
import { storageService } from '../services/storageService';
import { metadataService } from '../services/metadataService';
import { Colors } from '@/constants/theme';
import { FillStyles } from '@/constants/themeStyles';

const ACCENT = Colors.dark.accent;

interface GenreSelectionProps {
    liked: string[];
    disliked: string[];
    onToggleVibe: (vibe: string, type: 'liked' | 'disliked') => void;
    label1: string;
    label2: string;
    options?: string[];
}

export default function VibeSelection({ liked, disliked, onToggleVibe, label1, label2, options }: GenreSelectionProps) {
    const [modalState, setModalState] = useState<'liked' | 'disliked' | ''>('');
    const [internalVibes, setInternalVibes] = useState<string[]>(defaultVibes);

    useEffect(() => {
        if (options && options.length > 0) return;

        const fetchVibes = async () => {
            try {
                const data = await metadataService.getPreferencesOptions();
                if (data && Array.isArray(data.vibes) && data.vibes.length > 0) {
                    setInternalVibes(data.vibes);
                }
            } catch (error) {
                console.warn('Failed to fetch vibes from backend, using local fallbacks:', error);
            }
        };
        fetchVibes();
    }, [options]);

    const vibesToUse = options && options.length > 0 ? options : internalVibes;


    return (
        <View className="flex-col gap-1">
            <MiniCollapsibleSection
                title={label1 + ":"}
                value={liked.length}
                defaultOpen={false}
                rightIcon={<Plus size={14} color={ACCENT} />}
                onRightIconPress={() => setModalState('liked')}
                className="rounded-b-[10px]"
            >
                <View className="flex-col gap-2">
                    {liked.map(vibe => (
                        <View className={`${FillStyles.pillBase} ${FillStyles.pillInactive} flex flex-row justify-between items-center py-1`} key={vibe}>
                            <Text className="font-outfit text-[14px]">{vibe.replace("_", " ")}</Text>
                            <TouchableOpacity onPress={() => onToggleVibe(vibe, 'liked')}>
                                <X size={18} color="#707080" />
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
                <View className="flex-col gap-2">
                    {disliked.map(vibe => (
                        <View className="flex flex-row justify-between items-center py-1" key={vibe}>
                            <Text className="font-outfit text-[14px]">{vibe.replace("_", " ")}</Text>
                            <TouchableOpacity onPress={() => onToggleVibe(vibe, 'disliked')}>
                                <X size={18} color="#707080" />
                            </TouchableOpacity>
                        </View>
                    ))}
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
                                    return (
                                        <TouchableOpacity
                                            key={vibe}
                                            className="flex-row items-center gap-3"
                                            onPress={() => modalState && onToggleVibe(vibe, modalState)}
                                        >
                                            <Text className={`font-outfit text-[13px] ${FillStyles.pillBase} ${isActive ? FillStyles.pillActiver : FillStyles.pillInactive}`}>{vibe.replace("_", " ")}</Text>
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
