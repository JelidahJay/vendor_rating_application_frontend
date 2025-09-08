import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import UIColors from '@/constants/UIColors';

function tintFromVariant(variant: 'primary' | 'secondary' | 'danger') {
    switch (variant) {
        case 'secondary':
            return UIColors.secondary;
        case 'danger':
            return UIColors.danger;
        default:
            return UIColors.primary;
    }
}

type IconBtnProps = {
    onPress: () => void;
    style?: ViewStyle;
    iconName: React.ComponentProps<typeof Feather>['name'];
    variant: 'primary' | 'secondary' | 'danger';
    label?: string; // keep optional if you want text sometimes
};

function IconOutlineButton({ onPress, style, iconName, variant, label }: IconBtnProps) {
    const tint = tintFromVariant(variant);
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.btn, { borderColor: tint }, style]}
        >
            <Feather name={iconName} size={14} color={tint} />
            {!!label && <Text style={[styles.text, { color: tint }]}>{label}</Text>}
        </TouchableOpacity>
    );
}

export function EditButton({ onPress, style }: { onPress: () => void; style?: ViewStyle }) {
    return <IconOutlineButton iconName="edit-2" variant="secondary" onPress={onPress} style={style} />;
}

export function ViewButton({ onPress, style }: { onPress: () => void; style?: ViewStyle }) {
    return <IconOutlineButton iconName="eye" variant="primary" onPress={onPress} style={style} />;
}

export function DeleteButton({ onPress, style }: { onPress: () => void; style?: ViewStyle }) {
    return <IconOutlineButton iconName="trash-2" variant="danger" onPress={onPress} style={style} />;
}

export function CopyButton({ onPress, style }: { onPress: () => void; style?: ViewStyle }) {
    return <IconOutlineButton iconName="copy" variant="primary" onPress={onPress} style={style} />;
}

export function ActionGroup({
                                children,
                                style,
                            }: {
    children: React.ReactNode;
    style?: ViewStyle;
}) {
    return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 8 },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: 'transparent',
        minHeight: 26,
    },
    text: {
        fontSize: 12,
        fontWeight: '500', // not too bold, like "cute little buttons"
    },
});
