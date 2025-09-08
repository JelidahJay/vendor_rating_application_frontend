import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import UIColors from "../constants/UIColors";

const RATING_OPTIONS = ['1', '2', '3', '4', '5'];
const RADIO_OPTIONS = ['Yes', 'No'];
const COMM_OPTIONS = ['Poor', 'Average', 'Good'];

export default function SurveyMatrixQuestion({
                                                 questionId,
                                                 questionText,
                                                 questionType,
                                                 options = [],
                                                 value,
                                                 onChange
                                             }) {
    const renderRadio = (choices) => (
        <View style={styles.optionsRow}>
            {choices.map((opt) => (
                <Pressable
                    key={opt}
                    style={[
                        styles.circle,
                        value === opt && styles.selectedCircle
                    ]}
                    onPress={() => onChange(questionId, opt)}
                >
                    {value === opt && <View style={styles.innerCircle} />}
                    <Text
                        style={[
                            styles.optionLabel,
                            value === opt && { color: UIColors.primary }
                        ]}
                    >
                        {opt}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    if (questionType === 'Text') {
        return (
            <View style={styles.container}>
                <Text style={styles.label}>
                    {questionText} <Text style={{ color: UIColors.danger }}>*</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter response"
                    placeholderTextColor={UIColors.textSecondary}
                    value={value}
                    onChangeText={(text) => onChange(questionId, text)}
                />
            </View>
        );
    }

    if (questionType === 'Paragraph') {
        return (
            <View style={styles.container}>
                <Text style={styles.label}>
                    {questionText} <Text style={{ color: UIColors.danger }}>*</Text>
                </Text>
                <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    multiline
                    numberOfLines={4}
                    placeholder="Enter detailed response"
                    placeholderTextColor={UIColors.textSecondary}
                    value={value}
                    onChangeText={(text) => onChange(questionId, text)}
                />
            </View>
        );
    }

    if (questionType === 'Rating') {
        return (
            <View style={styles.container}>
                <Text style={styles.label}>
                    {questionText} <Text style={{ color: UIColors.danger }}>*</Text>
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
                <Text style={styles.label}>
                    {questionText} <Text style={{ color: UIColors.danger }}>*</Text>
                </Text>
                {renderRadio(RADIO_OPTIONS)}
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: {
        fontWeight: '600',
        marginBottom: 6,
        fontSize: 15,
        color: UIColors.textPrimary,
    },
    input: {
        borderWidth: 1,
        borderColor: UIColors.border,
        padding: 10,
        borderRadius: 6,
        backgroundColor: UIColors.surface,
        color: UIColors.textPrimary,
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
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderColor: UIColors.border,
        backgroundColor: UIColors.surface,
    },
    selectedCircle: {
        backgroundColor: UIColors.primarySoft,
        borderColor: UIColors.primary,
    },
    innerCircle: {
        width: 10,
        height: 10,
        backgroundColor: UIColors.primary,
        borderRadius: 5,
        marginRight: 6,
    },
    optionLabel: {
        fontSize: 14,
        marginLeft: 4,
        color: UIColors.textPrimary,
    },
});
