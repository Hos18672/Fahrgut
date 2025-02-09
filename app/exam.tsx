import React, { useRef, useEffect, useState } from "react";
import {
  StatusBar,
  Text,
  View,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  bgColor,
  blueColor,
  fontSizeNormal,
  fontSizeSmall,
} from "./assets/base/styles_assets";
import CustomHeader from "./components/CustomHeader";
import { useUser } from "@clerk/clerk-expo";
import ExamCheckBoxField from "./components/ExamCheckBoxField";
import { useRouter } from "expo-router"; // Use Expo Router
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { SafeAreaView } from "react-native-safe-area-context";
initI18n();
const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const BookmarksScreen = () => {
  const router = useRouter();
  const [GCheked, setGCheked] = useState(false);
  const [BCheked, setBCheked] = useState(false);

 const handleButton =()=>{
    router.push({ pathname: "/question", params: { isExam: true , GWIsSelected:GCheked, BIsSelected: BCheked } });
 }

  return (
    <SafeAreaView style={{ backgroundColor: bgColor, height: "100%" }}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      <CustomHeader title={i18n.t("exam")} customRoute={'home'} showBackButton={true} />
      <SafeAreaView style={styles.mainContainer}>
        <Text>{i18n.t("exam")}</Text>
        <View>
          <ExamCheckBoxField
            title={"Grundwissen"}
            checked={GCheked}
            onPress={() => setGCheked(!GCheked)}
            style={{}}
          />
          <ExamCheckBoxField
            title={"Basisswissen"}
            checked={BCheked}
            onPress={() => setBCheked(!BCheked)}
            style={{}}
          />
        </View>
        <TouchableOpacity
          style={styles.submitButtonText}
          onPress={handleButton}
        >
          <Text style={styles.textStyle}>{i18n.t("exam")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: bgColor,
    gap: 10,
    padding: 10,
    height: "100%",
  },
  submitButtonText: {
    backgroundColor: blueColor,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 20,

  },
  textStyle:{
    color: "white",
  }
});

export default BookmarksScreen;
