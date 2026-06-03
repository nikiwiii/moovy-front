import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { FillStyles } from '../constants/themeStyles';
import TouchableOpacity from './TouchableOpacity';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;

export interface MiniCollapsibleSectionProps {
    title: string;
    value?: number | string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
    className?: string;
    img?: string;
}

export default function CollapsibleSection({ title, value, children, defaultOpen = false, rightIcon = null, onRightIconPress, className, img }: MiniCollapsibleSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Animated.View layout={LinearTransition} className={`${FillStyles.miniSection} overflow-hidden ${className}`}>
            <TouchableOpacity
                className={`flex-col justify-between ${value !== undefined && value !== null ? "p-3" : "p-2.5"}`}
                onPress={() => setOpen(!open)}
            >
                <View className="flex-row justify-between items-center gap-4">
                    {img && <Image source={{ uri: img }} className="w-14 h-14 rounded-xl" />}
                    <View className="flex-1 mr-4">
                        <Text className={`font-outfit opacity-80 tracking-wider ${img ? " text-[15px]" : " text-[12px] uppercase tracking-[2px] opacity-50"}`}>{title} {value !== undefined && value !== null && `(${value})`}</Text>
                    </View>
                    <View className="flex-row items-center">
                        {rightIcon && (
                            <TouchableOpacity onPress={onRightIconPress} className="w-8 h-8 bg-white/[0.06] rounded-full justify-center items-center mr-2 border border-white/[0.08]">
                                {rightIcon}
                            </TouchableOpacity>
                        )}
                        <View className={`w-8 h-8 rounded-full items-center justify-center border ${open ? 'bg-accent border-accent' : 'bg-white/[0.06] border-white/[0.08]'}`}>
                            {open ? <ChevronUp color="#000" size={16} /> : <ChevronDown color="#707080" size={16} />}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            {open && (
                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="px-4 pb-4 pt-1">
                    {children}
                </Animated.View>
            )}
        </Animated.View>
    );
}
