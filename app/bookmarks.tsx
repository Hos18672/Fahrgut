import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  PanResponder,
  StatusBar,
  ScrollView,
} from "react-native";
import { bgColor } from "./assets/colors";
import CustomBottomNav from "./components/CustomNavBar";
import CustomHeader from "./components/CustomHeader";
const BookmarksScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && <CustomHeader title="Bookmarks" showBackButton={true} />}
      {Platform.OS !== "web" && <CustomBottomNav screenName={"bookmarks"} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: bgColor,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BookmarksScreen;
