import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform
} from 'react-native';
import { getUsers, createUser, updateUser, deleteUser, getDepartments } from '../../services/api';
import CustomModalForm from '../../components/CustomModalForm';
import UIColors from '../../constants/UIColors';

export default function UsersScreen() {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'rater',
        department_id: '',
        password: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await getDepartments(); // API call
            setDepartments(res);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData({ full_name: '', email: '', role: 'rater', department_id: '', password: '' });
        setEditingUser(null);
        setModalVisible(true);
    };

    const openEditModal = (user) => {
        setFormData({
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            department_id: user.department_id,
            password: ''
        });
        setEditingUser(user);
        setModalVisible(true);
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        console.log("handleSubmit triggered");

        const action = editingUser ? 'edit' : 'create';
        const message = `Are you sure you want to ${action} this user?`;

        const confirmed = Platform.OS === 'web' ? window.confirm(message) : true;

        if (confirmed) {
            try {
                if (editingUser) {
                    console.log("Calling updateUser...");
                    await updateUser(editingUser.user_id, formData);
                } else {
                    console.log("Calling createUser...");
                    await createUser(formData);
                }
                setModalVisible(false);
                console.log("User saved successfully, refreshing...");
                fetchUsers();
            } catch (error) {
                console.error(`Error trying to ${action} user:`, error);
                if (Platform.OS !== 'web') {
                    Alert.alert('Error', `Failed to ${action} user.`);
                } else {
                    window.alert(`Failed to ${action} user.`);
                }
            }
        }
    };

    const handleDelete = async (userId) => {
        console.log("Delete requested for user:", userId);

        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Are you sure you want to delete this user?");
            if (!confirmed) return;

            try {
                console.log("Calling deleteUser...");
                await deleteUser(userId);
                console.log("User deleted, fetching updated list...");
                fetchUsers();
            } catch (error) {
                console.error("Delete failed:", error);
                window.alert("Failed to delete user.");
            }
        } else {
            Alert.alert("Confirm Delete", "Are you sure you want to delete this user?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log("Calling deleteUser...");
                            await deleteUser(userId);
                            console.log("User deleted, fetching updated list...");
                            fetchUsers();
                        } catch (error) {
                            console.error("Delete failed:", error);
                            Alert.alert("Error", "Failed to delete user.");
                        }
                    },
                },
            ]);
        }
    };


    const departmentOptions = departments.map(d => ({ label: d.name, value: d.department_id }));
    const roleOptions = ['rater', 'admin'];

    const userFields = [
        { name: 'full_name', label: 'Full Name', placeholder: 'Enter full name' },
        { name: 'email', label: 'Email', placeholder: 'Enter email address' },
        { name: 'role', label: 'Role', type: 'select', options: roleOptions },
        { name: 'department_id', label: 'Department', type: 'select', options: departmentOptions },
        // Only show if role is admin
        formData.role === 'admin' ? { name: 'password', label: 'Password', placeholder: 'Enter password', secure: true } : null
    ].filter(Boolean);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Users</Text>
                <TouchableOpacity style={styles.button} onPress={openCreateModal}>
                    <Text style={{ color: UIColors.textLight, fontWeight: 'bold' }}>Add New User</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tableHeader}>
                <Text style={styles.headerCellLeft}>Name</Text>
                <Text style={styles.headerCellLeft}>Email</Text>
                <Text style={styles.headerCellLeft}>Role</Text>
                <Text style={styles.headerCellLeft}>Department</Text>
                <Text style={styles.headerCellRight}>Actions</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={UIColors.primary} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.user_id.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.tableRow}>
                            <Text style={styles.cell}>{item.full_name}</Text>
                            <Text style={styles.cell}>{item.email}</Text>
                            <Text style={[styles.cell, { color: item.role === 'admin' ? UIColors.primary : '#555' }]}>{item.role}</Text>
                            <Text style={styles.cell}>{item.department?.name || 'N/A'}</Text>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity onPress={() => openEditModal(item)}>
                                    <Text style={styles.editButton}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.user_id)}>
                                    <Text style={styles.deleteButton}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <CustomModalForm
                visible={modalVisible}
                title={editingUser ? "Edit User" : "Create User"}
                fields={userFields}
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
