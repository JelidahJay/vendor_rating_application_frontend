import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import UIColors from '@/constants/UIColors';

type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent';
interface Props {
    label: string;
    onPress: () => void;
    variant?: Variant;
    style?: ViewStyle;
}

export default function OutlineButton({ label, onPress, variant = 'primary', style }: Props) {
    const color =
        variant === 'primary'   ? UIColors.primary   :
            variant === 'secondary' ? UIColors.secondary :
                variant === 'success'   ? UIColors.success   :
                    variant === 'warning'   ? UIColors.warning   :
                        variant === 'danger'    ? UIColors.danger    :
                            UIColors.accent;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.base, { borderColor: color }, style]}
            accessibilityRole="button"
        >
            <Text style={[styles.text, { color }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: 6,   // smaller padding
        paddingVertical: 4,     // thinner height
        borderRadius: 8,        // softer, rounded edges
        borderWidth: 1,
        backgroundColor: UIColors.surface,
    },
    text: {
        fontSize: 10,           // smaller font
        fontWeight: '400',      // regular weight, not bold
    },
});
