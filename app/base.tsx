import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";
import ToggleSwitch from "./components/ToggleSwitch";
import { CustomTabProps, SubCategoryItemProps } from "./types";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
initI18n();
import { supabase } from "./services/supabase";
import { fontSizeSmall } from "./assets/base/styles_assets";
export const removeCharacters = (name) => {
  return name.replace(/[ -\/\\]/g, "");
};
export const flags = {
  de: { name: "At", url: require("./assets/icon/at.png") },
  en: { name: "En", url: require("./assets/icon/us.png") },
  fa: { name: "Fa", url: require("./assets/icon/ir.png") },
};
export const groupByCategory = (questions: any[]) => {
  const categories: { [key: string]: any[] } = {};
  questions.forEach((question) => {
    if (!categories[question.category]) {
      categories[question.category] = [];
    }
    categories[question.category].push(question);
  });
  return Object.entries(categories).map(([category, questions]) => ({
    category,
    questions,
  }));
};

export const CustomTab: React.FC<CustomTabProps> = ({
  title,
  active,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.tab,
      active && styles.activeTab,
      Platform.OS === "web" && pressed && styles.tabPressed,
    ]}
  >
    <Text style={[styles.tabText, active && styles.activeTabText]}>
      {title}
    </Text>
  </Pressable>
);

export const SubCategoryItem: React.FC<SubCategoryItemProps> = ({
  item,
  questions,
  questions_progress,
  onPress,
  itemWidth,
}) => {
  const progressPercentage = (questions_progress /questions.length) * 100;
 console.log('progress')
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.subCategory, pressed && styles.subCategoryPressed, itemWidth ? {width: itemWidth} : {}]}>
      <View style={[styles.progressBackground, { width: `${progressPercentage}%` }]} />
      <View style={styles.backgroundContainer}>
        <View style={styles.subCategoryContent}>
          <Text style={styles.subCategoryText}>{i18n.t(removeCharacters(item.category))}</Text>
          <Text style={styles.subCategoryCount}>{item.questions.length}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const renderFilters = ({
  filterCorrectAnswersOnly,
  setFilterCorrectAnswersOnly,
  filterAlwaysShowTranslation,
  setFilterAlwaysShowTranslation,
}: {
  filterCorrectAnswersOnly: boolean;
  setFilterCorrectAnswersOnly: (value: boolean) => void;
  filterAlwaysShowTranslation: boolean;
  setFilterAlwaysShowTranslation: (value: boolean) => void;
}) => (
  <View style={styles.filterContainer}>
    <Text style={styles.modalTitle}>{i18n.t("filters")}</Text>
    <ToggleSwitch
      label={i18n.t("showOnlyCorrectAnswers")}
      value={filterCorrectAnswersOnly}
      onValueChange={() =>
        setFilterCorrectAnswersOnly(!filterCorrectAnswersOnly)
      }
    />
    <ToggleSwitch
      label={i18n.t("alwaysShowTranslation")}
      value={filterAlwaysShowTranslation}
      onValueChange={() =>
        setFilterAlwaysShowTranslation(!filterAlwaysShowTranslation)
      }
    />
  </View>
);

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: Platform.OS === "web" ? "10%" : 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    fontSize: fontSizeSmall,
    fontWeight: "600",
    color: "#292929",
  },
  activeTabText: {
    color: "#ffffff",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  subCategory: {
    overflow: "hidden",
    alignSelf: "center",
    width: Platform.OS == "web" ? "95%" : "100%",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    gap: 10,
    height: 60,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  subCategoryPressed: {
    opacity: 0.7,
  },
  subCategoryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    height: "100%",
    borderRadius: 2,
    backgroundColor: '#00FF9C',
  },
  subCategoryText: {
    fontSize: fontSizeSmall,
    fontWeight: "600",
    color: "#333",
    width: "93%",
  },
  subCategoryCount: {
    fontSize: fontSizeSmall,
    color: "#666",
    fontWeight: "500",
  },
  filterContainer: {
    maxWidth: 500,
    alignSelf: "right",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export const findDuplicates = (arr) => {
  const uniqueSet = new Set();
  const duplicates = [];

  arr.forEach((item) => {
    const stringified = JSON.stringify(item);
    if (uniqueSet.has(stringified)) {
      duplicates.push(item);
    } else {
      uniqueSet.add(stringified);
    }
  });
  console.log(Array.from(uniqueSet));

  return duplicates;
};

/// insert function
// Function to sanitize strings by removing null characters
const sanitizeString = (str) => {
  if (!str) return ""; // Handle null or undefined
  return str.replace(/\u0000/g, ""); // Remove null characters
};

const questions = []

// Function to sanitize the entire question object
const sanitizeQuestion = (question) => {
  let type = null;
  if (question.category && question.category.includes("GW -")) {
    type = "GW";
  } else if (question.category && question.category.includes("B -")) {
    type = "B";
  }
  return {
    ...question,
    question_text: sanitizeString(question.question_text),
    answers: question.answers ? question.answers.map(sanitizeString) : [],
    correct_answers: question.correct_answers
      ? question.correct_answers.map(sanitizeString)
      : [],
    question_text_fa: sanitizeString(question.question_text_fa),
    answers_fa: question.answers_fa
      ? question.answers_fa.map(sanitizeString)
      : [],
    correct_answers_fa: question.correct_answers_fa
      ? question.correct_answers_fa.map(sanitizeString)
      : [],
    type: type,
  };
};

// Function to check if multiple questions exist in the table
const checkExistingQuestions = async (questionNumbers) => {
  const { data, error } = await supabase
    .from("question")
    .select("question_number")
    .in("question_number", questionNumbers);

  if (error) {
    console.error("Error checking if questions exist:", error);
    return [];
  }

  return data.map((q) => q.question_number); // Return an array of existing question numbers
};

// Function to insert data into the `question` table
export const insertQuestions = async () => {
  try {
    // Sanitize all questions
    const sanitizedQuestions = questions.map(sanitizeQuestion);

    // Extract question numbers for existence check
    const questionNumbers = sanitizedQuestions.map((q) => q.question_number);

    // Check which questions already exist in the database
    const existingQuestionNumbers = await checkExistingQuestions(questionNumbers);

    // Filter out questions that already exist in the database
    const questionsToInsert = sanitizedQuestions.filter(
      (question) => !existingQuestionNumbers.includes(question?.question_number)
    );

    console.log("Questions to insert:", questionsToInsert);
    console.log("Insert started");

    // Insert questions in batches (optional, but recommended for large datasets)
    const batchSize = 100; // Adjust the batch size as needed
    for (let i = 0; i < questionsToInsert.length; i += batchSize) {
      const batch = questionsToInsert.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from("question")
        .insert(batch);

      if (error) {
        console.error("Error inserting questions:", error);
      } else {
        console.log("Questions inserted successfully:", data);
      }
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};
