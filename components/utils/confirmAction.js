import React, { useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PaginatedList = ({ data, renderItem, itemsPerPage = 5, keyExtractor }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    return (
        <View>
            <FlatList
                data={paginatedData}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
            />
            <View style={styles.pagination}>
                <TouchableOpacity onPress={goToPrev} disabled={currentPage === 1} style={styles.pageButton}>
                    <Text style={styles.pageText}>Previous</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>{`Page ${currentPage} of ${totalPages}`}</Text>
                <TouchableOpacity onPress={goToNext} disabled={currentPage === totalPages} style={styles.pageButton}>
                    <Text style={styles.pageText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    pageButton: {
        padding: 10,
        marginHorizontal: 10,
        backgroundColor: '#008080',
        borderRadius: 6,
    },
    pageText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    pageInfo: {
        fontSize: 14,
        color: '#333',
    },
});

export default PaginatedList;
