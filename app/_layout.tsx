import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router"; // Added useRouter for navigation
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo"; // Added useAuth
import { Slot } from "expo-router";
import { tokenCache } from '@/utils/cache';

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

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Redirect to the Login Screen if the user is not signed in
      router.replace("/login");
    } else if (isLoaded && isSignedIn) {
      // Redirect to the Home Screen if the user is signed in
      router.replace("/home");
    }
  }, [isLoaded, isSignedIn]);

  return <Slot />; // Render the Slot for navigation
}