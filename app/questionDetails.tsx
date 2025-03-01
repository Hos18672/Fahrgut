import React, { useState } from "react";
import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { createClient } from "@supabase/supabase-js";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  LayoutAnimation,
} from "react-native";
import { fontSizeSmall, blueColor } from "./assets/base/styles_assets";
import { Question } from "./types";
import ResponsiveQuizImage from "./components/ResponsiveQuizImage";

const question_images_url =
  "https://osfxlrmxaifoehvxztqv.supabase.co/storage/v1/object/public/question_images";
const QuestionDetails = ({ question }: { question: Question }) => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [imageURLs, setImageURLs] = useState<{ [key: string]: string }>({});
  if (!question) return null; // Ensure question is defined
  const loadImageURL = async (questionNumber: string) => {
    if (questionNumber && !imageURLs[questionNumber]) {
      try {
        const url = `${question_images_url}/${questionNumber}.jpg`;
        setImageURLs((prev) => ({ ...prev, [questionNumber]: url }));
      } catch (error) {
        console.error("Error fetching image URL:", error);
      }
    }
  };

  const toggleExpand = async (question_number: string) => {
    if (!imageURLs[question_number]) {
      await loadImageURL(question_number);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedQuestion((prev) =>
      prev === question_number ? null : question_number
    );
  };

  const renderAnswers = () => {
    return question.answers.map((option, index) => {
      const isCorrect = question.correct_answers.includes(option);
      return (
        <View
          key={index}
          style={[
            styles.answerItem,
            {
              backgroundColor: isCorrect ? "#e6ffe6" : "#ffe6e6",
              borderColor: isCorrect ? "#00cc00" : "#ff0000",
            },
          ]}
        >
          <Text style={styles.answer}>{option}</Text>
        </View>
      );
    });
  };

  return (
    <View>
      <TouchableOpacity onPress={() => toggleExpand(question.question_number)}>
        <View
          style={[
            styles.item,
            expandedQuestion === question.question_number &&
              styles.expandedItem,
          ]}
        >
          <Text style={styles.title}>
            {question.question_number}) {question.question_text}
          </Text>
          <View style={styles.iconContainer}>
            <Ionicons
              name={
                expandedQuestion === question.question_number
                  ? "chevron-up"
                  : "chevron-down"
              }
              size={20}
              color="#666"
              style={styles.chevron}
            />
          </View>
        </View>
      </TouchableOpacity>

      {expandedQuestion === question.question_number && (
        <View style={[styles.answerMainContainer, imageURLs[question.question_number] ? {gap: 10} : {} ]}>
            {imageURLs[question.question_number] && (
              <ResponsiveQuizImage
                imageURL={imageURLs[question.question_number] || ""}
                maxWidth={250}
              />
            )}
          <View style={styles.answerContainer}>{renderAnswers()}</View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: "white",
    borderRadius: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expandedItem: {
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: blueColor,
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  answerMainContainer: {
    backgroundColor: "white",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 12,
  },
  title: {
    fontSize: fontSizeSmall,
    color: "#333",
    flexShrink: 1,
  },
  chevron: {
    marginLeft: "auto",
  },
  answerItem: {
    padding: 10,
    borderRadius: 8,
  },
  answerContainer:{
    gap: 5
  },
  answer: {
    fontSize: fontSizeSmall,
    color: "#333",
  },
});

export default QuestionDetails;
