import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function VendorSurveyDetailsModal({ visible, details, onClose }) {
    if (!details) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Vendor Survey Details</Text>

                    <Text style={styles.sectionTitle}>✅ Completed Ratings</Text>
                    <FlatList
                        data={details.completed}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Text style={styles.item}>
                                {item.raterName} - {new Date(item.submittedAt).toLocaleString()}
                            </Text>
                        )}
                        ListEmptyComponent={<Text style={styles.empty}>No completed ratings yet.</Text>}
                    />

                    <Text style={styles.sectionTitle}>🕓 Pending Ratings</Text>
                    <FlatList
                        data={details.pending}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Text style={styles.item}>
                                {item.raterName}
                            </Text>
                        )}
                        ListEmptyComponent={<Text style={styles.empty}>No pending ratings.</Text>}
                    />

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
    },
    item: {
        fontSize: 14,
        paddingVertical: 4,
    },
    empty: {
        fontSize: 14,
        fontStyle: 'italic',
        color: 'gray',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
