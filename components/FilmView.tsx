import { FillStyles } from "@/constants/themeStyles";
import { Clock, Star, Heart, ThumbsUp, ThumbsDown, Skull, Bookmark, Ticket } from "lucide-react-native";
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
import { getGenreColor } from "../constants/genres";

const ACCENT = Colors.dark.accent;

const getVibeBarSegments = (genres: string[]): { color: string; opacity: number }[] => {
    const segments: { color: string; opacity: number }[] = [];
    const L = genres.length;

    if (L === 0) {
        for (let i = 0; i < 6; i++) {
            segments.push({ color: 'rgba(255, 255, 255, 0.05)', opacity: 1 });
        }
        return segments;
    }

    const opacityFactors = [1.0, 0.8, 0.6, 0.45, 0.3, 0.15];

    for (let i = 0; i < 6; i++) {
        const index = i % L;
        const cycle = Math.floor(i / L);
        const color = getGenreColor(genres[index]);
        const opacity = opacityFactors[cycle] !== undefined ? opacityFactors[cycle] : 0.05;
        segments.push({ color, opacity });
    }
    return segments;
};
const size = 50;
const strokeWidth = 2.5;
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
                <Text className="font-outfit-bold text-white text-[13px]">{rating.toFixed(1)}</Text>
                <Text className="text-[6.5px] font-outfit-bold text-white/35 uppercase tracking-[0.5px]">SCORE</Text>
            </View>
        </View>
    );
};

