import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import UIColors from '../../constants/UIColors';

const COLORS = {
    red2:  '#ef4444', // female
    teal3: '#00796b', // male
    teal2: '#26a69a',
    gray:  '#cbd5e1',
};

export default function DemographicSurveyDetails({ completed }) {
    /* --- Gender Data (static for now, replace with real later) --- */
    const genderData = useMemo(() => [
        { name: 'Male', value: 2, color: COLORS.teal3 },
        { name: 'Female', value: 1, color: COLORS.red2 },
    ], []);

    /* --- Department Data (static for now) --- */
    const deptData = useMemo(() => [
        { name: 'Procurement', value: 2 },
        { name: 'IT', value: 1 },
        { name: 'Finance', value: 0 },
    ], []);

    /* --- Submission Times (from actual completed array) --- */
    const submitData = useMemo(() => {
        const map = new Map();
        (completed || []).forEach(s => {
            if (!s.submittedAt) return;
            const d = new Date(s.submittedAt);
            if (Number.isNaN(d.getTime())) return;
            const hh = d.getHours().toString().padStart(2, '0');
            const label = `${hh}:00`;
            map.set(label, (map.get(label) || 0) + 1);
        });
        return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }, [completed]);

    return (
        <View>
            <Text style={styles.title}>Demographic Dashboard</Text>

            {/* Gender Pie Chart */}
            <View style={styles.chartBox}>
                <Text style={styles.chartTitle}>Gender Distribution</Text>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={genderData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label
                        >
                            {genderData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </View>

            {/* Department Submissions Bar Chart */}
            <View style={styles.chartBox}>
                <Text style={styles.chartTitle}>Department Submissions</Text>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptData}>
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS.teal2} />
                    </BarChart>
                </ResponsiveContainer>
            </View>

            {/* Submission Times Bar Chart */}
            <View style={styles.chartBox}>
                <Text style={styles.chartTitle}>When Raters Submit (by hour)</Text>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={submitData}>
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS.gray} />
                    </BarChart>
                </ResponsiveContainer>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 22, fontWeight: '800', color: UIColors.header, marginBottom: 12 },
    chartBox: { backgroundColor: UIColors.textLight, borderRadius: 12, padding: 16, marginBottom: 18 },
    chartTitle: { fontSize: 16, fontWeight: '700', color: UIColors.accent, marginBottom: 10 },
});
