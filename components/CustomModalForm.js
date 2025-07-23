import React from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from "react-native-web";
import UIColors from "../constants/UIColors";

export default function CustomModalForm({ visible, title, fields, onSubmit, onCancel, formData, onChange }) {
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
                        {fields.map((field) => (
                            <View key={field.name} style={styles.inputContainer}>
                                <Text style={styles.label}>{field.label}</Text>
                                {field.type === 'select' ? (
                                    <View style={styles.pickerWrapper}>
                                        <Picker
                                            selectedValue={formData[field.name]}
                                            onValueChange={(value) => onChange(field.name, value)}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="Select..." value="" />
                                            {field.options.map((option, index) =>
                                                typeof option === 'string' ? (
                                                    <Picker.Item key={index} label={option} value={option} />
                                                ) : (
                                                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                                                )
                                            )}
                                        </Picker>
                                    </View>
                                ) : (
                                    <TextInput
                                        placeholder={field.placeholder}
                                        value={formData[field.name]}
                                        onChangeText={(text) => onChange(field.name, text)}
                                        style={styles.input}
                                        placeholderTextColor={UIColors.textSecondary}
                                    />
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={onSubmit}>
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
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCentered: {
        width: '50%',
        backgroundColor: UIColors.background,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1F8789',
        padding: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: UIColors.textLight,
    },
    closeButton: {
        fontSize: 24,
        fontWeight: 'bold',
        color: UIColors.textLight,
    },
    modalBody: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    pickerWrapper: {
        borderBottomWidth: 1,
        borderColor: '#aaa', // light gray bottom border
        backgroundColor: 'transparent',
        paddingVertical: 5,
    },

    picker: {
        height: 40,
        color: UIColors.textPrimary,
        backgroundColor: 'transparent',
        outlineStyle: 'none', // Removes browser focus border
        borderWidth: 0, // Removes default border
        appearance: 'none', // Disables native arrow and styling (React Native Web)
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
    },
    cancelButton: {
        backgroundColor: 'gray',
    },
    submitButton: {
        backgroundColor: UIColors.accent,
    },
    buttonText: {
        color: UIColors.textLight,
        fontWeight: 'bold',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#aaa',
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: 'transparent',
        color: UIColors.textPrimary,
        outlineStyle: 'none', // ✅ Remove default purple outline (React Native Web)
    },
    label: {
        fontSize: 15,
        fontWeight: 'bold',
        color: UIColors.textPrimary,
        marginBottom: 4,
    },
});
