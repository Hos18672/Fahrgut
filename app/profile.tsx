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
import {
  bgColor,
  fontSizeNormal,
  fontSizeSmall,
} from "./assets/base/styles_assets";
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
  );a

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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {i18n.t("selectLanguage")}
              </Text>
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{i18n.t("personalInfo")}</Text>
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
                      style={[styles.button, styles.saveButton]}
                      onPress={handleUpdateProfile}
                    >
                      <Text style={styles.buttonText}>{i18n.t("save")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={styles.buttonText}>{i18n.t("cancel")}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View
                    style={[
                      styles.infoRow,
                      i18n.language === "fa" && styles.infoRowRTL,
                    ]}
                  >
                    <Text style={styles.infoLabel}>{i18n.t("firstName")}</Text>
                    <Text style={styles.infoValue}>{firstName}</Text>
                  </View>
                  <View
                    style={[
                      styles.infoRow,
                      i18n.language === "fa" && styles.infoRowRTL,
                    ]}
                  >
                    <Text style={styles.infoLabel}>{i18n.t("lastName")}</Text>
                    <Text style={styles.infoValue}>{lastName}</Text>
                  </View>
                  <View
                    style={[
                      styles.infoRow,
                      i18n.language === "fa" && styles.infoRowRTL,
                    ]}
                  >
                    <Text style={styles.infoLabel}>{i18n.t("email")}</Text>
                    <Text style={styles.infoValue}>{email}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.buttonText}>
                      {i18n.t("editProfile")}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}
            >
              <Text style={styles.buttonText}>{i18n.t("signOut")}</Text>
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
    padding: 16,
    gap: 10,
    alignSelf: 'center',
    width: '100%',
  },
  profileCard: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 12,
    padding: 20,
    gap: 10,
    alignSelf: 'center',
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileGreeting: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  section: {
    width: "100%",
    marginBottom: 24,
    gap: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  pickerContainer: {
    width: "100%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    width: "100%",
    height: 48,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoRowRTL: {
    flexDirection: "row-reverse", // Right-to-left for Persian
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  editButton: {
    marginTop: 10,
    minHeight: 48,
    backgroundColor: "#007bff",
  },
  saveButton: {
    backgroundColor: "#28a745",
  },
  cancelButton: {
    backgroundColor: "#ff4444",
  },
  signOutButton: {
    minHeight: 48,
    backgroundColor: "#ff4444",
    marginTop: 24,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

export default ProfileScreen;
