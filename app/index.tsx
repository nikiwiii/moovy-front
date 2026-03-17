import { useRouter } from 'expo-router';
import { Check, Cloud, Smartphone } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';
import TouchableOpacity from '../components/TouchableOpacity';
import { FillStyles } from '../constants/themeStyles';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<'cloud' | 'local' | null>('local');
    const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

    const handleNext = () => {
        if (selected) {
            router.push('/preferences');
        }
    };

    return (
        <View className="flex-1 bg-background">
            <AnimatedBackground />
            <SafeAreaView className="flex-1">
                <View className="flex-1 px-4 justify-center">
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200, type: 'timing', duration: 800 }}
                        className="mb-10 px-4"
                    >
                        <Text className="font-outfit-bold text-white text-[26px] mb-1.5">Witamy w MovieNight</Text>
                        <Text className="font-outfit text-white text-[15px]">Gdzie chcesz zapisywać preferencje?</Text>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400, type: 'timing', duration: 800 }}
                        className="gap-2 text-black"
                    >
                        <Animated.View
                            layout={LinearTransition}
                            className={`${FillStyles.cardBase} ${selected === 'cloud' ? (FillStyles.cardActive + " py-4") : FillStyles.cardInactive} rounded-b-2xl`}
                        >
                            <AnimatedTouchableOpacity
                                layout={LinearTransition}
                                className="flex-row gap-4 items-center p-5"
                                onPress={() => setSelected('cloud')}
                            >
                                <View className={FillStyles.cardIcon}>
                                    <Cloud color={selected === 'cloud' ? '#8800ffa8' : '#000'} size={28} strokeWidth={selected === 'cloud' ? 2.0 : 1.5} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[18px] font-outfit uppercase tracking-wider">Chmura</Text>
                                    <Text className="font-outfit text-[14px] leading-[18px]">Preferencje filmowe powiązane z kontem</Text>
                                </View>
                            </AnimatedTouchableOpacity>
                        </Animated.View>

                        <Animated.View
                            layout={LinearTransition}
                            className={`${FillStyles.cardBase} ${selected === 'local' ? (FillStyles.cardActive + " py-4") : FillStyles.cardInactive} rounded-t-2xl`}
                        >
                            <AnimatedTouchableOpacity
                                layout={LinearTransition}
                                className="flex-row gap-4 items-center p-5"
                                onPress={() => setSelected('local')}
                            >
                                <View className={FillStyles.cardIcon}>
                                    <Smartphone color={selected === 'local' ? '#8800ffa8' : '#000'} size={28} strokeWidth={selected === 'local' ? 2.0 : 1.5} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[18px] font-outfit uppercase tracking-wider">Lokalnie</Text>
                                    <Text className="font-outfit text-[14px] leading-[18px]">Preferencje filmowe tylko na urządzeniu</Text>
                                </View>
                            </AnimatedTouchableOpacity>
                        </Animated.View>

                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.9 }}
                        transition={{ type: 'spring' }}
                        className="absolute bottom-10 right-6"
                    >
                        <TouchableOpacity onPress={handleNext} className="flex-row gap-x-2 items-center bg-white py-3.5 px-5 rounded-full">
                            <Check color="#000" size={20} strokeWidth={2} className="mr-2" />
                            <Text className="font-outfit-semi text-[16px]">Potwierdź wybór</Text>
                        </TouchableOpacity>
                    </MotiView>
                </View>
            </SafeAreaView>
        </View>
    );
}
