import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

const CustomCheckboxField = ({
  option,
  translatedOption,
  checked,
  disabled,
  showTranslation,
  style,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
        ]} >
        <View style={styles.checkmark}>
          <View style={styles.checkmarkStem} />
          <View style={styles.checkmarkKick} />
        </View>
      </View>
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {showTranslation ? translatedOption : option}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#999",
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#07f", // Selected color
    borderColor: "#07f",
  },
  checkmark: {
    width: 12,
    height: 8,
  },
  checkmarkStem: {
    position: "absolute",
    width: 2,
    height: 8,
    backgroundColor: "#fff",
    left: 7,
    transform: [{ rotate: "45deg" }],
  },
  checkmarkKick: {
    position: "absolute",
    width: 2,
    height: 4,
    backgroundColor: "#fff",
    left: 2,
    top: 4,
    transform: [{ rotate: "-45deg" }],
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  textDisabled: {
    color: "#000",
  },
});

export default CustomCheckboxField;