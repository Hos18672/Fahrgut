import React, { useState, useEffect } from "react";
import {
  StatusBar,
  View,
  ScrollView,
  StyleSheet,
  Platform,
  SafeAreaView,
  BackHandler, // Add BackHandler
} from "react-native";
import CustomBottomNav from "./components/CustomNavBar";
import { useRouter } from "expo-router"; // Use Expo Router
import BQuestions from "./assets/Questions/B.json";
import GWQuestions from "./assets/Questions/GW.json";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";
import { groupByCategory, CustomTab, SubCategoryItem } from "./base";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { blueColor,bgColor } from "./assets/colors";
initI18n();

const LearnScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter(); // Use Expo Router
  const grundwissenCategories = groupByCategory(GWQuestions);
  const basiswissenCategories = groupByCategory(BQuestions);

  const handleSubCategorySelect = (subCategory: string, cat: string) => {
    const questions = cat === "GW" ? GWQuestions : BQuestions;
    const subCategoryQuestions = questions.filter(
      (q) => q.category === subCategory
    );
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
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && <CustomHeader title="Learn" showBackButton={true} />}
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
      {Platform.OS !== "web" && <CustomBottomNav screenName={"learn"} />}
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
  tabPressed: {
    opacity: 0.8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  activeTabText: {
    color: "#0080ff",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: Platform.OS !=="web"? "30%" : 20,
  },
  tabContent: {
    flex: 1,
    backgroundColor: bgColor,
  },
});

export default LearnScreen;
