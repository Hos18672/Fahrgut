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
  );

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const isTablet = screenWidth >= 768;
  const isDesktop = screenWidth >= 1024;

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

  const getResponsiveStyles = () => ({
    container: {
      paddingHorizontal: isDesktop ? 40 : isTablet ? 24 : 16,
    },
    profileCard: {
      maxWidth: isDesktop ? 600 : isTablet ? 500 : "100%",
      padding: isDesktop ? 32 : isTablet ? 28 : 20,
    },
    avatar: {
      width: isDesktop ? 120 : isTablet ? 100 : 80,
      height: isDesktop ? 120 : isTablet ? 100 : 80,
    },
    iconSize: isDesktop ? 120 : isTablet ? 100 : 80,
    greeting: {
      fontSize: isDesktop ? 28 : isTablet ? 24 : 20,
    },
    sectionTitle: {
      fontSize: isDesktop ? 18 : isTablet ? 17 : 16,
    },
  });

  const responsiveStyles = getResponsiveStyles();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Gradient Background */}
      <View style={styles.gradientBackground} />

      {Platform.OS === "web" && (
        <CustomHeader
          title={i18n.t("profile")}
          showBackButton={true}
          customRoute={""}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            responsiveStyles.container,
            { minHeight: screenHeight - insets.top - insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.profileCard, responsiveStyles.profileCard]}>
            {/* Profile Header with Enhanced Avatar */}
            <View style={styles.profileHeader}>
              <View style={[styles.avatarContainer, responsiveStyles.avatar]}>
                <View style={styles.avatarBackground}>
                  <Ionicons
                    name="person"
                    size={responsiveStyles.iconSize * 0.6}
                    color="#6366f1"
                  />
                </View>
                <View style={styles.avatarBorder} />
              </View>

              <Text
                style={[
                  styles.profileGreeting,
                  { fontSize: responsiveStyles.greeting.fontSize },
                ]}
              >
                {i18n.t("hello")}, {firstName}
              </Text>
              <View style={styles.emailContainer}>
                <Ionicons name="mail-outline" size={16} color="#64748b" />
                <Text style={styles.emailText}>{email}</Text>
              </View>

              {/* Status Badge */}
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>

            {/* Language Selector with Enhanced Design */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="language-outline" size={20} color="#6366f1" />
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontSize: responsiveStyles.sectionTitle.fontSize },
                  ]}
                >
                  {i18n.t("selectLanguage")}
                </Text>
              </View>
              <div style={styles.pickerContainer}>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleChangeLanguage(e.target.value)}
                  style={styles.picker}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </View>

            {/* Personal Info with Card-like Design */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={20} color="#6366f1" />
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontSize: responsiveStyles.sectionTitle.fontSize },
                  ]}
                >
                  {i18n.t("personalInfo")}
                </Text>
              </View>

              <View style={styles.infoCard}>
                {isEditing ? (
                  <View style={styles.editingContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {i18n.t("firstName")}
                      </Text>
                      <TextInput
                        style={styles.modernInput}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder={i18n.t("firstName")}
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {i18n.t("lastName")}
                      </Text>
                      <TextInput
                        style={styles.modernInput}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder={i18n.t("lastName")}
                        placeholderTextColor="#94a3b8"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{i18n.t("email")}</Text>
                      <TextInput
                        style={[styles.modernInput, styles.disabledInput]}
                        value={email}
                        editable={false}
                        placeholder={i18n.t("email")}
                        placeholderTextColor="#94a3b8"
                        keyboardType="email-address"
                      />
                    </View>

                    <View style={styles.buttonsContainer}>
                      <TouchableOpacity
                        style={[styles.modernButton, styles.saveButton]}
                        onPress={handleUpdateProfile}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonText}>{i18n.t("save")}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.modernButton, styles.cancelButton]}
                        onPress={() => setIsEditing(false)}
                        activeOpacity={0.8}
                      >
        
                        <Text style={styles.buttonText}>
                          {i18n.t("cancel")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                      <View style={styles.infoLabelContainer}>
                        <Ionicons
                          name="person-outline"
                          size={16}
                          color="#64748b"
                        />
                        <Text style={styles.infoLabel}>
                          {i18n.t("firstName")}
                        </Text>
                      </View>
                      <Text style={styles.infoValue}>{firstName}</Text>
                    </View>

                    <View style={styles.infoItem}>
                      <View style={styles.infoLabelContainer}>
                        <Ionicons
                          name="person-outline"
                          size={16}
                          color="#64748b"
                        />
                        <Text style={styles.infoLabel}>
                          {i18n.t("lastName")}
                        </Text>
                      </View>
                      <Text style={styles.infoValue}>{lastName}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.modernButton, styles.editButton]}
                      onPress={() => setIsEditing(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="create" size={18} color="#fff" />
                      <Text style={styles.buttonText}>
                        {i18n.t("editProfile")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              style={[styles.modernButton, styles.signOutButton]}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out" size={18} color="#fff" />
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
    backgroundColor: "#f8fafc",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "#6366f1",
    opacity: 0.05,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: "25%",
  },
  profileCard: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#ffffff",
    shadowColor: "#1e293b",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },

  // Enhanced Profile Header
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBorder: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#6366f1",
    opacity: 0.3,
  },
  profileGreeting: {
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  emailText: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#dcfce7",
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16a34a",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },

  // Enhanced Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#1e293b",
  },

  // Modern Picker
  pickerContainer: {
    position: "relative",
    borderColor: "#e2e8f0",
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: "#fafafa",
  },
  picker: {
    height: 52,
    width: "100%",
    color: "#0d1117",
    borderRadius: 10,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pickerIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    pointerEvents: "none",
  },

  // Info Card
  infoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoContainer: {
    gap: 16,
  },
  infoItem: {
    gap: 8,
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    paddingLeft: 22,
  },

  // Modern Inputs
  editingContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 4,
  },
  modernInput: {
    height: 52,
    borderColor: "#e2e8f0",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#1e293b",
    fontWeight: "500",
  },
  disabledInput: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
  },

  // Modern Buttons
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modernButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: "#6366f1",
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#059669",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#dc2626",
  },
  signOutButton: {
    backgroundColor: "#dc2626",
    marginTop: 8,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
