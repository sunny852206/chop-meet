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
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

import type { Meal } from "../types";
import uuid from "react-native-uuid";

export default function CreateMealScreen() {
  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState<"Meal Buddy" | "Open to More">("Meal Buddy");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [budget, setBudget] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  // @ts-ignore
  const addMeal = route.params?.addMeal as (meal: Meal) => void;

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newMeal: Meal = {
      id: uuid.v4().toString(),
      title,
      mealType,
      location,
      time,
      budget,
      cuisine,
      people: 1,
      max: 4,
      createdByMe: true,
      date: date.toISOString(),
    };

    addMeal(newMeal);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Meal Event</Text>

      <TextInput
        placeholder="Enter title (e.g. Ramen Danbo)"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input} />
      <TextInput placeholder="Time" value={time} onChangeText={setTime} style={styles.input} />
      <TextInput placeholder="Budget" value={budget} onChangeText={setBudget} style={styles.input} />
      <TextInput placeholder="Cuisine" value={cuisine} onChangeText={setCuisine} style={styles.input} />

      <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>
          📅 {date.toDateString()}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            mealType === "Meal Buddy" && styles.activeToggle,
          ]}
          onPress={() => setMealType("Meal Buddy")}
        >
          <Text>🍜 Just Dinner</Text>
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

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
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
  dateButton: {
    backgroundColor: "#eaeaea",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  dateButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007aff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
