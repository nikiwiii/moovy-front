import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { cssInterop } from 'nativewind';

export type AppTextProps = RNTextProps & {
    className?: string; // nativewind support
};

export function AppText({ style, className, ...props }: AppTextProps) {
    // Explicitly fallback to #ffffff if no color is provided by NativeWind classes
    return (
        <RNText 
            style={[{ color: '#ffffff' }, style]} 
            className={className}
            {...props} 
        />
    );
}

// Ensure Nativewind intercepts this component
cssInterop(AppText, { className: 'style' });

export default AppText;
