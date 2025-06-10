import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { ref, onValue, push, update, get } from 'firebase/database';
import { db } from '../firebase';
import { auth } from '../firebase';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, ChatMessage } from '../types';

export default function ChatRoomScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ChatRoom'>>();
  const { mealId } = route.params;
  const user = auth.currentUser;
  const userId = user?.uid;
  const senderName = user?.displayName || 'You';
  const [messages, setMessages] = useState<(ChatMessage & { id: string })[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const msgRef = ref(db, `messages/${mealId}`);
    const unsubscribe = onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

    const sorted = Object.entries(data as Record<string, ChatMessage>)
    .map(([id, msg]) => ({ id, ...msg }))
    .sort((a, b) => a.timestamp - b.timestamp);

    setMessages(sorted);
    });

    return () => unsubscribe();
  }, [mealId]);

  
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!userId || !mealId) return;

      try {
        const snapshot = await get(ref(db, `messages/${mealId}`));
        const data = snapshot.val();
        if (!data) return;

        const updates: Record<string, any> = {};
        Object.entries(data as Record<string, ChatMessage>).forEach(([msgId, msg]) => {
          if (!msg.readBy?.includes(userId)) {
            const newReadBy = msg.readBy ? [...msg.readBy, userId] : [userId];
            updates[`messages/${mealId}/${msgId}/readBy`] = newReadBy;
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(ref(db), updates);
        }
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      }
    };

    markMessagesAsRead();
  }, [mealId, userId]);

  
  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = {
      text: input.trim(),
      senderId: userId,
      senderName,
      timestamp: Date.now(),
      readBy: [userId],
    };

    try {
      await push(ref(db, `messages/${mealId}`), msg);
      setInput('');
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.senderId === userId ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text style={styles.sender}>
              {item.senderId === userId ? 'You' : item.senderName}
            </Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
        />
        <Pressable onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageBubble: {
    marginVertical: 6,
    padding: 10,
    marginHorizontal: 12,
    borderRadius: 8,
    maxWidth: '75%',
  },
  myMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  sender: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  text: {
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: '#fff',
  },
  sendBtn: {
    marginLeft: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#007aff',
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
