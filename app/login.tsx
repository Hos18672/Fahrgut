import React, { useState } from "react";
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
} from "react-native";
import i18n from "i18next";
import { initI18n } from "./services/initI18n";
initI18n
import { fontSizeSmall } from "./assets/base/styles_assets";
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(`${supabaseUrl}`, `${supabaseKey}`);
const LoginScreen = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State to store error messages
  const router = useRouter();
  console.log(supabaseUrl);
  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        await setActive({ session: signInAttempt.createdSessionId });

        // Get the user ID from Clerk
        const userId = signInAttempt.createdUserId;

        // Check if the user exists in the Supabase `users` table
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", emailAddress)
          .single();

        if (userError && userError.code !== "PGRST116") {
          throw userError;
        }

        // If the user does not exist, insert them into the `users` table
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
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      // Handle specific Clerk errors
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
    }
  }, [isLoaded, emailAddress, password]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"} // Use "padding" for both iOS and Android
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust offset if needed
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled" // Prevent keyboard dismissal on tap
      >
        <View style={styles.formContainer}>
          <Image
            source={require("./assets/icon/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{i18n.t("welcome")}</Text>
          <Text style={styles.subtitle}>{i18n.t("signInToContinue")}</Text>

          {/* Display error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder={i18n.t("enterEmail")}
            placeholderTextColor="#999"
            onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
            keyboardType="email-address"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            value={password}
            placeholder={i18n.t("enterPassword")}
            placeholderTextColor="#999"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />

          {/* Sign In Button */}
          <TouchableOpacity style={styles.button} onPress={onSignInPress}>
            <Text style={styles.buttonText}>{i18n.t("signIn")}</Text>
          </TouchableOpacity>

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
    paddingVertical: 20, // Add padding to avoid content being cut off
    paddingBottom: 100, // Add extra padding at the bottom to accommodate the keyboard
  },
  logo:{
    width:200,
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