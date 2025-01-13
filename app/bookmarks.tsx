import React, {useRef , useEffect, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { bgColor, blueColor } from "./assets/colors";
import {insertQuestions} from "./base"
import CustomHeader from "./components/CustomHeader";
import { useUser } from "@clerk/clerk-expo";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { useRouter } from "expo-router"; // Use Expo Router
import { supabase } from "./services/supabase";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
initI18n();
const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";




const BookmarksScreen = () => {
  const router = useRouter(); // Use Expo Router
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const { user } = useUser();
  const cureentUserEmail = user?.emailAddresses[0].emailAddress;
  useEffect(() => {
    fetchBookmarkedQuestions();
  }, []);

  // Fetch bookmarked questions
  const fetchBookmarkedQuestions = async () => {
    try {
      setIsLoading(true); // Start loading

      // Step 1: Fetch all bookmarked question_nr from the `bookmarks` table
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("question_nr")
        .eq("user_email", cureentUserEmail);

      if (bookmarksError) {
        console.error("Error fetching bookmarks:", bookmarksError);
        return;
      }

      // Extract the question_nr values from the bookmarks
      const bookmarkedQuestionNumbers = bookmarks.map((b) => b.question_nr);

      // Step 2: Fetch all questions from the `question` table
      const { data: questions, error: questionsError } = await supabase
        .from("question")
        .select("*");

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return;
      }

      // Step 3: Match bookmarked question_nr with question_number in the `question` table
      const matchedQuestions = questions.filter((question) =>
        bookmarkedQuestionNumbers.includes(question.question_number)
      );

      // Step 4: Set the matched questions in the state
      setBookmarkedQuestions(matchedQuestions);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Handle deletion of a bookmarked question
  const handleDelete = async (question_number) => {
    try {
      // Delete the bookmark from the `bookmarks` table
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("question_nr", question_number);

      if (error) {
        console.error("Error deleting bookmark:", error);
      } else {
        // Remove the deleted question from the state
        setBookmarkedQuestions((prev) =>
          prev.filter((q) => q.question_number !== question_number)
        );
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // Render the swipeable delete button
  const renderRightActions = (progress, dragX, question_number) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });
    return (
      <Animated.View
        style={[
          styles.deleteContainer,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity onPress={() => handleDelete(question_number)}>
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Navigate to the QuestionScreen to review all bookmarked questions
  const navigateToQuestionScreen = () => {
    router.push({
      pathname: "/question",
      params: {
        BookmarkedQuestions: JSON.stringify(bookmarkedQuestions),
      },
    });
  };

  // Render skeleton loading UI
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
        <CustomHeader title={i18n.t('bookmarks')} showBackButton={true} />
      )}
      <View style={styles.container}>
        <ScrollView style={styles.list}>
          {isLoading
            ? // Show skeleton loading UI while data is being fetched
              renderSkeleton()
            : // Show actual data once loaded
              bookmarkedQuestions.map((question) => (
                <Swipeable
                  key={question.question_number}
                  renderRightActions={(progress, dragX) =>
                    renderRightActions(
                      progress,
                      dragX,
                      question.question_number
                    )
                  }
                  onSwipeableWillOpen={() =>
                    handleDelete(question.question_number)
                  } 
                  overshootRight={false}
                >
                  <View style={styles.item}>
                    <Text style={styles.title}>
                      {question.question_number}) 
                      {question.question_text}
                    </Text>
                    <Ionicons name="bookmark" size={24} color={blueColor} />
                  </View>
                </Swipeable>
              ))}
        </ScrollView>
        {!isLoading && bookmarkedQuestions.length > 0 && 
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={navigateToQuestionScreen}>
            <Text style={styles.reviewButtonText}>{i18n.t("reviewAll")}</Text>
          </TouchableOpacity>
          }
      </View>
      {!isLoading && bookmarkedQuestions.length < 1 && <Text style={styles.noBookmaks}>{i18n.t("nobookmarks")}</Text>}
      
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: bgColor,
    flex: 1,
    paddingBottom: Platform.OS === "web" ? 10 : 80,
    paddingHorizontal: width > 950 ? "20%" : 5,
  },
  noBookmaks:{
    width: "100%",
    height: "100%",
    alignSelf: "center",
    textAlign: "center",
    paddingVertical: "10%",
    backgroundColor: bgColor
  } ,
  list: {
    marginTop: 40,
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
  },
  number: {
    width: 30,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    color: "#333",
    flexShrink: 1,
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
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 20,
  },
  reviewButtonText: {
    fontSize: 16,
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
