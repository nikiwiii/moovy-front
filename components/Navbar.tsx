import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import { Clapperboard, Cog, UsersRound } from "lucide-react-native";
import { MotiView } from "moti";
import { StyleSheet, View } from "react-native";
import TouchableOpacity from "./TouchableOpacity";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const tabs = [
        { path: "/parameters", icon: Clapperboard },
        { path: "/friendboard", icon: UsersRound },
        { path: "/settings", icon: Cog },
    ];

    return (
        <View style={styles.absoluteBottom} className="items-center z-50">
            <MotiView
                from={{ opacity: 0, translateY: 40 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 600, type: 'spring' }}
                style={styles.navContainer}
            >
                <BlurView
                    intensity={50}
                    tint="dark"
                    style={styles.blurBackground}
                    className="flex-row items-center justify-between px-1.5 py-2 rounded-full border border-white/[0.08] bg-black/60"
                >
                    {tabs.map((tab, index) => {
                        const isActive = pathname === tab.path || (pathname === '/' && index === 0);
                        const Icon = tab.icon;

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    router.push(tab.path as any);
                                }}
                                className={`items-center justify-center rounded-full h-[52px] mx-1 ${isActive ? 'w-[68px] bg-[#CDFF64]' : 'w-[52px]'}`}
                            >
                                <Icon
                                    color={isActive ? "#000" : "#707080"}
                                    size={isActive ? 26 : 22}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </BlurView>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteBottom: {
        position: 'absolute',
        bottom: 34,
        left: 0,
        right: 0,
        elevation: 10,
        zIndex: 50,
    },
    navContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
    },
    blurBackground: {
        overflow: 'hidden',
    }
});