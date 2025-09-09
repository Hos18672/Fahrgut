import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ResponsiveQuizImage from "./components/ResponsiveQuizImage";
import ExamResultScreen from "./examrsult";
import CheckboxField from "./components/QuestionCheckBoxField";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuizScreenParams, Question } from "./types";
import { renderFilters } from "./base";
import {
  bgColor,
  blueColor,
  fontSizeNormal,
  fontSizeSmall,
} from "./assets/base/styles_assets";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { useUser } from "@clerk/clerk-expo";
import { GetRandomQuestions, formatTime } from "./services/base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeCharacters } from "./base";
import CustomHeader from "./components/CustomHeader";
import { supabase } from "./services/supabase";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

// Constants
initI18n();
const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const QUESTION_IMAGES_URL = "https://osfxlrmxaifoehvxztqv.supabase.co/storage/v1/object/public/question_images";
const EXAM_TIMER_SECONDS = 1800;

/**
 * Utility function to shuffle an array using Fisher-Yates algorithm
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Utility function to create answer mapping for shuffled options
 */
const createAnswerMapping = (originalAnswers, originalAnswersFa, shuffledIndices) => {
  const answerMapping = {};
  const shuffledAnswers = [];
  const shuffledAnswersFa = [];
  
  shuffledIndices.forEach((originalIndex, newIndex) => {
    const originalAnswer = originalAnswers[originalIndex];
    answerMapping[originalAnswer] = newIndex;
    shuffledAnswers[newIndex] = originalAnswer;
    shuffledAnswersFa[newIndex] = originalAnswersFa[originalIndex];
  });
  
  return { answerMapping, shuffledAnswers, shuffledAnswersFa };
};

/**
 * Process questions for randomization
 */
const processQuestions = (questions, shouldRandomizeQuestions = false, shouldRandomizeAnswers = false) => {
  let processedQuestions = [...questions];
  
  // Randomize question order if needed
  if (shouldRandomizeQuestions) {
    processedQuestions = shuffleArray(processedQuestions);
  }
  
  // Randomize answer options if needed
  if (shouldRandomizeAnswers) {
    processedQuestions = processedQuestions.map(question => {
      const answerIndices = question.answers.map((_, index) => index);
      const shuffledIndices = shuffleArray(answerIndices);
      
      const { answerMapping, shuffledAnswers, shuffledAnswersFa } = createAnswerMapping(
        question.answers,
        question.answers_fa,
        shuffledIndices
      );
      
      return {
        ...question,
        answers: shuffledAnswers,
        answers_fa: shuffledAnswersFa,
        originalAnswerMapping: answerMapping,
      };
    });
  }
  
  return processedQuestions;
};

