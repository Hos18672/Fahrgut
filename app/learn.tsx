import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StatusBar,
  View,
  ScrollView,
  StyleSheet,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Text,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";
import { groupByCategory, CustomTab, SubCategoryItem } from "./base";
import { bgColor , fontSizeNormal, fontSizeSmall} from "./assets/base/styles_assets";
import { supabase } from "./services/supabase"; // Import Supabase client
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
initI18n();
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProgressQuestions, shuffleArray } from "./services/base";
import { useUser } from "@clerk/clerk-expo";
const { width } = Dimensions.get("window");



const LearnScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const [allQuestions, setAllQuestions] = useState([]); // Store all questions
  const [allProgressQuestions, setAllProgressQuestions] = useState([]); // Store all questions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useUser();
  const cureentUserEmail = user?.emailAddresses[0].emailAddress;
  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check AsyncStorage for stored questions
        const storedData = await AsyncStorage.getItem('questions');
        if (storedData) {
          // Parse stored questions and set to state
          const parsedQuestions = JSON.parse(storedData);
          setAllQuestions(parsedQuestions);
          setLoading(false);
          return; // If data is found in AsyncStorage, return early
        }

        // If no questions in AsyncStorage, fetch from Supabase
        let all_Questions = [];
        let offset = 0;
        const limit = 10000; // Number of rows to fetch per request

        while (true) {
          const { data, error } = await supabase
            .from("question")
            .select("*")
            .range(offset, offset + limit - 1); // Fetch rows in chunks

          if (error) throw error;

          if (data.length === 0) break; // Stop if no more rows are returned

          all_Questions = [...all_Questions, ...data];
          offset += limit;
        }

        // Save fetched questions to AsyncStorage
        await AsyncStorage.setItem('questions', JSON.stringify(all_Questions));

        setAllQuestions(all_Questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuestions();
  }, []); // Empty dependency array to run only once when the component mounts

  useEffect(() => {
    const fetchData = async () => {
      const allProgressQuestions = await getProgressQuestions(cureentUserEmail);
      setAllProgressQuestions(allProgressQuestions)
    };
    fetchData();
  }, []);
  // Calculate the number of GW and B questions
  const [gwCount, bCount] = useMemo(() => {
    const gwQuestions = allQuestions.filter((question) =>
      question.category?.startsWith("GW")
    );
    const bQuestions = allQuestions.filter((question) =>
      question.category?.startsWith("B")
    );
    return [gwQuestions.length, bQuestions.length];
  }, [allQuestions]);

  // Filter questions based on the active tab
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((question) => {
      const prefix = question.category?.startsWith("GW") ? "GW" : "B";
      return activeTab === 0 ? prefix === "GW" : prefix === "B";
    });
  }, [allQuestions, activeTab]);

  // Group questions by category
  const groupedQuestions = useMemo(() => {
    return groupByCategory(filteredQuestions);
  }, [filteredQuestions]);

  const handleSubCategorySelect = useCallback(
    (subCategory: string) => {
      router.push({
        pathname: "/question",
        params: {
          category: subCategory,
        },
      });
    },
    [filteredQuestions]
  );

  // Render loading skeleton for tabs and content
  const renderSkeleton = () => {
    return (
      <View style={styles.skeletonContainer}>
        {/* Skeleton for content */}
        <View style={styles.skeletonContent}>
          {[1, 2, 3, 4, 5].map((_, index) => (
            <View key={index} style={styles.skeletonItem} >
                <View style={styles.skeletonText} />
              </View>
          ))}
        </View>
      </View>
    );
  };

  const getCategoryQuestions= (category: string) => {
    return allQuestions?.filter(item => item.category === category)
  }
  const getProgress= (category: string) => {
    return allProgressQuestions?.filter(item => item.category === category && item.is_answer_correct == true).length
  }
  const renderContent = () => {
    if (loading) {
      return renderSkeleton(); // Show skeleton while loading
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={styles.contentContainer}
      >
        {groupedQuestions.map((item) => (
          <SubCategoryItem
            key={item.category}
            item={item}
            questions={getCategoryQuestions(item.category)}
            questions_progress={getProgress(item.category)}
            onPress={() => handleSubCategorySelect(item.category)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && <CustomHeader title={i18n.t('learn')} showBackButton={true} />}
      <View style={[styles.tabsContainer]}>
        <CustomTab
          style={{ flex: 1 }}
          title={`${i18n.t("Grundwissen")} (${gwCount})`} // Always show GW count
          active={activeTab === 0}
          onPress={() => setActiveTab(0)}
        />
        <CustomTab
          style={{ flex: 1 }}
          title={`${i18n.t("Basiswissen")} (${bCount})`} // Always show B count
          active={activeTab === 1}
          onPress={() => setActiveTab(1)}
        />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
    width: "100%",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 4,
    alignSelf: "center",
    marginHorizontal: 0,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#0084ff",
    marginTop: 10,
    width: width > 768 ? "60%" : "95%", // Adjust width based on screen size
  },
  tabContent: {
    paddingHorizontal: width > 768 ? "18%" :5, // Adjust padding based on screen size
    flex: 1,
    backgroundColor: bgColor,
    paddingBottom: 50,
  },
  contentContainer: {
    paddingTop: 5,
    padding: width > 768 ? 15 : 2, 
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: fontSizeSmall,
  },
  skeletonContainer: {
    paddingHorizontal: width > 768 ? "18%" : 10, // Adjust padding based on screen size
    flex: 1,
    padding: 10,
    paddingTop: 15
  },
  skeletonContent: {
    flex: 1,
    width: "95%",
    alignSelf: "center",
  },
  skeletonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 0,
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
});

export default LearnScreen;