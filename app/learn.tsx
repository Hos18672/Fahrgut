import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
  Pressable,
  SafeAreaView,
  BackHandler, // Add BackHandler
} from "react-native";
import { useRouter } from "expo-router"; // Use Expo Router
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization"; // Use expo-localization
import { resources } from "./assets/translations";
import BQuestions from "./assets/Questions/B.json";
import GWQuestions from "./assets/Questions/GW.json";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale, // Use expo-localization
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const groupByCategory = (questions: any[]) => {
  const categories: { [key: string]: any[] } = {};
  questions.forEach((question) => {
    if (!categories[question.category]) {
      categories[question.category] = [];
    }
    categories[question.category].push(question);
  });
  return Object.entries(categories).map(([category, questions]) => ({
    category,
    questions,
  }));
};

interface CustomTabProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

const CustomTab: React.FC<CustomTabProps> = ({ title, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.tab,
      active && styles.activeTab,
      Platform.OS === "web" && pressed && styles.tabPressed,
    ]}
  >
    <Text style={[styles.tabText, active && styles.activeTabText]}>
      {title}
    </Text>
  </Pressable>
);

interface SubCategoryItemProps {
  item: { category: string; questions: any[] };
  onPress: () => void;
}

const SubCategoryItem: React.FC<SubCategoryItemProps> = ({ item, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.subCategory,
      pressed && styles.subCategoryPressed,
    ]}
  >
    <View style={styles.subCategoryContent}>
      <Text style={styles.subCategoryText}>{i18n.t(item.category)}</Text>
      <Text style={styles.subCategoryCount}>{item.questions.length}</Text>
    </View>
  </Pressable>
);

const LearnScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter(); // Use Expo Router
  const grundwissenCategories = groupByCategory(GWQuestions);
  const basiswissenCategories = groupByCategory(BQuestions);

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        router.back(); // Navigate back to the previous screen
        return true; // Prevent default behavior (closing the app)
      } else {
        // If no screens to go back to, allow the app to close
        return false;
      }
    };

    // Add event listener for hardware back button
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Clean up the event listener
    return () => backHandler.remove();
  }, [router]);

  const handleSubCategorySelect = (subCategory: string, cat: string) => {
    const questions = cat === "GW" ? GWQuestions : BQuestions;
    const subCategoryQuestions = questions.filter(
      (q) => q.category === subCategory
    );

    // Navigate to the Quiz screen using Expo Router
    router.push({
      pathname: "/question",
      params: {
        subCategoryQuestions: JSON.stringify(subCategoryQuestions),
        category: subCategory,
      },
    });
  };

  const renderContent = () => {
    const categories =
      activeTab === 0 ? grundwissenCategories : basiswissenCategories;
    const cat = activeTab === 0 ? "GW" : "B";

    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={styles.contentContainer}
      >
        {categories.map((item) => (
          <SubCategoryItem
            key={item.category}
            item={item}
            onPress={() => handleSubCategorySelect(item.category, cat)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <CustomHeader title="Learn" showBackButton={true} />
      <View style={[styles.tabsContainer]}>
        <CustomTab
          style={{ flex: 1 }}
          title={`${i18n.t("Grundwissen")} (${GWQuestions.length})`}
          active={activeTab === 0}
          onPress={() => setActiveTab(0)}
        />
        <CustomTab
          style={{ flex: 1 }}
          title={`${i18n.t("Basiswissen")} (${BQuestions.length})`}
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
    backgroundColor: "#f5f5f5",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 8,
    width: "100%",
    marginHorizontal: "auto",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#e6f3ff",
  },
  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#0066cc",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#fff",
  },
  subCategory: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      },
    }),
  },
  subCategoryPressed: {
    opacity: 0.7,
  },
  subCategoryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subCategoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  subCategoryCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default LearnScreen;