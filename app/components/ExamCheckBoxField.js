import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { fontSizeNormal } from "../assets/base/styles_assets";
import i18n from "i18next";
import { initI18n } from "../services/initI18n";
initI18n();
const { width } = Dimensions.get("window");
const ExamCheckBoxField = ({title, checked, style, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
        ]}
      >
        {checked && (
          <View style={styles.checkmark}>
            <View style={styles.checkmarkStem} />
            <View style={styles.checkmarkKick} />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.text,
          { textAlign:  i18n.language == 'fa' ? "right" : "left" },
        ]}
      >
        { title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    padding: width > 768 ? 5 : 4, // Adjusted for small screens
    paddingHorizontal: width > 768 ? 8 : 6, // Adjusted for small screens
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: width > 768 ? 8 : 6, // Adjusted for small screens
  },
  checkbox: {
    width: width > 768 ? 24 : 20, // Smaller checkbox for small screens
    height: width > 768 ? 24 : 20, // Smaller checkbox for small screens
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    marginRight: width > 768 ? 12 : 8, // Adjusted for small screens
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  correctCheckbox: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkmark: {
    width: width > 768 ? 12 : 10, // Smaller checkmark for small screens
    height: width > 768 ? 12 : 10, // Smaller checkmark for small screens
    position: "relative",
  },
  checkmarkStem: {
    position: "absolute",
    width: 2,
    height: width > 768 ? 8 : 6, // Adjusted for small screens
    backgroundColor: "#fff",
    left: width > 768 ? 7 : 5, // Adjusted for small screens
    bottom: 2,
    transform: [{ rotate: "45deg" }],
  },
  checkmarkKick: {
    position: "absolute",
    width: 2,
    height: width > 768 ? 5 : 4, // Adjusted for small screens
    backgroundColor: "#fff",
    left: width > 768 ? 3 : 2, // Adjusted for small screens
    top: width > 768 ? 5 : 4, // Adjusted for small screens
    transform: [{ rotate: "-45deg" }],
  },
  xMarkStem: {
    position: "absolute",
    width: 2,
    height: width > 768 ? 12 : 10, // Adjusted for small screens
    backgroundColor: "#fff",
    left: width > 768 ? 5 : 4, // Adjusted for small screens
    transform: [{ rotate: "45deg" }],
  },
  xMarkKick: {
    position: "absolute",
    width: 2,
    height: width > 768 ? 12 : 10, // Adjusted for small screens
    backgroundColor: "#fff",
    left: width > 768 ? 5 : 4, // Adjusted for small screens
    transform: [{ rotate: "-45deg" }],
  },
  text: {
    flex: 1,
    fontSize: fontSizeNormal, // Smaller font size for small screens
    color: "#333",
  },
  textDisabled: {
    color: "#a0a0a0",
  },
  checkItem: {
    borderColor: "#007AFF",
    backgroundColor: "#e6f2ff",
  },
  correctText: {
    color: "#016b04",
  },
});
export default ExamCheckBoxField;
