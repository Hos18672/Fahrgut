import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ResponsiveQuizImage from "./components/ResponsiveQuizImage";
import { ExamResultScreenProps, WrongAnswer } from "./types";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { bgColor } from "./assets/colors";
initI18n();

const question_images_url =
  "https://osfxlrmxaifoehvxztqv.supabase.co/storage/v1/object/public/question_images";

const ExamResultScreen: React.FC<ExamResultScreenProps> = ({
  examAnsweredQuestions,
}) => {
  const [wrongAnswersList, setWrongAnswersList] = useState<WrongAnswer[]>([]);
  const [correctAnswersList, setCorrectAnswersList] = useState<
    Array<{ question: string; answers: string[] }>
  >([]);
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [imageURLs, setImageURLs] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<"wrong" | "correct">("wrong");

  if (!examAnsweredQuestions || !Array.isArray(examAnsweredQuestions)) {
    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.errorText}>{i18n.t("NoExamDataAvailable")}.</Text>
      </View>
    );
  }

  useEffect(() => {
    const correctList: Array<{ question: string; answers: string[] }> = [];
    const wrongList: WrongAnswer[] = [];
    examAnsweredQuestions.forEach((obj) => {
      const answers = obj.userAnswers;
      const correctAnswers = obj.question.correct_answers;

      const allCorrect =
        correctAnswers.every((answer) => answers.includes(answer)) &&
        answers.every((answer) => correctAnswers.includes(answer));

      if (allCorrect) {
        correctList.push({
          question: obj.question.question_text,
          answers: answers,
        });
      } else {
        wrongList.push({
          question_text: obj.question.question_text,
          question_number: obj.question.question_number,
          correctAnswers,
        });
      }
    });

    setCorrectAnswersList(correctList);
    setWrongAnswersList(wrongList);
  }, [examAnsweredQuestions]);

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

  const totalQuestions = examAnsweredQuestions.length;
  const correctCount = correctAnswersList.length;
  const wrongCount = wrongAnswersList.length;
  const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const toggleExpand = async (index: number, questionNumber: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    if (!imageURLs[questionNumber]) {
      await loadImageURL(questionNumber);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.resultsContainer}>
          <Text style={styles.title}>{i18n.t("ExamResults")}</Text>

          {/* Results Card */}
          <View style={styles.resultsCard}>
            <View style={styles.resultItem}>
              <Ionicons name="star" type="material" color="#FFD700" size={30} />
              <Text style={styles.resultText}>{score.toFixed(2)}%</Text>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="checkmark-outline" type="material" color="#4CAF50" size={30} />
              <Text style={styles.resultText}>{correctCount}</Text>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="close" type="material" color="#F44336" size={30} />
              <Text style={styles.resultText}>{wrongCount}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "wrong" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("wrong")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "wrong" && styles.activeTabText,
                ]}
              >
                {i18n.t("WrongAnswers")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "correct" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("correct")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "correct" && styles.activeTabText,
                ]}
              >
                {i18n.t("CorrectAnswers")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.tabContentContainer}
          >
            {activeTab === "wrong" ? (
              wrongAnswersList.length > 0 ? (
                wrongAnswersList.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.listItem}
                    onPress={() => toggleExpand(index, item.question_number)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.questionText}>
                        {item.question_text}
                      </Text>
                      {expandedItems[index] && (
                        <View style={styles.correctAnswerContainer}>
                          {imageURLs[item.question_number] && (
                            <ResponsiveQuizImage
                              imageURL={imageURLs[item.question_number] || ""}
                              maxWidth={250}
                            />
                          )}
                          <Text style={styles.correctAnswerHeader}>
                            Correct Answer(s):
                          </Text>
                          {item.correctAnswers.map((answer, idx) => (
                            <Text key={idx} style={styles.correctAnswerText}>
                              {idx + 1}) {answer}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                    <Ionicons
                      name={expandedItems[index] ? "chevron-down-outline" : "chevron-forward-outline"}
                      type="material"
                      color="#333"
                      size={22}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noWrongAnswers}>
                  {i18n.t("GreatNoWrongAnswers")}.
                </Text>
              )
            ) : (
              correctAnswersList.map((item, index) => (
                <View key={index} style={styles.correctListItem}>
                  <Text style={styles.questionText}>{item.question}</Text>
                  <Text style={styles.correctAnswerText}>
                    Your Answer: {item.answers.join(", ")}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: bgColor,
  },
  container: {
    flex: 1,
    width: Platform.OS === "web" ? "60%" : "100%",
    alignSelf: "center",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: bgColor,
    alignItems: "center",
    borderRadius: 10,
    padding: Platform.OS === "web" ? 20 : 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  resultsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    paddingHorizontal: "10%",
    width: "95%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  resultItem: {
    alignItems: "center",
  },
  resultText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  resultLabel: {
    fontSize: 14,
    color: "#777",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "95%",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    margin: 5,
  },
  activeTabButton: {
    backgroundColor: "#007BFF",
  },
  tabText: {
    fontSize: 16,
    color: "#777",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tabContent: {
    width: Platform.OS === "web" ? "95%" : "98%",
    maxHeight: Platform.OS === "web" ? "60vh" : "auto",
    overflow: "auto",
  },
  tabContentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  correctListItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  correctAnswerContainer: {
    marginTop: 10,
    borderRadius: 8,
    gap: 5,
  },
  correctAnswerHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  correctAnswerText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#0ba30b",
    padding: 5,
  },
  noWrongAnswers: {
    fontSize: 16,
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
});

export default ExamResultScreen;