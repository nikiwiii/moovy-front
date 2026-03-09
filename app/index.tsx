import { useRouter } from 'expo-router';
import { Check, Cloud, Smartphone } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import AnimatedBackground from '../components/AnimatedBackground';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const [selected, setSelected] = useState<'cloud' | 'local' | null>('local');

    const handleNext = () => {
        if (selected) {
            router.push('/preferences');
        }
    };

    return (
        <View className="flex-1 bg-background pt-10">
            <AnimatedBackground />
            <SafeAreaView className="flex-1">
                <View className="flex-1 px-6 justify-center">
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 200, type: 'timing', duration: 800 }}
                        className="mb-10"
                    >
                        <Text className="font-outfit-bold text-[26px] text-white mb-1.5">Witamy w MovieNight</Text>
                        <Text className="font-outfit text-[15px] text-text-dim">Gdzie chcesz zapisywać preferencje?</Text>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 400, type: 'timing', duration: 800 }}
                        className="gap-4"
                    >
                        <TouchableOpacity onPress={() => setSelected('cloud')} activeOpacity={0.8}>
                            <View className={`flex-row items-center bg-black/20 border rounded-3xl p-5 ${selected === 'cloud' ? 'bg-card-active/20 border-accent border-1' : 'border-white/5'}`}>
                                <View className="mr-4">
                                    <Cloud color={selected === 'cloud' ? '#fff' : '#888'} size={28} strokeWidth={1.5} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-outfit-semi text-[18px] mb-1 ${selected === 'cloud' ? 'text-white' : 'text-text-secondary'}`}>Chmura</Text>
                                    <Text className="font-outfit text-[13px] text-text-muted leading-[18px]">Preferencje filmowe powiązane z kontem</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setSelected('local')} activeOpacity={0.8}>
                            <View className={`flex-row items-center bg-black/20 border rounded-3xl p-5 ${selected === 'local' ? 'bg-card-active/20 border-accent border-1' : 'border-white/5'}`}>
                                <View className="mr-4">
                                    <Smartphone color={selected === 'local' ? '#fff' : '#888'} size={28} strokeWidth={1.5} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-outfit-semi text-[18px] mb-1 ${selected === 'local' ? 'text-white' : 'text-text-secondary'}`}>Lokalnie</Text>
                                    <Text className="font-outfit text-[13px] text-text-muted leading-[18px]">Preferencje filmowe tylko na Twoim urządzeniu</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.9 }}
                        transition={{ type: 'spring' }}
                        className="absolute bottom-10 right-6"
                    >
                        <TouchableOpacity onPress={handleNext} activeOpacity={0.8} className="flex-row gap-x-2 items-center bg-white py-3.5 px-5 rounded-full">
                            <Check color="#000" size={20} strokeWidth={2} className="mr-2" />
                            <Text className="font-outfit-semi text-[16px] text-black">Potwierdź wybór</Text>
                        </TouchableOpacity>
                    </MotiView>
                </View>
            </SafeAreaView>
        </View>
    );
}