const DurationRing = ({ duration }: { duration: string }) => {
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
                <Text className="font-outfit-bold text-white text-[12px]">{timeValue}</Text>
                <Text className="text-[6.5px] font-outfit-bold text-white/35 uppercase tracking-[0.5px]">MINS</Text>
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
    thought?: string;
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
    "Documentary": "Doc",
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

export default function FilmView({ movieData, groupName }: { movieData?: MovieViewProps; groupName?: string }) {
    const defaultUrl = "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg";
    const defaultData: MovieViewProps = {
        movie_id: "1",
        tmdb_id: 1,
        title: "",
        year: 0,
        rating: 0.0,
        description: "",
        genres: [],
        duration: "0 minutes"
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
    const displayDescription = data.thought || data.description || defaultData.description;
    const displayGenres = data.genres && data.genres.length > 0 ? data.genres : (defaultData.genres || []);
    const displayDuration = data.duration;

    const [reaction, setReaction] = useState<'LIKE' | 'LOVE' | 'DISLIKE' | 'HATE' | 'WATCHLIST' | null>(
        data.initialReaction || null
    );

    const handleReaction = async (status: 'LIKE' | 'LOVE' | 'DISLIKE' | 'HATE' | 'WATCHLIST') => {
        if (!data.movie_id) return;

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
            setReaction(reaction);
        }
    };

    const ticketNumber = Math.floor(100000 + Math.random() * 900000);

    return (
        <Animated.View
            layout={LinearTransition}
            className="bg-white/[0.04] border border-white/[0.12] rounded-[24px] p-3 gap-y-2.5 overflow-hidden relative"
        >
            {/* Top Ticket Header Stub */}
            {/* <View className="flex-row justify-between items-center pb-3 border-b border-white/[0.08]">
                <View className="flex-row items-center gap-1.5">
                    <Ticket size={12} color={ACCENT} />
                    <Text className="font-outfit-bold text-[9px] uppercase tracking-[2px]" style={{ color: ACCENT }}>
                        {(groupName || "SOLO")} · MOOVY
                    </Text>
                </View>
                <Text className="font-mono text-[9px] text-white/30 tracking-[1.5px]">
                    TICKET{ticketNumber}
                </Text>
            </View> */}

            {/* Poster & Main Information */}
            <Animated.View layout={LinearTransition} className="flex-row gap-3.5">
                <MotiView
                    from={{ opacity: 0, translateX: 30 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 500 }}
                    className="w-[45%] gap-y-2"
                >
                    <Image source={{ uri: url }} className="w-full aspect-[2/3] rounded-xl bg-white/[0.03] border border-white/[0.06]" />
                </MotiView>
                <View className="flex-col w-[55%] gap-2.5">
                    <View className="flex-col gap-0.5">
                        <Text className="text-[22px] font-outfit-bold leading-snug">
                            {displayTitle} {displayYear !== 0 && <Text className="text-[13px] font-outfit opacity-40">({displayYear})</Text>}
                        </Text>

                        {/* Genres Badges */}
                        <View className="flex-row flex-wrap gap-1 mt-1">
                            {displayGenres.map((genre, i) => (
                                <View
                                    key={i}
                                    style={{ backgroundColor: `${ACCENT}15`, borderColor: `${ACCENT}30` }}
                                    className="border px-1.5 py-0.5 rounded-[5px] items-center justify-center"
                                >
                                    <Text
                                        style={{ color: ACCENT }}
                                        className="text-[8px] font-outfit-bold uppercase tracking-wider"
                                    >
                                        {translateGenre(genre)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Score and Runtime Rings */}
                    <View className="flex-row items-center gap-3 my-1 w-full">
                        {displayRating ? <RatingRing rating={displayRating} /> : null}
                        {displayDuration ? <DurationRing duration={displayDuration} /> : null}
                    </View>

                    {displayDirector ? (
                        <View className="flex-col">
                            <Text className="text-[10px] font-outfit opacity-35 uppercase tracking-[1.5px]">Director</Text>
                            <Text className="text-[12px] font-outfit-semi" numberOfLines={1}>{displayDirector}</Text>
                        </View>
                    ) : null}
                    {displayActors && displayActors.length > 0 ? (
                        <View className="flex-col">
                            <Text className="text-[10px] font-outfit opacity-35 uppercase tracking-[1.5px]">Starring</Text>
                            <Text className="text-[12px] font-outfit-semi" numberOfLines={1}>{displayActors.join(", ")}</Text>
                        </View>
                    ) : null}
                </View>
            </Animated.View>

            {/* Ticket Perforation / Cutout Tear Line */}
            <View className="relative my-1">


                {/* Colored vibe indicators bar at the bottom */}
                {data.genres && data.genres.length > 0 && (
                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, flexDirection: 'row', opacity: 0.6 }}>
                        {getVibeBarSegments(data.genres).map((seg, idx) => (
                            <View
                                key={idx}
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    backgroundColor: seg.color,
                                    opacity: seg.opacity,
                                }}
                            />
                        ))}
                    </View>
                )}
                {/* Left Cutout Notch */}
                <View
                    style={{
                        position: 'absolute',
                        left: -16,
                        top: -8,
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: '#040210',
                        borderColor: 'rgba(255,255,255,0.12)',
                        borderRightWidth: 1,
                    }}
                />
                {/* Right Cutout Notch */}
                <View
                    style={{
                        position: 'absolute',
                        right: -16,
                        top: -8,
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: '#040210',
                        borderColor: 'rgba(255,255,255,0.12)',
                        borderLeftWidth: 1,
                    }}
                />
            </View>

            {/* Description & Collapsible section */}
            {displayDescription && (
                <Animated.View layout={LinearTransition} className="flex-col gap-2">
                    <MiniCollapsibleSection
                        title="Description / Storyline"
                        defaultOpen={false}
                    >
                        <Text className="text-[13px] font-outfit opacity-70 leading-[20px]">{displayDescription}</Text>
                    </MiniCollapsibleSection>
                </Animated.View>)
            }

            {/* Ticket Stub Action Buttons */}
            {data.movie_id && (
                <Animated.View layout={LinearTransition} className="flex-row justify-between pt-1">
                    <TouchableOpacity
                        onPress={() => handleReaction('LOVE')}
                        className={`flex-row items-center justify-center gap-1 px-1 py-1.5 rounded-full flex-1 mx-0.5 ${reaction === 'LOVE' ? 'bg-[#FF6B6B]/80' : 'bg-[#FF6B6B]/10 border border-[#FF6B6B]/40 opacity-60'}`}
                    >
                        <Heart size={12} color={reaction === 'LOVE' ? '#0d0b1a' : '#FF6B6B'} fill={reaction === 'LOVE' ? '#0d0b1a' : 'transparent'} />
                        <Text className={`font-outfit-bold text-[9px] uppercase tracking-[0.5px] ${reaction === 'LOVE' ? 'text-[#0d0b1a]' : 'text-[#FF6B6B]'}`}>
                            Love
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleReaction('LIKE')}
                        className={`flex-row items-center justify-center gap-1 px-1 py-1.5 rounded-full flex-1 mx-0.5 ${reaction === 'LIKE' ? 'bg-[#4ECA64]/80' : 'bg-[#4ECA64]/10 border border-[#4ECA64]/40 opacity-60'}`}
                    >
                        <ThumbsUp size={12} color={reaction === 'LIKE' ? '#0d0b1a' : '#4ECA64'} fill={reaction === 'LIKE' ? '#0d0b1a' : 'transparent'} />
                        <Text className={`font-outfit-bold text-[9px] uppercase tracking-[0.5px] ${reaction === 'LIKE' ? 'text-[#0d0b1a]' : 'text-[#4ECA64]'}`}>
                            Like
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleReaction('DISLIKE')}
                        className={`flex-row items-center justify-center gap-1 px-1 py-1.5 rounded-full flex-1 mx-0.5 ${reaction === 'DISLIKE' ? 'bg-[#FFA500]/80' : 'bg-[#FFA500]/10 border border-[#FFA500]/40 opacity-60'}`}
                    >
                        <ThumbsDown size={12} color={reaction === 'DISLIKE' ? '#0d0b1a' : '#FFA500'} fill={reaction === 'DISLIKE' ? '#0d0b1a' : 'transparent'} />
                        <Text className={`font-outfit-bold text-[9px] uppercase tracking-[0.5px] ${reaction === 'DISLIKE' ? 'text-[#0d0b1a]' : 'text-[#FFA500]'}`}>
                            Dislike
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleReaction('HATE')}
                        className={`flex-row items-center justify-center gap-1 px-1 py-1.5 rounded-full flex-1 mx-0.5 ${reaction === 'HATE' ? 'bg-[#BD72FF]/80' : 'bg-[#BD72FF]/10 border border-[#BD72FF]/40 opacity-60'}`}
                    >
                        <Skull size={12} color={reaction === 'HATE' ? '#0d0b1a' : '#BD72FF'} fill={reaction === 'HATE' ? '#0d0b1a' : 'transparent'} />
                        <Text className={`font-outfit-bold text-[9px] uppercase tracking-[0.5px] ${reaction === 'HATE' ? 'text-[#0d0b1a]' : 'text-[#BD72FF]'}`}>
                            Hate
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleReaction('WATCHLIST')}
                        className={`flex-row items-center justify-center gap-1 px-1.5 py-1 rounded-full mx-0.5 ${reaction === 'WATCHLIST' ? 'bg-[#3b82f6]/80' : 'bg-[#3b82f6]/10 border border-[#3b82f6]/40 opacity-60'}`}
                    >
                        <Bookmark size={12} color={reaction === 'WATCHLIST' ? '#0d0b1a' : '#3b82f6'} fill={reaction === 'WATCHLIST' ? '#0d0b1a' : 'transparent'} />
                    </TouchableOpacity>
                </Animated.View>
            )}
        </Animated.View>
    );
};