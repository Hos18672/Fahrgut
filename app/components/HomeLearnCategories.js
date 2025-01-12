import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router"; // Use Expo Router
import BQuestions from "../assets/Questions/B.json";
import GWQuestions from "../assets/Questions/GW.json";
import { groupByCategory, CustomTab, SubCategoryItem } from "../base";

const HomeLearnCategories = () => {
  const grundwissenCategories = groupByCategory(GWQuestions);
  const basiswissenCategories = groupByCategory(BQuestions);
  const allCategories = [...grundwissenCategories, ...basiswissenCategories];
  const router = useRouter(); // Use Expo Router

  const handleSubCategorySelect = (subCategory) => {
    router.push({
      pathname: "/question",
      params: {
        category: subCategory,
      },
    });
  };
  return (
    <SafeAreaView style={styles.section}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ScrollView}>
        {allCategories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.categoryCard,  index === 0 && styles.firstItemMargin]}
            onPress={() => handleSubCategorySelect(item.category)}
          >
            <Text style={styles.categoryText}>{item.category.replace('GW - ', '').replace('B - ','')}</Text>
          </TouchableOpacity>
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
    paddingVertical: 10,
  },
  firstItemMargin: {
    marginLeft: 15, // Add a left margin only for the first item
  },
  section: {
    alignSelf: "center",
    width: "100%",
    marginTop: 20,
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
    fontSize: 14,
    fontWeight: "500",
    alignContent: "center",
    alignItems: "center",
  },
});

export default HomeLearnCategories;
