import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import Animated, { LinearTransition, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { AppText as Text } from '@/components/AppText';
import TouchableOpacity from './TouchableOpacity';
import { FillStyles } from '../constants/themeStyles';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export interface GroupItem {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
}

interface GroupSelectorProps {
    items: GroupItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function GroupSelector({ items, selectedId, onSelect }: GroupSelectorProps) {
    const scrollProgress = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const { contentOffset, layoutMeasurement, contentSize } = event;
            const maxScroll = contentSize.width - layoutMeasurement.width;
            if (maxScroll > 0) {
                // Prevent overscroll from giving negative/out-of-bounds progress
                let progress = contentOffset.x / maxScroll;
                progress = Math.max(0, Math.min(progress, 1));
                scrollProgress.value = progress;
            } else {
                scrollProgress.value = 0;
            }
        },
    });

    return (
        <View>
            <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-3 pb-3"
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                {items.map((item) => {
                    const isActive = selectedId === item.id;
                    const IconComp = item.icon;
                    return (
                        <AnimatedTouchableOpacity
                            key={item.id}
                            layout={LinearTransition.springify().damping(14).stiffness(120)}
                            className={`${FillStyles.cardBase} ${isActive ? FillStyles.cardActive : FillStyles.cardInactive} h-[130px] p-3 justify-between`}
                            style={{ width: isActive ? 150 : 135 }}
                            onPress={() => onSelect(item.id)}
                        >
                            <View className={`w-14 h-14 rounded-full items-center justify-center ${isActive ? 'bg-accent/15' : 'bg-white/[0.06]'}`}>
                                <IconComp
                                    color={isActive ? ACCENT : '#707080'}
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 1.5}
                                />
                            </View>
                            <View>
                                <Text className="font-outfit-semi text-[15px]">{item.title}</Text>
                                <Text className="font-outfit text-[11px] opacity-40 mt-0.5" numberOfLines={2}>{item.description}</Text>
                            </View>
                        </AnimatedTouchableOpacity>
                    );
                })}
            </Animated.ScrollView>

            {/* Custom Scroll Indicator */}
            <View className="flex-row justify-center items-center mt-1">
                <View className="w-16 h-[3px] bg-white/10 rounded-full overflow-hidden">
                    <Animated.View
                        style={[
                            useAnimatedStyle(() => {
                                // track width = 64px
                                // thumb width = 40% of 64px = 25.6px
                                // max translate = 64 - 25.6 = 38.4px
                                const maxTranslate = 38.4;
                                return {
                                    width: '40%',
                                    height: '100%',
                                    backgroundColor: ACCENT,
                                    borderRadius: 10,
                                    transform: [{ translateX: scrollProgress.value * maxTranslate }]
                                };
                            })
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}
