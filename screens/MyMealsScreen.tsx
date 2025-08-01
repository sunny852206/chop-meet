import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { onValue, ref, remove } from "firebase/database";
import { db, auth } from "../lib/firebase";

export default function MyMealsScreen() {
  const [createdMeals, setCreatedMeals] = useState([]);
  const [joinedMeals, setJoinedMeals] = useState([]);
  const [selectedTab, setSelectedTab] = useState("All");
  const userId = auth.currentUser?.uid;
  const navigation = useNavigation();

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Meal Events</Text>
      </View>

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

      {/* Create New Meal Event*/}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("CreateMeal")}
      >
        <Text style={styles.fabText}>＋ Meal Event</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
    lineHeight: 34,
    color: "#1a1a1a",
    marginVertical: 8,
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#007bff",
    minWidth: 100,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
