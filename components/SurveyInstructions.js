// components/SurveyInstructions.js
import { View, Text, StyleSheet } from 'react-native';

export default function SurveyInstructions() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>INSTRUCTIONS:</Text>
            <Text style={styles.body}>
                Please read each statement carefully and select the most appropriate option from the rating scale.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    header: {
        fontWeight: 'bold',
        backgroundColor: '#2A9D8F',
        color: 'white',
        padding: 8,
        borderRadius: 4,
    },
    body: {
        paddingTop: 6,
        fontSize: 14,
        color: '#333',
    },
});
