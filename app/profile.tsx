import React from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";
import {
  StatusBar,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions, 
  Platform,
} from "react-native";
import {bgColor} from "./assets/colors"
import CustomBottomNav from "./components/CustomNavBar";
import { initI18n } from "./services/initI18n";
initI18n();

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  // Get screen dimensions
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login"); // Redirect to the login screen after signing out
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && <CustomHeader title="Profile" showBackButton={true} />}
      <View
        style={[
          styles.scrollContent,
          { minHeight: screenHeight - insets.top - insets.bottom },
        ]}
      >
        <View style={styles.profileContainer}>
          {/* Profile Picture */}
          {user?.imageUrl && (
            <Image
              source={{ uri: user.imageUrl }}
              style={[
                styles.profileImage,
                {
                  width: screenWidth * 0.3, // 30% of screen width
                  height: screenWidth * 0.3, // Maintain a square aspect ratio
                  borderRadius: (screenWidth * 0.3) / 2, // Make it circular
                },
              ]}
            />
          )}

          {/* User Information */}
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>
            {user?.emailAddresses[0]?.emailAddress}
          </Text>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      {Platform.OS !== "web" && <CustomBottomNav screenName={"profile"} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileContainer: {
    width: "90%", // Use 90% of screen width
    maxWidth: 400, // Limit maximum width for larger screens
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    maxWidth: 300,
    maxHeight: 300,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center", // Center text for smaller screens
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center", // Center text for smaller screens
  },
  signOutButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#ff4444",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ProfileScreen;