import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue, off, remove, update } from 'firebase/database';
import { parseISO, isAfter } from 'date-fns';
import { db, auth } from '../firebase';
import type { RootStackParamList, Meal } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyMeals'>;

export default function MyMealsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [myCreatedMeals, setMyCreatedMeals] = useState<Meal[]>([]);
  const [upcomingJoinedMeals, setUpcomingJoinedMeals] = useState<Meal[]>([]);
  const [pastJoinedMeals, setPastJoinedMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mealsRef = ref(db, 'meals');

    const unsubscribe = onValue(mealsRef, (snapshot) => {
      const data = snapshot.val();
      const userId = auth.currentUser?.uid;

      if (!data || !userId) {
        setMyCreatedMeals([]);
        setUpcomingJoinedMeals([]);
        setPastJoinedMeals([]);
        setLoading(false);
        return;
      }

      const now = new Date();
      const mealsArray = Object.entries(data).map(([id, meal]) => ({
        ...(meal as Meal),
        id,
      }));

      const myCreated = mealsArray.filter((meal) => meal.creatorId === userId);

      const joined = mealsArray.filter(
        (meal) =>
          meal.joinedIds?.includes(userId) && meal.creatorId !== userId
      );

      const upcoming: Meal[] = [];
      const past: Meal[] = [];

      for (const meal of joined) {
        if (!meal.date || !meal.time) continue;

        try {
          const mealDateTime = parseISO(`${meal.date}T${meal.time}`);
          if (isAfter(mealDateTime, now)) {
            upcoming.push(meal);
          } else {
            past.push(meal);
          }
        } catch (err) {
          console.warn(`⚠️ Skipping invalid time for ${meal.title}`);
        }
      }

      setMyCreatedMeals(myCreated);
      setUpcomingJoinedMeals(upcoming);
      setPastJoinedMeals(past);
      setLoading(false);
    });

    return () => off(mealsRef);
  }, []);

  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this meal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            console.log('🗑 Deleting meal with ID:', mealId);
            await remove(ref(db, `meals/${mealId}`));
          } catch (error) {
            console.error('🔥 Failed to delete meal:', error);
            Alert.alert('Error', 'Failed to delete meal.');
          }
        },
      },
    ]);
  };

  const handleLeaveMeal = async (mealId: string, joinedIds: string[]) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const updatedIds = joinedIds.filter((id) => id !== userId);
    try {
      await update(ref(db, `meals/${mealId}`), { joinedIds: updatedIds });
    } catch (error) {
      console.error('🔥 Failed to leave meal:', error);
      Alert.alert('Error', 'Failed to leave the meal.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 📝 Meals You Created */}
      <Text style={styles.header}>📝 Meals You Created</Text>
      <FlatList
        data={myCreatedMeals}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.cardRow]}>
            <Pressable
              onPress={() => navigation.navigate('EditMeal', { meal: item })}
              style={styles.cardContent}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text>{item.location} • {item.time}</Text>
            </Pressable>
            <Pressable
              onPress={() => handleDeleteMeal(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven’t created any meals yet.
          </Text>
        }
      />

      {/* 🍽 Meals You Joined */}
      <Text style={styles.header}>🍽 Meals You Joined</Text>
      <FlatList
        data={upcomingJoinedMeals}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.cardRow]}>
            <Pressable
              onPress={() =>
                navigation.navigate('ChatRoom', {
                  mealId: item.id,
                  mealTitle: item.title,
                })
              }
              style={styles.cardContent}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text>{item.location} • {item.time}</Text>
            </Pressable>
            <Pressable
              onPress={() => handleLeaveMeal(item.id, item.joinedIds || [])}
              style={styles.deleteButton}
            >
              <Text style={styles.leaveText}>Leave</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven't joined any upcoming meals.
          </Text>
        }
      />

      {/* 🕓 Past Meals You Joined */}
      <Text style={styles.header}>🕓 Past Meals You Joined</Text>
      <FlatList
        data={pastJoinedMeals}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>{item.location} • {item.time}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No past meals yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteText: {
    color: 'red',
    fontWeight: '600',
  },
  leaveText: {
    color: '#d9534f',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 12, color: '#666' },
});
