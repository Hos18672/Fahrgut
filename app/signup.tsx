import React, { useState, useRef } from "react";
import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
} from "react-native";
import { fontSizeSmall } from "./assets/base/styles_assets";

const SignUpScreen = () => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current; // Animation for button scale

  const onSignUpPress = React.useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    // Start button scale animation
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();

    try {
      console.log("Attempting to create sign-up...");
      const signUpAttempt = await signUp.create({
        emailAddress,
        password,
      });

      console.log("Sign-up attempt status:", signUpAttempt.status);

      if (signUpAttempt.status === "complete") {
        console.log("Sign-up complete. Setting active session...");
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/home");
      } else {
        console.error("Unexpected sign-up status:", JSON.stringify(signUpAttempt, null, 2));
        Alert.alert(
          "Error",
          "Sign-up could not be completed. Please check your email for a verification link."
        );
      }
    } catch (err) {
      console.error("Sign-up error:", JSON.stringify(err, null, 2));
      Alert.alert("Error", "An error occurred during sign-up. Please try again.");
    } finally {
      setIsLoading(false);
      // Reset button scale
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoaded, emailAddress, password, scaleAnim]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#999"
            onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#999"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />

          {/* Sign Up Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonLoading]}
              onPress={onSignUpPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Login Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.signUpLink}>Log in</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 15,
  },
  buttonLoading: {
    backgroundColor: "#005bb5", // Slightly darker when loading
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
});

export default SignUpScreen;