import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
} from "react-native";
import { onValue, ref, remove } from "firebase/database";
import { db, auth } from "../lib/firebase";

export default function MyMealsScreen() {
  const [createdMeals, setCreatedMeals] = useState([]);
  const [joinedMeals, setJoinedMeals] = useState([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const mealsRef = ref(db, "meals");
    onValue(mealsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const created = [];
      const joined = [];

      Object.entries(data).forEach(([id, meal]) => {
        if (meal.creatorId === userId) {
          created.push({ id, ...meal });
        } else if (Object.values(meal.joinedIds || {}).includes(userId)) {
          joined.push({ id, ...meal });
        }
      });

      setCreatedMeals(created);
      setJoinedMeals(joined);
    });
  }, [userId]);

  const renderCard = (meal) => {
    // only creator can delete created meals
    const isCreator = meal.creatorId === auth.currentUser?.uid;

    return (
      <View key={meal.id} style={[styles.card, styles.cardRow]}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{meal.title}</Text>
          <Text>
            {meal.location} • {meal.time}
          </Text>
        </View>

        {isCreator && (
          <Pressable
            onPress={() => handleDeleteMeal(meal.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const handleDeleteMeal = (mealId) => {
    Alert.alert("Delete Meal", "Are you sure you want to delete this meal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "delete",
        style: "destructive",
        onPress: async () => {
          try {
            await remove(ref(db, `meals/${mealId}`));
            console.log("✅ Meal deleted:", mealId);

            setCreatedMeals((prev) =>
              prev.filter((meal) => meal.id !== mealId)
            );
          } catch (err) {
            console.error("❌ Failed to delete meal:", err);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Meals You Created</Text>
        <ScrollView>
          {createdMeals.length > 0 ? (
            createdMeals.map(renderCard)
          ) : (
            <Text style={styles.emptyText}>You haven't created any meals.</Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍽 Meals You Joined</Text>
        <ScrollView>
          {joinedMeals.length > 0 ? (
            joinedMeals.map(renderCard)
          ) : (
            <Text style={styles.emptyText}>You haven't joined any meals.</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 12,
    color: "#666",
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffdddd",
    borderRadius: 6,
    marginLeft: 12,
  },

  deleteText: {
    color: "red",
    fontWeight: "600",
  },
});
