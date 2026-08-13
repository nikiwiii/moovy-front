import React, { useState, useEffect, useMemo } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Plus, X, Check, Search, Ban, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import TouchableOpacity from './TouchableOpacity';
import { defaultVibes, getVibeColor } from '../constants/vibes';
import { metadataService } from '../services/metadataService';
import { Colors } from '@/constants/theme';
import VibeBars from './VibeBars';

const ACCENT = Colors.dark.accent;

interface GenreSelectionProps {
    liked: string[];
    disliked: string[];
    onToggleVibe: (vibe: string, type: 'liked' | 'disliked') => void;
    label1?: string;
    label2?: string;
    options?: string[];
    revealed?: boolean;
}

export default function VibeSelection({
    liked,
    disliked,
    onToggleVibe,
    label1 = "Include",
    label2 = "Exclude",
    options,
}: GenreSelectionProps) {
    const [internalVibes, setInternalVibes] = useState<string[]>(defaultVibes);
    const [backendColors, setBackendColors] = useState<Record<string, string>>({});
    const [activeMode, setActiveMode] = useState<'liked' | 'disliked'>('liked');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAll, setShowAll] = useState(false);

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

    const vibesToUse = useMemo(() => {
        return options && options.length > 0 ? options : internalVibes;
    }, [options, internalVibes]);

    const filteredVibes = useMemo(() => {
        if (!searchQuery.trim()) return vibesToUse;
        const query = searchQuery.toLowerCase().replace(/_/g, ' ');
        return vibesToUse.filter(v => v.toLowerCase().replace(/_/g, ' ').includes(query));
    }, [vibesToUse, searchQuery]);

    const displayedVibes = useMemo(() => {
        if (searchQuery || showAll || filteredVibes.length <= 12) {
            return filteredVibes;
        }
        return filteredVibes.slice(0, 12);
    }, [filteredVibes, searchQuery, showAll]);

    const handleTagClick = (vibe: string) => {
        if (activeMode === 'liked') {
            if (disliked.includes(vibe)) {
                onToggleVibe(vibe, 'disliked');
            }
            onToggleVibe(vibe, 'liked');
        } else {
            if (liked.includes(vibe)) {
                onToggleVibe(vibe, 'liked');
            }
            onToggleVibe(vibe, 'disliked');
        }
    };

    const handleClearAll = () => {
        [...liked].forEach(v => onToggleVibe(v, 'liked'));
        [...disliked].forEach(v => onToggleVibe(v, 'disliked'));
    };

    const hasSelections = liked.length > 0 || disliked.length > 0;

    return (
        <View className="flex-col gap-2 p-1">
            {/* Top Controls Header: Mode Switcher & Search */}
            <View className="flex-col sm:flex-row items-stretch gap-2">
                {/* Include / Exclude Mode Tabs */}
                <View className="flex-row bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08] flex-1">
                    <TouchableOpacity
                        onPress={() => setActiveMode('liked')}
                        style={activeMode === 'liked' ? { backgroundColor: ACCENT } : {}}
                        className={`flex-1 py-1.5 px-3 rounded-xl flex-row items-center justify-center gap-1.5 ${
                            activeMode === 'liked' ? 'bg-accent' : ''
                        }`}
                    >
                        <ThumbsUp size={14} color={activeMode === 'liked' ? '#000000' : 'rgba(255,255,255,0.6)'} />
                        <Text className={`font-outfit-bold text-[12px] ${activeMode === 'liked' ? 'text-black' : 'text-white/60'}`}>
                            {label1}
                        </Text>
                        {liked.length > 0 && (
                            <View className={`px-1.5 py-0.5 rounded-full ${activeMode === 'liked' ? 'bg-black/20' : 'bg-accent/20'}`}>
                                <Text className={`font-outfit-bold text-[10px] ${activeMode === 'liked' ? 'text-black' : 'text-accent'}`}>
                                    {liked.length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveMode('disliked')}
                        style={activeMode === 'disliked' ? { backgroundColor: '#EF476F' } : {}}
                        className={`flex-1 py-1.5 px-3 rounded-xl flex-row items-center justify-center gap-1.5 ${
                            activeMode === 'disliked' ? 'bg-[#EF476F]' : ''
                        }`}
                    >
                        <ThumbsDown size={14} color={activeMode === 'disliked' ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} />
                        <Text className={`font-outfit-bold text-[12px] ${activeMode === 'disliked' ? 'text-white' : 'text-white/60'}`}>
                            {label2}
                        </Text>
                        {disliked.length > 0 && (
                            <View className={`px-1.5 py-0.5 rounded-full ${activeMode === 'disliked' ? 'bg-white/20' : 'bg-red-500/20'}`}>
                                <Text className={`font-outfit-bold text-[10px] ${activeMode === 'disliked' ? 'text-white' : 'text-red-400'}`}>
                                    {disliked.length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="relative flex-1 min-w-[140px] flex-row items-center bg-white/[0.04] border border-white/[0.08] rounded-2xl px-3 py-1">
                    <Search size={14} color="rgba(255,255,255,0.4)" />
                    <TextInput
                        placeholder="Search tags..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 font-outfit text-[12px] text-white ml-2 py-1"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={12} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Clear All Header */}
            {hasSelections && (
                <View className="flex-row justify-end px-1 pt-1">
                    <TouchableOpacity onPress={handleClearAll} className="flex-row items-center gap-1">
                        <RotateCcw size={11} color="rgba(255,255,255,0.4)" />
                        <Text className="font-outfit-bold text-[10px] text-white/40 uppercase tracking-wider">Clear all</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Interactive Tag Matrix Grid */}
            <View className="flex-row flex-wrap gap-2 py-1">
                {displayedVibes.map((vibe) => {
                    const isLiked = liked.includes(vibe);
                    const isDisliked = disliked.includes(vibe);
                    const vibeColor = resolveVibeColor(vibe);

                    let itemStyle: any = {
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        borderWidth: 1,
                    };

                    if (isLiked) {
                        itemStyle = {
                            backgroundColor: vibeColor + '25',
                            borderColor: vibeColor + '80',
                            borderWidth: 1,
                        };
                    } else if (isDisliked) {
                        itemStyle = {
                            backgroundColor: 'rgba(239, 71, 111, 0.15)',
                            borderColor: 'rgba(239, 71, 111, 0.45)',
                            borderWidth: 1,
                        };
                    }

                    return (
                        <TouchableOpacity
                            key={vibe}
                            onPress={() => handleTagClick(vibe)}
                            style={itemStyle}
                            className="p-1.5 rounded-2xl flex-row items-center gap-2"
                        >
                            <VibeBars color={vibeColor} opacityMultiplier={isLiked ? 1 : isDisliked ? 0.4 : 0.6} />

                            <Text
                                className={`font-outfit text-[11px] ${
                                    isLiked ? 'font-outfit-bold text-white' : isDisliked ? 'font-outfit-bold text-red-300' : 'text-white/70'
                                }`}
                                style={{ textDecorationLine: isDisliked ? 'line-through' : 'none' }}
                            >
                                {vibe.replace(/_/g, ' ')}
                            </Text>

                            {/* Status Badge Icon */}
                            {isLiked && (
                                <View className="w-4 h-4 rounded-full bg-accent items-center justify-center ml-0.5">
                                    <Check size={11} color="#000000" strokeWidth={3} />
                                </View>
                            )}
                            {isDisliked && (
                                <View className="w-4 h-4 rounded-full bg-[#EF476F] items-center justify-center ml-0.5">
                                    <X size={11} color="#FFFFFF" strokeWidth={3} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Show More / Show Less Button */}
            {!searchQuery && filteredVibes.length > 12 && (
                <View className="items-center pt-1">
                    <TouchableOpacity
                        onPress={() => setShowAll(!showAll)}
                        className="py-1 px-4 rounded-full bg-white/[0.03] border border-white/[0.08]"
                    >
                        <Text className="font-outfit-bold text-[11px] text-white/50">
                            {showAll ? 'Show fewer vibes' : `Show all vibes (${filteredVibes.length})`}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
