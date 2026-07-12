import { FillStyles } from "@/constants/themeStyles";
import { Clock, Star, Heart, ThumbsUp, ThumbsDown, Skull, Bookmark } from "lucide-react-native";
import { MotiView } from "moti";
import { Image, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import Animated, { LinearTransition } from "react-native-reanimated";
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import MiniCollapsibleSection from "./MiniCollapsibleSection";
import React, { useState } from 'react';
import TouchableOpacity from "./TouchableOpacity";
import { storageService } from "../services/storageService";
import { ratingService } from "../services/ratingService";

const ACCENT = Colors.dark.accent;
const size = 56;
const strokeWidth = 3;
const center = size / 2;
const radius = center - strokeWidth;

const RatingRing = ({ rating }: { rating: number }) => {
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(rating / 10, 0), 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size} style={{ position: 'absolute' }}>
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth={strokeWidth}
                    fill="rgba(255, 255, 255, 0.02)"
                />
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
            <View className="items-center">
                <Text className="font-outfit-bold text-white text-[14px]">{rating.toFixed(1)}</Text>
                <Text className="text-[7px] font-outfit-bold text-white/30 uppercase tracking-[1px]">Rating</Text>
            </View>
        </View>
    );
};

const DurationRing = ({ duration }: { duration: string }) => {

    // Extract only the number from duration (e.g. "201 minut" -> "201")
    const match = duration.match(/\d+/);
    const timeValue = match ? match[0] : duration;

    return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size} style={{ position: 'absolute' }}>
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth={strokeWidth}
                    fill="rgba(255, 255, 255, 0.02)"
                />
            </Svg>
            <View className="items-center">
                <Text className="font-outfit-bold text-white text-[13px]">{timeValue}</Text>
                <Text className="text-[7px] font-outfit-bold text-white/30 uppercase tracking-[1px]">Minutes</Text>
            </View>
        </View>
    );
};

export interface MovieViewProps {
    movie_id?: string;
    tmdb_id?: number;
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
    initialReaction?: 'LIKE' | 'LOVE' | 'DISLIKE' | 'HATE' | 'WATCHLIST' | null;
}

const GENRE_TRANSLATIONS: Record<string, string> = {
    "Action": "Action",
    "Adventure": "Adventure",
    "Animation": "Animation",
    "Comedy": "Comedy",
    "Crime": "Crime",
    "Documentary": "Documentary",
    "Drama": "Drama",
    "Family": "Family",
    "Fantasy": "Fantasy",
    "History": "History",
    "Horror": "Horror",
    "Music": "Music",
    "Mystery": "Mystery",
    "Romance": "Romance",
    "Science Fiction": "Sci-Fi",
    "TV Movie": "TV Movie",
    "Thriller": "Thriller",
    "War": "War",
    "Western": "Western"
};

const translateGenre = (genre: string) => GENRE_TRANSLATIONS[genre] || genre;

