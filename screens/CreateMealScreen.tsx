import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

type Meal = {
  id: string;
  title: string;
  mealType: "Meal Buddy" | "Open to More";
};

export default function CreateMealScreen() {
  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState<"Meal Buddy" | "Open to More">(
    "Meal Buddy"
  );
  const navigation = useNavigation();
  const route = useRoute();

  // Add meal callback from parent screen
  // @ts-ignore
  const addMeal = route.params?.addMeal as (meal: Meal) => void;

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newMeal = {
      id: Date.now().toString(),
      title,
      mealType,
    };

    addMeal(newMeal);
    navigation.goBack();
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
