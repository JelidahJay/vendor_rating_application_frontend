import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { getVendors, getVendorSurveyDetails } from '../../services/api';
import UIColors from '../../constants/UIColors';

/* ---------- helpers (JS only) ---------- */
const safeNum = (n, d = 0) => (Number.isFinite(+n) ? +n : d);
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const band = (n) => (n >= 4 ? 'High' : n === 3 ? 'Medium' : 'Low');

/* ---------- page ---------- */
export default function DashboardLanding() {
    const [loading, setLoading] = useState(true);
    const [vendors, setVendors] = useState([]);
    const [details, setDetails] = useState({}); // vendorId -> details

    useEffect(() => {
        (async () => {
            try {
                const v = await getVendors();
                const list = Array.isArray(v) ? v : [];
                setVendors(list);

                // fetch each vendor’s details (responses)
                const map = {};
                for (const ven of list) {
                    try {
                        const det = await getVendorSurveyDetails(ven.vendor_id);
                        map[ven.vendor_id] = det || {};
                    } catch {
                        /* ignore one-off failures */
                    }
                }
                setDetails(map);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ---------- derive metrics ---------- */
    const {
        totalAssigned, totalResponses, raterSet, vendorsRated,
        topVendors, lineSeries, barSeries, top6Detailed, donutSegs
    } = useMemo(() => {
        let totalAssigned = 0;
        let totalResponses = 0;
        const raters = new Set();
        let vendorsRated = 0;

        // collect rating summaries
        const ratingRows = []; // { vendor_id, name, avgRating, responses }
        const dailyCount = new Map(); // "MM/DD" -> count
        const monthAvgMap = new Map(); // "YYYY-MM" -> [scores]
        const highMedLow = { High: 0, Medium: 0, Low: 0 };

        (vendors || []).forEach((v) => {
            const det = details[v.vendor_id] || {};
            const completed = det.completed || [];
            const pending = det.pending || [];

            totalAssigned += safeNum(completed.length) + safeNum(pending.length);
            totalResponses += safeNum(completed.length);
            if (completed.length) vendorsRated += 1;

            // raters set & time series
            completed.forEach((r) => {
                if (r.raterEmail) raters.add(r.raterEmail);
                const dt = r.submittedAt ? new Date(r.submittedAt) : null;
                if (dt && !Number.isNaN(dt.getTime())) {
                    const label = `${dt.getMonth() + 1}/${dt.getDate()}`;
                    dailyCount.set(label, (dailyCount.get(label) || 0) + 1);
                    const mk = monthKey(dt);
                    const arr = monthAvgMap.get(mk) || [];
                    // prefer Question 5 as overall score
                    const q5 = (r.answers || []).find((a) => a.question_id === 5);
                    const score = safeNum(q5?.answer, 0);
                    monthAvgMap.set(mk, [...arr, score]);
                }
            });

            // vendor avg score
            const allScores = [];
            completed.forEach((r) => {
                const q5 = (r.answers || []).find((a) => a.question_id === 5);
                if (q5) allScores.push(safeNum(q5.answer, 0));
            });
            const av = +avg(allScores).toFixed(2);
            if (completed.length) {
                ratingRows.push({
                    vendor_id: v.vendor_id,
                    name: v.name,
                    avgRating: av,
                    responses: completed.length,
                });
                highMedLow[band(Math.round(av))] += 1;
            }
        });

        // top table
        const topVendors = ratingRows
            .sort((a, b) => b.avgRating - a.avgRating || b.responses - a.responses)
            .slice(0, 7);

        // line: responses over “label” (MM/DD)
        const lineSeries = Array.from(dailyCount.entries())
            .map(([name, value]) => ({ name, value }));

        // bar: avg rating per month
        const barSeries = Array.from(monthAvgMap.entries())
            .sort((a, b) => (a[0] < b[0] ? -1 : 1))
            .map(([name, arr]) => ({ name, value: +avg(arr).toFixed(2) }));

        // detailed top 6 (progress bars)
        const top6Detailed = ratingRows
            .sort((a, b) => b.avgRating - a.avgRating || b.responses - a.responses)
            .slice(0, 6);

        const donutSegs = [
            { name: 'High', value: highMedLow.High, color: UIColors.primary },
            { name: 'Medium', value: highMedLow.Medium, color: UIColors.chartNeutral },
            { name: 'Low', value: highMedLow.Low, color: UIColors.danger },
        ];

        return {
            totalAssigned, totalResponses, raterSet: raters, vendorsRated,
            topVendors, lineSeries, barSeries, top6Detailed, donutSegs,
        };
    }, [vendors, details]);

    return (
        <ScrollView style={styles.container}>
            {/* Row 1: Stat cards + Top Vendors table */}
            <View style={styles.row}>
                <View style={{ flex: 1.4, gap: 14 }}>
                    <View style={styles.cardRow}>
                        <StatCard
                            title="Total Surveys Assigned"
                            value={loading ? '—' : String(totalAssigned)}
                            tint={UIColors.primaryMuted}
                        />
                        <StatCard
                            title="Responses Received"
                            value={loading ? '—' : String(totalResponses)}
                            tint={UIColors.primary}
                            dark
                        />
                    </View>
                    <View style={styles.cardRow}>
                        <StatCard
                            title="Raters"
                            value={loading ? '—' : String(raterSet.size)}
                            tint={UIColors.secondary}
                        />
                        <StatCard
                            title="Vendors Rated"
                            value={loading ? '—' : String(vendorsRated)}
                            tint={UIColors.accent}
                        />
                    </View>
                </View>

                <View style={{ width: 16 }} />

                <View style={{ flex: 1 }}>
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Top Vendors (by rating)</Text>
                        <View style={styles.tableHead}>
                            <Text style={[styles.th, { flex: 1.6 }]}>Vendor</Text>
                            <Text style={[styles.th, { width: 90, textAlign: 'right' }]}>Avg</Text>
                            <Text style={[styles.th, { width: 90, textAlign: 'right' }]}>Responses</Text>
                        </View>
                        {(topVendors.length ? topVendors : new Array(5).fill(null)).map((r, i) => (
                            <View key={i} style={styles.tr}>
                                <Text style={[styles.td, { flex: 1.6 }]}>{r?.name || '—'}</Text>
                                <Text style={[styles.td, { width: 90, textAlign: 'right', fontWeight: '700' }]}>
                                    {r ? r.avgRating.toFixed(2) : '—'}
                                </Text>
                                <Text style={[styles.td, { width: 90, textAlign: 'right' }]}>{r?.responses ?? '—'}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Row 2: Charts */}
            <View style={styles.row}>
                <View style={[styles.panel, { flex: 1 }]}>
                    <Text style={styles.panelTitle}>Responses over time</Text>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={lineSeries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke={UIColors.primary} strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </View>

                <View style={{ width: 16 }} />

                <View style={[styles.panel, { flex: 1 }]}>
                    <Text style={styles.panelTitle}>Average rating per month</Text>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barSeries}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 5]} />
                            <Tooltip />
                            <Bar dataKey="value" fill={UIColors.secondary} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </View>
            </View>

            {/* Row 3: Detailed vendors */}
            <View style={styles.row}>
                <View style={[styles.panel, { flex: 1.4 }]}>
                    <Text style={styles.panelTitle}>Detailed Reports — Top 6 Vendors</Text>
                    {top6Detailed.map((v, i) => (
                        <View key={i} style={styles.progressRow}>
                            <Text style={styles.progressLabel}>{v.name}</Text>
                            <View style={styles.progressTrack}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${(v.avgRating / 5) * 100}%`,
                                            backgroundColor: UIColors.primary,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressVal}>{v.avgRating.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ width: 16 }} />

                <View style={[styles.panel, { flex: 1 }]}>
                    <Text style={styles.panelTitle}>Ratings Mix</Text>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={donutSegs}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                label
                            >
                                {donutSegs.map((s, i) => <Cell key={i} fill={s.color} />)}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </View>
            </View>
        </ScrollView>
    );
}

/* ---------- small components ---------- */
function StatCard({ title, value, tint, dark = false }) {
    return (
        <View style={[styles.statCard, { backgroundColor: tint }]}>
            <Text style={[styles.statTitle, { color: dark ? UIColors.textLight : UIColors.textLight }]}>{title}</Text>
            <Text style={[styles.statValue, { color: dark ? UIColors.textLight : UIColors.textLight }]}>{value}</Text>
            <Text style={[styles.statSub, { color: dark ? UIColors.textLight : UIColors.textLight }]}>30 days</Text>
        </View>
    );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: UIColors.background,
        padding: 18,
        marginLeft: 20,
    },
    row: { flexDirection: 'row', marginBottom: 16 },
    cardRow: { flexDirection: 'row', gap: 14 },
    statCard: {
        flex: 1,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 18,
    },
    statTitle: { fontSize: 13, opacity: 0.95 },
    statValue: { fontSize: 32, fontWeight: '800', marginTop: 6 },
    statSub: { marginTop: 6, fontSize: 12, opacity: 0.9 },

    panel: {
        backgroundColor: UIColors.surface,
        borderRadius: 16,
        padding: 16,
    },
    panelTitle: { fontSize: 16, fontWeight: '800', color: UIColors.accent, marginBottom: 10 },

    tableHead: {
        flexDirection: 'row',
        backgroundColor: UIColors.header,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 6,
    },
    th: { color: UIColors.textLight, fontWeight: '700', fontSize: 12 },
    tr: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    td: { color: UIColors.textPrimary, fontSize: 13 },

    progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    progressLabel: { width: 170, color: UIColors.textPrimary, fontSize: 13 },
    progressTrack: { flex: 1, height: 10, borderRadius: 8, backgroundColor: '#EEF1FF', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 8 },
    progressVal: { width: 48, textAlign: 'right', color: UIColors.textSecondary, fontSize: 12 },
});
