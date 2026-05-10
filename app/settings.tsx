import { FillStyles } from "@/constants/themeStyles";
import { router } from "expo-router";
import { ChevronRight, LogIn, LogOut, Settings as SettingsIcon, Smartphone, UserCircle2 } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { ScrollView, View, Alert } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import TouchableOpacity from "@/components/TouchableOpacity";
import { storageService } from "@/services/storageService";
import { Colors } from "@/constants/theme";

const ACCENT = Colors.dark.accent;

export default function Settings() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await storageService.getToken();
            setIsLoggedIn(!!token);
        };
        checkAuth();
    }, []);

    const handleLogout = () => {
        Alert.alert(
            "Wyloguj się",
            "Czy na pewno chcesz się wylogować?",
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Tak",
                    onPress: async () => {
                        await storageService.logout();
                        setIsLoggedIn(false);
                        router.replace('/');
                    }
                }
            ]
        );
    };

    const Arrow = (
        <View className="w-8 h-8 rounded-full bg-white/[0.06] items-center justify-center border border-white/[0.08]">
            <ChevronRight color="#707080" size={16} />
        </View>
    );

    return (
        <View className="flex-1 bg-transparent pt-10">
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 600 }}
                className="px-6 pt-5 pb-3 flex-row justify-between items-center"
            >
                <Text className="font-outfit-bold text-[24px]">Ustawienia</Text>
            </MotiView>

            <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="gap-y-2">

                    {!isLoggedIn && (
                        <TouchableOpacity
                            onPress={() => router.push('/login')}
                            className="bg-accent/10 rounded-[24px] flex-row items-center justify-between gap-x-3 min-h-20 p-5 border border-accent/20"
                        >
                            <View className="flex-row items-center gap-x-4">
                                <View className="bg-accent/15 p-2.5 rounded-xl">
                                    <LogIn color={ACCENT} size={22} />
                                </View>
                                <View>
                                    <Text className="font-outfit-semi text-[15px]">Połącz z chmurą</Text>
                                    <Text className="font-outfit text-[12px] opacity-35">Zaloguj się i ciesz się pełną funkcjonalnością</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => router.push('/preferences')}
                        className={`${FillStyles.pillBase} ${FillStyles.pillInactive} ${isLoggedIn ? FillStyles.pillFirst : ''} flex-row items-center justify-between gap-x-2 min-h-14`}
                    >
                        <View className="flex-row items-center gap-x-3 pl-1">
                            <UserCircle2 color="#707080" size={18} />
                            <Text className="font-outfit text-[14px]">Zmień preferencje</Text>
                        </View>
                        {Arrow}
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        onPress={() => router.push('/')}
                        disabled
                        className={`${FillStyles.pillBase} ${FillStyles.pillInactive} flex-row items-center justify-between gap-x-2 min-h-14`}
                    >
                        <View className="flex-row items-center gap-x-3 pl-1">
                            <Smartphone color="#707080" size={18} />
                            <Text className="font-outfit text-[14px]">Zmień lokalizację zapisu</Text>
                        </View>
                        {Arrow}
                    </TouchableOpacity> */}

                    <TouchableOpacity
                        onPress={() => { }}
                        className={`${FillStyles.pillBase} ${FillStyles.pillInactive} ${isLoggedIn ? '' : FillStyles.pillLast} flex-row items-center justify-between gap-x-2 min-h-14`}
                    >
                        <View className="flex-row items-center gap-x-3 pl-1">
                            <SettingsIcon color="#707080" size={18} />
                            <Text className="font-outfit text-[14px]">Inne ustawienia</Text>
                        </View>
                        {Arrow}
                    </TouchableOpacity>

                    {isLoggedIn && (
                        <TouchableOpacity
                            onPress={handleLogout}
                            className={`${FillStyles.pillBase} ${FillStyles.pillLast} bg-red-500/10 border-red-500/20 flex-row items-center justify-between gap-x-2 min-h-14`}
                        >
                            <View className="flex-row items-center gap-x-3 pl-1">
                                <LogOut color="#ef4444" size={18} />
                                <Text className="font-outfit-semi text-[14px] text-red-400">Wyloguj się</Text>
                            </View>
                            {Arrow}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}