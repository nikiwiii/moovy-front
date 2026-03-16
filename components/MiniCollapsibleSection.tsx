import { ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { FillStyles } from '../constants/themeStyles';
import TouchableOpacity from './TouchableOpacity';

export interface MiniCollapsibleSectionProps {
    title: string;
    value?: number | string;
    // icon: any;
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
        <Animated.View layout={LinearTransition} className={`${FillStyles.subsection} overflow-hidden ${className}`}>
            <TouchableOpacity
                className="p-3 flex-col justify-between"
                onPress={() => setOpen(!open)}
            >
                <View className="flex-row justify-between items-center gap-4">
                    {img && <Image source={{ uri: img }} className="w-14 h-14 rounded-2xl" />}
                    <View className="flex-1 mr-4">
                        <Text className={"font-outfit uppercase tracking-widest" + (img ? " text-[16px]" : " text-[12px] opacity-70")}>{title} ({value})</Text>
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
            </TouchableOpacity>
            {open && (
                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="px-5 pb-6 pt-2">
                    {children}
                </Animated.View>
            )}
        </Animated.View>
    );
}
