import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet,
} from "react-native";

import { fontSizeSmall } from "../assets/base/styles_assets";
import { resources } from "../assets/base/translations";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization"; // Replace react-native-localize

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale, // Use expo-localization
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const MenuCard = ({ sideColor, icon, title, route, isWeb }) => {
  const slideAnimation = useRef(new Animated.Value(-300)).current;

  const CardContainer = isWeb
    ? TouchableOpacity
    : Animated.createAnimatedComponent(TouchableOpacity);
  const isSmallScreen = Platform.OS !== "web";
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSmallScreen && styles.cardSmallScreen,
        {
          opacity: isWeb
            ? 1
            : slideAnimation.interpolate({
                inputRange: [-300, 0],
                outputRange: [0.8, 1],
              }),
        },
     
      ]}
      onPress={route}
    >
      <Image source={icon} style={styles.icon} />
      <Text style={[styles.cardText, isSmallScreen && styles.cardTextSmall]}>
        {i18n.t(title)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Platform.OS === "web" ? "20%" : "40%",
    minWidth: 160,
    minHeight: 100,
    maxHeight: Platform.OS === "web" ? "40%" : "40%",
    aspectRatio: 4 / 3,
    backgroundColor: "#fff", // Ensure this is white
    borderRadius: 12,
  
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    marginTop: 12,
    fontSize: fontSizeSmall,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  cardTextSmall: { fontSize: 14 },
  icon: {
    width: 40,
    height: 40,
  },
});
export default MenuCard;
