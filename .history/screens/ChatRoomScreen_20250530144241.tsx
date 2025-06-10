import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebase";
import { ref, onValue, push, set, get } from "firebase/database";
import type { ChatMessage, Meal } from "../types";

export default function ChatRoomScreen() {
  const route = useRoute();
  const { mealId } = route.params || {};

  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mealTitle, setMealTitle] = useState("Chat Room");

  // Get userId
  useEffect(() => {
    const loadUser = async () => {
      const uid = await AsyncStorage.getItem("userId");
      if (uid) setUserId(uid);
    };
    loadUser();
  }, []);

  // Get meal title
  useEffect(() => {
    const mealRef = ref(db, `meals/${mealId}`);
    get(mealRef).then((snapshot) => {
      if (snapshot.exists()) {
        const meal = snapshot.val() as Meal;
        setMealTitle(meal.title);
      }
    });
  }, [mealId]);

  // Load messages
  useEffect(() => {
    const msgRef = ref(db, `messages/${mealId}`);
    const unsubscribe = onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgArray = Object.values(data) as ChatMessage[];
        setMessages(msgArray);
      } else {
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, [mealId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      sender: userId,
      message: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const msgRef = push(ref(db, `messages/${mealId}`));
    await set(msgRef, newMsg);

    setInput("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>{mealTitle}</Text>

      <FlatList
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === userId ? styles.mine : styles.theirs,
            ]}
          >
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  bubble: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: "75%",
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6",
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: "#eee",
  },
  messageText: { fontSize: 16 },
  timestamp: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  inputRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#007aff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
