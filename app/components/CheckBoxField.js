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
    padding: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    marginRight: 12,
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
    width: 12,
    height: 12,
    position: "relative",
  },
  checkmarkStem: {
    position: "absolute",
    width: 2,
    height: 8,
    backgroundColor: "#fff",
    left: 7,
    bottom: 2,
    transform: [{ rotate: "45deg" }],
  },
  checkmarkKick: {
    position: "absolute",
    width: 2,
    height: 5,
    backgroundColor: "#fff",
    left: 3,
    top: 5,
    transform: [{ rotate: "-45deg" }],
  },
  xMarkStem: {
    position: "absolute",
    width: 2,
    height: 12,
    backgroundColor: "#fff",
    left: 5,
    transform: [{ rotate: "45deg" }],
  },
  xMarkKick: {
    position: "absolute",
    width: 2,
    height: 12,
    backgroundColor: "#fff",
    left: 5,
    transform: [{ rotate: "-45deg" }],
  },
  text: {
    flex: 1,
    fontSize: 16,
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