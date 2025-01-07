import { Stack, useRouter } from "expo-router"; // Added useRouter for navigation
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo"; // Added useAuth
import { Slot, useSegments } from "expo-router"; // Added useSegments
import { tokenCache } from '@/utils/cache';
import { View, StyleSheet } from "react-native";
import CustomBottomNav from "./components/CustomNavBar";
import {
  Platform,
} from "react-native";
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

// Component to handle authentication redirects
function AuthRedirectHandler() {
  const router = useRouter(); // Use the router for navigation
  const { isLoaded, isSignedIn } = useAuth(); // Check authentication status
  const segments = useSegments(); // Get the current route segments

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Redirect to the Login Screen if the user is not signed in
      router.replace("/login");
    } else if (isLoaded && isSignedIn) {
      // Redirect to the Home Screen if the user is signed in
      router.replace("/home");
    }
  }, [isLoaded, isSignedIn]);

  // Determine if the current screen should show the bottom navigation bar
  const showBottomNav = isSignedIn && !segments.includes("login") && !segments.includes("question") && Platform.OS !== "web"

  return (
    <View style={styles.container}>
      <Slot /> {/* Render the Slot for navigation */}
      {showBottomNav && <CustomBottomNav screenName={segments[0]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
});