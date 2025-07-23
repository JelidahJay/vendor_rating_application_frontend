// components/SurveyHeader.js
import { View, Text, StyleSheet } from 'react-native';

export default function SurveyHeader() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>SURVEY</Text>
            <Text style={styles.subtitle}>PERSONAL INFORMATION</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 16 },
    title: {
        fontSize: 28,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#2A9D8F',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
        color: '#264653',
    },
});
