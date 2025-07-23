import React, { useEffect, useState } from 'react';
import { ScrollView, View, Button, Text } from 'react-native';
import QuestionRenderer from '../components/QuestionRenderer';
import { getQuestions } from '../services/api';

export default function SurveyScreen({ navigation }) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        getQuestions().then(res => setQuestions(res.data));
    }, []);

    const handleChange = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        console.log('Submitted answers:', answers);
        // navigation.navigate('Review', { answers });
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            {questions.map(q => (
                <QuestionRenderer
                    key={q.question_id}
                    question={q}
                    value={answers[q.question_id]}
                    onChange={val => handleChange(q.question_id, val)}
                />
            ))}

            <View style={{ marginTop: 20 }}>
                <Button title="Submit Survey" onPress={handleSubmit} />
            </View>
        </ScrollView>
    );
}
