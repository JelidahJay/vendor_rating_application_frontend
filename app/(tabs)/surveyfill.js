import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getSurveyByToken } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import SurveyMatrixQuestion from "../../components/SurveyMatrixQuestion";
import SurveyFooter from "../../components/SurveyFooter";
import UIColors from "../../constants/UIColors";

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

        // TODO: connect to backend
        console.log('✅ Survey submission:', { token, answers });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={UIColors.primary} />
            </View>
        );
    }

    if (!survey) {
        return (
            <View style={styles.errorContainer}>
                <Text style={{ color: UIColors.textPrimary }}>Survey not found or already completed.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.formContainer}>
                {/* Rater and Vendor Information */}
                <Text style={styles.infoText}>
                    Rater: <Text style={{ color: UIColors.textStrong }}>{survey.rater_name}</Text>{' '}
                    <Text style={{ color: UIColors.textSecondary }}>({survey.rater_email})</Text>
                </Text>
                <Text style={styles.infoText}>
                    Vendor: <Text style={{ color: UIColors.textStrong }}>{survey.vendor_name}</Text>
                </Text>
                <Text style={styles.infoText}>
                    Service Provided: <Text style={{ color: UIColors.textSecondary }}>{survey.vendor_service}</Text>
                </Text>

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
                    <Button title="Submit Survey" onPress={handleSubmit} color={UIColors.primary} />
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
    infoText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: UIColors.textPrimary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: UIColors.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: UIColors.background,
    },
});
