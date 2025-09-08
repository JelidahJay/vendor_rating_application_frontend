import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { getQuestions } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import SurveyMatrixQuestion from "../../components/SurveyMatrixQuestion";
import SurveyHeaderForm from "../../components/SurveyHeaderForm";
import SurveyFooter from "../../components/SurveyFooter";
import UIColors from "../../constants/UIColors";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function SurveyScreen() {
    const [form, setForm] = useState({
        name: '',
        age: '',
        date: '',
        address: '',
        place: '',
    });

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        getQuestions()
            .then((res) => {
                console.log('Fetched questions:', res);
                setQuestions(res);
            })
            .catch((err) => console.error('Error fetching questions:', err));
    }, []);

    const handleHeaderChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleResponseChange = (id, value) => {
        setAnswers((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        const missingFields = Object.entries(form).filter(([_, val]) => !val?.trim());
        const unanswered = questions.filter((q) => !answers[q.question_id]);

        if (missingFields.length > 0) {
            Alert.alert('Missing Info', 'Please fill in all personal information fields.');
            return;
        }

        if (unanswered.length > 0) {
            Alert.alert("Incomplete Survey", `Please answer all required questions (${unanswered.length} missing).`);
            return;
        }

        console.log(' Submitted:', { form, answers });
        Alert.alert("Success", "Survey submitted successfully!");
    };

    const renderQuestionsInSection = (range, title) => {
        const filtered = (questions || []).filter(
            (q) => q.question_order >= range[0] && q.question_order <= range[1]
        );

        if (filtered.length === 0) return null;

        return (
            <View style={{ marginBottom: 20 }}>
                <SectionHeader title={title} />
                {filtered.map((q) => (
                    <SurveyMatrixQuestion
                        key={q.question_id}
                        questionId={q.question_id}
                        questionText={q.question_text}
                        questionType={q.question_type}
                        options={q.options}
                        value={answers[q.question_id]}
                        onChange={handleResponseChange}
                    />
                ))}
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.formContainer}>
                <SurveyHeaderForm formData={form} onChange={handleHeaderChange} />

                {renderQuestionsInSection([1, 2], 'Supplier Information')}
                {renderQuestionsInSection([3, 5], 'Quality of Product/Service')}
                {renderQuestionsInSection([6, 8], 'Timeliness and On-Time Delivery')}
                {renderQuestionsInSection([9, 12], 'Communication and Responsiveness')}

                {/* Submit Button */}
                <View style={{ marginTop: 20 }}>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit Survey</Text>
                    </TouchableOpacity>
                </View>

                <SurveyFooter />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        paddingVertical: 30,
        alignItems: 'center',
        backgroundColor: UIColors.background,
    },
    formContainer: {
        width: '100%',
        maxWidth: 600,
        backgroundColor: UIColors.surface,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: UIColors.border,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    submitButton: {
        backgroundColor: UIColors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: UIColors.textLight,
        fontSize: 16,
        fontWeight: '600',
    },
});
