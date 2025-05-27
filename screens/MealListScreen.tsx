import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";

type Meal = {
  id: string;
  title: string;
};

export default function MealListScreen() {
  const [meals, setMeals] = useState([
    // Initial dummy meal events
    { id: "1", title: "🍲 Dollar Shop Hotpot @ Bellevue" },
    { id: "2", title: "🍣 Sushi Kashiba Dinner Meetup" },
    { id: "3", title: "🍔 Dick’s Drive-In Burger Night" },
    { id: "4", title: "🥟 Din Tai Fung Xiao Long Bao Gathering" },
    { id: "5", title: "🍜 Ramen Danbo Lunch" },
    { id: "6", title: "🌮 Tacos Chukis Capitol Hill" },
  ]);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ Explore Meal Events</Text>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>{item.title}</Text>
          </View>
        )}
      />

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
