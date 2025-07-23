import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UIColors from "../constants/UIColors";

export default function Footer() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>© 2025 Institute for Health Measurements | All rights reserved</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    text: {
        color: UIColors.textPrimary,
        fontSize: 12,
    },
});
