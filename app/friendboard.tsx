import MiniCollapsibleSection from "@/components/MiniCollapsibleSection";
import { FillStyles } from "@/constants/themeStyles";
import { Colors } from "@/constants/theme";

const ACCENT = Colors.dark.accent;
import { useRouter } from "expo-router";
import { Heart, HeartOff, Plus } from "lucide-react-native";
import { MotiView } from "moti";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';

interface FriendProps {
    id: number;
    img: string;
    name: string;
    genre_likes: string[];
    genre_dislikes: string[];
}

export default function FriendBoard() {
    const router = useRouter();
    const [friends, setFriends] = useState<FriendProps[]>([
        { id: 1, img: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", name: "Podyma", genre_likes: ["Sci-fi", "Akcja", "Dramat"], genre_dislikes: ["Horror", "Thriller", "Kryminał"] },
        { id: 2, img: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", name: "Kuba", genre_likes: ["Sci-fi", "Akcja", "Dramat"], genre_dislikes: ["Horror", "Thriller", "Kryminał"] },
        { id: 3, img: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", name: "Tomek", genre_likes: ["Sci-fi", "Akcja", "Dramat"], genre_dislikes: ["Horror", "Thriller", "Kryminał"] },
        { id: 4, img: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", name: "Bartek", genre_likes: ["Sci-fi", "Akcja", "Dramat"], genre_dislikes: ["Horror", "Thriller", "Kryminał"] },
        { id: 5, img: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", name: "Michał", genre_likes: ["Sci-fi", "Akcja", "Dramat"], genre_dislikes: ["Horror", "Thriller", "Kryminał"] },
        { id: 6, img: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", name: "Piotr", genre_likes: ["Sci-fi", "Akcja", "Dramat"], genre_dislikes: ["Horror", "Thriller", "Kryminał"] },
        { id: 7, img: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", name: "Jan", genre_likes: ["Sci-fi", "Akcja", "Dramat"], genre_dislikes: ["Horror", "Thriller", "Kryminał"] },
        { id: 8, img: "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", name: "Krzysztof", genre_likes: ["Sci-fi", "Akcja", "Dramat"], genre_dislikes: ["Horror", "Thriller", "Kryminał"] },
    ]);
    return (
        <View className="flex-1 bg-transparent pt-10">
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 600 }}
                className="px-6 pt-5 pb-3 flex-row justify-between items-center"
            >
                <Text className="font-outfit-bold text-[24px]">Friendboard</Text>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-accent items-center justify-center">
                    <Plus color="#000" size={18} strokeWidth={2.5} />
                </TouchableOpacity>
            </MotiView>
            <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="flex flex-col gap-2">
                    {friends.map((friend) => (
                        <MiniCollapsibleSection
                            key={friend.id}
                            title={friend.name}
                            defaultOpen={false}
                            img={friend.img}
                        >
                            <View className="flex-col gap-2">
                                <ScrollView horizontal className={`flex-row gap-2 ${FillStyles.pillBase} ${FillStyles.pillInactive} px-2 py-1.5 !rounded-t-[16px]`}>
                                    <View className={`flex flex-row gap-2 items-center py-1 mr-3`}>
                                        <Heart strokeWidth={1.5} size={14} color={ACCENT} />
                                        <Text className="font-outfit text-[11px] uppercase tracking-[2px] opacity-60">Lubi</Text>
                                    </View>
                                    <View className="flex-row gap-2 pr-5">
                                        {friend.genre_likes.map(genre => (
                                            <View className={`flex flex-row justify-between items-center ${FillStyles.pillBase} ${FillStyles.pillActive} px-2 rounded-lg`} key={genre}>
                                                <Text className="font-outfit text-[12px]">{genre}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                                <ScrollView horizontal className={`flex-row gap-2 ${FillStyles.pillBase} ${FillStyles.pillInactive} px-2 py-1.5 !rounded-b-[16px]`}>
                                    <View className={`flex flex-row gap-2 items-center py-1 mr-3`}>
                                        <HeartOff strokeWidth={1.5} size={14} color="#707080" />
                                        <Text className="font-outfit text-[11px] uppercase tracking-[2px] opacity-40">Nie lubi</Text>
                                    </View>
                                    <View className="flex-row gap-2 pr-5">
                                        {friend.genre_dislikes.map(genre => (
                                            <View className={`flex flex-row justify-between items-center ${FillStyles.pillBase} ${FillStyles.pillInactive} px-2 rounded-lg`} key={genre}>
                                                <Text className="font-outfit text-[12px] opacity-60">{genre}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        </MiniCollapsibleSection>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}