import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import UIColors from "@/constants/UIColors";

const GUTTER = 16;       // space around the SideNav
const HEADER_H = 56;     // your header height
const FOOTER_H = 40;     // your footer height

export default function SideNav() {
    const pathname = usePathname();

    return (
        <View style={styles.sidebar}>
            <NavItem
                icon={<FontAwesome5 name="store" size={16} color="#cde0df" />}
                label="Dashboard"
                path="/dashboard"
                currentPath={pathname}
            />
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
            <NavItem
                icon={<Feather name="layers" size={18} color="#cde0df" />}
                label="Reports"
                path="/reports"
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
        left: GUTTER,                 // left gutter shows the page bg
        top: HEADER_H + GUTTER,       // gap below header
        bottom: FOOTER_H + GUTTER,    // gap above footer
        width: 200,
        backgroundColor: UIColors.textLight, // card-like nav
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 10,
        zIndex: 100,

        // subtle shadow
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
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
        backgroundColor: UIColors.primary, // #4B49AC
    },
    icon: {
        width: 22,
        alignItems: 'center',
    },
    link: {
        color: UIColors.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    activeText: {
        color: '#FFFFFF', // white text on active background
        fontWeight: '600',
    },
});



