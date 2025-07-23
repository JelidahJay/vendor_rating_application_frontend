import { View, Text, StyleSheet } from 'react-native';

export default function SurveyFooter() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Thank you for taking the time to evaluate this supplier. Your feedback is valuable.
            </Text>
            <Text style={styles.link}>www.reallygreatsite.com</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 30, alignItems: 'center' },
    text: {
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 10,
        color: '#444',
    },
    link: {
        color: '#555',
        fontWeight: 'bold',
        fontSize: 13,
    },
});
