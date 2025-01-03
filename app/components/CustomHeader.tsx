import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  BackHandler,
} from "react-native";
import { useRouter } from "expo-router"; // Expo Router's navigation hook
import { Ionicons } from "@expo/vector-icons"; // For the back button icon

interface CustomHeaderProps {
  title: string; // Title to display in the header
  showBackButton?: boolean; // Whether to show the back button
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ title, showBackButton = true }) => {
  const router = useRouter(); // Expo Router's navigation hook

  const handleBack = () => {
        router.replace("/home")  // Navigate back to the previous screen
  };

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
        router.replace("/home") // Navigate back to the previous screen
    };

    // Add event listener for hardware back button
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Clean up the event listener
    return () => backHandler.remove();
  }, [router]);

  return (
    <View style={styles.header}>
      {showBackButton && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20, // Adjust for iOS status bar
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
});

export default CustomHeader;