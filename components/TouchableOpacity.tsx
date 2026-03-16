import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps } from 'react-native';

export default function TouchableOpacity(props: TouchableOpacityProps) {
    const { activeOpacity = 0.9, ...rest } = props;
    return <RNTouchableOpacity activeOpacity={activeOpacity} {...rest} />;
}
