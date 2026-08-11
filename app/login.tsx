import { useRouter, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, ArrowRight, UserPlus, LogIn, RotateCw } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, View, ActivityIndicator } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import TouchableOpacity from '../components/TouchableOpacity';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { FillStyles } from '../constants/themeStyles';
import { Colors } from '@/constants/theme';
import { APP_NAME } from '../constants/app';
import Toast from '../components/Toast';

const ACCENT = Colors.dark.accent;

export default function LoginScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [isLogin, setIsLogin] = useState(params.mode !== 'register');

    useEffect(() => {
        if (params.mode === 'register') {
            setIsLogin(false);
        } else {
            setIsLogin(true);
        }
    }, [params.mode]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
        title?: string;
    }>({
        visible: false,
        message: '',
        type: 'info',
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info', title?: string) => {
        setToast({
            visible: true,
            message,
            type,
            title,
        });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, visible: false }));
    };

    const handleSubmit = async () => {
        if (!email || !password) {
            showToast('Enter email and password', 'error', 'Missing Fields');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            showToast('Passwords are not identical', 'error', 'Password Mismatch');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const result = await authService.login(email, password);
                console.log('Logged in:', result);

                if (result.access_token) {
                    await storageService.saveToken(result.access_token);
                    if (result.refresh_token) {
                        await storageService.saveRefreshToken(result.refresh_token);
                    }
                    if (result.user_id) {
                        await storageService.saveUserId(result.user_id);
                    }
                    await storageService.saveUserEmail(email);
                }

                // Sprawdź, czy użytkownik ma już zapisane preferencje w chmurze
                const token = result.access_token;
                const userId = result.user_id;
                const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://34.118.42.82:8010';
                let hasPrefs = false;

                if (token && userId && API_URL) {
                    try {
                        const response = await fetch(`${API_URL}/preferences/get?user_id=${userId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            const hasData = data && (
                                (data.vibes && data.vibes.length > 0) ||
                                (data.hard_nos && data.hard_nos.length > 0) ||
                                (data.eras && data.eras.length > 0) ||
                                (data.movies && data.movies.length > 0)
                            );
                            if (hasData) {
                                hasPrefs = true;
                            }
                        }
                    } catch (e) {
                        console.error('Error checking preferences during login:', e);
                    }
                }

                if (hasPrefs) {
                    router.replace('/home');
                } else {
                    router.push({ pathname: '/preferences', params: { storageType: 'cloud' } });
                }
            } else {
                const result = await authService.register(email, password, confirmPassword);
                console.log('Registered:', result);
                showToast('Account created! You can now log in.', 'success', 'Success');
                setIsLogin(true);
            }
        } catch (error: any) {
            showToast(error.message, 'error', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-transparent px-5 justify-center">
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                title={toast.title}
                onClose={hideToast}
            />
            <SafeAreaView>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 800 }}
                    className="p-8 pt-10"
                >
                    <View className="items-center mb-8">
                        <View className="bg-accent/10 p-4 rounded-full mb-4 border border-accent/20">
                            {isLogin ? <LogIn color={ACCENT} size={32} /> : <UserPlus color={ACCENT} size={32} />}
                        </View>
                        <Text className="font-outfit-bold text-[26px] mb-1">
                            {isLogin ? 'Welcome back!' : 'New account'}
                        </Text>
                        <Text className="font-outfit text-[14px] opacity-35">
                            {isLogin ? 'Log in to continue' : `Sign up for ${APP_NAME}`}
                        </Text>
                    </View>

                    <View className="gap-y-3">
                        <View className="relative">
                            <View className="absolute left-4 top-[15px] z-10">
                                <Mail color="#707080" size={20} />
                            </View>
                            <TextInput
                                className={`${FillStyles.inputLarge} pl-12`}
                                placeholder="E-mail"
                                placeholderTextColor="#ffffff30"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={{ color: '#fff' }}
                            />
                        </View>

                        <View className="relative ">
                            <View className="absolute left-4 top-[15px] z-10">
                                <Lock color="#707080" size={20} />
                            </View>
                            <TextInput
                                className={`${FillStyles.inputLarge} pl-12 pr-12`}
                                placeholder="Password"
                                placeholderTextColor="#ffffff30"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                style={{ color: '#fff' }}
                            />
                            <TouchableOpacity
                                className="absolute right-4 top-[15px]"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff color="#707080" size={20} /> : <Eye color="#707080" size={20} />}
                            </TouchableOpacity>
                        </View>
                        {!isLogin && <View className="relative">
                            <View className="absolute left-4 top-[15px] z-10">
                                <RotateCw color="#707080" size={20} />
                            </View>
                            <TextInput
                                className={`${FillStyles.inputLarge} pl-12 pr-12`}
                                placeholder="Repeat password"
                                placeholderTextColor="#ffffff30"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                style={{ color: '#fff' }}
                            />
                            <TouchableOpacity
                                className="absolute right-4 top-[15px]"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff color="#707080" size={20} /> : <Eye color="#707080" size={20} />}
                            </TouchableOpacity>
                        </View>}
                    </View>

                    <TouchableOpacity
                        className="bg-accent py-4 rounded-2xl flex-row justify-center items-center mt-4"
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Text className="font-outfit-bold text-black text-[16px] mr-2">
                                    {isLogin ? 'Log In' : 'Sign Up'}
                                </Text>
                                <ArrowRight color="#000" size={18} strokeWidth={2.5} />
                            </>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6">
                        <Text className="font-outfit mr-2 opacity-35 text-[14px]">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        </Text>
                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                            <Text style={{ color: ACCENT }} className="font-outfit-semi text-[14px]">
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </MotiView>

                <TouchableOpacity
                    className="mt-8 self-center"
                    onPress={() => router.back()}
                >
                    <Text className="font-outfit opacity-30 text-[14px]">Go back to start</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}
