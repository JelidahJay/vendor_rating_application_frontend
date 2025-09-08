import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UIColors from '@/constants/UIColors';

export default function ThankYouScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎉 Thank You!</Text>
            <Text style={styles.message}>Your survey has been submitted successfully.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: UIColors.background,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: UIColors.header,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: UIColors.textSecondary,
        textAlign: 'center',
        maxWidth: 420,
    },
});
