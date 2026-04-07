import { FillStyles } from "@/constants/themeStyles";
import { router } from "expo-router";
import { ChevronRight, LogIn, LogOut, Settings as SettingsIcon, Smartphone, UserCircle2 } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Alert } from "react-native";
import TouchableOpacity from "@/components/TouchableOpacity";
import { storageService } from "@/services/storageService";

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
        <View className="w-9 h-9 rounded-full bg-white/30 items-center justify-center border border-white/5">
            <ChevronRight color="currentColor" size={18} />
        </View>
    );

    return (
        <View className="flex-1 bg-transparent pt-10">
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 600 }}
                className="px-6 pt-5 pb-5 flex-row justify-between items-center"
            >
                <Text className="font-outfit-bold text-[24px] text-white">Ustawienia</Text>
            </MotiView>

            <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="gap-y-1">

                    {!isLoggedIn && (
                        <TouchableOpacity
                            onPress={() => router.push('/login')}
                            className={`border-0 bg-white/20 rounded-t-3xl rounded-b-xl flex-row items-center justify-between gap-x-2 min-h-20 p-5 border border-white/10`}
                        >
                            <View className="flex-row items-center gap-x-4">
                                <View className="bg-white/20 p-2.5 rounded-2xl">
                                    <LogIn color="white" size={24} />
                                </View>
                                <View>
                                    <Text className="font-outfit-bold text-white text-[16px]">Połącz z chmurą</Text>
                                    <Text className="font-outfit text-white/50 text-[12px]">Zaloguj się i ciesz się pełną funkcjonalnością</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => router.push('/preferences')}
                        className={`${FillStyles.pillBase} border-0 bg-white/50 ${isLoggedIn ? FillStyles.pillFirst : ''} flex-row items-center justify-between gap-x-2 min-h-16`}
                    >
                        <View className="flex-row items-center gap-x-3 pl-2">
                            <UserCircle2 color="white" size={20} opacity={0.7} />
                            <Text className="font-outfit text-white">Zmień preferencje</Text>
                        </View>
                        {Arrow}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/')}
                        className={`${FillStyles.pillBase} border-0 bg-white/50 flex-row items-center justify-between gap-x-2 min-h-16`}
                    >
                        <View className="flex-row items-center gap-x-3 pl-2">
                            <Smartphone color="white" size={20} opacity={0.7} />
                            <Text className="font-outfit text-white">Zmień lokalizację zapisu</Text>
                        </View>
                        {Arrow}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { }}
                        className={`${FillStyles.pillBase} ${isLoggedIn ? '' : FillStyles.pillLast} border-0 bg-white/50 flex-row items-center justify-between gap-x-2 min-h-16`}
                    >
                        <View className="flex-row items-center gap-x-3 pl-2">
                            <SettingsIcon color="white" size={20} opacity={0.7} />
                            <Text className="font-outfit text-white">Inne ustawienia</Text>
                        </View>
                        {Arrow}
                    </TouchableOpacity>

                    {isLoggedIn && (
                        <TouchableOpacity
                            onPress={handleLogout}
                            className={`${FillStyles.pillBase} border-0 bg-white/50 ${FillStyles.pillLast} flex-row items-center justify-between gap-x-2 min-h-16`}
                        >
                            <View className="flex-row items-center gap-x-3 pl-2">
                                <LogOut color="#c10007" size={20} />
                                <Text className="font-outfit-semi text-[#c10007]">Wyloguj się</Text>
                            </View>
                            {Arrow}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView >
        </View >
    );
}