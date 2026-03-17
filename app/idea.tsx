import FilmView from "@/components/FilmView";
import { useRouter } from "expo-router";
import { Clock, Film, RotateCcw, UserPlus, Users } from "lucide-react-native";
import { MotiView } from "moti";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import AnimatedBackground from "../components/AnimatedBackground";
import CollapsibleSection from "../components/CollapsibleSection";
import Navbar from "../components/Navbar";

export default function IdeaScreen() {
    const router = useRouter();
    const criteria = {
        preset: "Tłum",
        genres: ["Przygodowy", "Akcji"],
        duration: "Dłuższy",
        friendsAdded: 0
    }
    return (
        <View className="flex-1 bg-background pt-10">
            <AnimatedBackground />
            <Navbar />
            <ScrollView contentContainerClassName="px-2 pb-[100px]" showsVerticalScrollIndicator={false}>
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-4 pt-5 pb-5 flex-row justify-between items-center"
                >
                    <Text className="font-outfit-bold text-[24px] text-white">Pomysł</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center gap-2"
                    >
                        <Text className="font-outfit text-md text-white/70">Wróć</Text>
                    </TouchableOpacity>
                </MotiView>
                <View className="flex-1 px-2 flex-col gap-y-2">
                    <FilmView />
                    <CollapsibleSection
                        title="Twoje kryteria"
                        subtitle="Skąd ten pomysł?"
                        icon={Users}
                        defaultOpen={false}
                    >
                        <Animated.View layout={LinearTransition} className="flex-col gap-2">
                            <View className="flex-row items-center gap-2"><Users size={20} strokeWidth={2} color="currentColor" /><Text className="font-outfit text-md">{criteria.preset}</Text></View>
                            <View className="flex-row items-center gap-2"><Film size={20} strokeWidth={2} color="currentColor" /><Text className="font-outfit text-md">{criteria.genres.join(", ")}</Text></View>
                            <View className="flex-row items-center gap-2"><Clock size={20} strokeWidth={2} color="currentColor" /><Text className="font-outfit text-md">{criteria.duration}</Text></View>
                            <View className="flex-row items-center gap-2"><UserPlus size={20} strokeWidth={2} color="currentColor" /><Text className="font-outfit text-md">{criteria.friendsAdded}</Text></View>
                        </Animated.View>
                    </CollapsibleSection>

                    <Animated.View
                        layout={LinearTransition}
                        className="self-end"
                    >
                        <TouchableOpacity
                            className="flex-row gap-x-2 w-[200px] items-center bg-white py-3.5 px-5 rounded-full shadow-[0_0_10px_rgba(0,229,255,0.3)] elevation-5"
                            onPress={() => { }}
                        >
                            <RotateCcw color="#000" size={20} strokeWidth={2} className="mr-2" />
                            <Text className="font-outfit-semi text-[16px] text-black">Spróbuj ponownie</Text>
                        </TouchableOpacity>
                    </Animated.View>

                </View>
            </ScrollView>
        </View>
    );
}