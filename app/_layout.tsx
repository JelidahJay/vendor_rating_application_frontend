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
import UIColors from "@/constants/UIColors";

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


    const AppTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: UIColors.background,   // light purple page bg
            card: 'transparent',               // so header/footer bars don’t paint white
            border: 'transparent',
        },
    };

    const AppDark = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            background: UIColors.background,   // keep same bg for now
            card: 'transparent',
            border: 'transparent',
        },
    };
  return (
      <ThemeProvider value={colorScheme === 'dark' ? AppDark : AppTheme}>
          {showSideNav && <Header />}
          <StatusBar style="auto" />
          {showSideNav && <SideNav />}

          {/* root wrapper uses the page bg so no white line above/below */}
          <View style={{ flex: 1, backgroundColor: UIColors.background }}>
              <View
                  style={{
                      flex: 1,
                      marginLeft: showSideNav ? 180 : 0,
                      padding: 20,
                      backgroundColor: 'transparent',
                  }}
              >
                  <Slot />
              </View>
          </View>

          {showSideNav && <Footer />}
      </ThemeProvider>

  );
}
