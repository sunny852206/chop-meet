import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import type { Meal } from "../types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import Toast from "react-native-toast-message";

export default function MealListScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filter, setFilter] = useState<"Meal Buddy" | "Open to More ">("Meal Buddy ❤️");
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchUser = async () => {
      let id = await AsyncStorage.getItem("userId");
      if (!id) {
        id = `user-${Date.now()}`;
        await AsyncStorage.setItem("userId", id);
      }
      setUserId(id);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const mealRef = ref(db, "meals");
    const unsubscribe = onValue(mealRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mealArray = Object.values(data);
        setMeals(mealArray as Meal[]);
      } else {
        setMeals([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMeals = meals.filter((m) => m.mealType === filter);

  const handleJoin = (meal: Meal) => {
    Alert.alert("Joined!", "You’ve joined this meal event 🎉");
    navigation.navigate("ChatRoom", { mealId: meal.id });
  };

  const handleAddMeal = (newMeal: Meal) => {
    setMeals((prev) => [...prev, newMeal]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Toast.show({ type: "success", text1: "List refreshed ✅", visibilityTime: 1500 });
    }, 800);
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

      {loading ? (
        <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredMeals}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.mealCard}>
              <Text style={styles.mealTitle}>{item.title}</Text>
              <Text>📍 {item.location}</Text>
              <Text>📅 {item.date}</Text>
              <Text>⏰ {item.time}</Text>
              <Text>💰 {item.budget}</Text>
              <Text>🍽️ {item.cuisine}</Text>
              <Text>👥 {item.people} / {item.max} people</Text>

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
      )}

      <Pressable
        style={styles.createButton}
        onPress={() => {
          if (userId) {
            navigation.navigate("CreateMeal", {
              addMeal: handleAddMeal,
              userId,
            });
          }
        }}
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
