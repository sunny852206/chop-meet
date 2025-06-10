import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ref, get, remove } from 'firebase/database';
import { db, auth } from '../firebase';
import type { RootStackParamList, Meal } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyMeals'>;

export default function MyMealsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [joinedMeals, setJoinedMeals] = useState<Meal[]>([]);
  const [myCreatedMeals, setMyCreatedMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeals = async () => {
    try {
      const snapshot = await get(ref(db, 'meals'));
      const data = snapshot.val();

      if (!data) {
        setJoinedMeals([]);
        setMyCreatedMeals([]);
        return;
      }

      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('❌ No user is logged in');
        setJoinedMeals([]);
        setMyCreatedMeals([]);
        return;
      }

      const mealsArray = Object.entries(data).map(([id, meal]) => ({
        ...(meal as Meal),
        id,
      }));

      const myCreated = mealsArray.filter((meal) => meal.creatorId === userId);
      const myJoined = mealsArray.filter(
        (meal) =>
          meal.joinedIds?.includes(userId) && meal.creatorId !== userId
      );

      setMyCreatedMeals(myCreated);
      setJoinedMeals(myJoined);
    } catch (err) {
      console.error('🔥 Failed to fetch meals:', err);
      Alert.alert('Error', 'Failed to load your meals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
            fetchMeals(); // refresh
          } catch (error) {
            console.error('🔥 Failed to delete meal:', error);
            Alert.alert('Error', 'Failed to delete meal.');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeals();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Meals You Created */}
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

      {/* Meals You Joined */}
      <Text style={styles.header}>🍽 Meals You Joined</Text>
      <FlatList
        data={joinedMeals}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('EditMeal', { meal: item })}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>{item.location} • {item.time}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven't joined any meals yet.
          </Text>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 12, color: '#666' },
});