/**
 * Debounce utility to prevent rapid calls
 */
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const QuizScreen = () => {
  const { user } = useUser();
  const currentUserEmail = user?.emailAddresses[0].emailAddress;
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Extract and validate params
  const {
    isExam = false,
    category,
    BookmarkedQuestions,
    GWIsSelected = false,
    BIsSelected = false,
    isBookmark = false,
  } = params;

  // State management
  const [state, setState] = useState({
    currentQuestion: 0,
    selectedAnswers: [],
    isChecked: false,
    imageURL: null, // Initialize with placeholder
    nextImageURL: null,
    isTranslated: false,
    showFilterModal: false,
    filterCorrectAnswersOnly: false,
    filterAlwaysShowTranslation: false,
    timer: EXAM_TIMER_SECONDS,
    quizEnded: false,
    questions: [],
    questionsLength: 0,
    examAnsweredNums: 0,
    bookmarked: false,
    loading: true,
    answeredCorrectly: false,
  });

  // Separate state for complex objects to avoid deep updates
  const [correctHistory, setCorrectHistory] = useState({});
  const [answerHistory, setAnswerHistory] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [examAnsweredQuestions, setExamAnsweredQuestions] = useState([]);

  // Memoized values
  const textAlign = useMemo(() => {
    return state.isTranslated ? "right" : "left";
  }, [state.isTranslated]);

  const progress = useMemo(() => {
    if (state.questions.length === 0) return 0;
    return ((state.currentQuestion + 1) / state.questions.length) * 100;
  }, [state.currentQuestion, state.questions.length]);

  const currentQuestionData = useMemo(() => {
    return state.questions[state.currentQuestion] || null;
  }, [state.questions, state.currentQuestion]);

  // Update state helper
  const updateState = useCallback((updates) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  /**
   * Fetch questions by category from AsyncStorage
   */
  const fetchQuestionsByCategory = useCallback(async (category) => {
    try {
      const storedData = await AsyncStorage.getItem("questions");
      if (storedData) {
        const questions = JSON.parse(storedData);
        return questions.filter((question) => question.category === category);
      }
      return [];
    } catch (err) {
      console.error("Error fetching questions by category:", err.message);
      return [];
    }
  }, []);

  /**
   * Initialize questions based on quiz type
   */
  const initializeQuestions = useCallback(async () => {
    try {
      let questionSet = [];

      if (isExam) {
        // Exam mode: get random questions based on selection
        const gw = GWIsSelected === true ? "GW" : null;
        const b = BIsSelected === true ? "B" : null;
        questionSet = await GetRandomQuestions([gw, b].filter(Boolean));
        updateState({ questionsLength: questionSet.length });
      } else if (category) {
        // Category mode: get all questions for category and randomize
        questionSet = await fetchQuestionsByCategory(category);
        // Process questions for category mode (randomize both questions and answers)
        questionSet = processQuestions(questionSet, true, true);
      } else if (BookmarkedQuestions) {
        // Bookmark mode: parse provided bookmarked questions
        try {
          questionSet = JSON.parse(BookmarkedQuestions);
          // Randomize only answers for bookmarked questions
          questionSet = processQuestions(questionSet, false, true);
        } catch (error) {
          console.error("Error parsing BookmarkedQuestions:", error.message);
          questionSet = [];
        }
      } else {
        // Default mode: get questions from AsyncStorage
        const storedQuestions = await AsyncStorage.getItem("questions");
        if (storedQuestions) {
          questionSet = JSON.parse(storedQuestions);
          // Randomize answers for default mode
          questionSet = processQuestions(questionSet, false, true);
        }
      }

      updateState({ 
        questions: questionSet,
        loading: false 
      });
    } catch (error) {
      console.error("Error initializing questions:", error.message);
      updateState({ 
        questions: [],
        loading: false 
      });
    }
  }, [isExam, category, BookmarkedQuestions, GWIsSelected, BIsSelected, fetchQuestionsByCategory, updateState]);

  /**
   * Preload images for current and next question with validation
   */
  const preloadImages = useCallback(async (currentNum, nextNum) => {
    try {
      // Default placeholder image
      const placeholderImage = "" // Ensure placeholder exists
      let newImageURL = placeholderImage;
      let newNextImageURL = null;

      // Helper function to check if image exists
      const checkImageExists = async (url) => {
        try {
          const response = await fetch(url, { method: "HEAD" });
          return response.ok;
        } catch {
          return false;
        }
      };

      // Preload current question image
      if (currentNum) {
        const currentURL = `${QUESTION_IMAGES_URL}/${currentNum}.jpg`;
        const imageExists = await checkImageExists(currentURL);
        if (imageExists) {
          await ExpoImage.prefetch(currentURL);
          newImageURL = currentURL;
        }
      }

      // Preload next question image
      if (nextNum) {
        const nextURL = `${QUESTION_IMAGES_URL}/${nextNum}.jpg`;
        const nextImageExists = await checkImageExists(nextURL);
        if (nextImageExists) {
          await ExpoImage.prefetch(nextURL);
          newNextImageURL = nextURL;
        }
      }

      // Update state only if component is still mounted
      updateState({ imageURL: newImageURL, nextImageURL: newNextImageURL });
    } catch (error) {
      console.error("Error preloading images:", error);
      // Fallback to placeholder for current image
      updateState({ imageURL: null, nextImageURL: null });
    }
  }, [updateState]);

  /**
   * Get bookmark status for current question
   */
  const getBookmarked = useCallback(async () => {
    if (!currentQuestionData || !currentUserEmail) return;
    
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_email", currentUserEmail)
        .eq("question_nr", currentQuestionData.question_number)
        .single();
      
      updateState({ bookmarked: !!data });
      
      if (error && !error.details?.includes("0 rows")) {
        console.error("Error fetching bookmark:", error);
      }
    } catch (err) {
      console.error("Error in getBookmarked:", err.message);
    }
  }, [currentQuestionData, currentUserEmail, updateState]);

  /**
   * Update progress in database for category mode
   */
  const updateProgressTable = useCallback(async () => {
    if (!currentQuestionData || !currentUserEmail || !category) return;

    try {
      const questionId = parseInt(currentQuestionData.question_number);
      const correctAnswers = currentQuestionData.correct_answers.map(String);
      
      const isAllCorrect =
        state.selectedAnswers.length === correctAnswers.length &&
        state.selectedAnswers.every((answer) => correctAnswers.includes(answer));

      // Check existing progress
      const { data: existingProgress, error: fetchError } = await supabase
        .from("progress")
        .select("attempt_count")
        .eq("question_id", questionId)
        .eq("user_email", currentUserEmail)
        .single();

      if (fetchError && !fetchError.details?.includes("0 rows")) {
        console.error("Error fetching progress:", fetchError);
        return;
      }

      // Update progress
      const { error } = await supabase.from("progress").upsert(
        {
          question_id: questionId,
          user_email: currentUserEmail,
          is_answer_correct: isAllCorrect,
          category: currentQuestionData.category,
          last_attempted: new Date().toISOString(),
          attempt_count: existingProgress ? (existingProgress.attempt_count || 0) + 1 : 1,
        },
        {
          onConflict: "question_id,user_email",
          returning: "minimal",
        }
      );

      if (error) {
        console.error("Error updating progress:", error);
      }
    } catch (err) {
      console.error("Error in updateProgressTable:", err.message);
    }
  }, [currentQuestionData, currentUserEmail, category, state.selectedAnswers]);

  /**
   * Handle bookmark toggle
   */
  const handleBookmarkToggle = useCallback(async () => {
    if (!currentQuestionData || !currentUserEmail) return;

    try {
      const questionNumber = currentQuestionData.question_number;
      
      const { data: existingBookmarks, error: fetchError } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("question_nr", questionNumber)
        .eq("user_email", currentUserEmail);

      if (fetchError) {
        console.error("Error fetching bookmark:", fetchError);
        return;
      }

      if (existingBookmarks && existingBookmarks.length > 0) {
        // Remove bookmark
        const { error: deleteError } = await supabase
          .from("bookmarks")
          .delete()
          .eq("question_nr", parseInt(questionNumber))
          .eq("user_email", currentUserEmail);

        if (deleteError) {
          console.error("Error deleting bookmark:", deleteError);
          return;
        }

        updateState({ bookmarked: false });
      } else {
        // Add bookmark
        const { error: insertError } = await supabase.from("bookmarks").insert([
          {
            user_email: currentUserEmail,
            question_nr: parseInt(questionNumber),
          },
        ]);

        if (insertError) {
          console.error("Error adding bookmark:", insertError);
          return;
        }

        updateState({ bookmarked: true });
      }
    } catch (err) {
      console.error("Error in handleBookmarkToggle:", err.message);
    }
  }, [currentQuestionData, currentUserEmail, updateState]);

  /**
   * Check if an answer option is correct
   */
  const isCorrect = useCallback((answer) => {
    if (!currentQuestionData) return false;
    const correctAnswers = currentQuestionData.correct_answers || [];
    return correctAnswers.includes(answer);
  }, [currentQuestionData]);

  /**
   * Handle checkbox change for answer selection
   */
  const handleCheckboxChange = useCallback((option) => {
    if (state.isChecked) return;

    updateState({
      selectedAnswers: state.selectedAnswers.includes(option)
        ? state.selectedAnswers.filter((answer) => answer !== option)
        : [...state.selectedAnswers, option]
    });
  }, [state.isChecked, state.selectedAnswers, updateState]);

  /**
   * Handle check/next button press
   */
  const handleCheck = useCallback(() => {
    if (!currentQuestionData) return;

    const correctAnswers = currentQuestionData.correct_answers.map(String);
    const isAllCorrect =
      state.selectedAnswers.length === correctAnswers.length &&
      state.selectedAnswers.every((answer) => correctAnswers.includes(answer));

    // Update correct history
    setCorrectHistory(prev => ({
      ...prev,
      [state.currentQuestion]: isAllCorrect,
    }));

    if (state.isChecked) {
      // Move to next question
      const nextQuestion = state.currentQuestion + 1;
      
      // Store current answers in history
      setAnswerHistory(prev => ({
        ...prev,
        [state.currentQuestion]: state.selectedAnswers,
      }));

      // Mark current question as answered
      setAnsweredQuestions(prev => new Set([...prev, state.currentQuestion]));

      if (nextQuestion >= state.questions.length) {
        // Quiz finished - navigate based on mode
        if (category) {
          router.push("/learn");
        } else if (BookmarkedQuestions) {
          router.push("/bookmarks");
        } else {
          router.push("/home");
        }
      } else {
        // Go to next question
        updateState({
          currentQuestion: nextQuestion,
          selectedAnswers: answeredQuestions.has(nextQuestion) 
            ? answerHistory[nextQuestion] || []
            : [],
          isChecked: answeredQuestions.has(nextQuestion) || state.filterCorrectAnswersOnly,
          imageURL: state.nextImageURL || null,
        });
      }
      
      if (category) {
        updateProgressTable();
      }
    } else {
      // Show answers
      updateState({ isChecked: true });
    }
  }, [
    currentQuestionData, 
    state.selectedAnswers, 
    state.currentQuestion, 
    state.isChecked, 
    state.questions.length,
    state.nextImageURL,
    state.filterCorrectAnswersOnly,
    answeredQuestions,
    answerHistory,
    category,
    BookmarkedQuestions,
    router,
    updateState,
    updateProgressTable
  ]);

  /**
   * Handle previous question navigation
   */
  const handlePreviousQuestion = useCallback(() => {
    if (state.currentQuestion > 0) {
      const previousQuestion = state.currentQuestion - 1;

      // Store current answers if checked
      if (state.isChecked) {
        setAnswerHistory(prev => ({
          ...prev,
          [state.currentQuestion]: state.selectedAnswers,
        }));
        setAnsweredQuestions(prev => new Set([...prev, state.currentQuestion]));
      }

      // Restore previous question's state
      updateState({
        currentQuestion: previousQuestion,
        selectedAnswers: answerHistory[previousQuestion] || [],
        isChecked: answeredQuestions.has(previousQuestion),
      });

      // Preload images for previous question
      const previousNum = state.questions[previousQuestion]?.question_number;
      const currentNum = state.questions[state.currentQuestion]?.question_number;
      preloadImages(previousNum, currentNum);
    }
  }, [
    state.currentQuestion, 
    state.isChecked, 
    state.selectedAnswers,
    state.questions,
    answerHistory,
    answeredQuestions,
    updateState,
    preloadImages
  ]);

  /**
   * Handle next question in exam mode
   */
  const handleNextQuestion = useCallback(() => {
    if (isExam) {
      const currentQuestionData = {
        question: state.questions[state.currentQuestion],
        userAnswers: state.selectedAnswers,
      };

      // Store current answers
      setAnswerHistory(prev => ({
        ...prev,
        [state.currentQuestion]: state.selectedAnswers,
      }));
      setAnsweredQuestions(prev => new Set([...prev, state.currentQuestion]));
      setExamAnsweredQuestions(prev => [...prev, currentQuestionData]);

      if (state.currentQuestion + 1 < state.questions.length) {
        const nextQuestion = state.currentQuestion + 1;
        updateState({
          currentQuestion: nextQuestion,
          selectedAnswers: answeredQuestions.has(nextQuestion) 
            ? answerHistory[nextQuestion] || []
            : [],
          isChecked: answeredQuestions.has(nextQuestion),
          imageURL: state.nextImageURL || null,
          timer: state.timer - 1,
          examAnsweredNums: state.examAnsweredNums + 1,
        });
      } else {
        updateState({ quizEnded: true });
      }
    }
  }, [
    isExam,
    state.currentQuestion,
    state.questions,
    state.selectedAnswers,
    state.nextImageURL,
    state.timer,
    state.examAnsweredNums,
    answeredQuestions,
    answerHistory,
    updateState
  ]);

  // Effects
  useEffect(() => {
    setAnsweredQuestions(new Set());
  }, []);

  useEffect(() => {
    initializeQuestions();
  }, [initializeQuestions]);

  // Timer effect
  useEffect(() => {
    if (
      state.timer <= 0 ||
      (state.examAnsweredNums > 0 && state.examAnsweredNums === state.questionsLength)
    ) {
      updateState({ quizEnded: true });
      return;
    }

    if (isExam) {
      const interval = setInterval(() => {
        updateState({ timer: state.timer - 1 });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.timer, state.examAnsweredNums, state.questionsLength, isExam, updateState]);

  // Image preloading effect with debounce
  useEffect(() => {
    if (state.questions.length > 0) {
      getBookmarked();
      const currentNum = currentQuestionData?.question_number;
      const nextNum = state.questions[state.currentQuestion + 1]?.question_number;
      const debouncedPreload = debounce(() => preloadImages(currentNum, nextNum), 100);
      debouncedPreload();
    }
  }, [state.questions, state.currentQuestion, currentQuestionData, getBookmarked, preloadImages]);

  // Event handlers
  const toggleTranslation = useCallback(() => {
    updateState({ isTranslated: !state.isTranslated });
  }, [state.isTranslated, updateState]);

  const toggleFilterModal = useCallback(() => {
    updateState({ showFilterModal: !state.showFilterModal });
  }, [state.showFilterModal, updateState]);

  const setFilterCorrectAnswersOnly = useCallback((value) => {
    updateState({ filterCorrectAnswersOnly: value });
  }, [updateState]);

  const setFilterAlwaysShowTranslation = useCallback((value) => {
    updateState({ filterAlwaysShowTranslation: value });
  }, [updateState]);

  // Render methods
  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonCategory} />
      <View style={styles.skeletonProgressBar} />
      <View style={styles.skeletonQuestionText} />
      <View style={styles.skeletonImage} />
      {[1, 2, 3, 4].map((_, index) => (
        <View key={index} style={styles.skeletonAnswerOption} />
      ))}
      <View style={styles.skeletonBottomButtons} />
    </View>
  );

  const renderFeedback = () => {
    if (isExam || !state.isChecked) return null;
    
    const isCorrectAnswer = correctHistory[state.currentQuestion];
    
    return (
      <View
        style={[
          styles.feedbackContainer,
          isCorrectAnswer ? styles.correctFeedback : styles.wrongFeedback,
        ]}
      >
        <View style={styles.feedbackContent}>
          <Ionicons
            name={isCorrectAnswer ? "checkmark-circle" : "close-circle"}
            size={24}
            color="#fff"
            style={styles.feedbackIcon}
          />
          <Text style={styles.feedbackText}>
            {isCorrectAnswer
              ? i18n.t("questionStatusCorrect")
              : i18n.t("questionStatusWrong")}
          </Text>
        </View>
      </View>
    );
  };

  const renderBottomButtons = () => {
    if (!isExam) {
      return (
        <View style={styles.bottomButtonsContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={[
              styles.commonButton,
              styles.backButton,
              state.currentQuestion === 0 && styles.disabledButton,
            ]}
            onPress={handlePreviousQuestion}
            disabled={state.currentQuestion === 0}
          >
            <Ionicons name="chevron-back-outline" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Check/Next Button */}
          <TouchableOpacity
            style={[
              styles.commonButton,
              state.isChecked ? styles.submitButton : styles.submitButtonUnchecked,
            ]}
            onPress={handleCheck}
          >
            <Text
              style={
                !state.isChecked
                  ? styles.submitButtonText
                  : styles.submitButtonTextUnchecked
              }
            >
              {state.currentQuestion + 1 === state.questions.length && state.isChecked
                ? i18n.t("finish")
                : state.isChecked || state.filterCorrectAnswersOnly
                ? i18n.t("next")
                : i18n.t("check")}
            </Text>
          </TouchableOpacity>

          {/* Translation Button */}
          {!state.filterAlwaysShowTranslation && (
            <TouchableOpacity
              style={[styles.commonButton, styles.translateButton]}
              onPress={toggleTranslation}
            >
              <View style={styles.languageIcon}>
                <Text style={styles.languageText}>
                  {state.isTranslated ? "DE" : "FA"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={[styles.commonButton, styles.submitButton]}
            onPress={handleNextQuestion}
          >
            <Text style={styles.submitButtonTextUnchecked}>
              {state.currentQuestion + 1 === state.questions.length
                ? i18n.t("finish")
                : i18n.t("next")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderFiltersModal = () => (
    <Modal visible={state.showFilterModal} animationType="slide" transparent={true}>
      <TouchableWithoutFeedback onPress={toggleFilterModal}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              {renderFilters({
                filterCorrectAnswersOnly: state.filterCorrectAnswersOnly,
                setFilterCorrectAnswersOnly,
                filterAlwaysShowTranslation: state.filterAlwaysShowTranslation,
                setFilterAlwaysShowTranslation,
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Main render
  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      <CustomHeader
        title={
          category
            ? i18n.t(removeCharacters(category))
            : isExam
            ? i18n.t("exam")
            : isBookmark
            ? i18n.t("bookmarks")
            : i18n.t("quiz")
        }
        customRoute={
          isExam
            ? "exam"
            : category
            ? "learn"
            : isBookmark
            ? "bookmarks"
            : "home"
        }
        showBackButton={true}
        iconRight={
          !state.quizEnded ? (state.bookmarked ? "bookmark" : "bookmark-outline") : ""
        }
        iconRightHandler={handleBookmarkToggle}
      />
      
      <View style={[styles.mainContainer, { alignSelf: !state.quizEnded ? "center" : "auto" }]}>
        {state.loading ? (
          renderSkeletonLoader()
        ) : state.quizEnded ? (
          <ExamResultScreen examAnsweredQuestions={examAnsweredQuestions} />
        ) : (
          <View style={styles.mainQuestionContainer}>
            {/* Progress Section */}
            <View style={styles.progressContainer}>
              <View style={styles.progressSection}>
                <View style={styles.questionCountContainer}>
                  <Text style={styles.questionCount}>
                    {`${state.currentQuestion + 1}/${state.questions.length}`}
                  </Text>
                  {isExam && (
                    <View style={{ width: 40 }}>
                      <Text style={{ fontSize: fontSizeSmall, fontWeight: "bold" }}>
                        {formatTime(state.timer)}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
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

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Question Text */}
              <View style={styles.questionContainer}>
                <Text style={[styles.questionText, { textAlign }]}>
                  <Text style={[styles.questionNumber, { marginLeft: state.isTranslated ? "5px" : "0px" }]}>
                    {currentQuestionData?.question_number})
                  </Text>
                  {state.filterAlwaysShowTranslation || state.isTranslated
                    ? currentQuestionData?.question_text_fa
                    : currentQuestionData?.question_text}
                </Text>
              </View>

              {/* Question Image */}
              <View style={styles.questionImage}>
                <ResponsiveQuizImage imageURL={state.imageURL} />
              </View>

              {/* Feedback */}
              {renderFeedback()}

              {/* Answer Options */}
              <View style={styles.answersContainer}>
                {currentQuestionData?.answers.map((option, index) => (
                  <CheckboxField
                    key={index}
                    option={option}
                    translatedOption={currentQuestionData?.answers_fa[index]}
                    checked={state.selectedAnswers.includes(option)}
                    disabled={state.isChecked}
                    isAnswerCorrect={isCorrect(option)}
                    showTranslation={state.filterAlwaysShowTranslation || state.isTranslated}
                    showCorrectAnswers={state.filterCorrectAnswersOnly}
                    onPress={() => handleCheckboxChange(option)}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Bottom Buttons */}
            {!state.quizEnded && renderBottomButtons()}
          </View>
        )}

        {/* Filter Section/Modal */}
        {width >= 950 && !isExam ? (
          <View style={styles.sidebar}>
            {renderFilters({
              filterCorrectAnswersOnly: state.filterCorrectAnswersOnly,
              setFilterCorrectAnswersOnly,
              filterAlwaysShowTranslation: state.filterAlwaysShowTranslation,
              setFilterAlwaysShowTranslation,
            })}
          </View>
        ) : (
          renderFiltersModal()
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
    paddingHorizontal: 5,
    height: "100%",
    width: isWeb && width > 950 ? "auto" : "100%",
    alignSelf: "center",
    paddingBottom: isWeb && width > 1200 ? 20 : 5,
  },
  mainQuestionContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: isWeb && width > 1200 ? 900 : "100%",
    maxWidth: isWeb && width > 950 ? 900 : "100%",
    alignSelf: "center",
    height: "100%",
    position: "relative",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: "15%",
    paddingHorizontal: 5,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: width > 768 ? 5 : 0,
    maxWidth: 800,
    height: 40,
    alignSelf: "center",
    width: "100%",
    gap: width > 768 ? 12 : 8,
  },
  progressSection: {
    flex: 1,
    marginRight: width > 768 ? 8 : 4,
  },
  questionCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hamburgerButton: {
    padding: width > 768 ? 8 : 6,
    alignSelf: "flex-start",
    marginTop: width > 768 ? 4 : 2,
    backgroundColor: "transparent",
    borderRadius: 6,
    width: width <= 380 ? 40 : 40,
    height: width <= 380 ? 40 : 40,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerIcon: {
    width: 24,
    height: 24,
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
    marginTop: width > 768 ? 8 : 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  questionText: {
    fontSize: fontSizeNormal,
    lineHeight: width > 768 ? 26 : 20,
    color: "#333",
    marginTop: width > 768 ? 10 : 0,
    marginBottom: width > 768 ? 10 : 5,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: width > 768 ? 8 : 4,
  },
  questionNumber: {
    fontWeight: "600",
    marginRight: width > 768 ? 8 : 4,
  },
  questionImage: {
    alignItems: "center",
    marginBottom: width > 768 ? 10 : 8,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  answersContainer: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    marginBottom: width > 768 ? 5 : 5,
  },
  bottomButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 5,
    borderColor: "#ddd",
    borderRadius: 15,
  },
  commonButton: {
    padding: width > 768 ? 13 : 10,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 42,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: width > 768 ? 5 : 2,
  },
  backButton: {
    width: 50,
    maxHeight: 42,
    backgroundColor: blueColor,
    borderColor: blueColor,
  },
  disabledButton: {
    width: 50,
    backgroundColor: "#ccc",
    borderColor: "#ccc",
  },
  submitButton: {
    flex: 2,
    backgroundColor: blueColor,
    borderColor: blueColor,
    borderWidth: 2,
    maxHeight: 42,
  },
  submitButtonUnchecked: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderColor: blueColor,
    borderWidth: 2,
    maxHeight: 42,
  },
  submitButtonText: {
    color: blueColor,
    fontSize: fontSizeSmall,
    fontWeight: "bold",
  },
  submitButtonTextUnchecked: {
    color: "#fff",
    fontSize: fontSizeSmall,
    fontWeight: "bold",
  },
  translateButton: {
    width: 50,
    maxHeight: 42,
    backgroundColor: blueColor,
    borderColor: blueColor,
  },
  languageIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  languageText: {
    fontSize: fontSizeSmall,
    fontWeight: "600",
    color: "#ffffff",
  },
  sidebar: {
    width: width > 950 ? 300 : "100%",
    padding: width > 768 ? 24 : 16,
    margin: isWeb ? 10 : width > 768 ? 5 : 3,
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
    padding: width > 768 ? 16 : 12,
  },
  modalContent: {
    width: width > 950 ? "50%" : "90%",
    maxWidth: 500,
    padding: width > 768 ? 24 : 16,
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
    padding: width > 768 ? 16 : 12,
    borderRadius: 15,
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
  },
  skeletonCategory: {
    height: 24,
    width: "30%",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 16 : 12,
    borderRadius: 8,
  },
  skeletonProgressBar: {
    height: 8,
    width: "100%",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 32 : 24,
    borderRadius: 4,
  },
  skeletonQuestionText: {
    height: 50,
    width: "100%",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 24 : 16,
    borderRadius: 8,
  },
  skeletonImage: {
    height: width > 768 ? 300 : 220,
    width: width > 768 ? 500 : 300,
    alignSelf: "center",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 32 : 24,
    borderRadius: 12,
  },
  skeletonAnswerOption: {
    height: 40,
    width: "100%",
    backgroundColor: "#e1e1e1",
    marginBottom: width > 768 ? 16 : 10,
    borderRadius: 8,
  },
  skeletonBottomButtons: {
    height: 50,
    width: "100%",
    backgroundColor: "#e1e1e1",
    marginTop: width > 768 ? 24 : 16,
    borderRadius: 8,
  },
  // Feedback styles
  feedbackContainer: {
    marginVertical: "3%",
    padding: 7,
    borderRadius: 8,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  feedbackContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  correctFeedback: {
    backgroundColor: "#4CAF50",
  },
  wrongFeedback: {
    backgroundColor: "#F44336",
  },
  feedbackIcon: {
    marginRight: 8,
  },
  feedbackText: {
    color: "#fff",
    fontSize: fontSizeNormal,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default QuizScreen;