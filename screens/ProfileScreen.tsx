import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { auth } from "../lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const user = auth.currentUser;
  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [editing, setEditing] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Sign Out Failed", error.message);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
        });
        Alert.alert("Success", "Profile updated!");
        setEditing(false);
      }
    } catch (error) {
      Alert.alert("Update Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      <Text style={styles.email}>Email: {user?.email || "Unknown user"}</Text>

      {editing ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter display name"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <Pressable style={styles.button} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setDisplayName(user?.displayName || "");
              setEditing(false);
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.name}>
            Display Name: {user?.displayName || "Not set"}
          </Text>
          <Pressable style={styles.button} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </Pressable>
        </>
      )}

      <Pressable
        style={[styles.button, styles.signOut]}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  email: { fontSize: 16, marginBottom: 8 },
  name: { fontSize: 16, marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 4,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  signOut: {
    backgroundColor: "#dc3545",
    marginTop: 32,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
