import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { db } from "../lib/firebase"; // adjust path as needed
import { onValue, ref } from "firebase/database";

type Meal = {
  id: string;
  title: string;
  mealType: "Meal Buddy" | "Open to More";
  date: string;
  time: string;
  location: string;
  cuisine: string;
  budget: string;
  max: number;
  people: number;
  creatorId: string;
  joinedIds?: Record<string, string>;
};

export default function MealListScreen() {
  const [filter, setFilter] = useState<"Meal Buddy" | "Open to More">(
    "Meal Buddy"
  );

  const [meals, setMeals] = useState<Meal[]>([]);
  const navigation = useNavigation();
  // const filteredMeals = meals.filter((meal) => meal.mealType === filter);
  useEffect(() => {
    const mealsRef = ref(db, "meals");
    const unsubscribe = onValue(mealsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMeals = Object.entries(data).map(([id, meal]) => ({
          ...(meal as Meal),
          id,
        }));
        setMeals(loadedMeals);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredMeals = meals.filter((meal) => meal.mealType === filter);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ Explore Meal Events</Text>

      {/* Toggle filter */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            filter === "Meal Buddy" && styles.activeToggle,
          ]}
          onPress={() => setFilter("Meal Buddy")}
        >
          <Text>🍜 Meal Buddy</Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            filter === "Open to More" && styles.activeToggle,
          ]}
          onPress={() => setFilter("Open to More")}
        >
          <Text>❤️ Open to More</Text>
        </Pressable>
      </View>

      {/* Filtered list */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>{item.title}</Text>
            <Text>📍 {item.location}</Text>
            <Text>
              📅 {item.date} ⏰ {item.time}
            </Text>
            <Text>
              💰 {item.budget} 🍽️ {item.cuisine}
            </Text>
            <Text>
              👥 {item.people} / {item.max} joined
            </Text>
          </View>
        )}
      />

      {/* Add meal event */}
      <Pressable
        style={styles.button}
        onPress={() => {
          // Pass meal-adding function to CreateMeal screen
          // @ts-ignore
          navigation.navigate("CreateMeal");
        }}
      >
        <Text style={styles.buttonText}>＋ Create Meal Event</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },
  toggleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: "#e0e0e0",
  },
  mealCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#ff7f50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
