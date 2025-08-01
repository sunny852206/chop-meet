import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { db, auth } from "../lib/firebase";
import { onValue, ref, set } from "firebase/database";

import type { Meal } from "../types/types";
import VibeSelectorModal from "../components/modals/VibeSelectorModal";
import { VIBE_OPTIONS } from "../constants/vibeOptions";

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
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [vibeModalVisible, setVibeModalVisible] = useState(false);

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
  const filteredMeals = meals.filter((meal) => {
    const matchesType = meal.mealType === filter;
    // console.log("Checking meal:", meal.title);
    // console.log("Meal Vibes:", meal.vibes);
    // console.log("Selected Vibes:", selectedVibes);
    const matchesVibe =
      selectedVibes.length === 0 ||
      selectedVibes.every((v) => meal.vibes?.includes(v));
    return matchesType && matchesVibe;
  });
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Meal Events</Text>
        <Pressable
          style={[
            styles.filterButton,
            { flexDirection: "row", alignItems: "center" },
          ]}
          onPress={() => setVibeModalVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color="gray" />
          <Text style={{ marginLeft: 5, color: "#666" }}>Vibe</Text>
        </Pressable>
      </View>
      {/* Meal Type Tabs*/}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            filter === "Meal Buddy" && styles.activeToggle,
          ]}
          onPress={() => setFilter("Meal Buddy")}
        >
          <Ionicons name="restaurant-outline" size={18} color="#555" />
          <Text style={{ marginLeft: 6 }}>Meal Buddy</Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            filter === "Open to More" && styles.activeToggle,
          ]}
          onPress={() => setFilter("Open to More")}
        >
          <Ionicons name="heart-outline" size={18} color="#555" />
          <Text style={{ marginLeft: 6 }}>Open to More</Text>
        </Pressable>
      </View>
      <VibeSelectorModal
        visible={vibeModalVisible}
        selectedVibes={selectedVibes}
        onClose={() => setVibeModalVisible(false)}
        onToggle={(vibes) => {
          console.log("✅ Applied vibes:", vibes);
          setSelectedVibes(vibes);
        }}
      />
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
              <View style={styles.cardHeader}>
                <Text style={styles.mealTitle}>{item.title}</Text>
                <Text style={styles.mealSubtitle}>
                  {item.cuisine} · ${item.budget}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#555"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.mealMeta}>{item.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#555"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.mealMeta}>{item.date}</Text>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color="#555"
                  style={{ marginLeft: 12, marginRight: 6 }}
                />
                <Text style={styles.mealMeta}>{item.time}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color="#555"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.mealMeta}>
                  {joined.length} / {item.max} joined
                </Text>
              </View>

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
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
    lineHeight: 34,
    color: "#1a1a1a",
    marginVertical: 8,
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
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: "#e0e0e0",
  },
  mealCard: {
    backgroundColor: "#f9f9f9",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 6,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  mealSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  mealMeta: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
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
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  chipSelected: {
    backgroundColor: "#cce5ff",
    borderColor: "#3399ff",
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fefefe",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#222",
    textAlign: "center",
  },
  vibeOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },
});
