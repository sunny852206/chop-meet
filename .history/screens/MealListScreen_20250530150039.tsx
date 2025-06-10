// ✅ 完整 Firebase 接入版 MealListScreen.tsx
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { useState, useEffect } from 'react';
import { ref as dbRef, onValue, update, get } from 'firebase/database';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Meal } from '../types';

export default function MealListScreen() {
  const [filter, setFilter] = useState<'Meal Buddy' | 'Open to More'>('Meal Buddy');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = auth().currentUser;

  useEffect(() => {
    const mealsRef = dbRef(db, 'meals');
    const unsubscribe = onValue(mealsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const allMeals = Object.values(data);
      setMeals(allMeals);
    });
    return () => unsubscribe();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const snapshot = await get(dbRef(db, 'meals'));
    const data = snapshot.val() || {};
    setMeals(Object.values(data));
    setRefreshing(false);
    Alert.alert('Refreshed ✅', 'Meal list updated!');
  };

  const handleJoin = async (meal: Meal) => {
    if (meal.people >= meal.max) {
      Alert.alert('Sorry', 'This event is full!');
      return;
    }
    if (meal.joinedIds?.includes(user.uid)) {
      Alert.alert('Already joined', 'You’re already in this meal');
      navigation.navigate('ChatRoom', { mealId: meal.id });
      return;
    }

    const updatedPeople = meal.people + 1;
    const updatedJoined = meal.joinedIds ? [...meal.joinedIds, user.uid] : [user.uid];

    await update(dbRef(db, `meals/${meal.id}`), {
      people: updatedPeople,
      joinedIds: updatedJoined,
    });

    Alert.alert('Joined!', 'You’ve joined this meal event 🎉');
    navigation.navigate('ChatRoom', { mealId: meal.id });
  };

  const filteredMeals = meals.filter((meal) => meal.mealType === filter);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ Explore Meal Events</Text>

      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, filter === 'Meal Buddy' && styles.activeToggle]}
          onPress={() => setFilter('Meal Buddy')}
        >
          <Text>🍜 Meal Buddy</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, filter === 'Open to More' && styles.activeToggle]}
          onPress={() => setFilter('Open to More')}
        >
          <Text>❤️ Open to More</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredMeals}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>{item.title}</Text>
            {item.location && <Text>📍 {item.location}</Text>}
            {item.time && <Text>⏰ {item.time}</Text>}
            {item.budget && <Text>💰 {item.budget}</Text>}
            {item.cuisine && <Text>🍽️ {item.cuisine}</Text>}
            <Text>👥 {item.people} / {item.max} people</Text>

            <Pressable
              style={[styles.joinButton, item.people >= item.max && { backgroundColor: '#ccc' }]}
              disabled={item.people >= item.max}
              onPress={() => handleJoin(item)}
            >
              <Text style={styles.joinButtonText}>
                {item.people >= item.max ? 'Full' : 'Join'}
              </Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateMeal')}
      >
        <Text style={styles.createButtonText}>＋ Create Meal Event</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 16 },
  toggleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  activeToggle: { backgroundColor: '#d0ebff' },
  mealCard: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  mealTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  joinButton: {
    marginTop: 10,
    backgroundColor: '#007aff',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: { color: '#fff', fontWeight: '600' },
  createButton: {
    backgroundColor: '#ff7f50',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
