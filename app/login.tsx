import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, ArrowRight, UserPlus, LogIn, RotateCw } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { SafeAreaView, TextInput, View, Alert, ActivityIndicator } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import TouchableOpacity from '../components/TouchableOpacity';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { FillStyles } from '../constants/themeStyles';
import { Colors } from '@/constants/theme';

const ACCENT = Colors.dark.accent;

export default function LoginScreen() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Błąd', 'Podaj e-mail i hasło');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            Alert.alert('Błąd', 'Hasła nie są identyczne');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const result = await authService.login(email, password);
                console.log('Zalogowano:', result);

                if (result.access_token) {
                    await storageService.saveToken(result.access_token);
                    if (result.user_id) {
                        await storageService.saveUserId(result.user_id);
                    }
                }

                router.push({ pathname: '/preferences', params: { storageType: 'cloud' } });
            } else {
                const result = await authService.register(email, password, confirmPassword);
                console.log('Zarejestrowano:', result);
                Alert.alert('Sukces', 'Konto utworzone! Możesz się zalogować.');
                setIsLogin(true);
            }
        } catch (error: any) {
            Alert.alert('Błąd', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-transparent px-5 justify-center">
            <SafeAreaView>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 800 }}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-[32px] p-8 pt-10"
                >
                    <View className="items-center mb-8">
                        <View className="bg-accent/10 p-4 rounded-2xl mb-4 border border-accent/20">
                            {isLogin ? <LogIn color={ACCENT} size={32} /> : <UserPlus color={ACCENT} size={32} />}
                        </View>
                        <Text className="font-outfit-bold text-[26px] mb-1">
                            {isLogin ? 'Witaj ponownie!' : 'Nowe konto'}
                        </Text>
                        <Text className="font-outfit text-[14px] opacity-35">
                            {isLogin ? 'Zaloguj się, aby kontynuować' : 'Zarejestruj się w MovieNight'}
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
                                placeholder="Hasło"
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
                                placeholder="Powtórz hasło"
                                placeholderTextColor="#ffffff30"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
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
                        className="bg-accent py-4 rounded-2xl flex-row justify-center items-center mt-8"
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Text className="font-outfit-bold text-black text-[16px] mr-2">
                                    {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
                                </Text>
                                <ArrowRight color="#000" size={18} strokeWidth={2.5} />
                            </>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6">
                        <Text className="font-outfit mr-2 opacity-35 text-[14px]">
                            {isLogin ? 'Nie masz konta?' : 'Masz już konto?'}
                        </Text>
                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                            <Text style={{ color: ACCENT }} className="font-outfit-semi text-[14px]">
                                {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </MotiView>

                <TouchableOpacity
                    className="mt-8 self-center"
                    onPress={() => router.back()}
                >
                    <Text className="font-outfit opacity-30 text-[14px]">Wróć do startu</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}
