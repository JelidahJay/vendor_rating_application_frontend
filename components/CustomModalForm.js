// components/CustomModalForm.js (plain JS)
import React, { useMemo, useState } from 'react';
import {
    Modal, View, Text, TextInput, StyleSheet,
    TouchableOpacity, ScrollView, FlatList, Platform
} from 'react-native';
import { Picker } from 'react-native-web';
import UIColors from '../constants/UIColors';

export default function CustomModalForm({
                                            visible, title, fields, onSubmit, onCancel, formData, onChange
                                        }) {

    const renderSearchableSelect = (field) => {
        const [q, setQ] = useState('');
        const isMulti = !!field.isMulti;
        const value = formData[field.name];
        const currentArray = Array.isArray(value) ? value : (isMulti ? [] : [value]);
        const selectedSet = new Set(currentArray);

        const filtered = useMemo(() => {
            const needle = (q || '').trim().toLowerCase();
            const source = field.options || [];
            if (!needle) return source;

            const getKey = (o) => (o.searchKey
                || `${o.label || ''} ${o.subLabel || ''}`.toLowerCase());

            return source
                .filter(o => getKey(o).includes(needle))
                .sort((a, b) => {
                    const ka = getKey(a);
                    const kb = getKey(b);
                    const ia = ka.indexOf(needle);
                    const ib = kb.indexOf(needle);
                    return (ia === -1 ? 9999 : ia) - (ib === -1 ? 9999 : ib);
                });
        }, [q, field.options]);


        const toggle = (val) => {
            if (!isMulti) {
                onChange(field.name, val);
                return;
            }
            if (selectedSet.has(val)) {
                onChange(field.name, currentArray.filter(v => String(v) !== String(val)));
            } else {
                onChange(field.name, [...currentArray, val]);
            }
        };

        const renderItem = ({ item }) => {
            const selected = selectedSet.has(item.value);
            return (
                <TouchableOpacity
                    onPress={() => toggle(item.value)}
                    style={[styles.optionRow, selected && styles.optionRowSelected]}
                >
                    <Text style={{ color: UIColors.textPrimary, fontWeight: selected ? '700' : '600' }}>
                        {selected ? '✓ ' : ''}{item.label}
                    </Text>
                    {!!item.subLabel && (
                        <Text style={{ color: UIColors.textSecondary, fontSize: 12, marginTop: 2 }}>
                            {item.subLabel}
                        </Text>
                    )}
                </TouchableOpacity>
            );
        };

        return (
            <View>
                <TextInput
                    value={q}
                    onChangeText={setQ}
                    placeholder={field.searchPlaceholder || 'Search…'}
                    placeholderTextColor={UIColors.textSecondary}
                    style={styles.searchInput}
                />
                <View style={[styles.listBox, { maxHeight: field.maxListHeight || 240 }]}>
                    <FlatList
                        keyboardShouldPersistTaps="handled"
                        data={filtered}
                        keyExtractor={(it) => String(it.value)}
                        renderItem={renderItem}
                    />
                </View>
                {isMulti && Array.isArray(value) && value.length > 0 && (
                    <Text style={styles.selectionHint}>Selected: {value.length}</Text>
                )}
            </View>
        );
    };

    const renderField = (field) => (
        <View key={field.name} style={styles.inputContainer}>
            <Text style={styles.label}>{field.label}</Text>

            {field.type === 'select' && (
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={formData[field.name]}
                        onValueChange={(v) => onChange(field.name, v)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select..." value="" />
                        {(field.options || []).map((option, idx) =>
                            typeof option === 'string'
                                ? <Picker.Item key={idx} label={option} value={option} />
                                : <Picker.Item key={String(option.value)} label={option.label} value={option.value} />
                        )}
                    </Picker>
                </View>
            )}

            {field.type === 'searchable-select' && renderSearchableSelect(field)}

            {field.type === 'input' && (
                <TextInput
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChangeText={(text) => onChange(field.name, text)}
                    style={styles.input}
                    placeholderTextColor={UIColors.textSecondary}
                />
            )}
        </View>
    );

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalCentered}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onCancel}>
                            <Text style={styles.closeButton}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.modalBody}>
                        {(fields || []).map(renderField)}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={() => {
                                onSubmit(); // let parent handle saving
                                // reset all fields to blank/empty
                                fields.forEach(f => {
                                    if (f.isMulti) {
                                        onChange(f.name, []);
                                    } else {
                                        onChange(f.name, '');
                                    }
                                });
                                onCancel(); // close modal after reset
                            }}
                        >
                            <Text style={styles.buttonText}>Save Changes</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalCentered: {
        width: '50%', backgroundColor: UIColors.background,
        borderRadius: 12, overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#1F8789', padding: 15,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: UIColors.textLight },
    closeButton: { fontSize: 24, fontWeight: 'bold', color: UIColors.textLight },
    modalBody: { padding: 20 },
    inputContainer: { marginBottom: 15 },

    pickerWrapper: {
        borderBottomWidth: 1, borderColor: '#aaa',
        backgroundColor: 'transparent', paddingVertical: 5,
    },
    picker: {
        height: 40, color: UIColors.textPrimary, backgroundColor: 'transparent',
        outlineStyle: 'none', borderWidth: 0, appearance: 'none',
    },

    input: {
        borderBottomWidth: 1, borderBottomColor: '#aaa', paddingVertical: 8,
        fontSize: 14, backgroundColor: 'transparent', color: UIColors.textPrimary,
        outlineStyle: 'none',
    },

    // Searchable select styles
    searchInput: {
        borderWidth: 1, borderColor: '#aaa', borderRadius: 8,
        paddingVertical: Platform.OS === 'web' ? 8 : 6, paddingHorizontal: 10,
        fontSize: 14, color: UIColors.textPrimary, marginBottom: 8,
        backgroundColor: 'transparent',
    },
    listBox: {
        borderWidth: 1, borderColor: '#eee', borderRadius: 8,
        overflow: 'hidden',
    },
    optionRow: {
        paddingVertical: 8, paddingHorizontal: 10, backgroundColor: UIColors.textLight,
        borderBottomWidth: 1, borderBottomColor: '#f2f2f2',
    },
    optionRowSelected: {
        backgroundColor: '#e7f7f7',
    },
    selectionHint: {
        marginTop: 6, fontSize: 12, color: UIColors.textSecondary,
    },

    modalFooter: {
        flexDirection: 'row', justifyContent: 'space-between',
        padding: 15, borderTopWidth: 1, borderColor: '#ccc',
    },
    button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
    cancelButton: { backgroundColor: 'gray' },
    submitButton: { backgroundColor: UIColors.accent },
    buttonText: { color: UIColors.textLight, fontWeight: 'bold' },
    label: { fontSize: 15, fontWeight: 'bold', color: UIColors.textPrimary, marginBottom: 4 },
});
