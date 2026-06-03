import { ActivityIndicator, View } from "react-native";
import { AppText as Text } from "./AppText";

export default function StatusBadge({ status, accent }: { status: string, accent: string }) {
    const configs: Record<string, { label: string; color: string; bgClass: string }> = {
        LOBBY: { label: 'Lobby', color: accent, bgClass: `bg-[${accent}]/10` },
        ALL_READY: { label: 'Everyone ready', color: '#4ADE80', bgClass: 'bg-[#4ADE80]/10' },
        RECOMMENDING: { label: 'Generating...', color: '#F59E0B', bgClass: 'bg-[#F59E0B]/10' },
        COMPLETED: { label: 'Finished', color: '#8B5CF6', bgClass: 'bg-[#8B5CF6]/10' },
    };
    const config = configs[status] || configs.LOBBY;

    return (
        <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgClass}`}>
            {status === 'RECOMMENDING' && (
                <ActivityIndicator size={10} color={config.color} />
            )}
            <Text style={{ color: config.color }} className="font-outfit-semi text-[11px] uppercase tracking-[2px]">
                {config.label}
            </Text>
        </View>
    );
}