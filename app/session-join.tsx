import { useRouter } from 'expo-router';
import { ArrowLeft, LogIn, Ticket } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useRef, useState } from 'react';
import {
    Alert, SafeAreaView, TextInput, View, Dimensions
} from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, {
    Easing, useAnimatedStyle, useSharedValue, withRepeat,
    withSequence, withTiming, FadeIn,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import TouchableOpacity from '../components/TouchableOpacity';
import { FillStyles } from '../constants/themeStyles';
import { sessionService } from '../services/sessionService';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;

const { width } = Dimensions.get('window');
const CODE_LENGTH = 6;

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

/* ─── Animated loading overlay ───────────────────────────────────────── */
function JoinLoadingScreen() {
    // Multiple animated rings + pulsing center
    const rotation = useSharedValue(0);
    const rotation2 = useSharedValue(0);
    const pulseScale = useSharedValue(1);
    const dotScale1 = useSharedValue(0.6);
    const dotScale2 = useSharedValue(0.6);
    const dotScale3 = useSharedValue(0.6);

    React.useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 3000, easing: Easing.linear }),
            -1, false
        );
        rotation2.value = withRepeat(
            withTiming(-360, { duration: 4500, easing: Easing.linear }),
            -1, false
        );
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            ),
            -1, true
        );

        // Staggered dots animation
        dotScale1.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.6, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            ),
            -1, true
        );
        setTimeout(() => {
            dotScale2.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.6, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                ),
                -1, true
            );
        }, 200);
        setTimeout(() => {
            dotScale3.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0.6, { duration: 400, easing: Easing.inOut(Easing.ease) }),
                ),
                -1, true
            );
        }, 400);
    }, []);

    const ringStyle1 = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));
    const ringStyle2 = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation2.value}deg` }],
    }));
    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));
    const dot1Style = useAnimatedStyle(() => ({
        transform: [{ scale: dotScale1.value }],
        opacity: 0.4 + dotScale1.value * 0.6,
    }));
    const dot2Style = useAnimatedStyle(() => ({
        transform: [{ scale: dotScale2.value }],
        opacity: 0.4 + dotScale2.value * 0.6,
    }));
    const dot3Style = useAnimatedStyle(() => ({
        transform: [{ scale: dotScale3.value }],
        opacity: 0.4 + dotScale3.value * 0.6,
    }));

    const ringSize = width * 0.55;

    return (
        <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 600 }}
            className="flex-1 items-center justify-center"
        >
            {/* Outer spinning ring */}
            <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
                <Animated.View style={[{ position: 'absolute', width: ringSize, height: ringSize }, ringStyle1]}>
                    <Svg width={ringSize} height={ringSize}>
                        <Defs>
                            <LinearGradient id="ring1" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor={ACCENT} stopOpacity="0.8" />
                                <Stop offset="0.5" stopColor={ACCENT} stopOpacity="0.1" />
                                <Stop offset="1" stopColor={ACCENT} stopOpacity="0" />
                            </LinearGradient>
                        </Defs>
                        <Circle
                            cx={ringSize / 2} cy={ringSize / 2}
                            r={ringSize / 2 - 3}
                            stroke="url(#ring1)"
                            strokeWidth={2.5}
                            fill="transparent"
                            strokeLinecap="round"
                            strokeDasharray={`${ringSize * 0.6} ${ringSize * 1.5}`}
                        />
                    </Svg>
                </Animated.View>

                {/* Inner counter-spinning ring */}
                <Animated.View style={[{ position: 'absolute', width: ringSize * 0.75, height: ringSize * 0.75 }, ringStyle2]}>
                    <Svg width={ringSize * 0.75} height={ringSize * 0.75}>
                        <Defs>
                            <LinearGradient id="ring2" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0" stopColor="#fff" stopOpacity="0.4" />
                                <Stop offset="0.5" stopColor="#fff" stopOpacity="0.05" />
                                <Stop offset="1" stopColor="#fff" stopOpacity="0" />
                            </LinearGradient>
                        </Defs>
                        <Circle
                            cx={ringSize * 0.375} cy={ringSize * 0.375}
                            r={ringSize * 0.375 - 2}
                            stroke="url(#ring2)"
                            strokeWidth={1.5}
                            fill="transparent"
                            strokeDasharray={`${ringSize * 0.35} ${ringSize * 1.2}`}
                        />
                    </Svg>
                </Animated.View>

                {/* Center pulsing icon */}
                <Animated.View
                    style={[pulseStyle, { alignItems: 'center', justifyContent: 'center' }]}
                >
                    <View className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 items-center justify-center">
                        <Ticket color={ACCENT} size={32} strokeWidth={1.5} />
                    </View>
                </Animated.View>
            </View>

            {/* Loading text */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 300, duration: 600 }}
                className="mt-10 items-center"
            >
                <Text className="font-outfit-bold text-[22px] mb-2">Joining session</Text>
                <View className="flex-row items-center gap-1.5 mt-1">
                    <Text className="font-outfit text-[14px] opacity-40">Connecting</Text>
                    <Animated.View style={dot1Style} className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <Animated.View style={dot2Style} className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <Animated.View style={dot3Style} className="w-1.5 h-1.5 rounded-full bg-accent" />
                </View>
            </MotiView>

            {/* Fun facts / tips */}
            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 800, duration: 800 }}
                className="mt-12 px-8"
            >
                <View className={`${FillStyles.subsection} p-4 items-center`}>
                    <Text className="font-outfit text-[12px] opacity-30 text-center leading-5">
                        💡 After joining, you will be able to set your{'\n'}movie preferences for tonight
                    </Text>
                </View>
            </MotiView>
        </MotiView>
    );
}


/* ─── Main screen ───────────────────────────────────────────────────── */
export default function SessionJoinScreen() {
    const router = useRouter();
    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const fullCode = code.join('');

    const handleChangeChar = (text: string, index: number) => {
        const char = text.slice(-1).toUpperCase();
        const newCode = [...code];
        newCode[index] = char;
        setCode(newCode);

        if (char && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newCode = [...code];
            newCode[index - 1] = '';
            setCode(newCode);
        }
    };

    const handleJoin = async () => {
        if (fullCode.length !== CODE_LENGTH) return;
        setIsLoading(true);
        try {
            const result = await sessionService.joinSession(fullCode);
            // Short delay for loading animation appreciation
            await new Promise(r => setTimeout(r, 1800));
            router.replace({
                pathname: '/session-lobby',
                params: {
                    sessionId: result.session_id,
                    isHost: 'false',
                },
            });
        } catch (error: any) {
            setIsLoading(false);
            Alert.alert('Error', error.message);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-transparent">
                <SafeAreaView className="flex-1">
                    <JoinLoadingScreen />
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-transparent pt-10">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-6 pt-5 pb-3 flex-row justify-between items-center"
                >
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-2">
                        <ArrowLeft color="#fff" size={20} strokeWidth={2} />
                        <Text className="font-outfit text-[13px] opacity-40 uppercase tracking-[2px]">Back</Text>
                    </TouchableOpacity>
                </MotiView>

                <View className="flex-1 px-5 mt-24">
                    <MotiView
                        from={{ opacity: 0, translateY: 30 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200, type: 'timing', duration: 800 }}
                    >
                        {/* Title */}
                        <View className="items-center mb-6">
                            <MotiView
                                from={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 300, damping: 30 }}
                                className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/[0.1] items-center justify-center mb-5"
                            >
                                <Ticket color={ACCENT} size={28} strokeWidth={1.5} />
                            </MotiView>
                            <Text className="font-outfit-bold text-[28px] text-center">Join session</Text>
                            <Text className="font-outfit text-[14px] opacity-35 mt-2 text-center">Enter 6-character invite code</Text>
                        </View>

                        {/* Code input */}
                        <View className="flex-row justify-center gap-2 mb-8">
                            {code.map((char, i) => (
                                <MotiView
                                    key={i}
                                    from={{ opacity: 0, translateY: 20 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ delay: 400 + i * 80, type: 'spring', damping: 14 }}
                                >
                                    <TextInput
                                        ref={(ref) => { inputRefs.current[i] = ref; }}
                                        value={char}
                                        onChangeText={(t) => handleChangeChar(t, i)}
                                        onKeyPress={(e) => handleKeyPress(e, i)}
                                        maxLength={2}
                                        autoCapitalize="characters"
                                        textAlign="center"
                                        className="font-outfit-bold text-[22px]"
                                        style={{
                                            width: (width - 72) / 6,
                                            height: 58,
                                            backgroundColor: char ? `${ACCENT}14` : 'rgba(255,255,255,0.04)',
                                            borderWidth: 1,
                                            borderColor: char ? `${ACCENT}40` : 'rgba(255,255,255,0.08)',
                                            borderRadius: 14,
                                            color: ACCENT,
                                        }}
                                        selectionColor={ACCENT}
                                    />
                                </MotiView>
                            ))}
                        </View>

                        {/* Join button */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: fullCode.length === CODE_LENGTH ? 1 : 0.4, scale: fullCode.length === CODE_LENGTH ? 1 : 0.95 }}
                            transition={{ type: 'spring' }}
                            className="items-center"
                        >
                            <TouchableOpacity
                                className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} w-full justify-center`}
                                onPress={handleJoin}
                                disabled={fullCode.length !== CODE_LENGTH}
                            >
                                <View className="flex-row items-center gap-2">
                                    <LogIn color="#fff" size={18} strokeWidth={2.5} />
                                    <Text className="font-outfit-semi text-[15px]">Join session</Text>
                                </View>
                            </TouchableOpacity>
                        </MotiView>
                    </MotiView>
                </View>
            </SafeAreaView>
        </View>
    );
}
