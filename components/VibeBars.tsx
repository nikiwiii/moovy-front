import React from 'react';
import { View, ViewStyle } from 'react-native';

interface VibeBarsProps {
    color: string;
    opacityMultiplier?: number;
    width?: number;
    height?: number;
    gap?: number;
    marginRight?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export default function VibeBars({
    color,
    opacityMultiplier = 1,
    width = 3,
    height = 12,
    gap = 2,
    marginRight = 6,
    borderRadius = 1.5,
    style
}: VibeBarsProps) {
    const opacities = [0.2, 0.45, 0.7, 1.0];
    return (
        <View style={[{ flexDirection: 'row', gap, alignItems: 'center', marginRight }, style]}>
            {opacities.map((op, i) => (
                <View
                    key={i}
                    style={{
                        width,
                        height,
                        borderRadius,
                        backgroundColor: color,
                        opacity: op * opacityMultiplier,
                    }}
                />
            ))}
        </View>
    );
}
