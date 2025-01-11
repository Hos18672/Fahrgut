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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";
import { groupByCategory, CustomTab, SubCategoryItem } from "./base";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { bgColor } from "./assets/colors";
import { supabase } from "./services/supabase"; // Import Supabase client

initI18n();

const LearnScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const [allQuestions, setAllQuestions] = useState([]); // Store all questions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch all questions from Supabase once when the screen loads
  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        let allQuestions = [];
        let offset = 0;
        const limit = 1000; // Number of rows to fetch per request

        while (true) {
          const { data, error } = await supabase
            .from("question")
            .select("*")
            .range(offset, offset + limit - 1); // Fetch rows in chunks

          if (error) throw error;

          if (data.length === 0) break; // Stop if no more rows are returned

          allQuestions = [...allQuestions, ...data];
          offset += limit;
        }

        setAllQuestions(allQuestions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuestions();
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
      const subCategoryQuestions = filteredQuestions.filter(
        (q) => q.category === subCategory
      );

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
            onPress={() => handleSubCategorySelect(item.category)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && <CustomHeader title="Learn" showBackButton={true} />}
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
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 4,
    width: "95%",
    alignSelf: "center",
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#0084ff",
    marginTop: 10,
  },
  tabContent: {
    flex: 1,
    backgroundColor: bgColor,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: Platform.OS !== "web" ? "30%" : 20,
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
    fontSize: 16,
  },
  skeletonContainer: {
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