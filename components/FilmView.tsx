import { FillStyles } from "@/constants/themeStyles";
import { Clock, Star } from "lucide-react-native";
import { MotiView } from "moti";
import { Image, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { LinearTransition } from "react-native-reanimated";
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import MiniCollapsibleSection from "./MiniCollapsibleSection";

const ACCENT = Colors.dark.accent;

const RatingRing = ({ rating }: { rating: number }) => {
    const size = 48;
    const strokeWidth = 4;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(rating / 10, 0), 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size} style={{ position: 'absolute' }}>
                {/* Background Ring */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Ring */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={ACCENT}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    transform={`rotate(-90 ${center} ${center})`}
                />
            </Svg>
            <Text className="font-outfit-bold text-white text-[14px]">{rating.toFixed(1)}</Text>
        </View>
    );
};

export interface MovieViewProps {
    title?: string;
    year?: number;
    rating?: number;
    director?: string;
    actors?: string[];
    description?: string;
    genres?: string[];
    duration?: string;
    poster_path?: string;
    release_date?: string;
}

const GENRE_TRANSLATIONS: Record<string, string> = {
    "Action": "Akcja",
    "Adventure": "Przygodowy",
    "Animation": "Animacja",
    "Comedy": "Komedia",
    "Crime": "Kryminał",
    "Documentary": "Dokumentalny",
    "Drama": "Dramat",
    "Family": "Familijny",
    "Fantasy": "Fantasy",
    "History": "Historyczny",
    "Horror": "Horror",
    "Music": "Muzyczny",
    "Mystery": "Tajemnica",
    "Romance": "Romans",
    "Science Fiction": "Sci-Fi",
    "TV Movie": "Film TV",
    "Thriller": "Thriller",
    "War": "Wojenny",
    "Western": "Western"
};

const translateGenre = (genre: string) => GENRE_TRANSLATIONS[genre] || genre;

export default function FilmView({ movieData }: { movieData?: MovieViewProps }) {
    const defaultUrl = "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg";
    const defaultData = {
        title: "Władca Pierścieni: Powrót króla",
        year: 2003,
        rating: 8.9,
        director: "Peter Jackson",
        actors: ["Elijah Wood", "Ian McKellen", "Viggo Mortensen"],
        description: "Władca Pierścieni: Powrót króla to epickie fantasy z 2003 roku w reżyserii Petera Jacksona. Film jest trzecią częścią trylogii Władca Pierścieni i opowiada historię Froda Bagginsa, który musi zniszczyć Pierścień Władzy, aby uratować Śródziemie przed Sauronem.",
        genres: ["Fantasy", "Przygodowy", "Akcja"],
        duration: "201 minut"
    };

    const data = movieData || defaultData;
    let finalPosterPath = data.poster_path;
    if (finalPosterPath === "null" || finalPosterPath === "N/A" || finalPosterPath === "None") {
        finalPosterPath = "";
    }

    const url = finalPosterPath
        ? (finalPosterPath.startsWith('http')
            ? finalPosterPath
            : `https://image.tmdb.org/t/p/w500${finalPosterPath.startsWith('/') ? '' : '/'}${finalPosterPath}`)
        : defaultUrl;

    console.log("[FILM VIEW] Final constructed poster URL:", url);

    const displayTitle = data.title || defaultData.title;

    let displayYear = data.year;
    if (!displayYear && data.release_date) {
        const d = new Date(data.release_date);
        if (!isNaN(d.getFullYear())) {
            displayYear = d.getFullYear();
        }
    }
    if (!displayYear) displayYear = defaultData.year;

    const displayRating = data.rating || defaultData.rating;
    const displayDirector = data.director;
    const displayActors = data.actors;
    const displayDescription = data.description || defaultData.description;
    const displayGenres = data.genres && data.genres.length > 0 ? data.genres : defaultData.genres;
    const displayDuration = data.duration;

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
                    <Text className="text-[20px] font-outfit-bold leading-tight">{displayTitle} {displayYear && <Text className="text-[15px] font-outfit opacity-50">({displayYear})</Text>}</Text>
                    {displayRating ? (
                        <View className="flex-row items-center gap-3">
                            <RatingRing rating={displayRating} />
                        </View>
                    ) : null}
                    {displayDuration ? <View className="flex-row items-center gap-1.5"><Clock size={14} color="#707080" /><Text className="text-[14px] font-outfit opacity-60">{displayDuration}</Text></View> : null}
                    {displayDirector ? (
                        <View className="flex-col mt-1">
                            <Text className="text-[12px] font-outfit opacity-35 uppercase tracking-[2px]">Reżyser</Text>
                            <Text className="text-[14px] font-outfit-semi">{displayDirector}</Text>
                        </View>
                    ) : null}
                    {displayActors && displayActors.length > 0 ? (
                        <View className="flex-col">
                            <Text className="text-[12px] font-outfit opacity-35 uppercase tracking-[2px]">Główne role</Text>
                            <Text className="text-[14px] font-outfit-semi">{displayActors.join(", ")}</Text>
                        </View>
                    ) : null}
                </View>
            </View>
            <View className="flex-col gap-3">
                <View className="flex-row flex-wrap gap-2">
                    {displayGenres.map((genre, i) => (
                        <View key={i} style={{ backgroundColor: `${ACCENT}1A`, borderColor: `${ACCENT}33` }} className="border px-4 py-1.5 rounded-full items-center justify-center">
                            <Text style={{ color: ACCENT }} className="text-[11px] font-outfit-bold uppercase tracking-[1px]">{translateGenre(genre)}</Text>
                        </View>
                    ))}
                </View>
                <MiniCollapsibleSection
                    title="Opis / Dlaczego?"
                    defaultOpen={false}
                >
                    <Text className="text-[14px] font-outfit opacity-70 leading-[22px]">{displayDescription}</Text>
                </MiniCollapsibleSection>
            </View>
        </Animated.View>
    );
};