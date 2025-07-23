import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';


const RATING_OPTIONS = ['1', '2', '3', '4', '5'];
const RADIO_OPTIONS = ['Yes', 'No'];
const COMM_OPTIONS = ['Poor', 'Average', 'Good'];

export default function SurveyMatrixQuestion({ questionId, questionText, questionType, options = [], value, onChange }) {
    const renderRadio = (choices) => (
        <View style={styles.optionsRow}>
            {choices.map((opt) => (
                <Pressable
                    key={opt}
                    style={[styles.circle, value === opt && styles.selected]}
                    onPress={() => onChange(questionId, opt)}
                >
                    {value === opt && <View style={styles.innerCircle} />}
                    <Text style={styles.optionLabel}>{opt}</Text>
                </Pressable>
            ))}
        </View>
    );

    if (questionType === 'Text') {
        return (
            <View style={styles.container}>
                <Text style={[styles.label]}>
                    {questionText} <Text style={{ color: 'red' }}>*</Text>
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter response"
                    value={value}
                    onChangeText={(text) => onChange(questionId, text)}
                />
            </View>
        );
    }

    if (questionType === 'Paragraph') {
        return (
            <View style={styles.container}>
                <Text style={[styles.label]}>
                    {questionText} <Text style={{ color: 'red' }}>*</Text>
                </Text>

                <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    multiline
                    numberOfLines={4}
                    placeholder="Enter detailed response"
                    value={value}
                    onChangeText={(text) => onChange(questionId, text)}
                />
            </View>
        );
    }

    if (questionType === 'Rating') {
        return (
            <View style={styles.container}>
                <Text style={[styles.label]}>
                    {questionText} <Text style={{ color: 'red' }}>*</Text>
                </Text>
                {renderRadio(RATING_OPTIONS)}
            </View>
        );
    }

    if (questionType === 'MultipleChoice') {
        return (
            <View style={styles.container}>
                <Text style={styles.label}>{questionText}</Text>
                {renderRadio(COMM_OPTIONS)}
            </View>
        );
    }

    if (questionType === 'Radio') {
        return (
            <View style={styles.container}>
                <Text style={[styles.label]}>
                    {questionText} <Text style={{ color: 'red' }}>*</Text>
                </Text>
                {renderRadio(RADIO_OPTIONS)}
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: { fontWeight: '600', marginBottom: 6, fontSize: 15 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 16,
        flexWrap: 'wrap',
        alignItems: 'center',
        marginTop: 8,
    },
    circle: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        padding: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderColor: '#2A9D8F',
        backgroundColor: '#f4f4f4',
    },
    innerCircle: {
        width: 10,
        height: 10,
        backgroundColor: '#2A9D8F',
        borderRadius: 5,
        marginRight: 6,
    },
    selected: {
        backgroundColor: '#CFF5ED',
        borderColor: '#1D7874',
    },
    optionLabel: {
        fontSize: 14,
        marginLeft: 4,
    },
});
