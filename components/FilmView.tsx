import { FillStyles } from "@/constants/themeStyles";
import { Clock, Star } from "lucide-react-native";
import { MotiView } from "moti";
import { Image, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { LinearTransition } from "react-native-reanimated";
import MiniCollapsibleSection from "./MiniCollapsibleSection";

export default function FilmView() {
    const url = "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg";
    const movieData = {
        title: "Władca Pierścieni: Powrót króla",
        year: 2003,
        rating: 8.9,
        director: "Peter Jackson",
        actors: ["Elijah Wood", "Ian McKellen", "Viggo Mortensen"],
        description: "Władca Pierścieni: Powrót króla to epickie fantasy z 2003 roku w reżyserii Petera Jacksona. Film jest trzecią częścią trylogii Władca Pierścieni i opowiada historię Froda Bagginsa, który musi zniszczyć Pierścień Władzy, aby uratować Śródziemie przed Sauronem.",
        genres: ["Fantasy", "Przygodowy", "Akcja"],
        duration: "201 minut"
    }
    return (
        <Animated.View layout={LinearTransition} className="bg-white/[0.04] border border-white/[0.08] rounded-[32px] p-6 gap-y-6">
            <View className="flex-row gap-5">
                <MotiView
                    from={{ opacity: 0, translateX: 50 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                    className="w-2/5 gap-y-2"
                >
                    <Image source={{ uri: url }} className="w-full aspect-[2/3] rounded-2xl bg-white/[0.03]" />
                </MotiView>
                <View className="flex-col w-3/5 gap-2.5">
                    <Text className="text-[20px] font-outfit-bold leading-tight">{movieData.title} <Text className="text-[15px] font-outfit opacity-50">({movieData.year})</Text></Text>
                    <View className="flex-row items-center gap-1.5"><Star size={14} fill="#CDFF64" color="#CDFF64" /> <Text className="text-[15px] font-outfit text-[#CDFF64]">{movieData.rating}/10</Text></View>
                    <View className="flex-row items-center gap-1.5"><Clock size={14} color="#707080" /> <Text className="text-[14px] font-outfit opacity-60">{movieData.duration}</Text></View>
                    <View className="flex-col mt-1">
                        <Text className="text-[12px] font-outfit opacity-35 uppercase tracking-[2px]">Reżyser</Text>
                        <Text className="text-[14px] font-outfit-semi">{movieData.director}</Text>
                    </View>
                    <View className="flex-col">
                        <Text className="text-[12px] font-outfit opacity-35 uppercase tracking-[2px]">Główne role</Text>
                        <Text className="text-[14px] font-outfit-semi">{movieData.actors.join(", ")}</Text>
                    </View>
                </View>
            </View>
            <View className="flex-col gap-3">
                <View className="flex-row flex-wrap gap-2">
                    {movieData.genres.map((genre, i) => (
                        <Text key={i} className={`text-[12px] font-outfit ${FillStyles.pillBase} ${FillStyles.pillActive} px-3 py-1.5 rounded-full`}>{genre}</Text>
                    ))}
                </View>
                <MiniCollapsibleSection
                    title="Opis"
                    defaultOpen={false}
                >
                    <Text className="text-[14px] font-outfit opacity-70 leading-[22px]">{movieData.description}</Text>
                </MiniCollapsibleSection>
            </View>
        </Animated.View>
    );
};