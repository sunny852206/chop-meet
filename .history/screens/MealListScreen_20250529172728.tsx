import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { Meal } from "../types";


export default function MealListScreen() {
  const [filter, setFilter] = useState<"Meal Buddy" | "Open to More">(
    "Meal Buddy"
  );

  const [meals, setMeals] = useState<Meal[]>([
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
      people: 2,
      max: 2,
    },
    {
      id: "3",
      title: "🍔 Dick’s Drive-In Burger Night",
      mealType: "Meal Buddy",
      people: 1,
      max: 3,
    },
    {
      id: "4",
      title: "🥟 Din Tai Fung Xiao Long Bao Gathering",
      mealType: "Open to More",
      people: 2,
      max: 5,
    },
    {
      id: "5",
      title: "🍜 Ramen Danbo Lunch",
      mealType: "Meal Buddy",
      people: 1,
      max: 2,
    },
    {
      id: "6",
      title: "🌮 Tacos Chukis Capitol Hill",
      mealType: "Open to More",
      people: 3,
      max: 4,
    },
  ]);

  const navigation = useNavigation();
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Meal }) => (
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>{item.title}</Text>
            {item.location && <Text>📍 {item.location}</Text>}
            {item.time && <Text>⏰ {item.time}</Text>}
            {item.budget && <Text>💰 {item.budget}</Text>}
            {item.cuisine && <Text>🍽️ {item.cuisine}</Text>}
          </View>
      )}
    />


      {/* Add meal event */}
      <Pressable
        style={styles.button}
        onPress={() => {
          // Pass meal-adding function to CreateMeal screen
          // @ts-ignore
          navigation.navigate("CreateMeal", {
            addMeal: (newMeal: Meal) => setMeals((prev) => [...prev, newMeal]),
          });
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
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "500",
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
