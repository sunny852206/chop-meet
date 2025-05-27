import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

type Meal = {
  id: string;
  title: string;
};

export default function CreateMealScreen() {
  const [title, setTitle] = useState("");
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
  button: {
    backgroundColor: "#007aff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
