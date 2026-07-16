import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { FillStyles } from '../constants/themeStyles';
import TouchableOpacity from './TouchableOpacity';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;

export interface CollapsibleSectionProps {
    title: string;
    value?: number | string;
    icon: any;
    children: React.ReactNode;
    defaultOpen?: boolean;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
    className?: string;
}

export default function CollapsibleSection({ title, value, icon: IconComponent, children, defaultOpen = false, rightIcon = null, onRightIconPress, className }: CollapsibleSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Animated.View layout={LinearTransition} className={`${FillStyles.section} overflow-hidden ${className}`}>
            <TouchableOpacity
                className="p-4 flex-col justify-between"
                onPress={() => setOpen(!open)}
            >
                <View className="flex-row justify-between items-center">
                    {/* <View className="w-[48px] h-[48px] rounded-full bg-white/[0.06] items-center justify-center border border-white/[0.08]">
                        <IconComponent color={ACCENT} size={22} strokeWidth={1.5} />
                    </View> */}
                    <View className="flex-row items-center justify-start gap-2">
                        <View className="w-[24px] h-[24px] flex items-center justify-center">
                            <IconComponent color={ACCENT} size={22} strokeWidth={1.5} />
                        </View>
                        <Text className="font-outfit-bold text-[18px] leading-tight uppercase border-b border-white/40">{title}</Text>
                    </View>
                    <View className="flex-row items-center">
                        {rightIcon && (
                            <TouchableOpacity onPress={onRightIconPress} className="w-9 h-9 bg-white/[0.06] rounded-full justify-center items-center mr-3 border border-white/[0.08]">
                                {rightIcon}
                            </TouchableOpacity>
                        )}
                        <View className={`w-9 h-9 rounded-full items-center justify-center border ${open ? 'bg-accent border-accent' : 'bg-white/[0.06] border-white/[0.08]'}`}>
                            {open ? <ChevronUp color="#000" size={18} /> : <ChevronDown color="white" size={18} />}
                        </View>
                    </View>
                </View>
                {/* <View className="flex-row justify-between items-end">
                    <Text className="font-outfit-bold text-[20px] leading-tight mt-0.5 uppercase border-b border-white">{title}</Text>
                    {value !== undefined && value !== null && (
                        <Text style={{ color: ACCENT }} className="font-outfit-bold text-[32px] relative top-[8px] opacity-40">{value}</Text>
                    )}
                </View> */}
            </TouchableOpacity>
            {open && (
                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="px-0.5 pb-0.5">
                    {children}
                </Animated.View>
            )}
        </Animated.View>
    );
}
