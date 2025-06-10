import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue, update } from 'firebase/database';
import { db, auth } from '../firebase';
import Toast from 'react-native-root-toast';
import type { Meal, RootStackParamList } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function MealListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const userId = auth.currentUser?.uid;

  const showToast = (message: string) => {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  };

  const fetchMeals = () => {
    const mealRef = ref(db, 'meals');
    onValue(mealRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = new Date();
        const mealArray = Object.entries(data)
          .map(([id, value]) => ({ ...(value as Meal), id }))
          .filter((meal) => {
            if (!meal.date) return true;
            const mealDate = new Date(meal.date);
            return mealDate >= now;
          });
        setMeals(mealArray);
      } else {
        setMeals([]);
      }
      setLoading(false);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeals();
  }, []);

  const handleAddMeal = (newMeal: Meal) => {
    setMeals((prev) => [...prev, newMeal]);
  };

  const handleCreateMeal = () => {
    if (!userId) {
      Alert.alert('Login Required', 'You must be logged in to create a meal.');
      return;
    }

    navigation.navigate('CreateMeal', {
      userId,
      addMeal: handleAddMeal,
    });
  };

  const handleJoinOrLeave = async (meal: Meal) => {
    if (!userId) {
      Alert.alert('Login Required', 'You must be logged in to join or leave.');
      return;
    }

    const joined = Array.isArray(meal.joinedIds) ? meal.joinedIds : [];
    const alreadyJoined = joined.includes(userId);
    const maxReached = meal.max && joined.length >= Number(meal.max);

    if (!alreadyJoined && maxReached) {
      showToast('🚫 Meal is full!');
      return;
    }

    const updatedJoinedIds = alreadyJoined
      ? joined.filter((id) => id !== userId)
      : [...joined, userId];

    try {
      await update(ref(db, `meals/${meal.id}`), {
      joinedIds: updatedJoinedIds,
    });

    showToast(alreadyJoined ? '👋 You left the meal.' : '✅ You joined the meal!');

    if (!alreadyJoined) {
      setTimeout(() => {
        navigation.navigate('ChatRoom', {
          mealId: meal.id,
          mealTitle: meal.title,
        });
      }, 300);
    }

    } catch (err) {
      console.error('🔥 Failed to join/leave meal:', err);
      showToast('⚠️ Failed to update. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🍽 Explore Meal Events</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007aff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const isCreatedByUser = item.creatorId === userId;
            const joinedIds = Array.isArray(item.joinedIds) ? item.joinedIds : [];
            const hasJoined = !!userId && joinedIds.includes(userId);
            const isFull = item.max && joinedIds.length >= Number(item.max);
            const isJoinDisabled = !!(isFull && !hasJoined);

            return (
              <View style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
                <Text>📍 {item.location}</Text>
                <Text>📅 {item.date || 'N/A'} ⏰ {item.time}</Text>
                <Text>💰 {item.budget} 🍽️ {item.cuisine}</Text>
                <Text>👥 {joinedIds.length} / {item.max || 'N/A'} joined</Text>

                {isCreatedByUser ? (
                  <Text style={styles.creatorNote}>You created this meal.</Text>
                ) : (
                  <Pressable
                    style={[
                      styles.button,
                      hasJoined ? styles.leaveButton : null,
                      isJoinDisabled ? { backgroundColor: '#ccc' } : null,
                    ]}
                    onPress={() => handleJoinOrLeave(item)}
                    disabled={isJoinDisabled}
                  >
                    <Text style={styles.buttonText}>{hasJoined ? 'Leave' : 'Join'}</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 24 }}>
              No upcoming meal events found.
            </Text>
          }
        />
      )}

      <Pressable style={styles.createButton} onPress={handleCreateMeal}>
        <Text style={styles.createButtonText}>＋ Create Meal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  creatorNote: {
    marginTop: 10,
    color: 'gray',
    fontStyle: 'italic',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#007aff',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#ff3b30',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  createButton: {
    marginTop: 12,
    backgroundColor: '#ff7f50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
