import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../lib/firebase";
import { ref, push } from "firebase/database";
import { auth } from "../lib/firebase";

type Meal = {
  id: string;
  title: string;
  mealType: "Meal Buddy" | "Open to More";
};

export default function CreateMealScreen() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [budget, setBudget] = useState("");
  const [max, setMax] = useState("4");
  const [mealType, setMealType] = useState<"Meal Buddy" | "Open to More">(
    "Meal Buddy"
  );
  const navigation = useNavigation();
  const route = useRoute();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const newMeal = {
      title,
      mealType,
      date,
      time,
      location,
      cuisine,
      budget,
      max: Number(max),
      people: 1,
      creatorId: auth.currentUser?.uid || "unknown",
      joinedIds: {
        0: auth.currentUser?.uid || "unknown",
      },
    };

    try {
      await push(ref(db, "meals"), newMeal);
      navigation.goBack();
    } catch (err) {
      console.error("🔥 Failed to create meal:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Meal Event</Text>
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
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
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
