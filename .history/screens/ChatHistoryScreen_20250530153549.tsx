import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function ChatHistoryScreen() {
  const [joinedMeals, setJoinedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const fetchJoinedMeals = async () => {
      try {
        const snapshot = await get(ref(db, 'meals'));
        const data = snapshot.val();

        if (!data) return;

        const meals = await Promise.all(
          Object.entries(data)
            .filter(([_, meal]) => meal.joinedIds?.includes(userId))
            .map(async ([id, meal]) => {
              const msgSnap = await get(ref(db, `messages/${id}`));
              const messages = msgSnap.val();

              let lastMessage = null;
              let unreadCount = 0;

              if (messages) {
                const sorted = Object.values(messages).sort(
                  (a, b) => b.timestamp - a.timestamp
                );
                lastMessage = sorted[sorted.length - 1];

                unreadCount = Object.values(messages).filter(
                  (msg) => !msg.readBy?.includes(userId) && msg.senderId !== userId
                ).length;
              }

              return { id, ...meal, lastMessage, unreadCount };
            })
        );

        setJoinedMeals(meals);
      } catch (e) {
        console.error('Error loading meals:', e);
        setError('Failed to load meals.');
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedMeals();
  }, [userId]);

  if (!userId) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 Chat History</Text>
      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && joinedMeals.length === 0 && (
        <Text style={styles.empty}>You haven't joined any meals yet.</Text>
      )}
      <FlatList
        data={joinedMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.itemWrapper}
            onPress={() => navigation.navigate('ChatRoom', { mealId: item.id })}
          >
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealTitle}>{item.title}</Text>
                <Text style={styles.meta}>📍 {item.location} · {item.time}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage
                    ? `${item.lastMessage.senderName || 'Someone'}: ${item.lastMessage.text || '[No text]'}`
                    : 'No messages yet'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  itemWrapper: { marginBottom: 12 },
  item: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealTitle: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#555', marginTop: 4, fontSize: 13 },
  preview: { color: '#333', marginTop: 6, fontSize: 14 },
  error: { color: 'red', marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
  unreadBubble: {
    backgroundColor: 'red',
    borderRadius: 12,
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
