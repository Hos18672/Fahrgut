import React, { useEffect, useState, useRef } from "react";
import {
    Image,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";

import Icon from "react-native-vector-icons/FontAwesome";
import { lightblueColor } from "../assets/colors";
import { resources } from "../assets/translations";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from 'expo-localization'; // Replace react-native-localize

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale, // Use expo-localization
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const MenuCard = ({ icon, title, route, isWeb }) => {
  const slideAnimation = useRef(new Animated.Value(-300)).current;

  const CardContainer = isWeb
    ? TouchableOpacity
    : Animated.createAnimatedComponent(TouchableOpacity);
  const isSmallScreen =  Platform.OS !== "web";
  return (
    <CardContainer
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
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Platform.OS === "web" ? "20%" : "40%",
    minWidth: 150,
    minHeight: 100,
    maxHeight: Platform.OS === "web" ? "40%" : "40%",
    aspectRatio: 4 / 3,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 5,
    borderLeftColor: lightblueColor,
    shadowOffset: {
        width: 0,
        height: 4, // Vertical shadow
    },
    shadowOpacity: 0.2, // Subtle shadow visibility
    shadowRadius: 6, // Soft edge
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  cardTextSmall: { fontSize: 14 },
  icon:{
    width: 40,
    height:40
  }
});
export default MenuCard;
