import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

type Meal = {
  id: string;
  title: string;
  mealType: "Meal Buddy" | "Open to More";
  location: string;
  time: string;
  budget: string;
  cuisine: string;
};

export default function CreateMealScreen() {
  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState<"Meal Buddy" | "Open to More">("Meal Buddy");

  // new fields
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [budget, setBudget] = useState("");
  const [cuisine, setCuisine] = useState("");

  const navigation = useNavigation();
  const route = useRoute();

  // @ts-ignore
  const addMeal = route.params?.addMeal as (meal: Meal) => void;

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newMeal = {
      id: Date.now().toString(),
      title,
      mealType,
      location,
      time,
      budget,
      cuisine,
    };

    addMeal(newMeal);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Meal Event</Text>

      <TextInput
        placeholder="Enter event title (e.g. Dollar Shop Hotpot)"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="Time (e.g. 6:30 PM)"
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />
      <TextInput
        placeholder="Budget ($)"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Cuisine (e.g. Hotpot, Sushi)"
        value={cuisine}
        onChangeText={setCuisine}
        style={styles.input}
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

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
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
  button: {
    backgroundColor: "#007aff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
