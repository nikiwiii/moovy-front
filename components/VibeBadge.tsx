import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { AppText as Text } from './AppText';
import VibeBars from './VibeBars';
import { getVibeColor } from '@/constants/vibes';

interface VibeBadgeProps {
    vibe: string;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export default function VibeBadge({ vibe, color, style }: VibeBadgeProps) {
    const badgeColor = color || getVibeColor(vibe);
    return (
        <View style={style} className="bg-white/[0.03] rounded-[6px] flex-row items-center px-1.5 py-0.5">
            <VibeBars color={badgeColor} width={2} height={8} gap={1} marginRight={3} borderRadius={1} />
            <Text className="font-outfit text-[9px] text-white/50 uppercase tracking-[1px] mt-0.5">
                {vibe.replace('_', ' ').toLowerCase()}
            </Text>
        </View>
    );
}
