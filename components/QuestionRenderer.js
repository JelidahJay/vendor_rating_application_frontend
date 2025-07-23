import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { RadioButton } from 'react-native-paper';

export default function QuestionRenderer({ question, value, onChange }) {
    const { question_text, question_type, options = [] } = question;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{question_text}</Text>

            {question_type === 'Text' && (
                <TextInput
                    style={styles.input}
                    placeholder="Your response"
                    value={value}
                    onChangeText={onChange}
                />
            )}

            {question_type === 'Radio' && (
                <RadioButton.Group onValueChange={onChange} value={value}>
                    {options.map((option, index) => (
                        <View key={index} style={styles.radioItem}>
                            <RadioButton value={option} />
                            <Text>{option}</Text>
                        </View>
                    ))}
                </RadioButton.Group>
            )}

            {question_type === 'Rating' && (
                <View style={styles.ratingRow}>
                    {options.map((rating, i) => (
                        <Text
                            key={i}
                            style={[
                                styles.ratingOption,
                                value === rating && styles.ratingSelected,
                            ]}
                            onPress={() => onChange(rating)}
                        >
                            {rating}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
    },
    radioItem: { flexDirection: 'row', alignItems: 'center' },
    ratingRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    ratingOption: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
    },
    ratingSelected: {
        backgroundColor: '#4caf50',
        color: '#fff',
    },
});
