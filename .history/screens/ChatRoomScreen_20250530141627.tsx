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
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import type { ChatMessage } from "../types";

export default function ChatRoomScreen() {
  const route = useRoute();
  const { mealId } = route.params || {};

  const [userId, setUserId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const id = await AsyncStorage.getItem("userId");
      if (id) setUserId(id);
    };
    getUser();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      const stored = await AsyncStorage.getItem("messages");
      if (stored) {
        const all = JSON.parse(stored) as ChatMessage[];
        const filtered = all.filter((m) => m.mealId === mealId);
        setMessages(filtered);
      }
    };
    loadMessages();
  }, [mealId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      mealId,
      sender: userId,
      message: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    setInput("");

    // Save to AsyncStorage
    const stored = await AsyncStorage.getItem("messages");
    const all = stored ? JSON.parse(stored) : [];
    all.push(newMessage);
    await AsyncStorage.setItem("messages", JSON.stringify(all));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === userId ? styles.mine : styles.theirs,
            ]}
          >
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
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
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
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
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: "70%",
  },
  mine: {
    backgroundColor: "#dcf8c6",
    alignSelf: "flex-end",
  },
  theirs: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },
  messageText: { fontSize: 16 },
  timestamp: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
});
