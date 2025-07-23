import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function SurveyHeaderForm({ formData, onChange }) {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Field label="Name:" value={formData.name} onChange={(v) => onChange('name', v)} />
                <Field label="Age:" value={formData.age} onChange={(v) => onChange('age', v)} />
            </View>
            <View style={styles.row}>
                <Field label="Date:" value={formData.date} onChange={(v) => onChange('date', v)} />
                <Field label="Address:" value={formData.address} onChange={(v) => onChange('address', v)} />
            </View>
            <Field label="Place:" value={formData.place} onChange={(v) => onChange('place', v)} />
        </View>
    );
}

function Field({ label, value, onChange }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                placeholder={`Enter ${label.toLowerCase().replace(':', '')}`}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    field: { flex: 1, marginRight: 10, marginVertical: 6 },
    label: { fontWeight: '600', marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
});
