import { View, Text, StyleSheet } from 'react-native';
import UIColors from "../constants/UIColors";

export default function SectionHeader({ title }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: UIColors.header, // deep brand primary
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
    },
    text: {
        color: UIColors.textLight, // white/light text
        fontWeight: '700',
        fontSize: 16,
    },
});
