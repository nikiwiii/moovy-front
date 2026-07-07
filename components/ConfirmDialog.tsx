import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { BlurView } from 'expo-blur';
import { AppText as Text } from './AppText';
import TouchableOpacity from './TouchableOpacity';

export interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    visible,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onCancel}
        >
            <AnimatePresence>
                {visible && (
                    <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-black/60 px-6 z-50">
                        {/* Backdrop tap to close */}
                        <TouchableOpacity 
                            style={StyleSheet.absoluteFill} 
                            activeOpacity={1} 
                            onPress={onCancel}
                        />

                        {/* Dialog Card */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.95, translateY: 15 }}
                            animate={{ opacity: 1, scale: 1, translateY: 0 }}
                            exit={{ opacity: 0, scale: 0.95, translateY: 10 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                            className="w-full max-w-[320px]"
                        >
                            <View className="rounded-[28px] overflow-hidden border border-white/[0.08] bg-[#0d0b1a]/95">
                                <BlurView
                                    intensity={30}
                                    tint="dark"
                                    experimentalBlurMethod="dimezisBlurView"
                                    style={StyleSheet.absoluteFill}
                                />
                                
                                <View className="p-6">
                                    <Text className="font-outfit-bold text-[18px] mb-2 text-white text-center">
                                        {title}
                                    </Text>
                                    <Text className="font-outfit text-[13px] text-white/70 text-center mb-6 leading-5">
                                        {message}
                                    </Text>

                                    <View className="flex-row gap-3">
                                        {/* Cancel Button */}
                                        <TouchableOpacity
                                            onPress={onCancel}
                                            className="flex-1 bg-white/[0.06] border border-white/[0.08] py-3 rounded-full items-center justify-center"
                                        >
                                            <Text className="font-outfit-semi text-[13px] text-white/60">
                                                {cancelText}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Confirm Button */}
                                        <TouchableOpacity
                                            onPress={onConfirm}
                                            className={`flex-1 py-3 rounded-full items-center justify-center ${
                                                isDestructive ? 'bg-red-500' : 'bg-accent'
                                            }`}
                                        >
                                            <Text className={`font-outfit-bold text-[13px] ${isDestructive ? 'text-white' : 'text-black'}`}>
                                                {confirmText}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </MotiView>
                    </View>
                )}
            </AnimatePresence>
        </Modal>
    );
}

export default ConfirmDialog;
