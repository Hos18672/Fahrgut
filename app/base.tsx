import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";
import ToggleSwitch from "./components/ToggleSwitch";
import { CustomTabProps, SubCategoryItemProps } from "./types";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
initI18n();

export const removeCharacters =(name)=>{
  return name.replace(/[ -\/\\]/g, '');
}


export const flags = {
  de: { name: "At", url: require("./assets/at.png") },
  en: { name: "En", url: require("./assets/us.png") },
  fa: { name: "Fa", url: require("./assets/ir.png") },
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
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.subCategory,
      pressed && styles.subCategoryPressed,
    ]}
  >
    <View style={styles.subCategoryContent}>
      <Text style={styles.subCategoryText}>{i18n.t(removeCharacters(item.category))}</Text>
      <Text style={styles.subCategoryCount}>{item.questions.length}</Text>
    </View>
  </Pressable>
);

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
    paddingHorizontal: Platform.OS === "web" ? "20%" : 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  
  },
  activeTab: {
    backgroundColor: "#0084ff",
  },
  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    fontSize: 14,
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
    alignSelf: "center",
    width: Platform.OS == "web" ? "95%" : "100%",
    padding: 16, 
    marginBottom: 12,
    borderRadius: 12,
    gap: 10,
    backgroundColor: "#fff",
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
  subCategoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    width: "93%"
  },
  subCategoryCount: {
    fontSize: 14,
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


export  const findDuplicates = (arr) => {
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
  console.log(Array.from(uniqueSet))

  return duplicates;
};


/// insert function
// Function to sanitize strings by removing null characters
const sanitizeString = (str) => {
  if (!str) return ""; // Handle null or undefined
  return str.replace(/\u0000/g, ""); // Remove null characters
};

// Function to sanitize the entire question object
const sanitizeQuestion = (question) => {
  return {
    ...question,
    question_text: sanitizeString(question.question_text),
    answers: question.answers ? question.answers.map(sanitizeString) : [],
    correct_answers: question.correct_answers ? question.correct_answers.map(sanitizeString) : [],
    question_text_fa: sanitizeString(question.question_text_fa),
    answers_fa: question.answers_fa ? question.answers_fa.map(sanitizeString) : [],
    correct_answers_fa: question.correct_answers_fa ? question.correct_answers_fa.map(sanitizeString) : [],
  };
};
// Function to check if a question exists in the table
const questionExists = async (question_number) => {
  const { data, error } = await supabase
    .from("question")
    .select("question_number")
    .eq("question_number", parseInt(question_number));

  if (error) {
    console.error("Error checking if question exists:", error);
    return false;
  }

  return data.length > 0; // Return true if data exists, false otherwise
};

// Function to insert data into the `question` table
const insertQuestions = async () => {
  try {
    // Sanitize all questions
    const sanitizedQuestions = questions.map(sanitizeQuestion);

    // Filter out questions that already exist in the database
    const questionsToInsert = [];
    for (const question of sanitizedQuestions) {
      const exists = await questionExists(question.question_number);
      if (!exists) {
        questionsToInsert.push(question);
      } else {
        console.log(`Question ${question.question_number} already exists. Skipping.`);
      }
    }

    // Insert only new questions into the database
    if (questionsToInsert.length > 0) {
      const { data, error } = await supabase
        .from("question")
        .insert(questionsToInsert);

      if (error) {
        console.error("Error inserting questions:", error);
      } else {
        console.log("Questions inserted successfully:", data);
      }
    } else {
      console.log("No new questions to insert.");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};
