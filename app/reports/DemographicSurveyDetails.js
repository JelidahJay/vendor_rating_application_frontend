import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import UIColors from '../../constants/UIColors';

const COLORS = {
    male: UIColors.primary,        // deep indigo (4B49AC)
    female: UIColors.chartPoor,    // coral/red from charts palette
    bar: UIColors.primary,         // main bars
    barAlt: UIColors.chartNeutral, // secondary bars (light gray/blue)
    axis: '#9aa4b2',               // subtle axis color
};


export default function DemographicSurveyDetails({ completed }) {
    /* --- Gender Data (static for now, replace with real later) --- */
    const genderData = useMemo(
        () => [
            { name: 'Male', value: 2, color: COLORS.male },
            { name: 'Female', value: 1, color: COLORS.female },
        ],
        []
    );


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
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {genderData.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(v) => [v, 'Count']} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>

            </View>

            {/* Department Submissions Bar Chart */}
            <View style={styles.chartBox}>
                <Text style={styles.chartTitle}>Department Submissions</Text>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.axis} />
                        <XAxis dataKey="name" tick={{ fill: COLORS.axis }} tickMargin={8} />
                        <YAxis allowDecimals={false} tick={{ fill: COLORS.axis }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS.bar} barSize={24} radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>

            </View>

            {/* Submission Times Bar Chart */}
            <View style={styles.chartBox}>
                <Text style={styles.chartTitle}>When Raters Submit (by hour)</Text>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={submitData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.axis} />
                        <XAxis dataKey="name" tick={{ fill: COLORS.axis }} tickMargin={8} />
                        <YAxis allowDecimals={false} tick={{ fill: COLORS.axis }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS.barAlt} barSize={22} radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 22, fontWeight: '800', color: UIColors.header, marginBottom: 12 },
    chartBox: {
        backgroundColor: UIColors.textLight,
        borderRadius: 12,
        padding: 16,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    chartTitle: { fontSize: 16, fontWeight: '700', color: UIColors.accent, marginBottom: 10 },
});
