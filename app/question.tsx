import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useLocalSearchParams } from "expo-router"; // Use Expo Router
import { SafeAreaView } from "react-native-safe-area-context";
import ResponsiveQuizImage from "./components/ResponsiveQuizImage";
import ToggleSwitch from "./components/ToggleSwitch";
import ExamResultScreen from "./examrsult";
import CheckboxField from "./components/CheckBoxField";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";

import i18n from "i18next";
import {
  GetRandomQuestions,
  downloadImage,
  formatTime,
  getKeyCat,
  allQuestions,
} from "./services/base";

// Define types for route parameters
interface QuizScreenParams {
  isExam?: boolean;
  category?: string;
  subCategoryQuestions?: any[];
}

// Define types for the component state
interface Question {
  question_number: string;
  question_text: string;
  question_text_fa: string;
  answers: string[];
  answers_fa: string[];
  correct_answers: string[];
}

const QuizScreen = () => {
  const params = useLocalSearchParams<QuizScreenParams>(); // Use Expo Router
  const { isExam, category, subCategoryQuestions } = params;
  const { width } = useWindowDimensions();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [nextImageURL, setNextImageURL] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterCorrectAnswersOnly, setFilterCorrectAnswersOnly] =
    useState(false);
  const [filterAlwaysShowTranslation, setFilterAlwaysShowTranslation] =
    useState(false);
  const [examAnsweredQuestions, setExamAnsweredQuestions] = useState<any[]>([]);
  const [timer, setTimer] = useState(1800);
  const [quizEnded, setQuizEnded] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examAnsweredNums, setExamAnsweredNums] = useState(0);
  const insets = useSafeAreaInsets();
  const preloadImages = useCallback(
    async (currentNum: string, nextNum: string) => {
      if (currentNum) {
        const currentURL = await downloadImage(currentNum);
        setImageURL(currentURL);
      }
      if (nextNum) {
        const nextURL = await downloadImage(nextNum);
        setNextImageURL(nextURL);
      }
    },
    []
  );

  useEffect(() => {
    const initQuestions = () => {
      let questionSet = allQuestions || [];

      if (isExam) {
        questionSet = GetRandomQuestions();
      } else if (subCategoryQuestions) {
        questionSet = JSON.parse(subCategoryQuestions);
      }

      setQuestions(questionSet);
    };

    initQuestions();
  }, [isExam, subCategoryQuestions]);

  useEffect(() => {
    if (questions.length > 0) {
      const currentNum = questions[currentQuestion]?.question_number;
      const nextNum = questions[currentQuestion + 1]?.question_number;
      preloadImages(currentNum, nextNum);
    }
  }, [questions, currentQuestion, preloadImages]);

  // Timer functionality
  useEffect(() => {
    if (timer <= 0 || examAnsweredNums === GetRandomQuestions().length) {
      setQuizEnded(true);
      return; // Stop timer
    }

    if (isExam) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, examAnsweredNums]);

  // Preload the image for the first question on mount
  useEffect(() => {
    const firstQuestionNumber = questions[0]?.question_number;
    const nextQuestionNumber = questions[1]?.question_number;

    preloadImages(firstQuestionNumber, nextQuestionNumber);
  }, []);

  const handleCheckboxChange = (option: string) => {
    if (isChecked) return; // Prevent changing answers after checking
    const updatedAnswers = selectedAnswers.includes(option)
      ? selectedAnswers.filter((answer) => answer !== option)
      : [...selectedAnswers, option];
    setSelectedAnswers(updatedAnswers);
  };

  const handleCheck = () => {
    if (isChecked) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswers([]);
      setIsChecked(filterCorrectAnswersOnly);
      setImageURL(nextImageURL);
    } else {
      setIsChecked(true);
    }
  };

  const handleNextQuestion = () => {
    if (isExam) {
      const currentQuestionData = {
        question: questions[currentQuestion],
        userAnswers: selectedAnswers,
      };

      setExamAnsweredQuestions([...examAnsweredQuestions, currentQuestionData]);

      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswers([]);
        setIsChecked(false);
        setImageURL(nextImageURL);
      } else {
        setQuizEnded(true);
      }
      setExamAnsweredNums(examAnsweredNums + 1);
    }
  };

  const toggleTranslation = () => {
    setIsTranslated(!isTranslated);
  };

  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
  };

  const isCorrect = (answer: string) => {
    const correctAnswers = questions[currentQuestion].correct_answers;
    return correctAnswers.includes(answer);
  };

  const getAnswerStyle = (answer: string) => {
    if (!isChecked && !filterCorrectAnswersOnly) return styles.answerButton;

    if (isCorrect(answer)) return [styles.answerButton, styles.correctAnswer];
    if (selectedAnswers.includes(answer) && !isCorrect(answer))
      return [styles.answerButton, styles.incorrectAnswer];

    return filterCorrectAnswersOnly && !isCorrect(answer)
      ? styles.WrongAnswer
      : styles.answerButton;
  };

  // Calculate progress based on the current question
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.modalTitle}>Filters</Text>
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

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <CustomHeader title={isExam ? "Exam" : "Quiz"} showBackButton={true} />
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={category ? {} : { height: 0 }}>
            <Text
              style={{ fontSize: 20, fontWeight: "bold", paddingBottom: 5 }}
            >
              {i18n.t(getKeyCat(category)) || ""}
            </Text>
          </View>
          {quizEnded ? (
            <ExamResultScreen examAnsweredQuestions={examAnsweredQuestions} />
          ) : (
            <View style={styles.mainQuestionContainer}>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.questionContainer,
                    {
                      width:
                        width > 600
                          ? isExam
                            ? "92%"
                            : "100%"
                          : isExam
                          ? "80%"
                          : "100%",
                    },
                  ]}
                >
                  <Text style={styles.questionCount}>{`${
                    currentQuestion + 1
                  } of ${questions.length}`}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                </View>
                {isExam && (
                  <View style={{ width: 60 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        marginTop: 5,
                      }}
                    >
                      {formatTime(timer)}
                    </Text>
                  </View>
                )}
                {width <= 775 && !isExam && (
                  <TouchableOpacity
                    style={styles.hamburgerButton}
                    onPress={toggleFilterModal}
                  >
                    <Image
                      source={require("./assets/hamburger.png")}
                      style={styles.hamburgerIcon}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>
                  <Text style={styles.questionNumber}>
                    {questions[currentQuestion]?.question_number})
                  </Text>
                  {filterAlwaysShowTranslation || isTranslated
                    ? questions[currentQuestion]?.question_text_fa
                    : questions[currentQuestion]?.question_text}
                </Text>
              </View>
              <ResponsiveQuizImage imageURL={imageURL} />
              <View>
                <View style={styles.answersContainer}>
                  {questions[currentQuestion]?.answers.map((option, index) => (
                    <CheckboxField
                      key={index}
                      option={option}
                      translatedOption={
                        questions[currentQuestion]?.answers_fa[index]
                      }
                      checked={selectedAnswers.includes(option)}
                      disabled={isChecked}
                      showTranslation={
                        filterAlwaysShowTranslation || isTranslated
                      }
                      style={getAnswerStyle(option)}
                      onPress={() => handleCheckboxChange(option)}
                    />
                  ))}
                </View>
                {!isExam && (
                  <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity
                      style={
                        isChecked
                          ? styles.submitButton
                          : styles.submitButtonUnchecked
                      }
                      onPress={handleCheck}
                    >
                      <Text
                        style={
                          !isChecked
                            ? styles.submitButtonText
                            : styles.submitButtonTextUnchecked
                        }
                      >
                        {isChecked || filterCorrectAnswersOnly
                          ? i18n.t("next")
                          : i18n.t("check")}
                      </Text>
                    </TouchableOpacity>

                    {/* Translation Button */}
                    {!filterAlwaysShowTranslation && !isExam && (
                      <TouchableOpacity
                        style={styles.translateButton}
                        onPress={toggleTranslation}
                      >
                        <View style={styles.languageIcon}>
                          <Text style={styles.languageText}>
                            {isTranslated ? "DE" : "FA"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                {!quizEnded && isExam && (
                  <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity
                      style={
                        isChecked || isExam
                          ? styles.submitButton
                          : styles.submitButtonUnchecked
                      }
                      onPress={handleNextQuestion}
                    >
                      <Text
                        style={
                          !isChecked && !isExam
                            ? styles.submitButtonText
                            : styles.submitButtonTextUnchecked
                        }
                      >
                        {isChecked || isExam ? i18n.t("next") : i18n.t("check")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
        {/* Filter Section */}
        {width > 775 ? (
          <View style={styles.sidebar}>{renderFilters()}</View>
        ) : (
          <Modal
            visible={showFilterModal}
            animationType="slide"
            transparent={true}
          >
            <TouchableWithoutFeedback onPress={toggleFilterModal}>
              <View style={styles.modalContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={styles.modalContent}>{renderFilters()}</View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  quizContainer: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    color: "blue",
  },
  container: {
    flex: 5,
    alignSelf: "center",
    width: "100%",
    padding: 15,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#333",
  },

  questionCount: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    marginBottom: 0,
  },
  mainContainer:{
    display: "flex",
    flexDirection:"row"
  },
  questionContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 0,
    borderRadius: 8,
  },
  questionCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 4,
  },
  hamburgerButton: {
    width: 40,
  },
  hamburgerIcon: {
    width: 24,
    height: 24,
  },
  mainQuestionContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 15,
  },
  questionContainer: {
    marginTop: 0,
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    paddingRight: 5,
  },
  questionText: {
    fontSize: 16,
    color: "#111",
    marginTop: 5,
  },
  answersContainer: {
    marginBottom: 10,
  },
  answerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 3,
    marginBottom: 5,
    backgroundColor: "#fff",
  },
  WrongAnswer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 3,
    marginBottom: 5,
    backgroundColor: "#fbbfc3",
    borderColor: "#ff3e51",
  },
  correctAnswer: {
    backgroundColor: "#a9fbbc",
    borderColor: "#00c02d",
  },
  incorrectAnswer: {
    backgroundColor: "#fbbfc3",
    borderColor: "#ff3e51",
  },
  checkbox: {
    padding: 0,
    marginRight: 10,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  answerText: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },
  bottomButtonsContainer: {
    width: "100%",
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#007bff",
    borderWidth: 1,
    borderColor: "#007bff",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    flex: 2,
  },
  submitButtonText: {
    color: "#444",
    fontSize: 16,
    fontWeight: "bold",
  },

  submitButtonUnchecked: {
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    flex: 2,
    backgroundColor: "#ffffff",
    borderColor: "#007bff",
  },

  submitButtonTextUnchecked: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  translateButton: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    borderRadius: 5,
  },
  languageIcon: {
    width: 40,
    borderRadius: 20, // Makes it circular
    justifyContent: "center",
    alignItems: "center",
  },
  languageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333", // You can change this color based on your preference
  },

  sidebar: {
    minWidth: 250,
    maxWidth: 400,
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 1,
    borderColor: "#ddd",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  filterContainer: {
    maxWidth: 600,
    padding: 16,
  },
  hamburgerButton: {
    flex: 1,
    minWidth: 40,
    position: "absolute",
    top: 0,
    right: 0,
  },
  resultsContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resultsText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default QuizScreen;
