import React, { useEffect, useState } from 'react';
import {View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity, Platform} from 'react-native';
import {getVendors, createVendor, updateVendor, deleteVendor, getVendorSurveyDetails} from "../../services/api"
import CustomModalForm from "../../components/CustomModalForm";
import { useRouter } from 'expo-router';
import VendorSurveyDetailsModal from "../../components/VendorSurveyDetailsModal";
import UIColors from "../../constants/UIColors";

export default function VendorScreen() {
    const [vendors, setVendors] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        product_service: '',
    });
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [surveyDetails, setSurveyDetails] = useState([]);

    const openSurveyDetailsModal = async (vendorId) => {
        try {
            const data = await getVendorSurveyDetails(vendorId); // New API
            setSurveyDetails(data);
            setDetailsModalVisible(true);
        } catch (error) {
            console.error('Error fetching survey details:', error);
            Alert.alert('Error', 'Failed to load survey details.');
        }
    };


    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const data = await getVendors();
            console.log(data);
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', product_service: '' });
        setEditingVendor(null);
        setModalVisible(true);
    };

    const openEditModal = (vendor) => {
        setFormData({
            name: vendor.name,
            product_service: vendor.product_service,
        });
        setEditingVendor(vendor);
        setModalVisible(true);
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        console.log("handleSubmit triggered");

        const action = editingVendor ? 'edit' : 'create';
        const message = `Are you sure you want to ${action} this vendor?\n\nName: ${formData.name}\nProduct/Service: ${formData.product_service}`;

        const confirmed = Platform.OS === 'web' ? window.confirm(message) : true;

        if (confirmed) {
            try {
                if (editingVendor) {
                    console.log("Calling updateVendor...");
                    await updateVendor(editingVendor.vendor_id, formData);
                } else {
                    console.log("Calling createVendor...");
                    await createVendor(formData);
                }
                setModalVisible(false);
                console.log("Vendor saved successfully, refreshing...");
                fetchVendors();
            } catch (error) {
                console.error(`Error trying to ${action} vendor:`, error);
                if (Platform.OS !== 'web') {
                    Alert.alert('Error', `Failed to ${action} vendor.`);
                } else {
                    window.alert(`Failed to ${action} vendor.`);
                }
            }
        }
    };

    const handleDelete = async (vendorId) => {
        console.log("Delete requested for vendor:", vendorId);
        const vendor = vendors.find(v => v.vendor_id === vendorId);
        const message = `Are you sure you want to delete this vendor?\n\nName: ${vendor?.name}\nProduct/Service: ${vendor?.product_service}`;

        if (Platform.OS === 'web') {
            const confirmed = window.confirm(message);
            if (!confirmed) return;

            try {
                console.log("Calling deleteVendor...");
                await deleteVendor(vendorId);
                console.log("Vendor deleted, fetching updated list...");
                fetchVendors();
            } catch (error) {
                console.error("Delete failed:", error);
                window.alert("Failed to delete vendor.");
            }
        } else {
            Alert.alert("Confirm Delete", message, [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log("Calling deleteVendor...");
                            await deleteVendor(vendorId);
                            console.log("Vendor deleted, fetching updated list...");
                            fetchVendors();
                        } catch (error) {
                            console.error("Delete failed:", error);
                            Alert.alert("Error", "Failed to delete vendor.");
                        }
                    },
                },
            ]);
        }
    };

    const vendorFields = [
        { name: 'name', label: 'Vendor Name', placeholder: 'Enter vendor name' },
        { name: 'product_service', label: 'Product/Service', placeholder: 'Enter product/service' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Vendors</Text>
                <TouchableOpacity style={styles.button} onPress={openCreateModal}>
                    <Text style={{ color: UIColors.textLight, fontWeight: 'bold' }}>Add New Vendor</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tableHeader}>
                <Text style={styles.headerCellLeft}>Vendor Name</Text>
                <Text style={styles.headerCellLeft}>Product/Service</Text>
                <Text style={styles.headerCellRight}>Actions</Text>
            </View>


            <FlatList
                data={vendors}
                keyExtractor={(item) => item.vendor_id.toString()}
                renderItem={({ item, index }) => (
                    <View style={[
                        styles.tableRow,
                        { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }
                    ]}>
                        <Text style={styles.cell}>{item.name}</Text>
                        <Text style={styles.cell}>{item.product_service}</Text>
                        <View style={styles.actionButtons}>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity onPress={() => openEditModal(item)}>
                                    <Text style={styles.editButton}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.vendor_id)}>
                                    <Text style={styles.deleteButton}>🗑️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openSurveyDetailsModal(item.vendor_id)}>
                                    <Text style={styles.viewButton}>👁️</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                )}
            />

            <CustomModalForm
                visible={modalVisible}
                title={editingVendor ? "Edit Vendor" : "Create Vendor"}
                fields={vendorFields}
                formData={formData}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => setModalVisible(false)}
            />

            {detailsModalVisible && (
                <VendorSurveyDetailsModal
                    visible={detailsModalVisible}
                    details={surveyDetails}
                    onClose={() => setDetailsModalVisible(false)}
                />
            )}

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
