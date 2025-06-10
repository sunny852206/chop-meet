import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../firebase";
import { ref, push, set } from "firebase/database";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import type { Meal } from "../types";

export default function CreateMealScreen() {
  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState<"Meal Buddy" | "Open to More">("Meal Buddy");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(new Date());
  const [budget, setBudget] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { addMeal, userId } = route.params || {};

  const handleCreate = async () => {
    if (!title || !location || !time || !budget || !cuisine || !userId) {
      alert("Please fill in all fields.");
      return;
    }

    const newMeal: Meal = {
      id: `${Date.now()}`,
      title,
      mealType,
      location,
      time,
      date: date.toISOString().split("T")[0],
      budget,
      cuisine,
      people: 1,
      max: 4,
      creatorId: userId,
      joinedIds: [userId],
    };

    try {
      const newMealRef = push(ref(db, "meals"));
      await set(newMealRef, newMeal);

      addMeal(newMeal);
      navigation.goBack();
    } catch (err) {
      console.error("Failed to upload meal to Firebase", err);
      alert("Failed to create meal. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🍴 Create a Meal Event</Text>

      <TextInput
        style={styles.input}
        placeholder="Event Title"
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, mealType === "Meal Buddy" && styles.activeToggle]}
          onPress={() => setMealType("Meal Buddy")}
        >
          <Text>🍜 Meal Buddy</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, mealType === "Open to More" && styles.activeToggle]}
          onPress={() => setMealType("Open to More")}
        >
          <Text>❤️ Open to More</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.input}
        placeholder="Time (e.g. 6:30 PM)"
        value={time}
        onChangeText={setTime}
      />

      <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>📅 {date.toDateString()}</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Budget (e.g. $20-30)"
        value={budget}
        onChangeText={setBudget}
      />
      <TextInput
        style={styles.input}
        placeholder="Cuisine Type"
        value={cuisine}
        onChangeText={setCuisine}
      />

      <Pressable style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>✔️ Submit Meal</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  toggleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  activeToggle: { backgroundColor: "#d0ebff" },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  dateButtonText: {
    fontSize: 16,
  },
  createButton: {
    backgroundColor: "#4caf50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
