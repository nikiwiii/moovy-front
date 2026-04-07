import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, ArrowRight, UserPlus, LogIn, RotateCw } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, View, Alert, ActivityIndicator } from 'react-native';
import TouchableOpacity from '../components/TouchableOpacity';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { FillStyles } from '../constants/themeStyles';

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
                  // Jeśli backend zwraca user_id, możemy go też zapisać
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
        <View className="flex-1 bg-transparent px-6 justify-center">
            <SafeAreaView>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 800 }}
                    className="bg-black/40 border border-white/10 rounded-[32px] p-8 pt-10 backdrop-blur-md"
                >
                    <View className="items-center mb-8">
                        <View className="bg-white/10 p-4 rounded-3xl mb-4 border border-white/10">
                            {isLogin ? <LogIn color="#fff" size={32} /> : <UserPlus color="#fff" size={32} />}
                        </View>
                        <Text className="font-outfit-bold text-white text-2xl mb-1">
                            {isLogin ? 'Witaj ponownie!' : 'Nowe konto'}
                        </Text>
                        <Text className="font-outfit text-white/50 text-[15px]">
                            {isLogin ? 'Zaloguj się, aby kontynuować' : 'Zarejestruj się w MovieNight'}
                        </Text>
                    </View>

                    <View className="gap-y-4">
                        <View className="relative">
                            <View className="absolute left-4 top-[15px] z-10">
                                <Mail color="#aaa" size={20} />
                            </View>
                            <TextInput
                                className={`${FillStyles.inputLarge} pl-12`}
                                placeholder="E-mail"
                                placeholderTextColor="#aaa"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View className="relative">
                            <View className="absolute left-4 top-[15px] z-10">
                                <Lock color="#aaa" size={20} />
                            </View>
                            <TextInput
                                className={`${FillStyles.inputLarge} pl-12 pr-12`}
                                placeholder="Hasło"
                                placeholderTextColor="#aaa"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                className="absolute right-4 top-[15px]"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff color="#aaa" size={20} /> : <Eye color="#aaa" size={20} />}
                            </TouchableOpacity>
                        </View>
                        {!isLogin && <View className="relative">
                            <View className="absolute left-4 top-[15px] z-10">
                                <RotateCw color="#aaa" size={20} />
                            </View>
                            <TextInput
                                className={`${FillStyles.inputLarge} pl-12 pr-12`}
                                placeholder="Powtórz hasło"
                                placeholderTextColor="#aaa"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                className="absolute right-4 top-[15px]"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff color="#aaa" size={20} /> : <Eye color="#aaa" size={20} />}
                            </TouchableOpacity>
                        </View>}
                    </View>




                    <TouchableOpacity
                        className="bg-white py-4 rounded-2xl flex-row justify-center items-center mt-8 shadow-lg shadow-white/20"
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Text className="font-outfit-bold text-black text-lg mr-2">
                                    {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
                                </Text>
                                <ArrowRight color="#000" size={20} />
                            </>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6">
                        <Text className="font-outfit text-white/50 mr-2">
                            {isLogin ? 'Nie masz konta?' : 'Masz już konto?'}
                        </Text>
                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                            <Text className="font-outfit-bold text-white">
                                {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </MotiView>

                <TouchableOpacity
                    className="mt-8 self-center"
                    onPress={() => router.back()}
                >
                    <Text className="font-outfit text-white/40">Wróć do startu</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}
