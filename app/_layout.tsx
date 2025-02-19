import { Stack, useRouter, usePathname } from "expo-router"; // Added usePathname
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import './style/global.css';
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot, useSegments } from "expo-router";
import { tokenCache } from '@/utils/cache';
import { View, StyleSheet, Dimensions, } from "react-native";
import CustomBottomNav from "./components/CustomNavBar";
import { Platform } from "react-native";
const { width, height } = Dimensions.get("window");
export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error(
      "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <AuthRedirectHandler />
        <StatusBar style="auto" />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function AuthRedirectHandler() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Only redirect to login if not already on the login page
      if (pathname !== "/login") {
        router.replace("/login");
      }
    } else if (isLoaded && isSignedIn) {
      // Only redirect to home if not already on a protected page
      if (pathname === "/login" || pathname === "/") {
        router.replace("/home");
      }
    }
  }, [isLoaded, isSignedIn, pathname]);

  const showBottomNav = isSignedIn && !segments.includes("login") && !segments.includes("question");

  return (
    <View style={styles.container}>
      <Slot />
      { width < 768 && showBottomNav && <CustomBottomNav screenName={segments[0]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  html: { height: "100%"},
  body: { height: "100%"},
  root: { height: "100%"},
  container: {
    flex: 1,
    position: "relative",
  },
});