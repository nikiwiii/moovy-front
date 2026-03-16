import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { FillStyles } from '../constants/themeStyles';
import TouchableOpacity from './TouchableOpacity';

export interface CollapsibleSectionProps {
    title: string;
    subtitle: string;
    value?: number | string;
    icon: any;
    children: React.ReactNode;
    defaultOpen?: boolean;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

export default function CollapsibleSection({ title, subtitle, value, icon: IconComponent, children, defaultOpen = false, rightIcon = null, onRightIconPress }: CollapsibleSectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Animated.View layout={LinearTransition} className={`${FillStyles.section} overflow-hidden`}>
            <TouchableOpacity
                className="p-5 flex-col justify-between min-h-[140px]"
                onPress={() => setOpen(!open)}
            >
                <View className="flex-row justify-between items-start">
                    <View className="w-[48px] h-[48px] rounded-full bg-white/30 items-center justify-center border border-white/5">
                        <IconComponent color="currentColor" size={22} strokeWidth={1.5} />
                    </View>
                    <View className="flex-row items-center">
                        {rightIcon && (
                            <TouchableOpacity onPress={onRightIconPress} className="w-9 h-9 bg-white/20 rounded-full justify-center items-center mr-3 border border-white/5">
                                {rightIcon}
                            </TouchableOpacity>
                        )}
                        <View className="w-9 h-9 rounded-full bg-white/30 items-center justify-center border border-white/5">
                            {open ? <ChevronUp color="currentColor" size={18} /> : <ChevronDown color="currentColor" size={18} />}
                        </View>
                    </View>
                </View>
                <View className="flex-row justify-between items-end mt-6 mb-1.5">
                    <View className="flex-1 mr-4">
                        <Text className="font-outfit text-[12px] opacity-70 uppercase tracking-widest">{subtitle}</Text>
                        <Text className="font-outfit-semi text-[18px] leading-tight">{title}</Text>
                    </View>
                    <Text className="font-outfit-bold text-[28px] relative top-[8px]">{value}</Text>
                </View>
            </TouchableOpacity>
            {open && (
                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="px-5 pb-6 pt-2">
                    {children}
                </Animated.View>
            )}
        </Animated.View>
    );
}
