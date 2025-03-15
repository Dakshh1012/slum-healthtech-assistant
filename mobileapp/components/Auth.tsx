import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Auth() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to HealthCare</Text>
      <Text style={styles.subText}>Your health journey begins here</Text>
      
      <Pressable
        style={[styles.button, styles.signInButton]}
        onPress={() => router.push("/signin")}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.signUpButton]}
        onPress={() => router.push("/signup")}
      >
        <Text style={[styles.buttonText, styles.signUpText]}>Create Account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    width: "100%",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.8,
  },
  button: {
    padding: 16,
    borderRadius: 30,
    marginBottom: 12,
    alignItems: "center",
  },
  signInButton: {
    backgroundColor: "white",
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#07A996",
  },
  signUpText: {
    color: "white",
  },
});
