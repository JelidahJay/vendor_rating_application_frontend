import React, { useEffect, useState } from 'react';
import {View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity, Platform, TextInput} from 'react-native';
import {getVendors, createVendor, updateVendor, deleteVendor, getVendorSurveyDetails} from "../../services/api"
import CustomModalForm from "../../components/CustomModalForm";
import { useRouter } from 'expo-router';
import VendorSurveyDetailsModal from "../../components/VendorSurveyDetailsModal";
import UIColors from "../../constants/UIColors";
import {Feather} from "@expo/vector-icons";
import Swal from "sweetalert2";

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

    const [nameQuery, setNameQuery] = useState('');
    const [serviceQuery, setServiceQuery] = useState('');

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

        const action = editingVendor ? "edit" : "create";
        const message = `Are you sure you want to ${action} this vendor?\n\nName: ${formData.name}\nProduct/Service: ${formData.product_service}`;

        let confirmed = Platform.OS === "web"
            ? (await Swal.fire({
                icon: "question",
                title: "Are you sure?",
                text: message,
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel",
            })).isConfirmed
            : true;

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

                // ✅ success feedback
                if (Platform.OS === "web") {
                    Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: `Vendor successfully ${action === "create" ? "added" : "updated"}!`,
                        showConfirmButton: false,
                        timer: 3000,
                    });
                } else {
                    Alert.alert("Success", `Vendor successfully ${action === "create" ? "added" : "updated"}!`);
                }

            } catch (error) {
                console.error(`Error trying to ${action} vendor:`, error);
                if (Platform.OS !== "web") {
                    Alert.alert("Error", `Failed to ${action} vendor.`);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: `Failed to ${action} vendor.`,
                        confirmButtonText: "OK",
                    });
                }
            }
        }
    };

    const handleDelete = async (vendorId) => {
        console.log("Delete requested for vendor:", vendorId);
        const vendor = vendors.find((v) => v.vendor_id === vendorId);
        const message = `Are you sure you want to delete this vendor?\n\nName: ${vendor?.name}\nProduct/Service: ${vendor?.product_service}`;

        if (Platform.OS === "web") {
            const confirmed = (await Swal.fire({
                icon: "warning",
                title: "Confirm Delete",
                text: message,
                showCancelButton: true,
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
            })).isConfirmed;

            if (!confirmed) return;

            try {
                console.log("Calling deleteVendor...");
                await deleteVendor(vendorId);
                console.log("Vendor deleted, fetching updated list...");
                fetchVendors();

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Vendor deleted successfully!",
                    showConfirmButton: false,
                    timer: 3000,
                });
            } catch (error) {
                console.error("Delete failed:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to delete vendor.",
                    confirmButtonText: "OK",
                });
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
                            Alert.alert("Success", "Vendor deleted successfully!");
                        } catch (error) {
                            console.error("Delete failed:", error);
                            Alert.alert("Error", "Failed to delete vendor.");
                        }
                    },
                },
            ]);
        }
    };

// in VendorScreen
    const vendorFields = [
        { name: 'name', label: 'Vendor Name', placeholder: 'Enter vendor name', type: 'input' },
        { name: 'product_service', label: 'Product/Service', placeholder: 'Enter product/service', type: 'input' },
    ];

    function MiniButton({ label, iconName, tint, onPress }) {
        return (
            <TouchableOpacity onPress={onPress} style={[miniStyles.btn, { borderColor: tint }]}>
                <Feather name={iconName} size={14} color={tint} />
                {!!label && <Text style={[miniStyles.text, { color: tint }]}>{label}</Text>}
            </TouchableOpacity>
        );
    }

    const miniStyles = StyleSheet.create({
        btn: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderWidth: 1,
            borderRadius: 6,
            backgroundColor: 'transparent',
        },
        text: {
            fontSize: 12,
            fontWeight: '500', // not bold
        },
    });

    const filteredVendors = React.useMemo(() => {
        const n = (nameQuery || '').toLowerCase().trim();
        const s = (serviceQuery || '').toLowerCase().trim();

        if (!Array.isArray(vendors)) return [];

        return vendors.filter(v => {
            const name = (v?.name || '').toLowerCase();
            const svc  = (v?.product_service || '').toLowerCase();

            // match if each non-empty query is contained anywhere (start, middle, end)
            const nameOk = n ? name.includes(n) : true;
            const svcOk  = s ? svc.includes(s) : true;

            return nameOk && svcOk;
        });
    }, [vendors, nameQuery, serviceQuery]);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Vendors</Text>
                <TouchableOpacity style={styles.button} onPress={openCreateModal}>
                    <Text style={{ color: UIColors.textLight, fontWeight: 'bold' }}>Add New Vendor</Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.filterLabel}>Filter by Name</Text>
                    <View style={styles.filterInputWrap}>
                        <Feather name="search" size={14} color={UIColors.textSecondary} />
                        <TextInput
                            placeholder="Type a name (e.g. nem)"
                            placeholderTextColor={UIColors.textSecondary}
                            value={nameQuery}
                            onChangeText={setNameQuery}
                            style={styles.filterInput}
                        />
                        {!!nameQuery && (
                            <TouchableOpacity onPress={() => setNameQuery('')}>
                                <Feather name="x" size={14} color={UIColors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ width: 12 }} />

                <View style={{ flex: 1 }}>
                    <Text style={styles.filterLabel}>Filter by Product/Service</Text>
                    <View style={styles.filterInputWrap}>
                        <Feather name="search" size={14} color={UIColors.textSecondary} />
                        <TextInput
                            placeholder="Type a service (e.g. chem)"
                            placeholderTextColor={UIColors.textSecondary}
                            value={serviceQuery}
                            onChangeText={setServiceQuery}
                            style={styles.filterInput}
                        />
                        {!!serviceQuery && (
                            <TouchableOpacity onPress={() => setServiceQuery('')}>
                                <Feather name="x" size={14} color={UIColors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            <View style={styles.tableHeader}>
                <Text style={styles.headerCellLeft}>Vendor Name</Text>
                <Text style={styles.headerCellLeft}>Product/Service</Text>
                <Text style={styles.headerCellRight}>Actions</Text>
            </View>

            <FlatList
                data={filteredVendors}
                keyExtractor={(item) => item.vendor_id.toString()}
                renderItem={({ item, index }) => {
                    const isLast = index === filteredVendors.length - 1;
                    return (
                        <View
                            style={[
                                styles.tableRow,
                                isLast && styles.tableRowLast,
                                { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9' }
                            ]}
                        >
                            <Text style={styles.cell}>{item.name}</Text>
                            <Text style={styles.cell}>{item.product_service}</Text>
                            <View style={styles.actionButtons}>
                                <MiniButton iconName="eye" tint={UIColors.primary} onPress={() => openSurveyDetailsModal(item.vendor_id)} />
                                <MiniButton iconName="edit-2" tint={UIColors.secondary} onPress={() => openEditModal(item)} />
                                <MiniButton iconName="trash-2" tint={UIColors.danger} onPress={() => handleDelete(item.vendor_id)} />
                            </View>
                        </View>
                    );
                }}
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
        marginLeft: 35,
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
    filterRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 12,
        marginTop: -8, // optional: tuck closer under header row
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
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: UIColors.header,
        paddingVertical: 6,
        paddingHorizontal: 5,
        borderTopLeftRadius: 6,   // ⬅ top corners
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

        // default flat rows
    },
    tableRowLast: {
        borderBottomWidth: 0,      // remove bottom divider
        borderBottomLeftRadius: 6, // ⬅ bottom corners
        borderBottomRightRadius: 6,
    },

});
