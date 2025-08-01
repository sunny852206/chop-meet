import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { db } from "../lib/firebase";
import { ref, push } from "firebase/database";
import { auth } from "../lib/firebase";

import { VIBE_OPTIONS } from "../constants/vibeOptions";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, Meal } from "../types/types";
import VibeSelectorModal from "../components/modals/VibeSelectorModal";

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
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [vibeModalVisible, setVibeModalVisible] = useState(false);

  const toggleVibe = (key: string) => {
    setSelectedVibes((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  };

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
      vibes: selectedVibes,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🍽️ Meal Info</Text>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="Ex: Taco Tuesday"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <Text style={styles.label}>Cuisine</Text>
          <TextInput
            placeholder="Ex: Mexican Fusion"
            value={cuisine}
            onChangeText={setCuisine}
            style={styles.input}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Budget ($)</Text>
              <TextInput
                placeholder="Ex: 20"
                value={budget}
                onChangeText={setBudget}
                style={styles.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Max Participants</Text>
              <TextInput
                placeholder="Ex: 4"
                value={max}
                onChangeText={setMax}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
          </View>
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
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📅 Schedule</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                Date <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                style={styles.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                Time <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder="Ex: 18:30"
                value={time}
                onChangeText={setTime}
                style={styles.input}
              />
            </View>
          </View>
          <Text style={styles.label}>
            Location <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            placeholder="Ex: Downtown Taco House"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎯 Vibe</Text>
          <Text style={styles.label}>Select Vibes</Text>
          <Pressable
            style={[styles.input, { justifyContent: "center" }]}
            onPress={() => setVibeModalVisible(true)}
          >
            <Text>
              {selectedVibes.length > 0
                ? selectedVibes
                    .map(
                      (key) =>
                        VIBE_OPTIONS.find((v) => v.key === key)?.emoji +
                        " " +
                        VIBE_OPTIONS.find((v) => v.key === key)?.label +
                        " "
                    )
                    .join(", ")
                : "Choose Vibes"}
            </Text>
          </Pressable>

          <VibeSelectorModal
            visible={vibeModalVisible}
            selectedVibes={selectedVibes}
            onToggle={(vibes) => setSelectedVibes(vibes)}
            onClose={() => setVibeModalVisible(false)}
          />
        </View>

        <Pressable style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Submit</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  card: {
    marginBottom: 12,
    backgroundColor: "#fafafa",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
    color: "#333",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
    marginTop: 4,
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 4,
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
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
