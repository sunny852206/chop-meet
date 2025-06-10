import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { Meal } from "../types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";

export default function MealListScreen() {
  const [filter, setFilter] = useState<"Meal Buddy" | "Open to More">("Meal Buddy");
  const [meals, setMeals] = useState<Meal[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Load meals from local storage
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const stored = await AsyncStorage.getItem("meals");
        if (stored) {
          setMeals(JSON.parse(stored));
        } else {
          const defaultMeals: Meal[] = [
            {
              id: "1",
              title: "🍲 Dollar Shop Hotpot @ Bellevue",
              mealType: "Meal Buddy",
              location: "Bellevue",
              time: "6:30 PM",
              budget: "$20-30",
              cuisine: "Hotpot",
              people: 1,
              max: 4,
            },
            {
              id: "2",
              title: "🍣 Sushi Kashiba Dinner Meetup",
              mealType: "Open to More",
              location: "Seattle",
              time: "7:00 PM",
              budget: "$50+",
              cuisine: "Sushi",
              people: 2,
              max: 2,
            },
          ];
          setMeals(defaultMeals);
          await AsyncStorage.setItem("meals", JSON.stringify(defaultMeals));
        }
      } catch (err) {
        console.error("Failed to load meals", err);
      }
    };

    loadMeals();
  }, []);

  // Update storage when meals change
  useEffect(() => {
    AsyncStorage.setItem("meals", JSON.stringify(meals));
  }, [meals]);

  const filteredMeals = meals.filter((meal) => meal.mealType === filter);

  const handleJoin = (meal: Meal) => {
    if (meal.people >= meal.max) {
      Alert.alert("Sorry", "This event is full!");
      return;
    }

    const updated = meals.map((m) =>
      m.id === meal.id ? { ...m, people: m.people + 1 } : m
    );
    setMeals(updated);
    Alert.alert("Joined!", "You’ve joined this meal event 🎉");
  };

  const handleAddMeal = (newMeal: Meal) => {
    setMeals((prev) => [...prev, newMeal]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ Explore Meal Events</Text>

      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, filter === "Meal Buddy" && styles.activeToggle]}
          onPress={() => setFilter("Meal Buddy")}
        >
          <Text>🍜 Meal Buddy</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, filter === "Open to More" && styles.activeToggle]}
          onPress={() => setFilter("Open to More")}
        >
          <Text>❤️ Open to More</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>{item.title}</Text>
            {item.location && <Text>📍 {item.location}</Text>}
            {item.time && <Text>⏰ {item.time}</Text>}
            {item.budget && <Text>💰 {item.budget}</Text>}
            {item.cuisine && <Text>🍽️ {item.cuisine}</Text>}
            <Text>
              👥 {item.people} / {item.max} people
            </Text>

            <Pressable
              style={[
                styles.joinButton,
                item.people >= item.max && { backgroundColor: "#ccc" },
              ]}
              disabled={item.people >= item.max}
              onPress={() => handleJoin(item)}
            >
              <Text style={styles.joinButtonText}>
                {item.people >= item.max ? "Full" : "Join"}
              </Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable
        style={styles.createButton}
        onPress={() =>
          navigation.navigate("CreateMeal", {
            addMeal: handleAddMeal,
          })
        }
      >
        <Text style={styles.createButtonText}>＋ Create Meal Event</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  toggleContainer: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 16 },
  toggleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  activeToggle: { backgroundColor: "#d0ebff" },
  mealCard: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  mealTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  joinButton: {
    marginTop: 10,
    backgroundColor: "#007aff",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: { color: "#fff", fontWeight: "600" },
  createButton: {
    backgroundColor: "#ff7f50",
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
