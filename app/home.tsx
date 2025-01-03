import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Platform,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StatusBar,
  ImageSourcePropType,
} from "react-native";

import { Stack, useRouter } from "expo-router"; // Added useRouter for navigation
import { lightblueColor } from "./assets/colors";
import { resources } from "./assets/translations";
import SelectOption from "./components/SelectOptions";
import MenuCard from "./components/MenuCard";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { languageOptions } from "./services/base";

import * as Localization from "expo-localization"; // Replace react-native-localize

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale, // Use expo-localization
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const flags = {
  en: { name: "En", url: require("./assets/us.png") },
  de: { name: "At", url: require("./assets/at.png") },
  fa: { name: "Fa", url: require("./assets/ir.png") },
};

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter(); // Use the router for navigation
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    i18n.language in flags ? i18n.language : "en"
  );
  const slideAnimation = useRef(new Animated.Value(-300)).current;

  const isWeb = Platform.OS === "web";

  // Handle sign out action
  const handleSignOut = async () => {
    try {
      // await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // PanResponder for side menu
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
    onPanResponderMove: (_, gestureState) => {
      const translateX = Math.max(-300, Math.min(0, gestureState.dx - 300));
      slideAnimation.setValue(translateX);
    },
    onPanResponderRelease: (_, gestureState) => {
      const shouldOpen = gestureState.dx > 50;
      Animated.timing(slideAnimation, {
        toValue: shouldOpen ? 0 : -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuVisible(shouldOpen));
    },
  });

  // Change language
  const handleChangeLanguage = (language: string) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Image
          source={require("./assets/logo7.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.profileContainer}>
          <SelectOption
            options={languageOptions}
            selectedValue={selectedLanguage}
            onValueChange={handleChangeLanguage}
          />
          <TouchableOpacity
            onPress={() => router.push("/profile")} // Use router.push for navigation
          >
            <Image
              source={require("./assets/user.png")}
              style={styles.user}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Background Image (only for non-small screens) */}

        <Image
          source={require("./assets/street.png")}
          style={styles.backgroundStreet}
          resizeMode="cover"
        />
   

      {/* Main Content Section */}
      <View style={[styles.mainContent, Platform.OS != "web" && styles.mainContentSmall]}>
        <MenuCard
          icon={require("./assets/road-sign.png")}
          title={"trafficSigns"}
          route={() => router.push("/trafficsigns")} // Use router.push for navigation
          isWeb={isWeb}
        />
        <MenuCard
          icon={require("./assets/book.png")}
          title={"commonWords"}
          route={() => router.push("/commonwords")} // Use router.push for navigation
          isWeb={isWeb}
        />
        <MenuCard
          icon={require("./assets/study.png")}
          title={"learn"}
          route={() => router.push("/learn")} // Use router.push for navigation
          isWeb={isWeb}
        />
        <MenuCard
          icon={require("./assets/quiz.png")}
          title={"quiz"}
          route={() => router.push("/question")} // Use router.push for navigation
          isWeb={isWeb}
        />
        <MenuCard
          icon={require("./assets/deadline.png")}
          title={"exam"}
          route={() => router.push({ pathname: "/question", params: { isExam: true } })}
          isWeb={isWeb}
        />
      </View>

      {/* Side Menu (Slide-out) */}
      <Animated.View
        style={[
          styles.sideMenu,
          {
            transform: [{ translateX: slideAnimation }],
            paddingTop: insets.top + 20,
          },
        ]}
        {...(Platform.OS !== "web" ? panResponder.panHandlers : {})}
      >
        {/* Add side menu content here */}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 0,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  logo: { height: 40, width: 100 },
  user: { height: 50, width: 50 },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: 100,
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
    padding: 16,
    gap: 20,
  },
  mainContentSmall: { paddingHorizontal: 8, gap: 8 },
  sideMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 300,
    height: "100%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default HomeScreen;