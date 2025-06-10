import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";


type LandingNav = NativeStackNavigationProp<RootStackParamList, "Landing">;

export default function LandingScreen() {
  const navigation = useNavigation<LandingNav>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ Welcome to Chop Meet</Text>
      <Text style={styles.subtitle}>
        Find people. Share a meal. Make connections.
      </Text>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fdf6f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  registerButton: {
    backgroundColor: "#007aff",
    marginRight: 8,
  },
  loginButton: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
