import React, { useEffect, useState } from "react";
import {
  StatusBar,
  Text,
  View,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  LayoutAnimation,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  bgColor,
  blueColor,
  fontSizeNormal,
  fontSizeSmall,
} from "./assets/base/styles_assets";
import CustomHeader from "./components/CustomHeader";
import { useUser } from "@clerk/clerk-expo";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { QuizScreenParams, Question } from "./types";
import { useRouter } from "expo-router";
import { supabase } from "./services/supabase";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";

initI18n();
const { width, height } = Dimensions.get("window");

const BookmarksScreen = () => {
  const router = useRouter();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const cureentUserEmail = user?.emailAddresses[0].emailAddress;
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetchBookmarkedQuestions();

    const initQuestions = async () => {
      try {
        const storedQuestions = await AsyncStorage.getItem("questions");
        if (storedQuestions) {
          setQuestions(JSON.parse(storedQuestions));
        }
      } catch (error) {
        console.error("Error parsing questions:", error);
        setQuestions([]);
      }
    };

    initQuestions();
  }, []);

  const fetchBookmarkedQuestions = async () => {
    try {
      setIsLoading(true);
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("question_nr")
        .eq("user_email", cureentUserEmail);

      if (bookmarksError) throw bookmarksError;

      const bookmarkedQuestionNumbers = bookmarks.map((b) => b.question_nr);
      const { data: questions, error: questionsError } = await supabase
        .from("question")
        .select("*");

      if (questionsError) throw questionsError;

      setBookmarkedQuestions(
        questions.filter((q) =>
          bookmarkedQuestionNumbers.includes(q.question_number)
        )
      );
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (question_number: number) => {
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("question_nr", question_number);

      if (!error) {
        setBookmarkedQuestions((prev) =>
          prev.filter((q) => q.question_number !== question_number)
        );
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    question_number: number
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });
    
    return (
      <Animated.View style={[styles.deleteContainer, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity onPress={() => handleDelete(question_number)}>
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const navigateToQuestionScreen = () => {
    router.push({
      pathname: "/question",
      params: {
        isBookmark: true,
        BookmarkedQuestions: JSON.stringify(bookmarkedQuestions),
      },
    });
  };

  const toggleExpand = (question_number: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedQuestion(prev => prev === question_number ? null : question_number);
  };

  const renderAnswers = (question: Question) => {
    return question.answers.map((option, index) => {
      const isCorrect = question.correct_answers.includes(option);
      return (
        <View
          key={index}
          style={[
            styles.answerContainer,
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

  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <View key={index} style={styles.skeletonItem}>
        <View style={styles.skeletonText} />
        <View style={styles.skeletonIcon} />
      </View>
    ));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && (
        <CustomHeader title={i18n.t("bookmarks")} showBackButton={true} />
      )}
      <View style={styles.container}>
        <ScrollView style={styles.list}>
          {isLoading ? renderSkeleton() : bookmarkedQuestions.map((question) => (
            <View key={question.question_number}>
              <Swipeable
                renderRightActions={(progress, dragX) =>
                  renderRightActions(progress, dragX, question.question_number)
                }
                overshootRight={false}
              >
                <TouchableOpacity onPress={() => toggleExpand(question.question_number)}>
                  <View style={[
                    styles.item,
                    expandedQuestion === question.question_number && styles.expandedItem
                  ]}>
                    <Text style={styles.title}>
                      {question.question_number}) {question.question_text}
                    </Text>
                    <View style={styles.iconContainer}>
                      <Ionicons name="bookmark" size={24} color={blueColor} />
                      <Ionicons 
                        name={expandedQuestion === question.question_number ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#666" 
                        style={styles.chevron}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </Swipeable>
              
              {expandedQuestion === question.question_number && (
                <View style={styles.answerMainContainer}>
                  {renderAnswers(question)}
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {!isLoading && bookmarkedQuestions.length > 0 && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={navigateToQuestionScreen}
          >
            <Text style={styles.reviewButtonText}>{i18n.t("reviewAll")}</Text>
          </TouchableOpacity>
        )}

        {!isLoading && bookmarkedQuestions.length === 0 && (
          <Text style={styles.noBookmarks}>{i18n.t("nobookmarks")}</Text>
        )}
      </View>
    </GestureHandlerRootView>)

      }

const styles = StyleSheet.create({
  container: {
    backgroundColor: bgColor,
    flex: 1,
    paddingBottom: Platform.OS === "web" || width < 750 ? 10 : 180,
    paddingHorizontal: width > 950 ? "20%" : 5,
  },
  list: {
    marginTop: Platform.OS !== "web" ? 40 : 0,
  },
  noBookmarks: {
    width: "100%",
    height: "100%",
    alignSelf: "center",
    textAlign: "center",
    paddingVertical: "10%",
    backgroundColor: bgColor,
  },
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
  chevron: {
    marginLeft: "auto",
  },
  title: {
    fontSize: fontSizeSmall,
    color: "#333",
    flexShrink: 1,
  },
  answerMainContainer: {
    backgroundColor: "white",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 12,
  },
  answerContainer: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 5,
    marginBottom: 5,
  },
  answer: {
    fontSize: fontSizeSmall,
    color: "#333",
  },
  deleteContainer: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "76%",
    alignSelf: "center",
    marginHorizontal: 10,
    borderRadius: 12,
    marginVertical: 8,
  },
  reviewButton: {
    backgroundColor: blueColor,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: width < 750 ? 90 : 20,
  },
  reviewButtonText: {
    fontSize: fontSizeSmall,
    color: "white",
    fontWeight: "bold",
  },
  skeletonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
  },
  skeletonText: {
    width: "70%",
    height: 20,
    backgroundColor: "#c7c7c7",
    borderRadius: 4,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    backgroundColor: "#c7c7c7",
    borderRadius: 12,
  },
});

export default BookmarksScreen;