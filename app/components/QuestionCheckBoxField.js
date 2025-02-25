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


const { width } = Dimensions.get("window");
const CustomCheckboxField = ({
  option,
  translatedOption,
  checked,
  disabled,
  showTranslation,
  style,
  showCorrectAnswers,
  onPress,
  isAnswerCorrect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
        checked && styles.checkItem,
        showCorrectAnswers &&  (isAnswerCorrect ? styles.correctAnswer : styles.wrongAnswer),
        disabled && isAnswerCorrect !== undefined && (isAnswerCorrect ? styles.correctAnswer : styles.wrongAnswer),
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
          showCorrectAnswers &&  (isAnswerCorrect ? styles.correctCheckbox : styles.wrongCheckbox),
          disabled && isAnswerCorrect !== undefined && (isAnswerCorrect ? styles.correctCheckbox : styles.wrongCheckbox),
        ]}
      >
        {checked && (
          <View style={styles.checkmark}>
            {disabled && isAnswerCorrect === false ? (
              // X icon for wrong answer
              <>
                <View style={styles.xMarkStem} />
                <View style={styles.xMarkKick} />
              </>
            ) : (
              // Checkmark for correct or default checked state
              <>
                <View style={styles.checkmarkStem} />
                <View style={styles.checkmarkKick} />
              </>
            )}
          </View>
        )}
      </View>
      <Text style={[
        styles.text,
        disabled && styles.textDisabled,
        { textAlign: showTranslation ? "right" : "left" },
        showCorrectAnswers &&  (isAnswerCorrect ? styles.correctText : styles.wrongText),
        disabled && isAnswerCorrect !== undefined && (isAnswerCorrect ? styles.correctText : styles.wrongText),
      ]}>
        {showTranslation ? translatedOption : option}
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
    marginBottom: width > 768 ? 8 : 6 // Adjusted for small screens
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
  wrongCheckbox: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
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
  correctAnswer: {
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e9",
  },
  wrongAnswer: {
    borderColor: "#F44336",
    backgroundColor: "#ffebee",
  },
  correctText: {
    color: "#016b04",
  },
  wrongText: {
    color: "#b10c00",
  },
});
export default CustomCheckboxField;