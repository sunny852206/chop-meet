import { View, Text, StyleSheet, FlatList } from "react-native";

const dummyMeals = [
  { id: "1", title: "🍲 Dollar Shop Hotpot @ Bellevue" },
  { id: "2", title: "🍣 Sushi Kashiba Dinner Meetup" },
  { id: "3", title: "🍔 Dick’s Drive-In Burger Night" },
  { id: "4", title: "🥟 Din Tai Fung Xiao Long Bao Gathering" },
  { id: "5", title: "🍜 Ramen Danbo Lunch" },
  { id: "6", title: "🌮 Tacos Chukis Capitol Hill" },
];

export default function MealListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ Upcoming Meal Events</Text>
      <FlatList
        data={dummyMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>{item.title}</Text>
          </View>
        )}
      />
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
});
