import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet } from 'react-native';
import {getQuestions} from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import SurveyMatrixQuestion from "../../components/SurveyMatrixQuestion";
import SurveyHeaderForm from "../../components/SurveyHeaderForm";
import SurveyFooter from "../../components/SurveyFooter";
import { useColorScheme } from 'react-native';

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

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';


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
            alert('Please fill in all personal information fields.');
            return;
        }

        if (unanswered.length > 0) {
            alert(`Please answer all required questions (${unanswered.length} missing).`);
            return;
        }

        // If everything is valid:
        console.log('✅ Submitted:', { form, answers });
        alert('Survey submitted successfully!');
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
});
