import { FillStyles } from "@/constants/themeStyles";
import { Clock, Star } from "lucide-react-native";
import { MotiView } from "moti";
import { Image, Text, View } from "react-native";
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
        <Animated.View layout={LinearTransition} className="bg-black/60 rounded-[36px] p-6 gap-y-8">
            <View className="flex-row gap-6">
                <MotiView
                    from={{ opacity: 0, translateX: 50 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                    className="w-2/5 gap-y-2"
                >
                    <Image source={{ uri: url }} className="w-full aspect-[2/3] rounded-3xl bg-[#222]" />
                </MotiView>
                <View className="flex-col w-3/5 gap-2">
                    <Text className="text-white text-2xl font-outfit-bold">{movieData.title} <Text className="text-lg font-outfit">({movieData.year})</Text></Text>
                    <View className="flex-row items-center gap-1"><Star size={16} fill="white" color="white" /> <Text className="text-white text-lg font-outfit">{movieData.rating}/10</Text></View>
                    <View className="flex-row items-center gap-1"><Clock size={16} color="white" /> <Text className="text-white text-lg font-outfit">{movieData.duration}</Text></View>
                    <View className="flex-col">
                        <Text className="text-white text-lg font-outfit">Reżyser: </Text>
                        <Text className="text-white text-lg font-outfit-bold">{movieData.director}</Text>
                    </View>
                    <View className="flex-col">
                        <Text className="text-white text-lg font-outfit">Główne role: </Text>
                        <Text className="text-white text-lg font-outfit-bold">{movieData.actors.join(", ")}</Text>
                    </View>
                </View>
            </View>
            <View className="flex-col gap-2">
                <View className="flex-row flex-wrap gap-2">
                    {movieData.genres.map((genre, i) => (
                        <Text key={i} className={`text-white text-md font-outfit ${FillStyles.pillBase} ${FillStyles.pillInactive} px-2 py-1 rounded-full`}>{genre}</Text>
                    ))}
                </View>
                <MiniCollapsibleSection
                    title="Opis"
                    defaultOpen={false}
                >
                    <Text className="text-white text-lg font-outfit">{movieData.description}</Text>
                </MiniCollapsibleSection>
            </View>
        </Animated.View>
    );
};