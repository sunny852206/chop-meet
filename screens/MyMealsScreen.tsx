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
  const [selectedTab, setSelectedTab] = useState("All");
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const mealsRef = ref(db, "meals");
    const unsubscribe = onValue(mealsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const created = [];
      const joined = [];

      Object.entries(data).forEach(([id, meal]) => {
        if (meal.creatorId === userId) {
          created.push({ id, ...meal });
        }
        if (Object.values(meal.joinedIds || {}).includes(userId)) {
          joined.push({ id, ...meal });
        }
      });

      setCreatedMeals(created);
      setJoinedMeals(joined);
    });
    return () => unsubscribe();
  }, [userId]);

  const renderCard = (meal) => {
    const isCreator = meal.creatorId === auth.currentUser?.uid;
    return (
      <View key={meal.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{meal.title}</Text>
          {isCreator && (
            <Pressable onPress={() => handleDeleteMeal(meal.id)}>
              <Text style={styles.cardDelete}>🗑</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.cardDetail}>
          {meal.location} • {meal.time}
        </Text>
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

  const getDisplayedMeals = () => {
    if (selectedTab === "Created") return createdMeals;
    if (selectedTab === "Joined") return joinedMeals;
    const all = [...createdMeals];
    joinedMeals.forEach((m) => {
      if (!all.find((x) => x.id === m.id)) all.push(m);
    });
    return all;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ My Meal Events</Text>

      {/* Segmented Control Tabs */}
      <View style={styles.tabsContainer}>
        {["All", "Created", "Joined"].map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={styles.tabText}>
              {tab} (
              {tab === "All"
                ? new Set([...createdMeals, ...joinedMeals].map((m) => m.id))
                    .size
                : tab === "Created"
                ? createdMeals.length
                : joinedMeals.length}
              )
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.listContainer}>
        {getDisplayedMeals().length > 0 ? (
          getDisplayedMeals().map(renderCard)
        ) : (
          <Text style={styles.emptyText}>No meals to show.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  activeTab: {
    backgroundColor: "#007aff",
  },
  tabText: {
    color: "#000",
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDelete: {
    fontSize: 16,
    color: "#ff4d4f",
  },
  cardDetail: {
    marginTop: 4,
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#666",
  },
});
