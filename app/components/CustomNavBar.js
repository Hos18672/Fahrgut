import React, { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 
import i18n from "i18next";
import { initI18n } from "../services/initI18n";
initI18n();

const CustomBottomNav = React.memo(({ screenName }) => {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const [animation] = useState(new Animated.Value(0));
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Define the language change handler
  const handleLanguageChange = (lng) => {
    setCurrentLanguage(lng);
  };

  // Add the event listener and clean it up properly
  useEffect(() => {
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Memoize the translation function
  const translate = useMemo(() => (key) => i18n.t(key), [currentLanguage]);

  // Define navigation items using the translate function
  const navItems = [
    { icon: "home-outline", label: translate("home"), route: "/home", color: "#FF6B6B" },
    { icon: "book-outline", label: translate("learn"), route: "/learn", color: "#4ECDC4" },
    { icon: "text-outline", label: translate("commonWords"), route: "/commonwords", color: "#4ECDC4" },
    { icon: "bookmark-outline", label: translate("bookmarks"), route: "/bookmarks", color: "#45B7D1" },
    { icon: "person-outline", label: translate("profile"), route: "/profile", color: "#96CEB4" },
  ];

  // Update selected index when screenName or currentLanguage changes
  useEffect(() => {
    const currentIndex = navItems.findIndex(
      (item) => item.route.replace("/", "") === screenName
    );
    if (currentIndex !== -1) {
      setSelected(currentIndex);
      Animated.spring(animation, {
        toValue: currentIndex,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    }
  }, [screenName, currentLanguage, navItems]);

  // Handle navigation press
  const handlePress = (index, route) => {
    setSelected(index);
    router.push(route);
    Animated.spring(animation, {
      toValue: index,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  };

  return (
    <View
      key={currentLanguage}
      style={{
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "white",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 15,
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {navItems.map((item, index) => {
          const isSelected = selected === index;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handlePress(index, item.route)}
              style={{
                alignItems: "center",
                paddingHorizontal: 5,
                paddingVertical: 8,
              }}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: animation.interpolate({
                        inputRange: [index - 1, index, index + 1],
                        outputRange: [1, 1.2, 1],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                }}
              >
                <View
                  style={{
                    alignContent: "center",
                    alignItems: "center",
                    padding: 6,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: isSelected ? "#F3F4F6" : "transparent",
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isSelected ? item.color : "#9CA3AF"}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    fontWeight: isSelected ? "600" : "400",
                    color: isSelected ? "#111827" : "#6B7280",
                    textAlign: "center",
                  }}
                >
                  {item.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.screenName === nextProps.screenName;
});

export default CustomBottomNav;