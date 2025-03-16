import React from "react";
import { StyleSheet, View, Text, Pressable, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function Auth() {
  return (
    <View className="flex-row space-x-4">
      <TouchableOpacity 
        className="flex-1 bg-white h-14 rounded-full items-center justify-center"
        onPress={() => router.push("/signin")}
      >
        <Text className="text-green-600 font-semibold text-lg">Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="flex-1 bg-green-700 h-14 rounded-full items-center justify-center"
        onPress={() => router.push("/signup")}
      >
        <Text className="text-white font-semibold text-lg">Sign Up</Text>
      </TouchableOpacity>
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
