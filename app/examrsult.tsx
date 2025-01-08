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
import { Icon } from "react-native-elements";
import ResponsiveQuizImage from "./components/ResponsiveQuizImage";
import { ExamResultScreenProps, WrongAnswer } from "./types";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
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
    console.log(examAnsweredQuestions);
    examAnsweredQuestions.forEach((obj) => {
      const answers = obj.userAnswers;
      const correctAnswers = obj.question.correct_answers;

      const allCorrect =
        correctAnswers.every((answer) => answers.includes(answer)) &&
        answers.every((answer) => correctAnswers.includes(answer));

      if (allCorrect) {
        correctList.push({ question: obj.question.question_text, answers: answers });
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
      <ScrollView
        contentContainerStyle={styles.scrollContent} // Use contentContainerStyle
        style={styles.scrollView} // Ensure ScrollView takes up full height
      >
        <View style={styles.resultsContainer}>
          <Text style={styles.title}>{i18n.t("ExamResults")}</Text>

          <View style={styles.scoreContainer}>
            <Text style={styles.resultsText}>
              {i18n.t("YourScore")}: {score.toFixed(2)}%
            </Text>
            <Text style={styles.resultsText}>
              {i18n.t("CorrectAnswers")}: {correctCount}
            </Text>
            <Text style={styles.resultsText}>
              {i18n.t("WrongAnswers")}: {wrongCount}
            </Text>
            <Text style={styles.resultsText}>
              {i18n.t("TotalQuestions")}: {totalQuestions}
            </Text>
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>{i18n.t("WrongAnswers")}:</Text>
            {wrongAnswersList.length > 0 ? (
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
                    {expandedItems[index] ? (
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
                    ) : (
                      ""
                    )}
                  </View>
                  <Icon
                    name={expandedItems[index] ? "expand-less" : "expand-more"}
                    type="material"
                    color="#333"
                    size={24}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noWrongAnswers}>
                {i18n.t("GreatNoWrongAnswers")}.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    marginBottom: "15%"
  },
  scrollView: {
    flex: 1, // Ensure ScrollView takes up the full height
  },
  scrollContent: {
    flexGrow: 1, // Allow content to grow and scroll
    width: Platform.OS=="web" ? "60%" : "100%",
    alignSelf: "center",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  scoreContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  resultsText: {
    fontSize: 18,
    color: "#555",
    marginBottom: 8,
  },
  listContainer: {
    width: "100%",
    marginTop: 20,
    padding: 5,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
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
  },
  correctAnswerContainer: {
    marginTop: 10,
  },
  correctAnswerHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  correctAnswerText: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    margin: 5,
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