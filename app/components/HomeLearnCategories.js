import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { fontSizeSmall } from "../assets/base/styles_assets";
import { useRouter } from "expo-router"; // Use Expo Router
import BQuestions from "../assets/Questions/B.json";
import GWQuestions from "../assets/Questions/GW.json";
import { groupByCategory, CustomTab, SubCategoryItem } from "../base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProgressQuestions, shuffleArray } from "../services/base";
import { useUser } from "@clerk/clerk-expo";
import i18n from "i18next";
import { initI18n } from "../services/initI18n";
initI18n();

const HomeLearnCategories = (itemWidth) => {
  const grundwissenCategories = groupByCategory(GWQuestions);
  const basiswissenCategories = groupByCategory(BQuestions);
  const allCategories = [...grundwissenCategories, ...basiswissenCategories];
  const router = useRouter(); // Use Expo Router
  const [allQuestions, setAllQuestions] = useState([]);
  const [allProgressQuestions, setAllProgressQuestions] = useState([]);
  const { user } = useUser();
  // Initialize animation value without an initial animation
  const cureentUserEmail = user?.emailAddresses[0].emailAddress;
  const handleSubCategorySelect = (subCategory) => {
    router.push({
      pathname: "/question",
      params: {
        category: subCategory,
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const allProgressQuestions = await getProgressQuestions(cureentUserEmail);
      setAllProgressQuestions(allProgressQuestions);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const initializeData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("questions");
        if (storedData) {
          setAllQuestions(JSON.parse(storedData));
          return;
        }
      } catch (err) {
        console.log(err);
      } finally {
      }
    };

    initializeData();
  }, []);

  const getCategoryQuestions = (category: string) => {
    return allQuestions?.filter((item) => item.category === category);
  };
  const getProgress = (category: string) => {
    return allProgressQuestions?.filter(
      (item) => item.category === category && item.is_answer_correct == true
    ).length;
  };
  return (
    <SafeAreaView style={styles.section}>
      <Text style={styles.sectionTitle}> {i18n.t("categories")}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.ScrollView}
      >
        {allCategories.map((item, index) => (
          <SubCategoryItem
            key={item.category}
            item={item}
            questions={getCategoryQuestions(item.category)}
            questions_progress={getProgress(item.category)}
            onPress={() => handleSubCategorySelect(item.category)}
            itemWidth={"250px"}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ScrollView: {
    paddingVertical: 5,
    marginLeft: 10,
  },
  firstItemMargin: {
    marginLeft: 15, // Add a left margin only for the first item
  },
  section: {
    alignSelf: "center",
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    paddingHorizontal: 15,
    color: "#000000",
    marginBottom: 0,
  },
  categoryCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    maxWidth: 180,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    marginRight: 3,
    elevation: 5,
  },
  categoryIcon: {
    height: 50,
    width: 50,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: fontSizeSmall,
    fontWeight: "500",
    alignContent: "center",
    alignItems: "center",
  },
});

export default HomeLearnCategories;
