import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Platform} from 'react-native';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/api';
import CustomModalForm from '../../components/CustomModalForm';
import UIColors from '../../constants/UIColors';

export default function DepartmentScreen() {
    const [departments, setDepartments] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '' });
        setEditingDept(null);
        setModalVisible(true);
    };

    const openEditModal = (dept) => {
        setFormData({ name: dept.name });
        setEditingDept(dept);
        setModalVisible(true);
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        console.log("handleSubmit triggered");

        const action = editingDept ? 'edit' : 'create';
        const message = `Are you sure you want to ${action} this department?\n\nName: ${formData.name}`;

        const confirmed = Platform.OS === 'web' ? window.confirm(message) : true;

        if (confirmed) {
            try {
                if (editingDept) {
                    console.log("Calling updateDepartment...");
                    await updateDepartment(editingDept.department_id, formData);
                } else {
                    console.log("Calling createDepartment...");
                    await createDepartment(formData);
                }
                setModalVisible(false);
                console.log("Department saved successfully, refreshing...");
                fetchDepartments();
            } catch (error) {
                console.error(`Error trying to ${action} department:`, error);
                if (Platform.OS !== 'web') {
                    Alert.alert('Error', `Failed to ${action} department.`);
                } else {
                    window.alert(`Failed to ${action} department.`);
                }
            }
        }
    };

    const handleDelete = async (id) => {
        console.log("Delete requested for department:", id);
        const dept = departments.find(d => d.department_id === id);
        const message = `Are you sure you want to delete this department?\n\nName: ${dept?.name}`;

        if (Platform.OS === 'web') {
            const confirmed = window.confirm(message);
            if (!confirmed) return;

            try {
                console.log("Calling deleteDepartment...");
                await deleteDepartment(id);
                console.log("Department deleted, refreshing...");
                fetchDepartments();
            } catch (error) {
                console.error("Delete failed:", error);
                window.alert("Failed to delete department.");
            }
        } else {
            Alert.alert("Confirm Delete", message, [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log("Calling deleteDepartment...");
                            await deleteDepartment(id);
                            console.log("Department deleted, refreshing...");
                            fetchDepartments();
                        } catch (error) {
                            console.error("Delete failed:", error);
                            Alert.alert("Error", "Failed to delete department.");
                        }
                    },
                },
            ]);
        }
    };

    const fields = [
        { name: 'name', label: 'Department Name', placeholder: 'Enter name' }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Departments</Text>
                <TouchableOpacity style={styles.button} onPress={openCreateModal}>
                    <Text style={{ color: UIColors.textLight, fontWeight: 'bold' }}>Add New</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tableHeader}>
                <Text style={styles.headerCellLeft}>Department Name</Text>
                <Text style={styles.headerCellRight}>Actions</Text>
            </View>

            <FlatList
                data={departments}
                keyExtractor={(item) => item.department_id.toString()}
                renderItem={({ item, index }) => (
                    <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }]}>
                        <Text style={styles.cell}>{item.name}</Text>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity onPress={() => openEditModal(item)}>
                                <Text style={styles.editButton}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.department_id)}>
                                <Text style={styles.deleteButton}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <CustomModalForm
                visible={modalVisible}
                title={editingDept ? 'Edit Department' : 'Create Department'}
                fields={fields}
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => setModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: UIColors.background,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: UIColors.header,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: UIColors.header,
        paddingVertical: 6,
        paddingHorizontal: 5,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    headerCellLeft: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 14,
        paddingLeft: 10,
        color: UIColors.textLight,
    },
    headerCellRight: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'right',
        fontSize: 14,
        paddingRight: 10,
        color: UIColors.textLight,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
        backgroundColor: UIColors.textLight,
    },
    cell: {
        flex: 1,
        textAlign: 'left',
        fontSize: 14,
        paddingLeft: 10,
        color: UIColors.textPrimary,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 1,
        gap: 10,
        paddingRight: 10,
    },
    editButton: {
        fontSize: 20,
        marginHorizontal: 10,
        color: UIColors.accent,
    },
    deleteButton: {
        fontSize: 20,
        marginHorizontal: 10,
        color: UIColors.primary,
    },
    button: {
        backgroundColor: UIColors.primary,
        color: UIColors.textLight,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
    },
});
