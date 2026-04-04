import { FillStyles } from "@/constants/themeStyles";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { MotiView } from "moti";
import { ScrollView, Text, View } from "react-native";
import TouchableOpacity from "@/components/TouchableOpacity";

export default function Settings() {
    const Arrow = (
        <TouchableOpacity className="w-9 h-9 rounded-full bg-white/30 items-center justify-center border border-white/5">
            <ChevronRight color="currentColor" size={18} />
        </TouchableOpacity>
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
                    <TouchableOpacity
                        onPress={() => router.push('/')}
                        className={`${FillStyles.pillBase} border-0 bg-white/50 ${FillStyles.pillFirst} flex-row items-center justify-between gap-x-2 min-h-16`}
                    >
                        <Text className="font-outfit">Zmień motyw</Text>
                        {Arrow}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/preferences')}
                        className={`${FillStyles.pillBase} border-0 bg-white/50 flex-row items-center justify-between gap-x-2 min-h-16`}
                    >
                        <Text className="font-outfit">Zmień preferencje</Text>
                        {Arrow}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/')}
                        className={`${FillStyles.pillBase} border-0 bg-white/50 flex-row items-center justify-between gap-x-2 min-h-16`}
                    >
                        <Text className="font-outfit">Zmień lokalizację zapisu</Text>
                        {Arrow}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/')}
                        className={`${FillStyles.pillBase} border-0 bg-white/50 ${FillStyles.pillLast} flex-row items-center justify-between gap-x-2 min-h-16`}
                    >
                        <Text className="font-outfit">Wyloguj się</Text>
                        {Arrow}
                    </TouchableOpacity>
                </View>
            </ScrollView >
        </View >
    );
}