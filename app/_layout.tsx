import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import SideNav from '../components/SideNav';
import {View} from "react-native";
import { usePathname } from 'expo-router';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
    const showSideNav = !pathname.startsWith('/survey/fill') && !pathname.startsWith('/thankyou');
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          {showSideNav && <Header />}
          <StatusBar style="auto" />
          {showSideNav && <SideNav />}
          <View style={{ flex: 1, marginLeft: showSideNav ? 180 : 0, padding: 20 }}>
              <Slot />
          </View>
          {showSideNav && <Footer />}
      </ThemeProvider>
  );
}