export default function FilmView({ movieData }: { movieData?: MovieViewProps }) {
    const defaultUrl = "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg";
    const defaultData: MovieViewProps = {
        movie_id: "1",
        tmdb_id: 1,
        title: "The Lord of the Rings: The Return of the King",
        year: 2003,
        rating: 8.9,
        // director: "Peter Jackson",
        // actors: ["Elijah Wood", "Ian McKellen", "Viggo Mortensen"],
        description: "The Lord of the Rings: The Return of the King is a 2003 epic fantasy adventure film directed by Peter Jackson. The film is the third installment in the Lord of the Rings trilogy and follows Frodo Baggins as he and Samwise Gamgee begin the final stage of their quest to destroy the One Ring.",
        genres: ["Fantasy", "Adventure", "Action"],
        duration: "201 minutes"
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
    const displayGenres = data.genres && data.genres.length > 0 ? data.genres : (defaultData.genres || []);
    const displayDuration = data.duration;

    const [reaction, setReaction] = useState<'LIKE' | 'LOVE' | 'DISLIKE' | 'HATE' | 'WATCHLIST' | null>(
        data.initialReaction || null
    );

    const handleReaction = async (status: 'LIKE' | 'LOVE' | 'DISLIKE' | 'HATE' | 'WATCHLIST') => {
        if (!data.movie_id) return;

        // Toggle behaviour
        const isToggledOff = reaction === status;
        const nextStatus = isToggledOff ? null : status;
        setReaction(nextStatus);

        try {
            if (isToggledOff) {
                await ratingService.unrateMovie(data.movie_id, status);
            } else {
                await ratingService.rateMovie(data.movie_id, status);
            }
        } catch (error) {
            console.error('Failed to save movie interaction:', error);
            // Revert state on error
            setReaction(reaction);
        }
    };

    return (
        <Animated.View layout={LinearTransition} className="bg-white/[0.04] border border-white/[0.08] rounded-[32px] p-4 gap-y-3">
            <Animated.View layout={LinearTransition} className="flex-row gap-4">
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
                    <View className="flex-row items-center gap-4 my-1">
                        {displayRating ? <RatingRing rating={displayRating} /> : null}
                        {displayDuration ? <DurationRing duration={displayDuration} /> : null}
                    </View>
                    <View className="flex-row flex-wrap gap-2 pr-4">
                        {displayGenres.map((genre, i) => (
                            <View key={i} style={{ backgroundColor: `${ACCENT}1A`, borderColor: `${ACCENT}33` }} className="border px-3 py-1.5 rounded-full items-center justify-center">
                                <Text style={{ color: ACCENT }} className="text-[10px] font-outfit-semi uppercase tracking-tight">{translateGenre(genre)}</Text>
                            </View>
                        ))}
                    </View>
                    {displayDirector ? (
                        <View className="flex-col mt-1">
                            <Text className="text-[12px] font-outfit opacity-35 uppercase tracking-[2px]">Director</Text>
                            <Text className="text-[14px] font-outfit-semi">{displayDirector}</Text>
                        </View>
                    ) : null}
                    {displayActors && displayActors.length > 0 ? (
                        <View className="flex-col">
                            <Text className="text-[12px] font-outfit opacity-35 uppercase tracking-[2px]">Starring</Text>
                            <Text className="text-[14px] font-outfit-semi">{displayActors.join(", ")}</Text>
                        </View>
                    ) : null}
                </View>
            </Animated.View>
            <Animated.View layout={LinearTransition} className="flex-col gap-3">
                <MiniCollapsibleSection
                    title="Description / Why?"
                    defaultOpen={false}
                >
                    <Text className="text-[14px] font-outfit opacity-70 leading-[22px]">{displayDescription}</Text>
                </MiniCollapsibleSection>
            </Animated.View>

            {data.movie_id && (
                <Animated.View layout={LinearTransition} className="flex-row justify-between">
                    <TouchableOpacity
                        onPress={() => handleReaction('LOVE')}
                        className={`flex-row items-center justify-center gap-1 px-1 py-1.5 rounded-full flex-1 mx-0.5 ${reaction === 'LOVE' ? 'bg-[#FF6B6B]/80' : 'bg-[#FF6B6B]/10 border border-[#FF6B6B]/40  opacity-60'}`}
                    >
                        <Heart size={12} color={reaction === 'LOVE' ? '#0d0b1a' : '#FF6B6B'} fill={reaction === 'LOVE' ? '#0d0b1a' : 'transparent'} />
                        <Text className={`font-outfit-bold text-[9px] uppercase tracking-[0.5px] ${reaction === 'LOVE' ? 'text-[#0d0b1a]' : 'text-[#FF6B6B]'}`}>
                            Love
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleReaction('LIKE')}
                        className={`flex-row items-center justify-center gap-1 px-1 py-1.5 rounded-full flex-1 mx-0.5 ${reaction === 'LIKE' ? 'bg-[#4ECA64]/80' : 'bg-[#4ECA64]/10 border border-[#4ECA64]/40  opacity-60'}`}
                    >
                        <ThumbsUp size={12} color={reaction === 'LIKE' ? '#0d0b1a' : '#4ECA64'} fill={reaction === 'LIKE' ? '#0d0b1a' : 'transparent'} />
                        <Text className={`font-outfit-bold text-[9px] uppercase tracking-[0.5px] ${reaction === 'LIKE' ? 'text-[#0d0b1a]' : 'text-[#4ECA64]'}`}>
                            Like
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleReaction('DISLIKE')}
                        className={`flex-row items-center justify-center gap-1 px-1 py-1.5 rounded-full flex-1 mx-0.5 ${reaction === 'DISLIKE' ? 'bg-[#FFA500]/80' : 'bg-[#FFA500]/10 border border-[#FFA500]/40  opacity-60'}`}
                    >
                        <ThumbsDown size={12} color={reaction === 'DISLIKE' ? '#0d0b1a' : '#FFA500'} fill={reaction === 'DISLIKE' ? '#0d0b1a' : 'transparent'} />
                        <Text className={`font-outfit-bold text-[9px] uppercase tracking-[0.5px] ${reaction === 'DISLIKE' ? 'text-[#0d0b1a]' : 'text-[#FFA500]'}`}>
                            Dislike
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleReaction('HATE')}
                        className={`flex-row items-center justify-center gap-1 px-1 py-1.5 rounded-full flex-1 mx-0.5 ${reaction === 'HATE' ? 'bg-[#BD72FF]/80' : 'bg-[#BD72FF]/10 border border-[#BD72FF]/40  opacity-60'}`}
                    >
                        <Skull size={12} color={reaction === 'HATE' ? '#0d0b1a' : '#BD72FF'} fill={reaction === 'HATE' ? '#0d0b1a' : 'transparent'} />
                        <Text className={`font-outfit-bold text-[9px] uppercase tracking-[0.5px] ${reaction === 'HATE' ? 'text-[#0d0b1a]' : 'text-[#BD72FF]'}`}>
                            Hate
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleReaction('WATCHLIST')}
                        className={`flex-row items-center justify-center gap-1 px-1.5 py-1 rounded-full mx-0.5 ${reaction === 'WATCHLIST' ? 'bg-[#3b82f6]/80' : 'bg-[#3b82f6]/10 border border-[#3b82f6]/40  opacity-60'}`}
                    >
                        <Bookmark size={12} color={reaction === 'WATCHLIST' ? '#0d0b1a' : '#3b82f6'} fill={reaction === 'WATCHLIST' ? '#0d0b1a' : 'transparent'} />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </Animated.View>
    );
};