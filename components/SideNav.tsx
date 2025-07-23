import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';

export default function SideNav() {
    const pathname = usePathname();

    return (
        <View style={styles.sidebar}>
            <NavItem
                icon={<FontAwesome5 name="store" size={16} color="#cde0df" />}
                label="Vendors"
                path="/vendors"
                currentPath={pathname}
            />
            <NavItem
                icon={<MaterialIcons name="assignment" size={18} color="#cde0df" />}
                label="Surveys"
                path="/survey"
                currentPath={pathname}
            />
            <NavItem
                icon={<Feather name="users" size={18} color="#cde0df" />}
                label="Users"
                path="/users"
                currentPath={pathname}
            />
            <NavItem
                icon={<Feather name="layers" size={18} color="#cde0df" />}
                label="Departments"
                path="/departments"
                currentPath={pathname}
            />
        </View>
    );
}

function NavItem({ icon, label, path, currentPath }: any) {
    const isActive = currentPath?.startsWith(path);

    return (
        <Pressable
            onPress={() => router.push(path)}
            style={[styles.navItem, isActive && styles.activeNavItem]}
        >
            <View style={styles.icon}>{icon}</View>
            <Text style={[styles.link, isActive && styles.activeText]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 200,
        backgroundColor: '#014d4e', // dark teal green
        paddingTop: 60,
        paddingHorizontal: 10,
        zIndex: 100,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginBottom: 8,
    },
    activeNavItem: {
        backgroundColor: '#cc5500', // tangerine / burnt orange
    },
    icon: {
        width: 22,
        alignItems: 'center',
    },
    link: {
        color: '#cde0df', // soft teal text
        fontSize: 14,
        fontWeight: '500',
    },
    activeText: {
        color: '#fff',
        fontWeight: '600',
    },
});
