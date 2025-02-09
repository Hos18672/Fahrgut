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
import * as Localization from "expo-localization";

i18n.use(initReactI18next).init({
  resources,
  lng: Localization.locale,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const MenuCard = ({ sideColor, icon, title, route, isWeb }) => {
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const shadowAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const backgroundAnimation = useRef(new Animated.Value(0)).current;

  const handleHoverIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1.3,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnimation, {
        toValue: 12,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnimation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleHoverOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const CardContainer = isWeb
    ? TouchableOpacity
    : Animated.createAnimatedComponent(TouchableOpacity);
  const isSmallScreen = Platform.OS !== "web";


  return (
    <CardContainer
      style={[
        styles.card,
        isSmallScreen && styles.cardSmallScreen,
        {
          shadowRadius: shadowAnimation,
          shadowOffset: { width: 0, height: 4 },
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.05)',
        },
      ]}
      onPress={route}
      onMouseEnter={isWeb ? handleHoverIn : undefined}
      onMouseLeave={isWeb ? handleHoverOut : undefined}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnimation }],
          opacity: backgroundAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.9],
          }),
        }}
      >
        <Image source={icon} style={styles.icon} />
      </Animated.View>
      <Text style={[styles.cardText, isSmallScreen && styles.cardTextSmall]}>
        {i18n.t(title)}
      </Text>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    width: Platform.OS === "web" ? "20%" : "40%",
    minWidth: 160,
    minHeight: 100,
    maxHeight: Platform.OS === "web" ? "40%" : "40%",
    aspectRatio: 4 / 3,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    elevation: 3,
    transition: Platform.OS === "web" ? 'all 0.3s ease-in-out' : undefined,
  },
  cardText: {
    marginTop: 16,
    fontSize: fontSizeSmall,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  cardTextSmall: {
    fontSize: 14,
  },
  icon: {
    width: 40,
    height: 40,
  },
});

export default MenuCard;