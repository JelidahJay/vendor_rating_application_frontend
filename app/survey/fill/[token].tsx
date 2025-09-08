import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { getSurveyByToken, submitSurvey } from '../../../services/api';
import SectionHeader from '../../../components/SectionHeader';
import SurveyMatrixQuestion from '../../../components/SurveyMatrixQuestion';
import SurveyFooter from '../../../components/SurveyFooter';
import ThankYouScreen from '../../thankyou';
import UIColors from '@/constants/UIColors';

export default function SurveyFillScreen() {
    const { token } = useLocalSearchParams();
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState(null);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        if (token) {
            getSurveyByToken(token)
                .then((res) => {
                    setSurvey(res);
                    setLoading(false);
                    navigation.setOptions({ title: `Survey for ${res.vendor_name}` });
                })
                .catch(() => setLoading(false));
        }
    }, [token]);

    const handleResponseChange = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const router = useRouter();

    const handleSubmit = async () => {
        if (!survey) return;

        const unanswered = survey.survey_questions.filter((q) => !answers[q.question_id]);
        if (unanswered.length > 0) {
            Alert.alert('Incomplete Survey', `Please answer all required questions (${unanswered.length} missing).`);
            return;
        }

        try {
            await submitSurvey(token, answers);
            router.replace('../../thankyou');
        } catch (error) {
            Alert.alert('Error', 'Failed to submit survey.');
        }
    };

    useEffect(() => {
        if (!survey) return;
        const lc = (s) => (s || '').toString().toLowerCase();

        const qSupplier = survey.survey_questions.find(
            (q) => lc(q.question_text).includes('supplier') || lc(q.question_text).includes('company name')
        );
        const qService = survey.survey_questions.find((q) => {
            const t = lc(q.question_text);
            return t.includes('product/service being evaluated') || t.includes('product / service being evaluated') || (t.includes('product') && t.includes('service'));
        });

        const serviceValue =
            survey.vendor_service ??
            survey.product_service ??
            survey.vendor_product_service ??
            survey.vendor?.product_service ??
            '';

        setAnswers((prev) => {
            const next = { ...prev };
            if (qSupplier && next[qSupplier.question_id] == null) next[qSupplier.question_id] = survey.vendor_name || '';
            if (qService && next[qService.question_id] == null) next[qService.question_id] = serviceValue;
            return next;
        });
    }, [survey]);

    if (loading) {
        return (
            <View style={[styles.fill, styles.center]}>
                <ActivityIndicator size="large" color={UIColors.primary} />
            </View>
        );
    }

    if (!survey) {
        return (
            <View style={[styles.fill, styles.center]}>
                <Text style={{ color: UIColors.textPrimary }}>Survey not found or already completed.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.formContainer}>
                <Text style={styles.infoText}>
                    Rater: <Text style={{ color: UIColors.textStrong }}>{survey.rater_name}</Text>{' '}
                    <Text style={{ color: UIColors.textSecondary }}>({survey.rater_email})</Text>
                </Text>

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

                <View style={{ marginTop: 20 }}>
                    <Button title="Submit Survey" onPress={handleSubmit} color={UIColors.primary} />
                </View>

                <SurveyFooter />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1, backgroundColor: UIColors.background },
    center: { justifyContent: 'center', alignItems: 'center' },

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
});
