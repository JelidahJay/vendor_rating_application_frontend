// pages/survey/index.tsx
import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Platform} from 'react-native';
import {
    getSurveyResponsesGroupedByDepartment,
    assignMultipleSurveys,
    getVendors,
    getRaters,
    getPendingSurveys
} from '../../services/api';
import CustomModalForm from '../../components/CustomModalForm';
import UIColors from '../../constants/UIColors';
import {CopyButton} from "../../components/ActionButtons";
import Swal from "sweetalert2";

export default function SurveyScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [surveyData, setSurveyData] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [raters, setRaters] = useState([]);
    const [pendingSurveys, setPendingSurveys] = useState([]);
    const [formData, setFormData] = useState({ vendor_id: '', user_ids: [], invited_by_user_id: 1, valid_days: '7' });

    useEffect(() => {
        fetchGroupedSurveyData();
        fetchVendors();
        fetchRaters();
        fetchPending();
    }, []);

    const fetchGroupedSurveyData = async () => {
        try {
            const data = await getSurveyResponsesGroupedByDepartment();
            setSurveyData(data);
        } catch (error) {
            console.error('Error fetching grouped survey data:', error);
        }
    };

    const fetchVendors = async () => {
        try {
            const data = await getVendors();
            console.log('The vendors we have so far ',data);
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const fetchRaters = async () => {
        try {
            const data = await getRaters();
            setRaters(data);
        } catch (error) {
            console.error('Error fetching raters:', error);
        }
    };

    const fetchPending = async () => {
        try {
            const data = await getPendingSurveys();
            setPendingSurveys(data);
        } catch (error) {
            console.error('Error fetching pending surveys:', error);
        }
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'user_ids'
                ? (Array.isArray(value) ? value : [value])
                : value
        }));
    };

    const [submitting, setSubmitting] = useState(false);

    const handleAssign = async () => {
        // ---- basic validation ----
        if (!formData.vendor_id) {
            if (Platform.OS === "web") {
                await Swal.fire({
                    icon: "warning",
                    title: "Validation",
                    text: "Please select a vendor.",
                    confirmButtonText: "OK",
                });
            } else {
                Alert.alert("Validation", "Please select a vendor.");
            }
            return;
        }
        if (!formData.user_ids || formData.user_ids.length === 0) {
            if (Platform.OS === "web") {
                Swal.fire({
                    icon: "warning",
                    title: "Validation",
                    text: "Please select at least one user.",
                    confirmButtonText: "OK",
                });
            } else {
                Alert.alert("Validation", "Please select at least one user.");
            }
            return;
        }

        const payload = {
            vendor_id: parseInt(String(formData.vendor_id), 10),
            user_ids: (formData.user_ids || []).map(id => parseInt(String(id), 10)),
            invited_by_user_id: formData.invited_by_user_id,
            valid_days: parseInt(String(formData.valid_days), 10),
        };

        // build user names (handle string/number mismatch)
        const selectedUserIdSet = new Set((formData.user_ids || []).map(x => String(x)));
        const userNames = raters
            .filter(r => selectedUserIdSet.has(String(r.user_id)))
            .map(r => r.full_name)
            .join(', ');

        // show vendor name + service in confirm
        const vendorOptions = vendors.map(v => ({
            value: String(v.vendor_id),
            label: v.name,
            subLabel: v.product_service || '',
        }));
        const selectedVendor = vendorOptions.find(o => String(o.value) === String(formData.vendor_id));
        const vendorDisplay = selectedVendor ? `${selectedVendor.label} — ${selectedVendor.subLabel}` : 'Selected Vendor';

        const confirmMessage = `Assign ${vendorDisplay} survey to:\n${userNames}\nValid for ${formData.valid_days} days?`;
        const confirmed = Platform.OS === 'web' ? window.confirm(confirmMessage) : true;
        if (!confirmed) return;

        try {
            setSubmitting(true);
            console.log('📤 Payload to be sent:', payload);
            await assignMultipleSurveys(payload);

            // ✅ reset form & close modal
            setFormData({ vendor_id: '', user_ids: [], invited_by_user_id: 1, valid_days: '7' });
            setModalVisible(false);

            // refresh lists
            await Promise.all([fetchGroupedSurveyData(), fetchPending()]);

            Platform.OS === 'web'
                ? Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Surveys assigned successfully.',
                    confirmButtonText: 'OK',
                })
                : Alert.alert('Success', 'Surveys assigned successfully.');
        } catch (error) {
            Platform.OS === 'web'
                ? Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to assign surveys.',
                    confirmButtonText: 'OK',
                })
                : Alert.alert('Error', 'Failed to assign surveys.');
        } finally {
            setSubmitting(false);
        }

    };

    // build options with name + service
    const vendorOptions = vendors.map(v => ({
        value: String(v.vendor_id),
        label: v.name,                        // main line
        subLabel: v.product_service || '',    // second line
        searchKey: `${v.name} ${v.product_service || ''}`.toLowerCase(), // for search
    }));

    const userOptions   = raters.map(u => ({ label: u.full_name, value: String(u.user_id) }));

    const surveyFields = [
        {
            name: 'vendor_id',
            label: 'Select Vendor',
            type: 'searchable-select',
            options: vendorOptions,
            searchPlaceholder: 'Search vendors (name or service)…',
        },
        {
            name: 'user_ids',
            label: 'Select Users',
            type: 'searchable-select',
            options: userOptions,
            isMulti: true,
            searchPlaceholder: 'Search users',
        },
        {
            name: 'valid_days',
            label: 'Valid For (Days)',
            type: 'input',
            placeholder: '7',
        }
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Survey Assignment & Results</Text>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <Text style={{ color: UIColors.textLight }}>Assign Surveys</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.subTitle}>Completed Surveys:</Text>
            {surveyData.length === 0 ? (
                <Text style={styles.emptyText}>No completed surveys found.</Text>
            ) : (
                <View>
                    <View style={styles.tableHeader}>
                        <Text style={styles.headerCell}>Rater</Text>
                        <Text style={styles.headerCell}>Vendor</Text>
                        <Text style={styles.headerCell}>Date</Text>
                    </View>
                    {surveyData.flatMap((dept) => dept.surveys).map((s, i, arr) => {
                        const isLast = i === arr.length - 1;
                        return (
                            <View key={i} style={[styles.tableRow, isLast && styles.tableRowLast]}>
                                <Text style={styles.cell}>{s.rater_name}</Text>
                                <Text style={styles.cell}>{s.vendor_name}</Text>
                                <Text style={styles.cell}>{new Date(s.submitted_at).toLocaleDateString()}</Text>
                            </View>
                        );
                    })}
                </View>
            )}

            <Text style={styles.subTitle}>Pending Surveys:</Text>
            {pendingSurveys.length === 0 ? (
                <Text style={styles.emptyText}>None</Text>
            ) : (
                <View>
                    <View style={styles.tableHeader}>
                        <Text style={styles.headerCell}>Rater</Text>
                        <Text style={styles.headerCell}>Vendor</Text>
                        <Text style={styles.headerCell}>Valid Until</Text>
                        <Text style={styles.headerCell}>Action</Text>
                    </View>
                    {pendingSurveys.map((s, i) => {
                        const isLast = i === pendingSurveys.length - 1;
                        const url = `${window.location.origin}/survey/fill/${s.token}`;
                        return (
                            <View key={i} style={[styles.tableRow, isLast && styles.tableRowLast]}>
                                <Text style={styles.cell}>{s.rater_name}</Text>
                                <Text style={styles.cell}>{s.vendor_name}</Text>
                                <Text style={styles.cell}>{new Date(s.valid_until).toLocaleDateString()}</Text>
                                <View style={[styles.cell, { alignItems: 'flex-start' }]}>
                                    <CopyButton onPress={() => navigator.clipboard.writeText(url)} />
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}

            <CustomModalForm
                visible={modalVisible}
                title="Assign Survey to Users"
                fields={surveyFields}
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleAssign}
                onCancel={() => setModalVisible(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: UIColors.background, marginLeft: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: UIColors.header },
    button: { backgroundColor: UIColors.primary, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
    subTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: UIColors.accent },

    // unified rounded table header
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: UIColors.header,
        padding: 8,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    headerCell: { flex: 1, fontWeight: 'bold', color: UIColors.textLight, fontSize: 14 },

    // rows share style; last row gets rounded bottom
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        backgroundColor: UIColors.textLight,
    },
    tableRowLast: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
    },
    cell: { flex: 1, fontSize: 14, color: UIColors.textPrimary },

    emptyText: { fontStyle: 'italic', color: 'gray' },
});
