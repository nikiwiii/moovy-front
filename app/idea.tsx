import FilmView from "@/components/FilmView";
import { useRouter } from "expo-router";
import { Clock, Film, RotateCcw, UserPlus, Users } from "lucide-react-native";
import { MotiView } from "moti";
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { LinearTransition } from "react-native-reanimated";
import CollapsibleSection from "../components/CollapsibleSection";
import { FillStyles } from "../constants/themeStyles";

export default function IdeaScreen() {
    const router = useRouter();
    const criteria = {
        preset: "Tłum",
        genres: ["Przygodowy", "Akcji"],
        duration: "Dłuższy",
        friendsAdded: 0
    }
    return (
        <View className="flex-1 bg-transparent pt-10">
            <ScrollView contentContainerClassName="px-2 pb-[120px]" showsVerticalScrollIndicator={false}>
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-4 pt-5 pb-3 flex-row justify-between items-center"
                >
                    <Text className="font-outfit-bold text-[24px]">Pomysł</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center gap-2"
                    >
                        <Text className="font-outfit text-[13px] opacity-35 uppercase tracking-[2px]">Wróć</Text>
                    </TouchableOpacity>
                </MotiView>
                <View className="flex-1 px-2 flex-col gap-y-3">
                    <FilmView />
                    <CollapsibleSection
                        title="Twoje kryteria"
                        subtitle="Skąd ten pomysł?"
                        icon={Users}
                        defaultOpen={false}
                    >
                        <Animated.View layout={LinearTransition} className="flex-col gap-3">
                            <View className="flex-row items-center gap-3"><Users size={16} strokeWidth={2} color="#CDFF64" /><Text className="font-outfit text-[14px]">{criteria.preset}</Text></View>
                            <View className="flex-row items-center gap-3"><Film size={16} strokeWidth={2} color="#CDFF64" /><Text className="font-outfit text-[14px]">{criteria.genres.join(", ")}</Text></View>
                            <View className="flex-row items-center gap-3"><Clock size={16} strokeWidth={2} color="#CDFF64" /><Text className="font-outfit text-[14px]">{criteria.duration}</Text></View>
                            <View className="flex-row items-center gap-3"><UserPlus size={16} strokeWidth={2} color="#CDFF64" /><Text className="font-outfit text-[14px]">{criteria.friendsAdded}</Text></View>
                        </Animated.View>
                    </CollapsibleSection>

                    <Animated.View
                        layout={LinearTransition}
                        className="self-end"
                    >
                        <TouchableOpacity
                            className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} w-[200px]`}
                            onPress={() => { }}
                        >
                            <RotateCcw color="#000" size={18} strokeWidth={2.5} />
                            <Text className="font-outfit-semi text-[15px] text-black">Spróbuj ponownie</Text>
                        </TouchableOpacity>
                    </Animated.View>

                </View>
            </ScrollView>
        </View>
    );
}