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
      <View style={styles.card}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  card: {
    backgroundColor: "#f2f4f7",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
  email: { fontSize: 16, marginBottom: 8 },
  name: { fontSize: 16, marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginVertical: 6,
    alignItems: "center",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  signOut: {
    backgroundColor: "#dc3545",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
