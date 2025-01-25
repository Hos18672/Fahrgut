import React, { useState, useEffect, useCallback } from "react";
import {
  StatusBar,
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router"; // Use Expo Router
import { SafeAreaView } from "react-native-safe-area-context";
import ResponsiveQuizImage from "./components/ResponsiveQuizImage";
import ExamResultScreen from "./examrsult";
import CheckboxField from "./components/CheckBoxField";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuizScreenParams, Question } from "./types";
import { renderFilters } from "./base";
import { bgColor, fontSizeNormal, fontSizeSmall } from "./assets/base/styles_assets";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { useUser } from "@clerk/clerk-expo";
import { GetRandomQuestions, formatTime, AllQuestions } from "./services/base";
import { removeCharacters } from "./base";
import CustomHeader from "./components/CustomHeader";
import { supabase } from "./services/supabase";
import { Image as ExpoImage } from "expo-image"; // Use expo-image for better performance

initI18n();
const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const QuizScreen = () => {
  const { user } = useUser();
  const cureentUserEmail = user?.emailAddresses[0].emailAddress;
  const params = useLocalSearchParams<QuizScreenParams>();
  const { isExam, category, BookmarkedQuestions } =
    params;
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
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [textAlign, setTextAlign] = useState("left");
  const question_images_url =
    "https://osfxlrmxaifoehvxztqv.supabase.co/storage/v1/object/public/question_images";
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Preload images for the current and next question
  const preloadImages = useCallback(async (currentNum: string, nextNum: string) => {
    if (currentNum) {
      const currentURL = `${question_images_url}/${currentNum}.jpg`;
      await ExpoImage.prefetch(currentURL); // Preload the current image
      setImageURL(currentURL);
    }
    if (nextNum) {
      const nextURL = `${question_images_url}/${nextNum}.jpg`;
      await ExpoImage.prefetch(nextURL); // Preload the next image
      setNextImageURL(nextURL);
    }
  }, []);

  // Fetch questions by category from Supabase
  const fetchQuestionsByCategory = async (category: string) => {
    try {
      const { data, error } = await supabase
        .from("question")
        .select("*")
        .eq("category", category); // Filter questions by category

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error("Error fetching questions by category:", err.message);
      return [];
    }
  };

  useEffect(() => {
    const initQuestions = async () => {
      let questionSet = (await AllQuestions()) || [];

      if (isExam) {
        questionSet = await GetRandomQuestions();
      } else if (category) {
        // Fetch questions from Supabase based on the category
        questionSet = await fetchQuestionsByCategory(category);
      } else if (BookmarkedQuestions) {
        questionSet = JSON.parse(BookmarkedQuestions);
      }

      setQuestions(questionSet);
      setLoading(false);
    };

    initQuestions();
  }, [isExam, category, BookmarkedQuestions]);

  useEffect(() => {
    if (questions.length > 0) {
      getBookmarked();
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

    // Determine text alignment based on the language
    setTextAlign(isTranslated === "fa" ? "right" : "left");
  }, [timer, examAnsweredNums, textAlign]);

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
      setImageURL(nextImageURL); // Set the next image URL
    } else {
      setIsChecked(true);
    }
    console.log('check')
    if (currentQuestion + 1 >= questions.length) {
      if (category) {
        router.push("/learn");
      } else if (BookmarkedQuestions) {
        isChecked && router.push("/bookmarks");
      } else {
        router.push("/home");
      }
    }
  };

  const handleNextQuestion = () => {
    getBookmarked();
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
        setImageURL(nextImageURL); // Set the next image URL
        setTimer((prevTimer) => prevTimer - 1);
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

  const getBookmarked = async () => {
    const { data: user, error: userError } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_email", cureentUserEmail)
      .eq("question_nr", questions[currentQuestion]?.question_number)
      .single();
    setBookmarked(user ? true : false);
    if (userError) {
      throw userError;
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const bookMarkHandler = async () => {
    const questionNumber = questions[currentQuestion]?.question_number;
    const { data: existingBookmarks, error: fetchError } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("question_nr", questionNumber)
      .eq("user_email", cureentUserEmail); // Add user_email to the query

    if (fetchError) {
      console.error("Error fetching bookmark:", fetchError);
      return;
    }

    if (existingBookmarks && existingBookmarks.length > 0) {
      // If the question is already bookmarked, remove it
      const { error: deleteError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("question_nr", parseInt(questionNumber))
        .eq("user_email", cureentUserEmail); // Add user_email to the delete query

      if (deleteError) {
        console.error("Error deleting bookmark:", deleteError);
        return;
      }

      // Update the state to reflect that the question is no longer bookmarked
      setBookmarked(false);
    } else {
      // If the question is not bookmarked, add it
      const { error: insertError } = await supabase.from("bookmarks").insert([
        {
          user_email: cureentUserEmail,
          question_nr: parseInt(questionNumber),
        },
      ]);

      if (insertError) {
        console.error("Error adding bookmark:", insertError);
        return;
      }

      // Update the state to reflect that the question is now bookmarked
      setBookmarked(true);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      <CustomHeader
        title={
          category
            ? i18n.t(removeCharacters(category))
            : isExam
            ? i18n.t("exam")
            : i18n.t("quiz")
        }
        showBackButton={true}
        iconRight={
          !quizEnded ? (bookmarked ? "bookmark" : "bookmark-outline") : ""
        }
        iconRightHandler={bookMarkHandler}
      />
      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: quizEnded ? "2%" : 10 },
          ]}
        >
          {/* Show loading skeleton if questions are not yet fetched */}
          {loading ? (
            <View style={styles.skeletonContainer}>
              {/* Skeleton for category */}
              <View style={styles.skeletonCategory} />

              {/* Skeleton for progress bar */}
              <View style={styles.skeletonProgressBar} />

              {/* Skeleton for question text */}
              <View style={styles.skeletonQuestionText} />

              {/* Skeleton for image */}
              <View style={styles.skeletonImage} />

              {/* Skeleton for answer options */}
              {[1, 2, 3, 4].map((_, index) => (
                <View key={index} style={styles.skeletonAnswerOption} />
              ))}

              {/* Skeleton for bottom buttons */}
              <View style={styles.skeletonBottomButtons} />
            </View>
          ) : quizEnded ? (
            <ExamResultScreen examAnsweredQuestions={examAnsweredQuestions} />
          ) : (
            <View style={styles.mainQuestionContainer}>
              <View style={styles.progressContainer}>
                <View style={styles.progressSection}>
                  <View style={styles.questionCountContainer}>
                    <Text style={styles.questionCount}>{`${
                      currentQuestion + 1
                    }/${questions.length}`}</Text>
                    {isExam && (
                      <View style={{ width: 50 }}>
                        <Text style={{ fontSize: fontSizeSmall, fontWeight: "bold" }}>
                          {formatTime(timer)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                </View>

                {width <= 950 && !isExam && (
                  <TouchableOpacity
                    style={styles.hamburgerButton}
                    onPress={toggleFilterModal}
                  >
                    <Image
                      source={require("./assets/icon/hamburger.png")}
                      style={styles.hamburgerIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.questionContainer}>
                <Text
                  style={[
                    styles.questionText,
                    { textAlign: isTranslated ? "right" : "left" },
                  ]}
                >
                  <Text style={styles.questionNumber}>
                    {questions[currentQuestion]?.question_number})
                  </Text>
                  {filterAlwaysShowTranslation || isTranslated
                    ? questions[currentQuestion]?.question_text_fa
                    : questions[currentQuestion]?.question_text}
                </Text>
              </View>
              <View style={styles.questionImage}>
                {imageURL ? (
                  <ResponsiveQuizImage imageURL={imageURL} />
                ) : (
                  <Text></Text>
                )}
              </View>

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
                      isAnswerCorrect={isCorrect(option)}
                      style={{}}
                      showTranslation={
                        filterAlwaysShowTranslation || isTranslated
                      }
                      showCorrectAnswers={filterCorrectAnswersOnly}
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
                        {currentQuestion + 1 === questions.length && isChecked
                          ? i18n.t("finish")
                          : isChecked || filterCorrectAnswersOnly
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
                        {currentQuestion + 1 === questions.length
                          ? i18n.t("finish")
                          : isChecked || isExam
                          ? i18n.t("next")
                          : i18n.t("check")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
        {/* Filter Section */}
        {width >= 950 && !isExam ? (
          <View style={styles.sidebar}>
            {renderFilters({
              filterCorrectAnswersOnly,
              setFilterCorrectAnswersOnly,
              filterAlwaysShowTranslation,
              setFilterAlwaysShowTranslation,
            })}
          </View>
        ) : (
          <Modal
            visible={showFilterModal}
            animationType="slide"
            transparent={true}
          >
            <TouchableWithoutFeedback onPress={toggleFilterModal}>
              <View style={styles.modalContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={styles.modalContent}>
                    {renderFilters({
                      filterCorrectAnswersOnly,
                      setFilterCorrectAnswersOnly,
                      filterAlwaysShowTranslation,
                      setFilterAlwaysShowTranslation,
                    })}
                  </View>
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
    flex: 1,
    backgroundColor: bgColor,
  },
  mainContainer: {
    flex: 1,
    flexDirection: isWeb && width > 950 ? "row" : "column",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width > 950 ? "2%" : width > 768 ? 16 : 12, // Adjusted for small screens
    maxWidth: isWeb ? 1200 : "100%",
    alignSelf: "center",
    width: "100%",
  },
  mainQuestionContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    marginVertical: width > 768 ? 10 : 5, // Adjusted for small screens
    padding: width > 768 ? 15 : 12, // Adjusted for small screens
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: isWeb ? 900 : "100%",
    alignSelf: "center",
    width: "100%",
    gap: width > 768 ? 10 : 5,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: width > 768 ? 5 : 3, // Adjusted for small screens
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    gap: width > 768 ? 12 : 8, // Adjusted for small screens
  },
  progressSection: {
    flex: 1,
    marginRight: width > 768 ? 8 : 4, // Adjusted for small screens
  },
  questionCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hamburgerButton: {
    padding: width > 768 ? 8 : 6, // Adjusted for small screens
    alignSelf: "flex-start",
    marginTop: width > 768 ? 4 : 2, // Adjusted for small screens
    backgroundColor: "transparent",
    borderRadius: 6,
    width: width <= 380 ? 40 : 40,
    height: width <= 380 ? 40 : 40,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerIcon: {
    width: width <= 380 ? 20 : 24,
    height: width <= 380 ? 20 : 24,
    opacity: 0.8,
  },
  questionContainer: {
    width: "100%",
  },
  questionCount: {
    fontSize: fontSizeSmall,
    fontWeight: "600",
    color: "#333",
  },
  progressBar: {
    height: 8,
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: width > 768 ? 8 : 4, // Adjusted for small screens
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  questionText: {
    fontSize: fontSizeNormal, // Adjusted for small screens
    lineHeight:  width > 768 ? 26 : 20, // Adjusted for small screens
    color: "#333",
    marginTop:  width > 768 ? 10 : 5, // Adjusted for small screens
    marginBottom: width > 768 ? 10 : 5, // Adjusted for small screens
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: width > 768 ? 8 : 4, // Adjusted for small screens
  },
  questionNumber: {
    fontWeight: "600",
    marginRight: width > 768 ? 8 : 4, // Adjusted for small screens
  },
  questionImage: {
    alignItems: "center",
    marginBottom: width > 768 ? 10 : 8, // Adjusted for small screens
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  answersContainer: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    marginBottom: width > 768 ? 5 : 3, // Adjusted for small screens
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: width > 768 ? "2%" : "1%", // Adjusted for small screens
    gap: width > 768 ? 16 : 12, // Adjusted for small screens
    alignSelf: "center",
    width: "100%",
    maxWidth: 800,
  },
  submitButton: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
    borderWidth: 4,
    padding:  width > 768 ? 13 : 10, // Adjusted for small screens
    borderRadius: 8,
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonUnchecked: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#007bff",
    padding: width > 768 ? 13 : 10, // Adjusted for small screens
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#444",
    fontSize: fontSizeSmall, // Adjusted for small screens
    fontWeight: "600",
  },
  submitButtonTextUnchecked: {
    color: "#fff",
    fontSize:fontSizeSmall, // Adjusted for small screens
    fontWeight: "600",
  },
  translateButton: {
    backgroundColor: "#ffffff",
    padding: width > 768 ? 13 : 10, // Adjusted for small screens
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 8,
    width: 50 , // Adjusted for small screens
    justifyContent: "center",
    alignItems: "center",
  },
  languageText: {
    fontSize: fontSizeSmall, // Adjusted for small screens
    fontWeight: "600",
    color: "#333",
  },
  sidebar: {
    width: width > 950 ? 300 : "100%",
    padding: width > 768 ? 24 : 16, // Adjusted for small screens
    margin: isWeb ? 10 : width > 768 ? 5 : 3, // Adjusted for small screens
    marginTop: 0,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "flex-start",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: width > 768 ? 16 : 12, // Adjusted for small screens
  },
  modalContent: {
    width: width > 950 ? "50%" : "90%",
    maxWidth: 500,
    padding: width > 768 ? 24 : 16, // Adjusted for small screens
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  // Skeleton styles
  skeletonContainer: {
    flex: 1,
    padding: width > 768 ? 16 : 12, // Adjusted for small screens
    borderRadius: 15,
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },
  skeletonCategory: {
    height: 24,
    width: "30%",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 16 : 12, // Adjusted for small screens
    borderRadius: 8,
  },
  skeletonProgressBar: {
    height: 8,
    width: "100%",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 32 : 24, // Adjusted for small screens
    borderRadius: 4,
  },
  skeletonQuestionText: {
    height: 50,
    width: "100%",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 24 : 16, // Adjusted for small screens
    borderRadius: 8,
  },
  skeletonImage: {
    height:  width > 768 ? 300 : 220,
    width: width > 768 ? 500 : 300,
    alignSelf: "center",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 32 : 24, // Adjusted for small screens
    borderRadius: 12,
  },
  skeletonAnswerOption: {
    height: 40,
    width: "100%",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 16 : 10, // Adjusted for small screens
    borderRadius: 8,
  },
  skeletonBottomButtons: {
    height: 50,
    width: "100%",
    backgroundColor: "#e1e1e1",
    marginTop: width > 768 ? 24 : 16, // Adjusted for small screens
    borderRadius: 8,
  },
});
export default QuizScreen;
