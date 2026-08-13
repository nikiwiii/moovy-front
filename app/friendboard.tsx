import MiniCollapsibleSection from "@/components/MiniCollapsibleSection";
import { FillStyles } from "@/constants/themeStyles";
import { Colors } from "@/constants/theme";
import StatusBadge from "@/components/StatusBadge";

const ACCENT = Colors.dark.accent;
import { useRouter } from "expo-router";
import { Heart, HeartOff, Plus, RotateCw } from "lucide-react-native";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { sessionService, SessionResponse } from "@/services/sessionService";

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

    const [mySessions, setMySessions] = useState<SessionResponse[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const sessions = await sessionService.getMySessions();
            setMySessions(sessions);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error("Full error:", JSON.stringify(error));
        } finally {
            setIsLoadingSessions(false);
        }
    };
    return (
        <View className="flex-1 bg-transparent pt-10">
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 600 }}
                className="px-6 pt-5 pb-3 flex-row justify-between items-center"
            >
                <Text className="font-outfit text-[22px] uppercase tracking-wide text-white/80">Friendboard</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={loadSessions}
                        disabled={isLoadingSessions}
                        className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] items-center justify-center"
                    >
                        {isLoadingSessions ? (
                            <ActivityIndicator size="small" color={ACCENT} />
                        ) : (
                            <RotateCw color={ACCENT} size={18} strokeWidth={2} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity className="w-10 h-10 rounded-full bg-accent items-center justify-center">
                        <Plus color="#000" size={18} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
            </MotiView>
            <ScrollView
                className="px-4"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoadingSessions}
                        onRefresh={loadSessions}
                        tintColor={ACCENT}
                        colors={[ACCENT]}
                    />
                }
            >
                <View className="flex flex-col gap-6">
                    {/* Twoje Sesje */}
                    <View className="flex flex-col gap-3">
                        <Text className="font-outfit-semi text-[16px] ml-2 opacity-80">Open Sessions</Text>
                        {isLoadingSessions ? (
                            <Text className="font-outfit text-white/50 ml-2 text-[14px]">Loading...</Text>
                        ) : mySessions.length === 0 ? (
                            <Text className="font-outfit text-white/50 ml-2 text-[14px]">No open sessions</Text>
                        ) : (
                            mySessions.map(session => {
                                const hostMember = session.members?.find(m => m.user_id === session.host_id);
                                const hostName = hostMember ? hostMember.user_name : "Unknown";

                                return (
                                    <TouchableOpacity
                                        key={session.session_id}
                                        className={`${FillStyles.cardBase} bg-white/10 p-4`}
                                        onPress={() => router.push({ pathname: '/session-lobby', params: { sessionId: session.session_id } })}
                                    >
                                        <View className="flex-row justify-between items-center">
                                            <View>
                                                <Text className="font-outfit-bold text-[16px]">{session.meeting_type}</Text>
                                                <Text className="font-outfit text-[13px] opacity-60 mt-1">Host: <Text className='font-outfit-bold text-white'>{hostName}</Text></Text>
                                                <Text className="font-outfit text-[13px] opacity-60 mt-1">Code: <Text className='font-outfit-semi text-white'>{session.invite_code}</Text></Text>
                                            </View>
                                            <StatusBadge accent={ACCENT} status={session.status} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>

                    {/* Znajomi */}
                    {/* <View className="flex flex-col gap-3">
                        <Text className="font-outfit-semi text-[16px] ml-2 opacity-80">Znajomi</Text>
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
                    </View> */}
                    <Text className="font-outfit-bold text-[18px] text-white/60 text-center uppercase tracking-[3px]">Friends coming soon</Text>
                </View>
            </ScrollView>
        </View>
    )
}