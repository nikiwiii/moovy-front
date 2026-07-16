import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { AppText as Text } from './AppText';

export interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    title?: string;
    onClose: () => void;
    autoHideDuration?: number;
}

export function Toast({
    visible,
    message,
    type = 'info',
    title,
    onClose,
    autoHideDuration = 4000
}: ToastProps) {
    useEffect(() => {
        if (visible && autoHideDuration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [visible, autoHideDuration, onClose]);

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    border: 'border-emerald-500/30',
                    icon: '#10b981',
                    bg: 'bg-emerald-950/20',
                    defaultTitle: 'Success'
                };
            case 'error':
                return {
                    border: 'border-red-500/30',
                    icon: '#ef4444',
                    bg: 'bg-red-950/20',
                    defaultTitle: 'Error'
                };
            case 'info':
            default:
                return {
                    border: 'border-accent/30',
                    icon: '#ef7e45', // app brand color
                    bg: 'bg-accent/10',
                    defaultTitle: 'Information'
                };
        }
    };

    const colors = getColors();

    return (
        <AnimatePresence>
            {visible && (
                <MotiView
                    from={{ opacity: 0, translateY: -50, scale: 0.95 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    exit={{ opacity: 0, translateY: -30, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 120 }}
                    style={{
                        position: 'absolute',
                        top: 50,
                        left: 20,
                        right: 20,
                        zIndex: 9999,
                        elevation: 100,
                    }}
                >
                    <View className={`rounded-2xl overflow-hidden border ${colors.border} ${colors.bg}`}>
                        <BlurView
                            intensity={40}
                            tint="dark"
                            experimentalBlurMethod="dimezisBlurView"
                            style={StyleSheet.absoluteFill}
                        />
                        <View className="flex-row items-center p-4">
                            <View className="mr-3">
                                {type === 'success' && <CheckCircle2 color={colors.icon} size={24} />}
                                {type === 'error' && <AlertCircle color={colors.icon} size={24} />}
                                {type === 'info' && <Info color={colors.icon} size={24} />}
                            </View>
                            
                            <View className="flex-1 mr-2">
                                <Text className="font-outfit-bold text-[15px] mb-0.5 text-white">
                                    {title || colors.defaultTitle}
                                </Text>
                                <Text className="font-outfit text-[13px] text-white opacity-75 leading-4">
                                    {message}
                                </Text>
                            </View>

                            <Pressable 
                                onPress={onClose} 
                                className="w-8 h-8 rounded-full items-center justify-center bg-white/[0.05] active:bg-white/[0.12]"
                            >
                                <X color="#ffffffaa" size={16} />
                            </Pressable>
                        </View>
                    </View>
                </MotiView>
            )}
        </AnimatePresence>
    );
}

export default Toast;
