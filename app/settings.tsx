import { FillStyles } from "@/constants/themeStyles";
import { router } from "expo-router";
import { ArrowLeft, Bookmark, ChevronRight, LogIn, LogOut, Settings as SettingsIcon, Trash2, UserCircle2 } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { ScrollView, View, Alert } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import TouchableOpacity from "@/components/TouchableOpacity";
import { storageService } from "@/services/storageService";
import { authService } from "@/services/authService";
import { Colors } from "@/constants/theme";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";

const ACCENT = Colors.dark.accent;

export default function Settings() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
        title?: string;
    }>({ visible: false, message: '', type: 'info' });

    const showToast = (message: string, type: 'success' | 'error' | 'info', title?: string) => {
        setToast({ visible: true, message, type, title });
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = await storageService.getToken();
            setIsLoggedIn(!!token);
        };
        checkAuth();
    }, []);

    const handleLogout = () => {
        setLogoutConfirmVisible(true);
    };

    const confirmLogout = async () => {
        setLogoutConfirmVisible(false);
        await storageService.logout();
        setIsLoggedIn(false);
        router.replace('/');
    };

    const handleDeleteAccount = () => {
        setDeleteConfirmVisible(true);
    };

    const confirmDeleteAccount = async () => {
        setDeleteConfirmVisible(false);
        setIsDeleting(true);
        try {
            const refreshToken = await storageService.getRefreshToken();
            if (!refreshToken) {
                throw new Error("No refresh token found. Please log in again.");
            }
            await authService.deleteAccount(refreshToken);
            await storageService.logout();
            setIsLoggedIn(false);
            showToast("Your account has been deleted.", "info", "Account Deleted");
            setTimeout(() => {
                router.replace('/');
            }, 1500);
        } catch (err: any) {
            showToast(err.message || "Failed to delete account.", "error", "Error");
        } finally {
            setIsDeleting(false);
        }
    };

    const Arrow = (
        <View className="w-8 h-8 rounded-full bg-white/[0.06] items-center justify-center border border-white/[0.08]">
            <ChevronRight color="#707080" size={16} />
        </View>
    );

    return (
        <View className="flex-1 bg-transparent pt-10">
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
            />
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 600 }}
                className="px-6 pt-5 pb-3 flex-row items-center justify-between"
            >
                <View className="flex-row items-center gap-x-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/[0.06] items-center justify-center border border-white/[0.08]"
                    >
                        <ArrowLeft color="#fff" size={20} />
                    </TouchableOpacity>
                    <Text className="font-outfit-bold text-[24px]">Settings</Text>
                </View>
            </MotiView>

            <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="gap-y-2">

                    {!isLoggedIn && (
                        <TouchableOpacity
                            onPress={() => router.push('/login')}
                            className="bg-accent/10 rounded-[24px] flex-row items-center justify-between gap-x-3 min-h-20 p-5 border border-accent/20"
                        >
                            <View className="flex-row items-center gap-x-4">
                                <View className="bg-accent/15 p-2.5 rounded-xl">
                                    <LogIn color={ACCENT} size={22} />
                                </View>
                                <View>
                                    <Text className="font-outfit-semi text-[15px]">Connect with Cloud</Text>
                                    <Text className="font-outfit text-[12px] opacity-35">Log in and enjoy full functionality</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => router.push('/preferences')}
                        className={`${FillStyles.pillBase} ${FillStyles.pillInactive} ${isLoggedIn ? FillStyles.pillFirst : ''} flex-row items-center justify-between gap-x-2 min-h-14`}
                    >
                        <View className="flex-row items-center gap-x-3 pl-1">
                            <UserCircle2 color="#707080" size={18} />
                            <Text className="font-outfit text-[14px]">Change preferences</Text>
                        </View>
                        {Arrow}
                    </TouchableOpacity>

                    {isLoggedIn && (
                        <>
                            <TouchableOpacity
                                onPress={handleLogout}
                                className={`${FillStyles.pillBase} bg-white/[0.04] border-white/[0.08] flex-row items-center justify-between gap-x-2 min-h-14`}
                            >
                                <View className="flex-row items-center gap-x-3 pl-1">
                                    <LogOut color="#f87171" size={18} />
                                    <Text className="font-outfit-semi text-[14px] text-red-400">Log out</Text>
                                </View>
                                {Arrow}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
                                className={`${FillStyles.pillBase} ${FillStyles.pillLast} bg-red-500/10 border-red-500/20 flex-row items-center justify-between gap-x-2 min-h-14`}
                            >
                                <View className="flex-row items-center gap-x-3 pl-1">
                                    <Trash2 color="#ef4444" size={18} />
                                    <Text className="font-outfit-semi text-[14px] text-red-500">Delete account</Text>
                                </View>
                                {Arrow}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>

            <ConfirmDialog
                visible={logoutConfirmVisible}
                title="Log out"
                message="Are you sure you want to log out of your account?"
                confirmText="Log out"
                isDestructive
                onConfirm={confirmLogout}
                onCancel={() => setLogoutConfirmVisible(false)}
            />

            <ConfirmDialog
                visible={deleteConfirmVisible}
                title="Delete Account"
                message="Are you sure you want to permanently delete your account? This action cannot be undone."
                confirmText="Delete Account"
                isDestructive
                onConfirm={confirmDeleteAccount}
                onCancel={() => setDeleteConfirmVisible(false)}
            />
        </View>
    );
}