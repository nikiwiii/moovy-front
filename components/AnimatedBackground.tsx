import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function AnimatedBackground() {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    useEffect(() => {
        // Płynne skalowanie promienia
        scale.value = withRepeat(
            withTiming(1.3, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        // Lekkie pływanie w poziomie
        translateX.value = withRepeat(
            withTiming(40, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        // Lekkie pływanie w pionie
        translateY.value = withRepeat(
            withTiming(-40, { duration: 9000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    return (
        <View className="absolute inset-0 bg-indigo-950 overflow-hidden">
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        bottom: -width * 0.5,
                        left: -width * 0.4,
                        width: width * 1.8,
                        height: width * 1.8,
                        opacity: 0.5,
                    },
                    animatedStyle
                ]}
            >
                <Svg width="100%" height="100%">
                    <Defs>
                        <RadialGradient
                            id="glow"
                            cx="50%"
                            cy="50%"
                            r="50%"
                            fx="50%"
                            fy="50%"
                        >
                            <Stop offset="0%" stopColor="#00e5ff" stopOpacity="1" />
                            <Stop offset="40%" stopColor="#00e5ff" stopOpacity="0.6" />
                            <Stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
                </Svg>
            </Animated.View>
        </View>
    );
}
