// screens/ChatRoomScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatRoomScreen() {
  const route = useRoute<any>();
  const { mealId } = route.params;

  const [messages, setMessages] = useState<{ id: string; sender: string; content: string }[]>([]);
  const [text, setText] = useState('');

  const storageKey = `chat_${mealId}`;

  useEffect(() => {
    // 讀取本地聊天紀錄
    const loadMessages = async () => {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) setMessages(JSON.parse(stored));
    };
    loadMessages();
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content: text.trim(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setText('');

    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedMessages));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.message}>
            <Text style={styles.sender}>{item.sender}: </Text>
            {item.content}
          </Text>
        )}
      />

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Type a message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 6,
  },
  message: {
    marginVertical: 4,
    fontSize: 16,
  },
  sender: {
    fontWeight: 'bold',
  },
});
