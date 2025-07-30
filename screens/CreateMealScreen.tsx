import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../lib/firebase";
import { ref, push } from "firebase/database";
import { auth } from "../lib/firebase";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, Meal } from "../types/types";

type Props = NativeStackScreenProps<RootStackParamList, "CreateMeal">;

export default function CreateMealScreen({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState<"Meal Buddy" | "Open to More">(
    "Meal Buddy"
  );
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [people, setPeople] = useState("2");
  const [max, setMax] = useState("4");

  const handleCreate = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    if (!title || !location || !time || !date) {
      Alert.alert("Missing Fields", "Please fill in all required fields");
      return;
    }

    const newMeal: Omit<Meal, "id"> = {
      title,
      mealType,
      location,
      time,
      date,
      budget,
      cuisine,
      people: Number(people),
      max: Number(max),
      creatorId: userId,
      joinedIds: [userId],
    };
    try {
      const mealRef = ref(db, "meals");
      await push(mealRef, newMeal);
      console.log("New Meal Created:", newMeal);
      Alert.alert("Success", "Meal created successfully");
      navigation.goBack();
    } catch (err) {
      console.error("Failed to create meal:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Required Information</Text>
      <TextInput
        placeholder="Enter event title（Ex: Dollar Shop Hotpot）"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />
      <TextInput
        placeholder="Time (e.g. 18:30)"
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="Cuisine"
        value={cuisine}
        onChangeText={setCuisine}
        style={styles.input}
      />
      <TextInput
        placeholder="Budget ($)"
        value={budget}
        onChangeText={setBudget}
        style={styles.input}
      />
      <TextInput
        placeholder="Max participants"
        value={max}
        onChangeText={setMax}
        style={styles.input}
        keyboardType="numeric"
      />
      {/* Meal Type Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            mealType === "Meal Buddy" && styles.activeToggle,
          ]}
          onPress={() => setMealType("Meal Buddy")}
        >
          <Text>🍜 Meal Buddy</Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            mealType === "Open to More" && styles.activeToggle,
          ]}
          onPress={() => setMealType("Open to More")}
        >
          <Text>❤️ Open to More</Text>
        </Pressable>
      </View>
      <Pressable style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  activeToggle: {
    backgroundColor: "#007aff",
  },
  button: {
    backgroundColor: "#007aff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
