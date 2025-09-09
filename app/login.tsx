import React, { useState, useRef } from "react";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { createClient } from "@supabase/supabase-js";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
initI18n();
import { fontSizeSmall } from "./assets/base/styles_assets";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(`${supabaseUrl}`, `${supabaseKey}`);

const LoginScreen = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const passwordInputRef = useRef(null); // Ref for password input

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        const userId = signInAttempt.createdUserId;

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", emailAddress)
          .single();

        if (userError && userError.code !== "PGRST116") {
          throw userError;
        }

        if (!user) {
          const { error: insertError } = await supabase
            .from("users")
            .insert([{ email: emailAddress }]);

          if (insertError) {
            throw insertError;
          }
        }

        router.replace("/home");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError("Sign-in could not be completed. Please try again.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));

      if (err.errors && err.errors.length > 0) {
        const clerkError = err.errors[0];
        setError(
          clerkError.longMessage ||
            clerkError.message ||
            "An error occurred during sign-in."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoaded, emailAddress, password, scaleAnim]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Image
            source={require("./assets/icon/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{i18n.t("welcome")}</Text>
          <Text style={styles.subtitle}>{i18n.t("signInToContinue")}</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder={i18n.t("enterEmail")}
            placeholderTextColor="#999"
            onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()} // Focus password input on "Next"
          />

          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            value={password}
            placeholder={i18n.t("enterPassword")}
            placeholderTextColor="#999"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
            returnKeyType="go"
            onSubmitEditing={onSignInPress} // Trigger sign-in on "Enter"
          />

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonLoading]}
              onPress={onSignInPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{i18n.t("signIn")}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Sign Up Link
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/signup")}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
          */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 100,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  formContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: fontSizeSmall,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: fontSizeSmall,
    backgroundColor: "#f9f9f9",
  },
  button: {
    height: 50,
    backgroundColor: "#007bff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: "10%",
  },
  buttonLoading: {
    backgroundColor: "#005bb5",
  },
  buttonText: {
    fontSize: fontSizeSmall,
    fontWeight: "bold",
    color: "#fff",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  signUpText: {
    fontSize: fontSizeSmall,
    color: "#666",
  },
  signUpLink: {
    fontSize: fontSizeSmall,
    color: "#007bff",
    fontWeight: "bold",
    marginLeft: 5,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: "#c62828",
    fontSize: fontSizeSmall,
    textAlign: "center",
  },
});

export default LoginScreen;