import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  bgColor,
} from "./assets/base/styles_assets";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AllQuestions,shuffleArray } from "./services/base";
import HomeLearnCategories from "./components/HomeLearnCategories";
import { useRouter } from "expo-router"; // Added useRouter for navigation
import MenuCard from "./components/MenuCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
const { width, height } = Dimensions.get("window");
import { initI18n } from "./services/initI18n";
import SearchComponent from "./search";
initI18n();

const HomeScreen = () => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";

  useEffect(() => {
    const fetchData = async () => {
      const allQuestions = await AllQuestions();
      const shuffledQuestions = shuffleArray(allQuestions);
      await AsyncStorage.setItem('questions', JSON.stringify(shuffledQuestions)); // Ensure it's stored as a JSON string
    };
    fetchData();
  }, []);
  

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {width > 768 && (
        <Image
          source={require("./assets/icon/street.png")}
          style={styles.backgroundStreet}
          resizeMode="cover"
        />
      )}
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      <ScrollView style={styles.ScrollView}>
        {width < 768 && (
          <View style={styles.header}>
            <Image
              source={require("./assets/icon/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}
        {width > 768 && (
          <View style={styles.header}>
            <Image
              source={require("./assets/icon/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.profileContainer}>
              {Platform.OS === "web" && (
                <TouchableOpacity onPress={() => router.push("/profile")}>
                  {" "}
                  <Ionicons name={"person-outline"} size={30} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        <SearchComponent/>
        {Platform.OS !== "web" || (width < 768 && <HomeLearnCategories />)}
        {/* Main Content Section */}
        <View
          style={[
            styles.mainContent,
            Platform.OS != "web" && styles.mainContentSmall,
          ]}
        >
          <MenuCard
            sideColor={"#9f00a2"}
            icon={require("./assets/icon/study.png")}
            title={"learn"}
            route={() => router.push("/learn")} // Use router.push for navigation
            isWeb={isWeb}
          />
          <MenuCard
            sideColor={"#ff9100"}
            icon={require("./assets/icon/quiz.png")}
            title={"quiz"}
            route={() => router.push("/question")} // Use router.push for navigation
            isWeb={isWeb}
          />
          <MenuCard
            sideColor={"#ff00e1"}
            icon={require("./assets/icon/exam_icon.png")}
            title={"exam"}
            route={() =>
              router.push({ pathname: "/exam", params: { isExam: true } })
            }
            isWeb={isWeb}
          />

          <MenuCard
            sideColor={"#f72d00"}
            icon={require("./assets/icon/road-sign.png")}
            title={"trafficSigns"}
            route={() => router.push("/trafficsigns")} // Use router.push for navigation
            isWeb={isWeb}
          />
          <MenuCard
            sideColor={"#00e31a"}
            icon={require("./assets/icon/book.png")}
            title={"commonWords"}
            route={() => router.push("/commonwords")} // Use router.push for navigation
            isWeb={isWeb}
          />
          <MenuCard
            sideColor={"#007bff"}
            icon={require("./assets/icon/bookmark_icon.png")}
            title={"bookmarks"}
            route={() => router.push("/bookmarks")} // Use router.push for navigation
            isWeb={isWeb}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
  },
  ScrollView: {
    flex: 1,
    height: "100%",
    paddingBottom: width < 750 ? 90 : 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor:
      Platform.OS === "web" && width > 768 ? "#ffffff" : "transparent",
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 0,
  },
  logo: { height: 40, width: 100 },
  user: { height: 50, width: 50 },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  backgroundStreet: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -1,
  },
  mainContent: {
    flex: 1,
    maxHeight: "40%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
    paddingTop: 0,
    gap: 20,
  },
  mainContentSmall: { paddingHorizontal: 5, gap: 15 },
});

export default HomeScreen;
