import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { dummyUsers } from "../data/dummyUsers";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long."
      );
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created!");
      navigation.navigate("Login");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  // const handleRegister = () => {
  //   const existingUser = dummyUsers.find((u) => u.email === email);

  //   if (existingUser) {
  //     Alert.alert("Error", "This email is already registered");
  //   } else {
  //     dummyUsers.push({ email, password });
  //     Alert.alert("Success", "Account created (simulated)");
  //     navigation.navigate("Login");
  //   }
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007aff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
