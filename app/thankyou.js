import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ThankYouScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎉 Thank You!</Text>
            <Text style={styles.message}>Your survey has been submitted successfully.</Text>
            <Button title="Go Home" onPress={() => router.push('/')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f2f2f2',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 40,
    },
});
