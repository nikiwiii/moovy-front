import { LucideIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
    LinearTransition,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { AppText as Text } from '@/components/AppText';
import TouchableOpacity from './TouchableOpacity';
import { FillStyles } from '../constants/themeStyles';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const SPRING_CONFIG = { damping: 14, stiffness: 120 };

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

interface GroupItemCardProps {
    item: GroupItem;
    isActive: boolean;
    onPress: () => void;
    activeWidth: number;
    inactiveWidth: number;
}

function GroupItemCard({ item, isActive, onPress, activeWidth, inactiveWidth }: GroupItemCardProps) {
    const IconComp = item.icon;
    const widthSV = useSharedValue(isActive ? activeWidth : inactiveWidth);

    useEffect(() => {
        widthSV.value = withSpring(isActive ? activeWidth : inactiveWidth, SPRING_CONFIG);
    }, [isActive, activeWidth, inactiveWidth]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: widthSV.value,
        overflow: 'hidden',
    }));

    return (
        <AnimatedTouchableOpacity
            layout={LinearTransition.springify().damping(200).stiffness(1200)}
            className={`${FillStyles.cardBase} ${isActive ? FillStyles.cardActive : FillStyles.cardInactive} p-3 justify-between rounded-[25px]`}
            style={animatedStyle}
            onPress={onPress}
        >
            <View className={`h-10 px-3 rounded-full flex-row items-center gap-2 ${isActive ? 'bg-accent/15' : 'bg-white/[0.06]'}`}>
                <IconComp
                    color={isActive ? ACCENT : '#707080'}
                    size={16}
                    strokeWidth={isActive ? 2.5 : 1.5}
                />
                <Text className="font-outfit-semi text-[15px]">{item.title}</Text>
            </View>
            <View className="mt-2">
                <Text className="font-outfit text-[11px] opacity-40 mt-0.5 mb-1" numberOfLines={2}>
                    {item.description}
                </Text>
            </View>
        </AnimatedTouchableOpacity>
    );
}

export default function GroupSelector({ items, selectedId, onSelect }: GroupSelectorProps) {
    const scrollProgress = useSharedValue(0);
    const windowWidth = Dimensions.get('window').width;
    const activeWidth = windowWidth / 2 - 20;
    const inactiveWidth = windowWidth / 2 - 48;

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const { contentOffset, layoutMeasurement, contentSize } = event;
            const maxScroll = contentSize.width - layoutMeasurement.width;
            if (maxScroll > 0) {
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
                {items.map((item) => (
                    <GroupItemCard
                        key={item.id}
                        item={item}
                        isActive={selectedId === item.id}
                        onPress={() => onSelect(item.id)}
                        activeWidth={activeWidth}
                        inactiveWidth={inactiveWidth}
                    />
                ))}
            </Animated.ScrollView>

            {/* Custom Scroll Indicator */}
            <View className="flex-row justify-center items-center mt-1 -mb-3">
                <View className="w-16 h-[3px] bg-white/10 rounded-full overflow-hidden">
                    <Animated.View
                        style={[
                            useAnimatedStyle(() => {
                                const maxTranslate = 38.4;
                                return {
                                    width: '40%',
                                    height: '100%',
                                    backgroundColor: ACCENT,
                                    borderRadius: 10,
                                    transform: [{ translateX: scrollProgress.value * maxTranslate }],
                                };
                            }),
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}
