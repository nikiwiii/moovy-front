import { useRouter } from 'expo-router';
import { ArrowUpRight, Plus, Search, Users, Menu, ArrowRight, UsersRound } from 'lucide-react-native';
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
                <View className="px-8 pt-4 flex-row justify-between items-center">
                    <MotiView
                        from={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 300 }}
                    >
                        <Text className="font-outfit-bold text-[24px] tracking-tighter">{APP_NAME}®</Text>
                    </MotiView>
                    <MotiView
                        from={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 300 }}
                        className="flex-row items-center gap-2"
                    >
                        <View className="h-[1px] w-8 bg-white/20" />
                        <Text className="font-outfit text-[10px] uppercase tracking-[3px] opacity-60">Hello</Text>
                    </MotiView>
                </View>

                {/* Main Content */}
                <View className="flex-1 px-8 justify-center">
                    <MotiView
                        from={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'timing', duration: 1000, delay: 500 }}
                        className="mb-12"
                    >
                        <Text className="font-outfit text-[42px] leading-[48px] tracking-tight text-white/90">
                            witamy w{'\n'}{APP_NAME.includes('.') ? APP_NAME.split('.')[0] : APP_NAME}{'\n'}
                            {APP_NAME.includes('.') && <Text style={{ color: ACCENT }}>{APP_NAME.split('.')[1]} </Text>}
                            <Text style={{ color: ACCENT }}>(alpha*)</Text>
                        </Text>

                        {/* Decorative line */}
                        <View className="w-16 h-[1px] bg-white/20 mt-6" />
                    </MotiView>

                    {/* Interactive Elements inspired by the design */}
                    <View className="flex-row items-end justify-between">
                        {/* "Find Movie" Large Circle Button */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', delay: 800 }}
                        >
                            <TouchableOpacity
                                onPress={() => router.push('/parameters')}
                                className="w-[140px] h-[140px] rounded-full border border-white/10 bg-white/5 items-center justify-center overflow-hidden"
                            >
                                <View className="items-center">
                                    <Search color={ACCENT} size={32} strokeWidth={1.5} />
                                    <Text className="font-outfit-semi text-[12px] uppercase tracking-[2px] mt-3 text-center px-4">
                                        Znajdź film
                                    </Text>
                                </View>
                                {/* Subtle inner glow */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: ACCENT,
                                        opacity: 0.03
                                    }}
                                />
                            </TouchableOpacity>
                        </MotiView>

                        {/* Side Actions */}
                        <View className="items-center">
                            <MotiView
                                from={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1000 }}
                                className="items-end"
                            >
                                <TouchableOpacity
                                    onPress={() => router.push('/session-join')}
                                    className="flex-col items-center"
                                >
                                    <Text className="font-outfit text-[18px] text-white/70 tracking-tight mb-2">dołącz do sesji</Text>
                                    <View className="opacity-70">
                                        <UsersRound color={ACCENT} size={20} />
                                    </View>
                                </TouchableOpacity>
                            </MotiView>
                            <MotiView
                                from={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1000 }}
                                className="h-20 w-[1px] bg-white/40" />

                            <MotiView
                                from={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1200 }}
                            >
                                <TouchableOpacity
                                    onPress={() => router.push('/session-create')}
                                    className='items-center'
                                >
                                    <View className="opacity-70">
                                        <Plus color={ACCENT} size={20} />
                                    </View>
                                    <Text className="font-outfit text-[18px] text-white/70 tracking-tight mb-2">utwórz sesję</Text>
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
                            znajdziemy dla Ciebie{'\n'}idealny seans
                        </Text>
                    </MotiView>
                </View>
            </SafeAreaView>
        </View>
    );
}
