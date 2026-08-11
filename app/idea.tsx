import FilmView, { MovieViewProps } from "@/components/FilmView";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Clock, Film, RotateCcw, UserPlus, Users } from "lucide-react-native";
import { MotiView } from "moti";
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { LinearTransition } from "react-native-reanimated";
import CollapsibleSection from "../components/CollapsibleSection";
import { FillStyles } from "../constants/themeStyles";
import { Colors } from "@/constants/theme";

const ACCENT = Colors.dark.accent;

export default function IdeaScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const parsedCriteria = params.criteriaData ? JSON.parse(params.criteriaData as string) : {
        preset: "Tłum",
        genres: ["Przygodowy", "Akcji"],
        duration: 240,
        friendsAdded: 0
    };

    const parsedMovies = params.recommendationData ? JSON.parse(params.recommendationData as string) : null;

    console.log("[IDEA SCREEN] Parsed Criteria:", parsedCriteria);
    console.log("[IDEA SCREEN] Parsed Movies:", parsedMovies);

    // Build array of movies
    let moviesData: MovieViewProps[] = [];

    if (parsedMovies) {
        moviesData.push({
            movie_id: parsedMovies.movie_id,
            tmdb_id: parsedMovies.tmdb_id,
            title: parsedMovies.movie_title,
            description: parsedMovies.thought || parsedMovies.reasoning_pl || parsedMovies.reasoning,
            thought: parsedMovies.thought || parsedMovies.reasoning_pl || parsedMovies.reasoning,
            genres: parsedMovies.genres,
            poster_path: parsedMovies.poster_path,
            release_date: parsedMovies.release_date,
            rating: parsedMovies.rating,
            duration: parsedMovies.runtime ? `${parsedMovies.runtime} min` : undefined,
        });

        if (parsedMovies.extra_movies && Array.isArray(parsedMovies.extra_movies)) {
            parsedMovies.extra_movies.forEach((extra: any) => {
                const extraDescription = extra.thought || extra.reasoning_pl || extra.reasoning || extra.description || "An alternative suggestion from our system, tailored to your taste.";
                moviesData.push({
                    movie_id: extra.movie_id,
                    tmdb_id: extra.tmdb_id,
                    title: extra.movie_title,
                    description: extraDescription,
                    thought: extra.thought || extra.reasoning_pl || extra.reasoning,
                    genres: extra.genres,
                    poster_path: extra.poster_path,
                    release_date: extra.release_date,
                    rating: extra.rating,
                    duration: extra.runtime ? `${extra.runtime} min` : undefined,
                });
            });
        }
    }
    console.log("[IDEA SCREEN] Constructed moviesData for FilmView:", moviesData);

    return (
        <View className="flex-1 bg-transparent pt-10">
            <ScrollView contentContainerClassName="px-2 pb-[120px]" showsVerticalScrollIndicator={false}>
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ duration: 600 }}
                    className="px-4 pt-5 pb-3 flex-row justify-between items-center"
                >
                    <Text className="font-outfit-bold text-[24px]">Ideas</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center gap-2"
                    >
                        <Text className="font-outfit text-[13px] opacity-35 uppercase tracking-[2px]">Back</Text>
                    </TouchableOpacity>
                </MotiView>
                <View className="flex-1 px-2 flex-col gap-y-3">
                    <View className="flex-col gap-4">
                        {moviesData.length > 0 ? (
                            moviesData.map((movie, index) => (
                                <FilmView key={index} movieData={movie} groupName={parsedCriteria.preset} />
                            ))
                        ) : (
                            <FilmView /> // Default fallback
                        )}
                    </View>
                    <CollapsibleSection
                        title="Your criteria"
                        icon={Users}
                        defaultOpen={false}
                    >
                        <Animated.View layout={LinearTransition} className="flex-col gap-3 px-4 pb-4">
                            <View className="flex-row items-center gap-3"><Users size={16} strokeWidth={2} color={ACCENT} /><Text className="font-outfit text-[14px]">{parsedCriteria.preset}</Text></View>
                            <View className="flex-row items-center gap-3"><Film size={16} strokeWidth={2} color={ACCENT} /><Text className="font-outfit text-[14px]">{parsedCriteria.genres.length > 0 ? parsedCriteria.genres.join(", ") : "Any"}</Text></View>
                            <View className="flex-row items-center gap-3"><Clock size={16} strokeWidth={2} color={ACCENT} /><Text className="font-outfit text-[14px]">{parsedCriteria.duration}</Text></View>
                            <View className="flex-row items-center gap-3"><UserPlus size={16} strokeWidth={2} color={ACCENT} /><Text className="font-outfit text-[14px]">{parsedCriteria.friendsAdded}</Text></View>
                        </Animated.View>
                    </CollapsibleSection>

                    <Animated.View
                        layout={LinearTransition}
                        className="self-end"
                    >
                        <TouchableOpacity
                            className={`${FillStyles.actionBtnBase} ${FillStyles.actionBtnPrimary} bg-accent`}
                            onPress={() => router.back()}
                        >
                            <RotateCcw color="#000" size={18} strokeWidth={2.5} />
                            <Text className="font-outfit-semi text-[15px] text-black">Try again</Text>
                        </TouchableOpacity>
                    </Animated.View>

                </View>
            </ScrollView>
        </View>
    );
}