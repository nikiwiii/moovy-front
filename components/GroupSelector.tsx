import { LucideIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
    Easing,
    LinearTransition,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { AppText as Text } from '@/components/AppText';
import TouchableOpacity from './TouchableOpacity';
import { FillStyles } from '../constants/themeStyles';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const SPRING_CONFIG = { damping: 14, stiffness: 120 };
const EXPAND_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };
const COLLAPSE_TIMING = { duration: 180, easing: Easing.in(Easing.cubic) };

const DESC_HEIGHT = 45; // height per-card when descriptions are visible

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
    onLongPress: () => void;
    activeWidth: number;
    inactiveWidth: number;
    showDesc: boolean;
}

function GroupItemCard({
    item,
    isActive,
    onPress,
    onLongPress,
    activeWidth,
    inactiveWidth,
    showDesc,
}: GroupItemCardProps) {
    const IconComp = item.icon;
    const widthSV = useSharedValue(isActive ? activeWidth : inactiveWidth);
    const descHeightSV = useSharedValue(showDesc ? DESC_HEIGHT : 0);
    const descOpacitySV = useSharedValue(showDesc ? 1 : 0);

    useEffect(() => {
        widthSV.value = withSpring(isActive ? activeWidth : inactiveWidth, SPRING_CONFIG);
    }, [isActive, activeWidth, inactiveWidth]);

    useEffect(() => {
        const cfg = showDesc ? EXPAND_TIMING : COLLAPSE_TIMING;
        descHeightSV.value = withTiming(showDesc ? DESC_HEIGHT : 0, cfg);
        descOpacitySV.value = withTiming(showDesc ? 0.7 : 0, cfg);
    }, [showDesc]);

    const animatedWidthStyle = useAnimatedStyle(() => ({
        width: widthSV.value,
        overflow: 'hidden',
    }));

    const animatedDescStyle = useAnimatedStyle(() => ({
        height: descHeightSV.value,
        opacity: descOpacitySV.value,
        overflow: 'hidden',
    }));

    return (
        <AnimatedTouchableOpacity
            layout={LinearTransition.springify().damping(200).stiffness(1200)}
            className={`${FillStyles.cardBase} ${isActive ? FillStyles.cardActive : FillStyles.cardInactive} p-3 justify-center items-center rounded-[25px]`}
            style={animatedWidthStyle}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={350}
        >
            <View
                className={`p-3 w-full rounded-full flex-row items-center gap-2 ${isActive ? 'bg-accent/15' : 'bg-white/[0.06]'
                    }`}
            >
                <IconComp
                    color={isActive ? ACCENT : '#707080'}
                    size={16}
                    strokeWidth={isActive ? 2.5 : 1.5}
                />
                <Text className="font-outfit-semi text-[15px]">{item.title}</Text>
            </View>

            <Animated.View style={animatedDescStyle}>
                <Text
                    className="font-outfit text-[11px] mt-2 mb-1"
                    numberOfLines={3}
                >
                    {item.description}
                </Text>
            </Animated.View>
        </AnimatedTouchableOpacity>
    );
}

export default function GroupSelector({ items, selectedId, onSelect }: GroupSelectorProps) {
    const scrollProgress = useSharedValue(0);
    const windowWidth = Dimensions.get('window').width;
    const activeWidth = windowWidth / 2 - 20;
    const inactiveWidth = windowWidth / 2 - 48;

    // Global toggle — long press anywhere expands ALL cards
    const [showDesc, setShowDesc] = React.useState(false);

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
                        onLongPress={() => setShowDesc((prev) => !prev)}
                        activeWidth={activeWidth}
                        inactiveWidth={inactiveWidth}
                        showDesc={showDesc}
                    />
                ))}
            </Animated.ScrollView>

            {/* Custom Scroll Indicator */}
            <View className="flex-row justify-center items-center -mb-3">
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
