import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../lib/firebase";
import { onValue, ref, set } from "firebase/database";
import type { Meal } from "../types/types";

// Utility Toast Function
const showToast = (message: string, type: "success" | "error" = "success") => {
  Toast.show({
    type,
    text1: message,
    position: "top",
    visibilityTime: 2000,
  });
};

export default function MealListScreen() {
  const [filter, setFilter] = useState<"Meal Buddy" | "Open to More">(
    "Meal Buddy"
  );
  const [meals, setMeals] = useState<Meal[]>([]);
  const navigation = useNavigation();
  const userId = auth.currentUser?.uid;

  // listener for all meals
  useEffect(() => {
    const mealsRef = ref(db, "meals");
    const unsubscribe = onValue(mealsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const loadedMeals = Object.entries(data).map(([id, meal]) => ({
        ...(meal as Meal),
        id,
      }));
      setMeals(loadedMeals);
    });

    return () => unsubscribe();
  }, []);

  // Filter meals based on current selected tab
  const filteredMeals = meals.filter((meal) => meal.mealType === filter);

  // Handles user joining or leaving a meal
  const handleJoinOrLeave = async (meal: Meal) => {
    if (!userId) {
      Alert.alert("Login Required", "You must be logged in to join or leave.");
      return;
    }

    const joined = Array.isArray(meal.joinedIds)
      ? meal.joinedIds
      : typeof meal.joinedIds === "object" && meal.joinedIds !== null
      ? Object.values(meal.joinedIds)
      : [];

    const alreadyJoined = joined.includes(userId);
    const maxReached = meal.max && joined.length >= Number(meal.max);

    if (!alreadyJoined && maxReached) {
      Alert.alert(
        "Full",
        "This meal has reached the maximum number of participants."
      );
      return;
    }

    const updatedJoinedIds = alreadyJoined
      ? joined.filter((id) => id !== userId) // leave
      : [...joined, userId]; // join

    try {
      await set(ref(db, `meals/${meal.id}/joinedIds`), updatedJoinedIds);

      // show toast
      showToast(
        alreadyJoined ? "👋 You left the meal." : "✅ You joined the meal!",
        alreadyJoined ? "error" : "success"
      );

      // Prompt chat only when joining
      if (!alreadyJoined) {
        Alert.alert("🎉 You're in!", "Want to hop into the group chat now?", [
          { text: "Not Now" },
          {
            text: "Enter Chat",
            onPress: () =>
              // @ts-ignore
              navigation.navigate("ChatRoom", {
                mealId: meal.id,
                mealTitle: meal.title,
              }),
          },
        ]);
      }
    } catch (err) {
      console.error("❌ Failed to join/leave meal:", err);
      Alert.alert("Error", "Action failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍴 Explore Meal Events</Text>

      {/* Meal Type Tabs*/}
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

      {/* Filtered  Meal List */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const joined = Array.isArray(item.joinedIds)
            ? item.joinedIds
            : typeof item.joinedIds === "object"
            ? Object.values(item.joinedIds)
            : [];
          const alreadyJoined = joined.includes(userId ?? "");
          return (
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
                👥 {joined.length} / {item.max} joined
              </Text>

              {/* Join/Leave Button */}
              <Pressable
                style={[
                  styles.joinButton,
                  alreadyJoined ? styles.leave : styles.join,
                ]}
                onPress={() => handleJoinOrLeave(item)}
              >
                <Text style={styles.joinText}>
                  {alreadyJoined ? "Leave" : "Join"}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
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
  joinButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  join: {
    backgroundColor: "#4caf50",
  },
  leave: {
    backgroundColor: "#dc3545",
  },
  joinText: {
    color: "#fff",
    fontWeight: "600",
  },
});
