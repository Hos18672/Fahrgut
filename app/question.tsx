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
import { bgColor } from "./assets/colors";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { useUser } from "@clerk/clerk-expo";
import { GetRandomQuestions, formatTime, AllQuestions } from "./services/base";
import { removeCharacters } from "./base";
import CustomHeader from "./components/CustomHeader";
import { supabase } from "./services/supabase"; 
initI18n();
const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const QuizScreen = () => {
  const { user } = useUser();
  const cureentUserEmail = user?.emailAddresses[0].emailAddress;
  const params = useLocalSearchParams<QuizScreenParams>();
  const { isExam, category, subCategoryQuestions, BookmarkedQuestions } =
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

  const preloadImages = useCallback(
    async (currentNum: string, nextNum: string) => {
      if (currentNum) {
        const currentURL = `${question_images_url}/${currentNum}.jpg`;
        setImageURL(currentURL);
      }
      if (nextNum) {
        const nextURL = `${question_images_url}/${nextNum}.jpg`;
        setNextImageURL(nextURL);
      }
    },
    []
  );

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
      setImageURL(nextImageURL);
    } else {
      setIsChecked(true);
    }
    if (currentQuestion + 1 >= questions.length) {
      if (subCategoryQuestions) {
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
        setImageURL(nextImageURL);
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
        title={ category ? i18n.t(removeCharacters(category)) : (isExam ? i18n.t("exam") : i18n.t("quiz"))}
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
                <View style={styles.questionContainer}>
                  <View
                    style={{
                      width: "99.999%",
                      paddingVertical: 5,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.questionCount}>{`${
                      currentQuestion + 1
                    }/${questions.length}`}</Text>
                    {isExam && (
                      <View style={{ width: 50 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                          }}
                        >
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
                      source={require("./assets/hamburger.png")}
                      style={styles.hamburgerIcon}
                      resizeMode="cover"
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
                  <Text> {i18n.t("loading")}".."</Text>
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
                      showCorrectAnswers={
                        filterCorrectAnswersOnly
                      }
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
                              {currentQuestion +1 === questions.length && isChecked ? i18n.t("finish") : (isChecked || filterCorrectAnswersOnly
                          ? i18n.t("next")
                          : i18n.t("check"))}
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
                        {currentQuestion + 1 === questions.length ? i18n.t("finish") : (isChecked || isExam ? i18n.t("next") : i18n.t("check"))}
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
  );};

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
      paddingHorizontal: width > 950 ? "5%" : 5,
    },
    skeletonContainer: {
      flex: 1,
      padding: 5,
      borderRadius: 10,
      paddingHorizontal: width > 950 ? "10%" : 5,
    },
    skeletonCategory: {
      height: 20,
      width: "30%",
      backgroundColor: "#e1e1e1",
      marginBottom: 10,
      borderRadius: 10,
    },
    skeletonProgressBar: {
      height: 10,
      width: "100%",
      backgroundColor: "#e1e1e1",
      marginBottom: 20,
      borderRadius: 5,
    },
    skeletonQuestionText: {
      height: 50,
      width: "100%",
      backgroundColor: "#e1e1e1",
      marginBottom: 20,
      borderRadius: 10,
    },
    skeletonImage: {
      height: 200,
      width: "100%",
      backgroundColor: "#e1e1e1",
      marginBottom: 20,
      borderRadius: 10,
    },
    skeletonAnswerOption: {
      height: 40,
      width: "100%",
      backgroundColor: "#e1e1e1",
      marginBottom: 10,
       borderRadius: 5,
    },
    skeletonBottomButtons: {
      height: 50,
      width: "100%",
      backgroundColor: "#e1e1e1",
      marginTop: 20,
      borderRadius: 5,
    },
    mainQuestionContainer: {
      flex: 1,
      backgroundColor: "white",
      borderRadius: 10,
      marginBottom: 10,
      padding:isWeb ? 20: 10, 
      paddingHorizontal: width > 950 ? "15%" : 15,
    },
    progressContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    questionContainer: {
      flex: 1,
    },
    questionCount: {
      fontSize: 16,
      fontWeight: "bold",
    },
    progressBar: {
      height: 10,
      width: "100%",
      borderWidth: 1,
      borderColor: "#4CAF50",
      borderRadius: 5,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#4CAF50",
    },
    hamburgerButton: {
      padding: 10,
      paddingBottom: 0,
    },
    hamburgerIcon: {
      width: 24,
      height: 24,
    },
    questionText: {
      fontSize: 18,
      marginBottom: 10,
    },
    questionNumber: {
      paddingHorizontal: 10,
    },
    questionImage: {
      marginBottom: isWeb ? 40:20,
    },
    answersContainer: {
      marginBottom: isWeb ? 10: 0,
    },
    answerButton: {
      padding: isWeb ? 10: 5,
      borderRadius: 5,
    },
    correctAnswer: {
      backgroundColor: "#6ef573",
      borderColor:  "#06b203",
      padding: isWeb ? 10: 5,
      borderRadius: 5,
    },
    incorrectAnswer: {
      color: "#600000",
      borderColor:  "#ff3636",
      backgroundColor: "#ff7164",
    },
    bottomButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: isWeb ? 30: 10,
      gap: 10,
    },
    submitButton: {
      backgroundColor: "#007bff",
      borderWidth: 1,
      borderColor: "#007bff",
      padding: 10,
      alignItems: "center",
      borderRadius: 10,
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
      borderRadius: 10,
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
      padding: 5,
      borderWidth: 1,
      borderColor: "#333",
      alignItems: "center",
      borderRadius:10,
    },
    languageIcon: {
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    languageText: {
      fontSize: 16,
      fontWeight: "bold",
    },
    sidebar: {
      width: width > 950 ? "20%" : "100%",
      minWidth: 250,
      padding: 20,
      margin: isWeb ? 10: 5,
      marginTop: 0,
      borderRadius: 10,
      backgroundColor: "#ffffff",
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: width > 950 ? "50%" : "90%",
      padding: 20,
      backgroundColor: "#fff",
      borderRadius: 10,
    },
  });
  

export default QuizScreen;
