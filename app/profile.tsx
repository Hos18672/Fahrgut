import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomHeader from "./components/CustomHeader";
import {
  StatusBar,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { bgColor, fontSizeNormal, fontSizeSmall } from "./assets/base/styles_assets";
import { supabase } from "./services/supabase";
import { Ionicons } from "@expo/vector-icons";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
import { Picker } from "@react-native-picker/picker";
import { languageOptions } from "./services/base";
initI18n();

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(
    user?.emailAddresses[0]?.emailAddress || ""
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    i18n.language
  );

  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", user?.emailAddresses[0]?.emailAddress);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setFirstName(data[0].first_name);
          setLastName(data[0].last_name);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ first_name: firstName, last_name: lastName })
        .eq("email", user?.emailAddresses[0]?.emailAddress);

      if (error) {
        throw error;
      }

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleChangeLanguage = (language: string) => {
    setSelectedLanguage(language);
    i18n.changeLanguage(language);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={bgColor} />
      {Platform.OS === "web" && (
        <CustomHeader title={i18n.t("profile")} showBackButton={true} />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: screenHeight - insets.top - insets.bottom },
          ]}
        >
          <View style={styles.profileCard}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <Text style={styles.profileGreeting}>
                {i18n.t("hello")}, {firstName}!
              </Text>
            </View>

            {/* Language Selector */}
            <View style={styles.languageSelector}>
              <Text style={styles.label}>{i18n.t("selectLanguage")}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedLanguage}
                  onValueChange={handleChangeLanguage}
                  style={styles.picker}
                >
                  {languageOptions.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* User Information */}
            {isEditing ? (
              <>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={i18n.t("firstName")}
                />
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={i18n.t("lastName")}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  disabled={true}
                  placeholder={i18n.t("email")}
                  keyboardType="email-address"
                />

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateProfile}
                  >
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>{i18n.t("save")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.CancelEditButton}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.editButtonText}>{i18n.t("cancel")}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoLabel}>{i18n.t("firstName")}</Text>
                  <Text style={styles.infoValue}>{firstName}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoLabel}>{i18n.t("lastName")}</Text>
                  <Text style={styles.infoValue}>{lastName}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoLabel}>{i18n.t("email")}</Text>
                  <Text style={styles.infoValue}>{email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.editButtonText}>{i18n.t("editProfile")}</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Sign Out Button */}
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.signOutButtonText}>{i18n.t("signOut")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    paddingVertical: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileGreeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  languageSelector: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: fontSizeSmall,
    color: "#666",
    marginBottom: 5,
  },
  pickerContainer: {
    width: "100%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    width: "100%",
    height: 50,
  },
  infoContainer: {
    width: "100%",
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: fontSizeSmall,
    color: "#666",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: fontSizeNormal,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: fontSizeSmall,
    backgroundColor: "#f9f9f9",
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  editButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#007bff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
  },
  CancelEditButton: {
    width: "32%",
    height: 50,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
  },
  editButtonText: {
    fontSize: fontSizeSmall,
    fontWeight: "bold",
    color: "#fff",
  },
  saveButton: {
    width: "65%",
    height: 50,
    backgroundColor: "#28a745",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    gap: 10,
  },
  saveButtonText: {
    fontSize: fontSizeSmall,
    fontWeight: "bold",
    color: "#fff",
  },
  signOutButton: {
    left:0,
    alignSelf:"left",
    width: "50%",
    height: 50,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  signOutButtonText: {
    fontSize: fontSizeSmall,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ProfileScreen;