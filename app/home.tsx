import { useRouter } from 'expo-router';
import { ArrowUpRight, Plus, Search, Users, Menu, ArrowRight, UsersRound, Handshake } from 'lucide-react-native';
import { MotiView, MotiText } from 'moti';
import React from 'react';
import { Dimensions, SafeAreaView, View, StyleSheet } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import TouchableOpacity from '../components/TouchableOpacity';
import { Colors } from '@/constants/theme';
import { APP_NAME } from '../constants/app';

const { width, height } = Dimensions.get('window');
const ACCENT = Colors.dark.accent;

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-transparent pt-10">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-8 pt-4">
                    <MotiView
                        from={{ opacity: 0, translateX: -20 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ delay: 300 }}
                    >
                        <Text className="font-outfit-bold text-[24px] tracking-tighter">{APP_NAME}®</Text>
                    </MotiView>
                </View>

                {/* Main Content */}
                <View className="flex-1 px-8 justify-center">
                    <MotiView
                        from={{ opacity: 0, translateY: 40 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 1000, delay: 500 }}
                        className="mb-12"
                    >
                        <Text className="font-outfit text-[42px] leading-[48px] tracking-tight text-white/90">
                            welcome to{'\n'}{APP_NAME.includes('.') ? APP_NAME.split('.')[0] : APP_NAME}{'\n'}
                            {APP_NAME.includes('.') && <Text style={{ color: ACCENT }}>{APP_NAME.split('.')[1]} </Text>}
                            <Text style={{ color: ACCENT }}>(alpha*)</Text>
                        </Text>

                        {/* Decorative line */}
                        <View className="w-16 h-[1px] bg-white/20 mt-6" />
                    </MotiView>

                    {/* Interactive Elements inspired by the design */}
                    <View className="flex-row items-end justify-center gap-x-20">
                        {/* "Find Movie" Large Circle Button */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', delay: 800 }}
                        >
                            <TouchableOpacity
                                onPress={() => router.push('/parameters')}
                                className="h-[140px] items-center justify-center overflow-hidden"
                            >
                                <View className="items-center">
                                    <Search color={ACCENT} size={32} strokeWidth={1.5} />
                                    <Text className="font-outfit-bold border-b text-white/90 border-white/50 text-[18px] uppercase mt-3 text-center">
                                        Find a Movie
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </MotiView>

                        {/* Side Actions */}
                        <View className="items-center">
                            <MotiView
                                from={{ opacity: 0, translateX: 20 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ delay: 1000 }}
                                className="items-end mb-10"
                            >
                                <TouchableOpacity
                                    onPress={() => router.push('/session-join')}
                                    className="flex-col items-center"
                                >
                                    <View className="opacity-70">
                                        <Handshake color={ACCENT} size={20} />
                                    </View>
                                    <Text className="font-outfit-bold text-[18px] text-white/80 tracking-tight mb-2 border-b border-white/30">join session</Text>

                                </TouchableOpacity>
                            </MotiView>

                            <MotiView
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: 1200 }}
                            >
                                <TouchableOpacity
                                    onPress={() => router.push('/session-create')}
                                    className='items-center'
                                >
                                    <View className="opacity-70">
                                        <Plus color={ACCENT} size={20} />
                                    </View>
                                    <Text className="font-outfit-bold text-[18px] text-white/80 tracking-tight mb-2 border-b border-white/30">create session</Text>
                                </TouchableOpacity>
                            </MotiView>
                        </View>
                    </View>
                </View>

                {/* Bottom Actions */}
                <View className="px-8 pb-12 flex-row justify-between items-end">
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1500 }}
                    >
                        <Text className="font-outfit text-[10px] uppercase tracking-[2px] opacity-30">{APP_NAME} © 2026</Text>
                        <Text className="font-outfit text-[10px] text-white/40 mt-1 max-w-[150px]">
                            we'll find your{'\n'}perfect screening
                        </Text>
                    </MotiView>
                </View>
            </SafeAreaView>
        </View>
    );
}
