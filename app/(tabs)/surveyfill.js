import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getSurveyByToken } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import SurveyMatrixQuestion from "../../components/SurveyMatrixQuestion";
import SurveyFooter from "../../components/SurveyFooter";

export default function SurveyFillScreen() {
    const { token } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        if (token) {
            getSurveyByToken(token)
                .then((res) => {
                    console.log('Fetched survey:', res);
                    setSurvey(res);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Error fetching survey:', err);
                    setLoading(false);
                });
        }
    }, [token]);

    const handleResponseChange = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        if (!survey) return;

        const unanswered = survey.survey_questions.filter(
            (q) => !answers[q.question_id]
        );

        if (unanswered.length > 0) {
            Alert.alert("Incomplete Survey", `Please answer all required questions (${unanswered.length} missing).`);
            return;
        }

        // TODO: Connect submission to backend
        console.log('✅ Survey submission:', { token, answers });
        const handleSubmit = async () => {
            if (!survey) return;

            const unanswered = survey.survey_questions.filter(
                (q) => !answers[q.question_id]
            );

            if (unanswered.length > 0) {
                Alert.alert("Incomplete Survey", `Please answer all required questions (${unanswered.length} missing).`);
                return;
            }

            try {
                await submitSurvey(token, answers);
                Alert.alert("Success", "Survey submitted successfully!");

                // TODO: Optionally redirect to Thank You page or disable form
            } catch (error) {
                console.error('Error submitting survey:', error);
                Alert.alert("Error", "Failed to submit survey.");
            }
        };

        // You can navigate or show a thank you page after this
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!survey) {
        return (
            <View style={styles.errorContainer}>
                <Text>Survey not found or already completed.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.formContainer}>
                {/* Rater and Vendor Information */}
                <Text style={styles.infoText}>Rater: {survey.rater_name} ({survey.rater_email})</Text>
                <Text style={styles.infoText}>Vendor: {survey.vendor_name}</Text>

                {/* Survey Questions */}
                {survey.survey_questions.map((q) => (
                    <View key={q.question_id} style={{ marginBottom: 20 }}>
                        <SectionHeader title={q.question_text} />
                        <SurveyMatrixQuestion
                            questionId={q.question_id}
                            questionText={q.question_text}
                            questionType={q.question_type}
                            options={q.options}
                            value={answers[q.question_id]}
                            onChange={handleResponseChange}
                        />
                    </View>
                ))}

                {/* Submit Button */}
                <View style={{ marginTop: 20 }}>
                    <Button title="Submit Survey" onPress={handleSubmit} />
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
        backgroundColor: '#f2f2f2',
    },
    formContainer: {
        width: '100%',
        maxWidth: 600,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
    },
    infoText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
