// pages/reports/index.js
import React, { useEffect, useMemo, useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Platform} from 'react-native';
import UIColors from '../../constants/UIColors';
import { getVendors, getVendorSurveyDetails } from '../../services/api';
import DemographicSurveyDetails from './DemographicSurveyDetails';
import * as XLSX from "xlsx";

/* ================= small atoms ================= */

const Label = ({ children, style }) => (
    <Text style={[{ color: UIColors.textSecondary, fontSize: 12 }, style]}>{children}</Text>
);

// Left-column “each option is its own bar”
function OptionBar({ label, pct, color }) {
    const widthPct = Math.max(0, Math.min(100, pct));
    return (
        <View style={styles.optionRowLine}>
            <Text style={styles.optionLabel} numberOfLines={1}>{label}</Text>
            <View style={styles.barOuter}>
                <View style={[styles.barFill, { width: `${widthPct}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.optionPct}>{Math.round(widthPct)}%</Text>
        </View>
    );
}

// Right-column compact stacked bar (one bar per question)
function StackedBar({ segments }) {
    const total = Math.max(1, segments.reduce((s, seg) => s + (Number.isFinite(seg.pct) ? seg.pct : 0), 0));
    return (
        <View style={{ marginTop: 8 }}>
            <View style={styles.stackedOuter}>
                {segments.map((seg, i) => (
                    <View
                        key={seg.key ?? i}
                        style={[
                            styles.stackedSeg,
                            {
                                width: `${Math.max(0, Math.min(100, (seg.pct * 100) / total))}%`,
                                backgroundColor: seg.color,
                            },
                        ]}
                    />
                ))}
            </View>
            <View style={styles.legendRow}>
                {segments.map((seg, i) => (
                    <View key={`lg-${seg.key ?? i}`} style={styles.legendItem}>
                        <View style={[styles.legendSwatch, { backgroundColor: seg.color }]} />
                        <Text style={styles.legendText}>{seg.label} — {Math.round(seg.pct)}%</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

/* ================= palette & legend ================= */

const COLORS = {
    red2:  '#ef4444', // poor
    gray:  '#cbd5e1', // neutral
    teal2: '#26a69a', // good
    teal3: '#00796b', // very good
};

const LEGEND = [
    { label: 'High (4–5) / Yes', color: COLORS.teal3 },
    { label: 'Medium (3)',       color: COLORS.gray  },
    { label: 'Low (1–2) / No',   color: COLORS.red2  },
];

const colorForScore = (n) => {
    if (n <= 2) return COLORS.red2;
    if (n === 3) return COLORS.gray;
    if (n === 4) return COLORS.teal2;
    return COLORS.teal3; // 5
};

/* ================= shaping (Survey dashboard) ================= */

const YES = new Set(['yes','y','true']);
const toLower = (s) => (s ?? '').toString().trim().toLowerCase();
const isYes = (a) => YES.has(toLower(a));
const toInt = (a) => {
    const n = parseInt((a ?? '').toString().trim(), 10);
    return Number.isFinite(n) ? n : NaN;
};

const QUESTION_CONFIG = {
    3:  { title: 'Product/service of good quality?', kind: 'yesno' },
    4:  { title: 'Specifications met?',              kind: 'yesno' },
    5:  { title: 'Quality overall',                  kind: 'rating' },
    6:  { title: 'Deliveries made on time?',         kind: 'yesno' },
    7:  { title: 'Timeliness of the supplier',       kind: 'rating' },
    8:  { title: 'Delays — communication notes',     kind: 'text'   },
    9:  { title: 'Supplier’s communication',         kind: 'rating' },
    10: { title: 'Inquiries answered promptly?',     kind: 'yesno' },
    11: { title: 'Responsiveness overall',           kind: 'categorical' },
};

const Q11_SCORE = {
    'very poor': 1, 'poor': 2,
    'fair': 3, 'average': 3, 'moderate': 3,
    'good': 4,
    'very good': 5, 'excellent': 5,
};

function pct(n, d){ return d > 0 ? (n * 100) / d : 0; }

// Returns, per question, both render forms:
//   leftRows: [{label, pct, color}], rightStack: [{label, pct, color}]
function buildQuestionItems(completed) {
    // bucket answers by qid
    const bucket = new Map();
    completed.forEach(s => {
        (s.answers || []).forEach(a => {
            const arr = bucket.get(a.question_id) || [];
            arr.push((a.answer ?? '').toString().trim());
            bucket.set(a.question_id, arr);
        });
    });

    const yesNo = (qid, yesLabel='Yes', noLabel='No') => {
        const cfg = QUESTION_CONFIG[qid]; if (!cfg) return null;
        const arr = bucket.get(qid) || [];
        const y = arr.filter(isYes).length;
        const n = arr.length - y;
        const rows = [
            { label: yesLabel, pct: Math.round(pct(y, arr.length)), color: COLORS.teal3 },
            { label: noLabel,  pct: Math.round(pct(n, arr.length)), color: COLORS.red2  },
        ];
        return { title: cfg.title, leftRows: rows, rightStack: rows };
    };

    const rating = (qid) => {
        const cfg = QUESTION_CONFIG[qid]; if (!cfg) return null;
        const nums = (bucket.get(qid) || []).map(toInt).filter(n => n>=1 && n<=5);
        const total = nums.length;
        const counts = [1,2,3,4,5].map(v => nums.filter(x => x===v).length);

        // left: each score 1..5 is a row
        const leftRows = counts.map((c, i) => ({
            label: String(i+1), pct: Math.round(pct(c,total)), color: colorForScore(i+1),
        }));

        // right: banded stacked (Low / Medium / High)
        const low = counts[0] + counts[1];
        const med = counts[2];
        const high = counts[3] + counts[4];
        const rightStack = [
            { label: 'Low (1–2)',  pct: Math.round(pct(low,total)),  color: COLORS.red2  },
            { label: 'Medium (3)', pct: Math.round(pct(med,total)),  color: COLORS.gray  },
            { label: 'High (4–5)', pct: Math.round(pct(high,total)), color: COLORS.teal3 },
        ];

        return { title: cfg.title, leftRows, rightStack };
    };

    const categorical = (qid) => {
        const cfg = QUESTION_CONFIG[qid]; if (!cfg) return null;
        const arr = bucket.get(qid) || [];
        const total = arr.length;
        const map = new Map();
        arr.forEach(a => { if(a){ map.set(a, (map.get(a)||0)+1); }});
        const rows = Array.from(map.entries()).map(([label,count])=>{
            const s = Q11_SCORE[(label||'').toLowerCase()];
            return { label, pct: Math.round(pct(count,total)), color: s ? colorForScore(s) : COLORS.gray };
        });
        return { title: cfg.title, leftRows: rows, rightStack: rows };
    };

    // comments for Q8
    const comments = (bucket.get(8) || []).filter(Boolean).slice(0,6);

    const sections = [
        { heading: 'Quality',        items: [ yesNo(3), rating(5), yesNo(4) ].filter(Boolean) },
        { heading: 'Delivery',       items: [ yesNo(6), rating(7) ].filter(Boolean) },
        { heading: 'Communication',  items: [ rating(9), yesNo(10), categorical(11) ].filter(Boolean) },
    ];

    return { sections, comments };
}

// ---- Build flat rows for the detailed "Responses" export
const buildResponseRows = (completedList = []) => {
    // columns: survey_id, raterName, raterEmail, submittedAt, Q1..Q11 (by id)
    const maxQ = 11;
    return completedList.map(s => {
        const row = {
            vendor_id: s.vendor_id ?? '',
            survey_id: s.survey_id ?? '',
            rater_name: s.raterName ?? '',
            rater_email: s.raterEmail ?? '',
            submitted_at: s.submittedAt ?? '',
        };
        for (let i = 1; i <= maxQ; i++) {
            const a = (s.answers || []).find(x => x.question_id === i);
            row[`Q${i}`] = a ? a.answer : '';
        }
        return row;
    });
};

// ---- Pack the KPI/summary you already computed on-screen
const buildSummaryRow = () => {
    // You already have: respondentCount, sections/comments, and the per-question breakdown
    // Compute a single “overall” like the earlier method (avg of band “scores”).
    // We’ll just reuse leftRows of scoring questions to estimate an overall.
    const scoreFromLabel = (label) => {
        const m = String(label || '').trim();
        if (m === 'Yes') return 5;
        if (m === 'No') return 1;
        const n = parseInt(m, 10);
        if (Number.isFinite(n)) return Math.max(1, Math.min(5, n));
        if (/high/i.test(m)) return 5;
        if (/medium/i.test(m)) return 3;
        if (/low/i.test(m)) return 1;
        return 0; // categorical fallback
    };

    // Average across all available “leftRows” percentages
    let total = 0, weight = 0;
    sections.forEach(sec => {
        sec.items.forEach(it => {
            (it.leftRows || []).forEach(r => {
                const s = scoreFromLabel(r.label);
                if (s > 0 && Number.isFinite(r.pct)) {
                    total += s * r.pct;
                    weight += r.pct;
                }
            });
        });
    });
    const overall = weight > 0 ? (total / weight) : 0;

    // Pull some of the key KPIs you show (map by titles)
    const findItem = (t) => {
        for (const sec of sections) {
            const found = sec.items.find(i => i.title === t);
            if (found) return found;
        }
        return null;
    };
    const yesPct = (item) => {
        if (!item) return 0;
        const row = (item.leftRows || []).find(r => r.label === 'Yes');
        return row ? row.pct : 0;
    };
    const avgFrom1to5 = (item) => {
        if (!item) return 0;
        let sum = 0, countPct = 0;
        (item.leftRows || []).forEach(r => {
            const n = parseInt(r.label, 10);
            if (Number.isFinite(n)) {
                sum += (n * (r.pct || 0));
                countPct += (r.pct || 0);
            }
        });
        return countPct > 0 ? (sum / countPct) : 0;
    };

    const qualityYes = yesPct(findItem('Product/service of good quality?'));
    const specsYes   = yesPct(findItem('Specifications met?'));
    const qualityAvg = avgFrom1to5(findItem('Quality overall'));
    const onTimeYes  = yesPct(findItem('Deliveries made on time?'));
    const timelyAvg  = avgFrom1to5(findItem('Timeliness of the supplier'));
    const commsAvg   = avgFrom1to5(findItem('Supplier’s communication'));
    const inquiriesYes = yesPct(findItem('Inquiries answered promptly?'));

    // Date range text
    const rangeText = [
        filters.from ? `from ${filters.from}` : '',
        filters.to   ? `to ${filters.to}`     : ''
    ].filter(Boolean).join(' ');

    // A simple “risk” and “recommendation” placeholder
    const riskFlag = overall < 3 ? 'Underperformance risk' : '';
    const recommendation = overall < 3 ? 'Improvement plan' : 'Renew / Maintain';

    return {
        vendor_id: vendorId,
        vendor_name: (vendors.find(v => String(v.vendor_id) === String(vendorId)) || {}).name || '',
        date_range: rangeText || 'All time',
        respondents: respondentCount,
        overall_score: Number(overall.toFixed(2)),
        quality_yes_pct: qualityYes,
        specifications_yes_pct: specsYes,
        quality_avg: Number(qualityAvg.toFixed(2)),
        ontime_yes_pct: onTimeYes,
        timeliness_avg: Number(timelyAvg.toFixed(2)),
        communication_avg: Number(commsAvg.toFixed(2)),
        inquiries_yes_pct: inquiriesYes,
        risk_indicators: riskFlag,
        recommendations: recommendation,
        comments_sample: (comments || []).slice(0, 5).join(' | ')
    };
};


/* ================= page ================= */

export default function ReportsPage() {

    const [tab, setTab] = useState('demo');
    const [vendors, setVendors] = useState([]);
    const [vendorId, setVendorId] = useState('');
    const [filters, setFilters] = useState({ from: '', to: '', department_id: '' });

    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState(null); // {completed, pending}

    useEffect(() => {
        (async () => {
            try {
                const v = await getVendors();
                setVendors(v || []);
            } catch (e) {
                console.error('Failed to fetch vendors', e);
            }
        })();
    }, []);

    const vendorOptions = useMemo(() => (vendors || []).map(v => ({
        value: String(v.vendor_id),
        label: v.name,
        subLabel: v.product_service || ''
    })), [vendors]);

    useEffect(() => {
        if (!vendorId) return;
        (async () => {
            setLoading(true);
            try {
                const det = await getVendorSurveyDetails(vendorId);
                setDetails(det || null);
            } catch (e) {
                console.error('[DEBUG] survey-details error:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [vendorId]);

    // client-side date/department filter
    const completed = useMemo(() => {
        if (!details) return [];
        const fromTs = filters.from ? Date.parse(filters.from) : NaN;
        const toTs   = filters.to   ? Date.parse(filters.to)   : NaN;
        const deptId = filters.department_id ? String(filters.department_id).trim() : '';
        return (details.completed || []).filter(s => {
            const t = Date.parse(s.submittedAt);
            if (!Number.isNaN(fromTs) && !(t >= fromTs)) return false;
            if (!Number.isNaN(toTs)   && !(t <= toTs))   return false;
            if (deptId && String(s.rater_department_id || '') !== deptId) return false;
            return true;
        });
    }, [details, filters]);

    const respondentCount = completed.length;
    const { sections, comments } = useMemo(
        () => buildQuestionItems(completed),
        [completed]
    );

    // ---- CSV export (works on web; in native you’d route through Share or FS)
    const downloadCSV = () => {
        const rows = buildResponseRows(completed);
        if (!rows.length) {
            alert('No data to export.');
            return;
        }
        // Build CSV
        const headers = Object.keys(rows[0]);
        const lines = [
            headers.join(','),
            ...rows.map(r => headers.map(h => {
                const v = r[h] ?? '';
                const needsQuotes = /[",\n]/.test(String(v));
                const safe = String(v).replace(/"/g, '""');
                return needsQuotes ? `"${safe}"` : safe;
            }).join(','))
        ];
        const csv = lines.join('\n');

        if (Platform.OS === 'web') {
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vendor_${vendorId}_responses.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            console.log('[CSV]\n', csv); // fallback; wire to RN FS/Share if needed
        }
    };

// ---- Excel export (.xlsx) with multiple sheets
    const downloadExcel = () => {
        // Sheet 1: Summary (single row)
        const summary = [buildSummaryRow()];

        // Sheet 2: Responses (one row per survey)
        const responses = buildResponseRows(completed);

        // Sheet 3: Distributions (what the dashboard shows)
        const distRows = [];
        sections.forEach(sec => {
            sec.items.forEach(it => {
                // each option row becomes a record
                (it.leftRows || []).forEach(r => {
                    distRows.push({
                        section: sec.heading,
                        question: it.title,
                        option: r.label,
                        percent: r.pct
                    });
                });
            });
        });

        if (!responses.length && !distRows.length) {
            alert('No data to export.');
            return;
        }

        const wb = XLSX.utils.book_new();
        const ws1 = XLSX.utils.json_to_sheet(summary);
        const ws2 = XLSX.utils.json_to_sheet(responses);
        const ws3 = XLSX.utils.json_to_sheet(distRows);

        XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
        XLSX.utils.book_append_sheet(wb, ws2, 'Responses');
        XLSX.utils.book_append_sheet(wb, ws3, 'Distributions');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        if (Platform.OS === 'web') {
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vendor_${vendorId}_report.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            console.log('[XLSX bytes]', wbout.byteLength); // hook up to RN FS/Share if needed
        }
    };

    return (
        <View style={styles.shell}>
            {/* Sidebar */}
            <View style={styles.sidebar}>
                <Text style={styles.sideTitle}>Filters</Text>

                <Text style={styles.sideLabel}>Vendor</Text>
                <VendorSearch
                    options={vendorOptions}
                    value={vendorId}
                    onChange={(val) => setVendorId(String(val))}
                />

                <Text style={[styles.sideLabel, { marginTop: 12 }]}>From (YYYY-MM-DD)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={UIColors.textSecondary}
                    value={filters.from}
                    onChangeText={(t) => setFilters({ ...filters, from: t })}
                />

                <Text style={[styles.sideLabel, { marginTop: 8 }]}>To (YYYY-MM-DD)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={UIColors.textSecondary}
                    value={filters.to}
                    onChangeText={(t) => setFilters({ ...filters, to: t })}
                />

                <Text style={[styles.sideLabel, { marginTop: 8 }]}>Department ID (optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 12"
                    placeholderTextColor={UIColors.textSecondary}
                    value={filters.department_id}
                    onChangeText={(t) => setFilters({ ...filters, department_id: t })}
                />

                {/* Legend */}
                <View style={{ marginTop: 14 }}>
                    <Text style={styles.sideLabel}>Legend</Text>
                    {LEGEND.map((l, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                            <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: l.color }} />
                            <Text style={{ color: UIColors.textSecondary, fontSize: 12 }}>{l.label}</Text>
                        </View>
                    ))}
                </View>

                {loading && <Label style={{ marginTop: 12 }}>Loading…</Label>}
            </View>

            {/* Main */}
            <ScrollView style={styles.main}>
                {/* TABS */}
                <View style={styles.tabs}>
                    <TouchableOpacity onPress={() => setTab('demo')} style={[styles.tab, tab==='demo' && styles.tabActive]}>
                        <Text style={[styles.tabText, tab==='demo' && styles.tabTextActive]}>Demographic Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setTab('survey')} style={[styles.tab, tab==='survey' && styles.tabActive]}>
                        <Text style={[styles.tabText, tab==='survey' && styles.tabTextActive]}>Survey Dashboard</Text>
                    </TouchableOpacity>
                </View>

                {/* DEMOGRAPHIC DASHBOARD */}
                {tab === 'demo' && (
                    <DemographicSurveyDetails completed={completed} />
                )}

                {/* SURVEY DASHBOARD */}
                {tab === 'survey' && (
                    <>
                        <Text style={styles.title}>Survey Dashboard</Text>
                        <Text style={{ color: UIColors.textSecondary, marginBottom: 8 }}>
                            Respondents in range: <Text style={{ color: UIColors.textPrimary, fontWeight: '700' }}>{respondentCount}</Text>
                        </Text>

                        {sections.map(sec => (
                            <View key={sec.heading} style={styles.sectionBlock}>
                                <Text style={styles.sectionTitle}>{sec.heading}</Text>

                                {sec.items.length === 0 && <Label>No data</Label>}

                                {sec.items.map((it, idx) => (
                                    <View key={`${sec.heading}-${idx}`} style={styles.rowTwoCols}>
                                        {/* Left (option rows) */}
                                        <View style={styles.tile}>
                                            <Text style={styles.itemTitle}>{it.title}</Text>
                                            {it.leftRows.map((r, i) => (
                                                <OptionBar key={`l-${i}`} label={r.label} pct={r.pct} color={r.color} />
                                            ))}
                                        </View>

                                        {/* Right (stacked) */}
                                        <View style={styles.tile}>
                                            <Text style={styles.itemTitle}>{it.title}</Text>
                                            <StackedBar segments={it.rightStack} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}

                        {/* Comments */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Delay Communication — Comments</Text>
                            {comments && comments.length ? (
                                comments.map((c, i) => (
                                    <Text key={i} style={{ color: UIColors.textSecondary, marginBottom: 6 }}>• {c}</Text>
                                ))
                            ) : (
                                <Label>No comments</Label>
                            )}
                        </View>

                        {/* Respondents table */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Respondents</Text>
                            {(completed || []).length ? (
                                <View>
                                    <View style={styles.tableHead}>
                                        <Text style={[styles.th, { flex: 1.2 }]}>Name</Text>
                                        <Text style={[styles.th, { flex: 1.4 }]}>Email</Text>
                                        <Text style={[styles.th, { flex: 1 }]}>Submitted</Text>
                                        <Text style={[styles.th, { width: 70, textAlign: 'right' }]}>Answers</Text>
                                    </View>
                                    {completed.map(r => (
                                        <View key={r.survey_id} style={styles.tr}>
                                            <Text style={[styles.td, { flex: 1.2 }]}>{r.raterName}</Text>
                                            <Text style={[styles.td, { flex: 1.4 }]}>{r.raterEmail}</Text>
                                            <Text style={[styles.td, { flex: 1 }]}>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '-'}</Text>
                                            <Text style={[styles.td, { width: 70, textAlign: 'right' }]}>{(r.answers || []).length}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Label>No respondents in the selected range.</Label>
                            )}
                        </View>
                        <Text style={styles.title}>Survey Dashboard</Text>
                        <Text style={{ color: UIColors.textSecondary, marginBottom: 8 }}>
                            Respondents in range:{' '}
                            <Text style={{ color: UIColors.textPrimary, fontWeight: '700' }}>{respondentCount}</Text>
                        </Text>

                        {/* Export actions */}
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                            <TouchableOpacity onPress={downloadCSV} style={styles.exportBtn}>
                                <Text style={styles.exportText}>Download CSV</Text>
                            </TouchableOpacity>
{/*                            <TouchableOpacity onPress={downloadExcel} style={styles.exportBtn}>
                                <Text style={styles.exportText}>Download Excel</Text>
                            </TouchableOpacity>*/}
                        </View>

                    </>
                )}
            </ScrollView>
        </View>
    );
}

/* ================= vendor search ================= */

function VendorSearch({ options, value, onChange }) {
    const [q, setQ] = useState('');
    const filtered = useMemo(() => {
        const s = (q || '').trim().toLowerCase();
        if (!s) return options.slice(0, 20);
        return options
            .filter(o =>
                (o.label || '').toLowerCase().includes(s) ||
                (o.subLabel || '').toLowerCase().includes(s)
            )
            .slice(0, 20);
    }, [q, options]);

    const selected = options.find(o => String(o.value) === String(value));
    return (
        <View>
            <TextInput
                placeholder="Search vendors…"
                value={q}
                onChangeText={setQ}
                placeholderTextColor={UIColors.textSecondary}
                style={styles.input}
            />
            {selected && (
                <Label style={{ marginTop: 4 }}>
                    Selected: {selected.label} — {selected.subLabel}
                </Label>
            )}
            <View style={[styles.listBox, { marginTop: 8, maxHeight: 260 }]}>
                {filtered.map(opt => (
                    <TouchableOpacity
                        key={String(opt.value)}
                        onPress={() => onChange(opt.value)}
                        style={[
                            styles.optionRowSel,
                            String(value) === String(opt.value) && styles.optionRowSelected,
                        ]}
                    >
                        <Text style={{ color: UIColors.textPrimary, fontWeight: '600' }}>
                            {opt.label}
                        </Text>
                        {!!opt.subLabel && (
                            <Text style={{ color: UIColors.textSecondary, fontSize: 12, marginTop: 2 }}>
                                {opt.subLabel}
                            </Text>
                        )}
                    </TouchableOpacity>
                ))}
                {filtered.length === 0 && (
                    <Text style={{ padding: 10, color: UIColors.textSecondary }}>No matches.</Text>
                )}
            </View>
        </View>
    );
}

/* ================= styles ================= */

const styles = StyleSheet.create({
    shell: { flex: 1, flexDirection: 'row', backgroundColor: UIColors.background },

    sidebar: {
        width: 280,
        paddingVertical: 18,
        paddingHorizontal: 14,
        borderRightWidth: 1,
        borderRightColor: '#e6e6e6',
        backgroundColor: '#fbfbfb',
        gap: 6,
    },
    sideTitle: { fontSize: 16, fontWeight: '800', color: UIColors.header, marginBottom: 8 },
    sideLabel: { fontSize: 12, color: UIColors.textSecondary, marginTop: 4 },

    main: { flex: 1, padding: 18 },

    tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#e8f1f1' },
    tabActive: { backgroundColor: UIColors.primary },
    tabText: { color: UIColors.textPrimary, fontWeight: '600' },
    tabTextActive: { color: UIColors.textLight },

    title: { fontSize: 22, fontWeight: '800', color: UIColors.header, marginBottom: 8 },

    input: {
        borderWidth: 1, borderColor: '#dcdcdc', borderRadius: 8, padding: 8,
        backgroundColor: UIColors.textLight, color: UIColors.textPrimary
    },
    listBox: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, overflow: 'hidden' },
    optionRowSel: {
        paddingVertical: 8, paddingHorizontal: 10, backgroundColor: UIColors.textLight,
        borderBottomWidth: 1, borderBottomColor: '#f2f2f2'
    },
    optionRowSelected: { backgroundColor: '#e7f7f7' },

    sectionBlock: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: UIColors.accent, marginBottom: 8 },

    rowTwoCols: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    tile: { flex: 1, backgroundColor: UIColors.textLight, borderRadius: 10, padding: 12 },

    card: { backgroundColor: UIColors.textLight, borderRadius: 12, padding: 14, marginBottom: 14 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: UIColors.accent, marginBottom: 8 },
    itemTitle: { fontWeight: '700', color: UIColors.textPrimary },

    // Option rows
    optionRowLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
    optionLabel: { width: 160, color: UIColors.textPrimary, fontSize: 13 },
    barOuter: { flex: 1, height: 12, borderRadius: 6, backgroundColor: '#edf2f2', overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 6 },
    optionPct: { width: 48, textAlign: 'right', color: UIColors.textSecondary, fontSize: 12 },

    // Stacked bars
    stackedOuter: { height: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: '#eef2f2', flexDirection: 'row' },
    stackedSeg: { height: '100%' },
    legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendSwatch: { width: 10, height: 10, borderRadius: 3 },
    legendText: { color: UIColors.textSecondary, fontSize: 12 },

    tableHead: { flexDirection: 'row', paddingVertical: 6, backgroundColor: UIColors.header, borderRadius: 6, marginTop: 4, marginBottom: 6, paddingHorizontal: 8 },
    th: { color: UIColors.textLight, fontWeight: '700', fontSize: 12 },
    tr: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee', paddingHorizontal: 8 },
    td: { color: UIColors.textPrimary, fontSize: 13 },

    exportBtn: {
        backgroundColor: UIColors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8
    },
    exportText: { color: UIColors.textLight, fontWeight: '600' },
});
