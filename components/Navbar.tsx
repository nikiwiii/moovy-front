import { useRouter } from "expo-router";
import { Brain, Cog, UsersRound } from "lucide-react-native";
import { MotiView } from "moti";
import { Text, View } from "react-native";
import TouchableOpacity from "./TouchableOpacity";

export default function Navbar() {
    const router = useRouter();
    return (
        <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 600 }}
            className="px-6 pt-5 pb-5 flex-row justify-between items-center"
        >
            <Text className="font-outfit-bold text-[24px] text-white">MN</Text>
            <View className="flex-row">
                <TouchableOpacity onPress={() => router.push('/parameters')} className="p-2">
                    <Brain color="#fff" size={24} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/friendboard')} className="p-2">
                    <UsersRound color="#fff" size={24} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/settings')} className="p-2">
                    <Cog color="#fff" size={24} strokeWidth={2} />
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}