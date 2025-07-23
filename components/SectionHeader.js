import { View, Text, StyleSheet } from 'react-native';

export default function SectionHeader({ title }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2A9D8F',
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
