import React, { useState } from "react";
import {
  StatusBar,
  Text,
  View,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import CustomHeader from "./components/CustomHeader";
import ExamCheckBoxField from "./components/ExamCheckBoxField";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import {
  bgColor,
  blueColor,
} from "./assets/base/styles_assets";

initI18n();

const ExamScreen = () => {
  const router = useRouter();
  const [GChecked, setGChecked] = useState(false);
  const [BChecked, setBChecked] = useState(false);
  const [alert, setAlert] = useState(false);

  const handleButton = () => {
    if (GChecked || BChecked) {
      router.push({ pathname: "/question", params: { isExam: true, GWIsSelected: GChecked, BIsSelected: BChecked } });
    } else {
      setAlert(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      <CustomHeader title={i18n.t("exam")} customRoute="home" showBackButton />
      <SafeAreaView style={styles.mainContainer}>
        <View>
          <ExamCheckBoxField
            title="Grundwissen"
            checked={GChecked}
            onPress={() => setGChecked((prev) => !prev)}
          />
          <ExamCheckBoxField
            title="Basisswissen"
            checked={BChecked}
            onPress={() => setBChecked((prev) => !prev)}
          />
        </View>
        {alert && <Text style={styles.alertText}>{i18n.t("exam_selection_alert")}</Text>}
        <TouchableOpacity style={styles.submitButton} onPress={handleButton}>
          <Text style={styles.textStyle}>{i18n.t("exam")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: bgColor,
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: bgColor,
  },
  alertText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: blueColor,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ExamScreen;
