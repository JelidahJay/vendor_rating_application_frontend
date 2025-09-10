import React, { useEffect, useMemo, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Platform, TextInput
} from 'react-native';
import { getUsers, createUser, updateUser, deleteUser, getDepartments } from '../../services/api';
import CustomModalForm from '../../components/CustomModalForm';
import UIColors from '../../constants/UIColors';
import { Feather } from '@expo/vector-icons';
import { ActionGroup, ViewButton, EditButton, DeleteButton } from '@/components/ActionButtons';
import Swal from "sweetalert2";

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

    // filter state
    const [firstNameQuery, setFirstNameQuery] = useState('');
    const [lastNameQuery, setLastNameQuery]   = useState('');
    const [emailQuery, setEmailQuery]         = useState('');

    useEffect(() => { fetchDepartments(); }, []);
    const fetchDepartments = async () => {
        try {
            const res = await getDepartments();
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
        const action = editingUser ? "edit" : "create";

        let confirmed = Platform.OS === "web"
            ? (await Swal.fire({
                icon: "question",
                title: "Are you sure?",
                text: `Are you sure you want to ${action} this user?`,
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel",
            })).isConfirmed
            : true;

        if (!confirmed) return;

        try {
            if (editingUser) {
                await updateUser(editingUser.user_id, formData);
            } else {
                await createUser(formData);
            }
            setModalVisible(false);
            await fetchUsers();
        } catch (error) {
            console.error(`Error trying to ${action} user:`, error);
            if (Platform.OS !== "web") {
                Alert.alert("Error", `Failed to ${action} user.`);
            } else {
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Failed to ${action} user.`,
                    confirmButtonText: "OK",
                });
            }
        }
    };


    const handleDelete = async (userId) => {
        if (Platform.OS === "web") {
            const result = await Swal.fire({
                icon: "warning",
                title: "Are you sure?",
                text: "Are you sure you want to delete this user?",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
                cancelButtonText: "Cancel",
            });

            if (!result.isConfirmed) return;

            try {
                await deleteUser(userId);
                fetchUsers();
                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "User has been deleted successfully.",
                    confirmButtonText: "OK",
                });
            } catch (error) {
                console.error("Delete failed:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to delete user.",
                    confirmButtonText: "OK",
                });
            }
        } else {
            Alert.alert("Confirm Delete", "Are you sure you want to delete this user?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteUser(userId);
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

    const departmentOptions = (departments || []).map(d => ({ label: d.name, value: d.department_id }));
    const roleOptions = ['rater', 'admin'];

    const userFields = [
        { name: 'full_name', label: 'Full Name', placeholder: 'Enter full name' },
        { name: 'email', label: 'Email', placeholder: 'Enter email address' },
        { name: 'role', label: 'Role', type: 'select', options: roleOptions },
        { name: 'department_id', label: 'Department', type: 'select', options: departmentOptions },
        formData.role === 'admin' ? { name: 'password', label: 'Password', placeholder: 'Enter password', secure: true } : null
    ].filter(Boolean);

    // fuzzy filters: includes anywhere (start/middle/end), case-insensitive
    const filteredUsers = useMemo(() => {
        const qFirst = (firstNameQuery || '').trim().toLowerCase();
        const qLast  = (lastNameQuery  || '').trim().toLowerCase();
        const qEmail = (emailQuery     || '').trim().toLowerCase();

        if (!Array.isArray(users)) return [];

        return users.filter(u => {
            const full = (u?.full_name || '').trim();
            const email = (u?.email || '').toLowerCase();

            const [first = '', last = ''] = full.split(/\s+/); // simple split: "First Last"
            const firstLc = first.toLowerCase();
            const lastLc  = last.toLowerCase();
            const fullLc  = full.toLowerCase();

            const firstOk = qFirst ? (firstLc.includes(qFirst) || fullLc.includes(qFirst)) : true;
            const lastOk  = qLast  ? (lastLc.includes(qLast)   || fullLc.includes(qLast))  : true;
            const emailOk = qEmail ? email.includes(qEmail) : true;

            return firstOk && lastOk && emailOk;
        });
    }, [users, firstNameQuery, lastNameQuery, emailQuery]);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Users</Text>
                <TouchableOpacity style={styles.button} onPress={openCreateModal}>
                    <Text style={{ color: UIColors.textLight, fontWeight: 'bold' }}>Add New User</Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.filterLabel}>First name</Text>
                    <View style={styles.filterInputWrap}>
                        <Feather name="search" size={14} color={UIColors.textSecondary} />
                        <TextInput
                            placeholder="e.g. John"
                            placeholderTextColor={UIColors.textSecondary}
                            value={firstNameQuery}
                            onChangeText={setFirstNameQuery}
                            style={styles.filterInput}
                        />
                        {!!firstNameQuery && (
                            <TouchableOpacity onPress={() => setFirstNameQuery('')}>
                                <Feather name="x" size={14} color={UIColors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ width: 12 }} />

                <View style={{ flex: 1 }}>
                    <Text style={styles.filterLabel}>Last name</Text>
                    <View style={styles.filterInputWrap}>
                        <Feather name="search" size={14} color={UIColors.textSecondary} />
                        <TextInput
                            placeholder="e.g. Doe"
                            placeholderTextColor={UIColors.textSecondary}
                            value={lastNameQuery}
                            onChangeText={setLastNameQuery}
                            style={styles.filterInput}
                        />
                        {!!lastNameQuery && (
                            <TouchableOpacity onPress={() => setLastNameQuery('')}>
                                <Feather name="x" size={14} color={UIColors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ width: 12 }} />

                <View style={{ flex: 1 }}>
                    <Text style={styles.filterLabel}>Email</Text>
                    <View style={styles.filterInputWrap}>
                        <Feather name="search" size={14} color={UIColors.textSecondary} />
                        <TextInput
                            placeholder="e.g. jane@company.com"
                            placeholderTextColor={UIColors.textSecondary}
                            value={emailQuery}
                            onChangeText={setEmailQuery}
                            style={styles.filterInput}
                            autoCapitalize="none"
                        />
                        {!!emailQuery && (
                            <TouchableOpacity onPress={() => setEmailQuery('')}>
                                <Feather name="x" size={14} color={UIColors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
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
                data={filteredUsers}
            keyExtractor={(item) => item.user_id.toString()}
            renderItem={({ item, index }) => {
                const isLast = index === filteredUsers.length - 1;
                return (
                    <View
                        style={[
                            styles.tableRow,
                            isLast && styles.tableRowLast,
                            { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }
                        ]}
                    >
                        <Text style={styles.cell}>{item.full_name}</Text>
                        <Text style={styles.cell}>{item.email}</Text>
                        <Text style={[styles.cell, { color: item.role === 'admin' ? UIColors.primary : '#555' }]}>
                            {item.role}
                        </Text>
                        <Text style={styles.cell}>{item.department?.name || 'N/A'}</Text>

                        <View style={styles.actionButtons}>
                            <ActionGroup>
                                <ViewButton
                                    onPress={() => {
                                        const lines = [
                                            `Name: ${item.full_name}`,
                                            `Email: ${item.email}`,
                                            `Role: ${item.role}`,
                                            `Department: ${item.department?.name || 'N/A'}`
                                        ].join('\n');
                                        if (Platform.OS === 'web') window.alert(lines); else Alert.alert('User', lines);
                                    }}
                                />
                                <EditButton onPress={() => openEditModal(item)} />
                                <DeleteButton onPress={() => handleDelete(item.user_id)} />
                            </ActionGroup>
                        </View>
                    </View>
                );
            }}
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
        marginLeft: 35, // match the global gutter from SideNav
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: UIColors.header,
    },
    // Filters
    filterRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 12,
        marginTop: -4,
    },
    filterLabel: {
        color: UIColors.textSecondary,
        fontSize: 12,
        marginBottom: 6,
    },
    filterInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: UIColors.border,
        backgroundColor: UIColors.surface,
        borderRadius: 8,
    },
    filterInput: {
        flex: 1,
        color: UIColors.textPrimary,
        paddingVertical: 2,
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
    button: {
        backgroundColor: UIColors.primary,
        color: UIColors.textLight,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
    },
    // styles (add/replace)
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: UIColors.header,
        paddingVertical: 6,
        paddingHorizontal: 5,
        borderTopLeftRadius: 6,      // ⬅ rounded top
        borderTopRightRadius: 6,
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
    tableRowLast: {
        borderBottomWidth: 0,        // ⬅ remove last divider
        borderBottomLeftRadius: 6,   // ⬅ rounded bottom
        borderBottomRightRadius: 6,
    },

});
