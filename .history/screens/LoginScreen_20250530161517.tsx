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
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/types";
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<LoginNavProp>();

  const saveFcmToken = async () => {
    const token = await messaging().getToken();
    const user = auth().currentUser;
    if (user && token) {
      await set(ref(db, `users/${user.uid}/fcmToken`), token);
    }
  };

  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      await saveFcmToken(); // 
      navigation.reset({ index: 0, routes: [{ name: 'MealList' }] });
    } catch (error： any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
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
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
