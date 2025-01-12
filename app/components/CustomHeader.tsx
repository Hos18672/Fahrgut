import React, { useEffect, useRef } from "react";
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
import { blackColor, blueColor } from "../assets/colors";

interface CustomHeaderProps {
  title: string; // Title to display in the header
  showBackButton?: boolean; // Whether to show the back button
  iconRight?: string;
  iconRightHandler?: () => void; // Callback function for icon press
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showBackButton = true,
  iconRight = "",
  iconRightHandler,
}) => {
  const router = useRouter(); // Expo Router's navigation hook
  const handleBack = () => {
    router.replace("/home"); // Navigate back to the previous screen
  };

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      router.replace("/home"); // Navigate back to the previous screen
    };

    // Add event listener for hardware back button
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Clean up the event listener
    return () => backHandler.remove();
  }, [router]);

  // Handle icon press
  const handleIconPress = () => {
    if (iconRightHandler) {
      iconRightHandler(); // Call the provided handler
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {iconRight && (
        <TouchableOpacity onPress={handleIconPress}>
          <Ionicons
            name={iconRight} // Use the ref value for the icon name
            size={24}
            color={blueColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "web" ? 10 : 5, // Adjust for iOS status bar
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "left",
    width: "50%",
    minWidth: 100,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    minWidth: 200,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
  },
});

export default CustomHeader;