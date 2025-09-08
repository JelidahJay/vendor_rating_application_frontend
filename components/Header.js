import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UIColors from "../constants/UIColors";

export default function Header() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vendor Rating Management System</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fbfbfb',
        alignItems: 'center',
    },
    title: {
        color: UIColors.textSecondary,
        fontSize: 20,
        fontWeight: 'bold',
    },
});
