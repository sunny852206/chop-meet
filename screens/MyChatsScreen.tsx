import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ref, get } from "firebase/database";
import { db, auth } from "../lib/firebase";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, Meal, ChatMessage } from "../types/types";

type MealChatItem = Meal & {
  id: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
};

export default function MyChatsScreen() {
  const [joinedMeals, setJoinedMeals] = useState<MealChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const fetchChats = async () => {
      try {
        const snapshot = await get(ref(db, "meals"));
        const data = snapshot.val() as Record<string, Meal>;
        if (!data) {
          setJoinedMeals([]);
          return;
        }

        const meals = await Promise.all(
          Object.entries(data)
            .filter(
              ([_, meal]) =>
                meal.joinedIds?.includes(userId) || meal.creatorId === userId
            )
            .map(async ([id, meal]) => {
              const msgSnap = await get(ref(db, `messages/${id}`));
              const messages = msgSnap.val();

              let lastMessage: ChatMessage | null = null;
              let unreadCount = 0;

              if (messages) {
                const sorted = Object.values(
                  messages as Record<string, ChatMessage>
                ).sort((a, b) => b.timestamp - a.timestamp);

                lastMessage = sorted[sorted.length - 1];

                unreadCount = sorted.filter(
                  (msg) =>
                    !msg.readBy?.includes(userId) && msg.senderId !== userId
                ).length;
              }

              return { ...meal, id, lastMessage, unreadCount };
            })
        );

        setJoinedMeals(meals);
      } catch (err) {
        console.error("🔥 Failed to load chats:", err);
        setError("Could not load your chats.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userId]);

  if (!userId) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Meal Chats</Text>
      </View>
      {loading && <ActivityIndicator size="small" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && joinedMeals.length === 0 && (
        <Text style={styles.empty}>No joined meals yet.</Text>
      )}

      <FlatList
        data={joinedMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.itemWrapper}
            onPress={() =>
              navigation.navigate("ChatRoom", {
                mealId: item.id,
                mealTitle: item.title,
              })
            }
          >
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealTitle}>{item.title}</Text>
                <Text style={styles.meta}>
                  📍 {item.location} · {item.time}
                </Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage
                    ? `${item.lastMessage.senderName || "Someone"}: ${
                        item.lastMessage.text || "[No text]"
                      }`
                    : "No messages yet"}
                </Text>
              </View>

              {item.unreadCount > 0 && (
                <View style={styles.unreadBubble}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  error: { color: "red", marginBottom: 12 },
  empty: { textAlign: "center", marginTop: 20, color: "#888" },
  itemWrapper: { marginBottom: 12 },
  item: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#f2f2f2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, // very soft
    shadowRadius: 2,
    elevation: 0, // minimal shadow for flat iOS look
  },
  mealTitle: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#555", marginTop: 4, fontSize: 13 },
  preview: { color: "#333", marginTop: 6, fontSize: 14 },
  unreadBubble: {
    backgroundColor: "red",
    borderRadius: 12,
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});
