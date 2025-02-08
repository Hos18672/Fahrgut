import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  PanResponder,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  bgColor,
  fontSizeNormal,
  fontSizeSmall,
} from "./assets/base/styles_assets";
import HomeLearnCategories from "./components/HomeLearnCategories";
import { useRouter } from "expo-router"; // Added useRouter for navigation
import MenuCard from "./components/MenuCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
const { width, height } = Dimensions.get("window");
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
initI18n();

const HomeScreen = () => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const slideAnimation = useRef(new Animated.Value(-300)).current;
  const isWeb = Platform.OS === "web";
  console.log(user?.emailAddresses[0].emailAddress);
  // PanResponder for side menu
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 20,
    onPanResponderMove: (_, gestureState) => {
      const translateX = Math.max(-300, Math.min(0, gestureState.dx - 300));
      slideAnimation.setValue(translateX);
    },
  });

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
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
       {width > 768 && (
      <Image
        source={require("./assets/icon/street.png")}
        style={styles.backgroundStreet}
        resizeMode="cover"
      />
    )}
      {Platform.OS !== "web" || (width < 768 && <HomeLearnCategories />)}
      {/* Main Content Section */}
      <View
        style={[
          styles.mainContent,
          Platform.OS != "web" && styles.mainContentSmall,
        ]}
      >
        <MenuCard
          sideColor={"#007bff"}
          icon={require("./assets/icon/bookmark_icon.png")}
          title={"bookmarks"}
          route={() => router.push("/bookmarks")} // Use router.push for navigation
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
            router.push({ pathname: "/question", params: { isExam: true } })
          }
          isWeb={isWeb}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Platform.OS === "web" && width > 768 ? "#ffffff" : "transparent",
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
    gap: 20,
  },
  mainContentSmall: { paddingHorizontal: 5, gap: 15 },
});

export default HomeScreen;
