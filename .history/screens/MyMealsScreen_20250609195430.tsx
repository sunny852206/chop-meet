import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import type { RootStackParamList, Meal } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyMeals'>;

export default function MyMealsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [joinedMeals, setJoinedMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = auth().currentUser?.uid;

  const fetchMeals = async () => {
    try {
      const snapshot = await get(ref(db, 'meals'));
      const data = snapshot.val();

      if (!data) {
        setJoinedMeals([]);
        return;
      }

      const mealsArray = Object.values(data) as Meal[];
      const myMeals = mealsArray.filter((meal) => meal.joinedIds?.includes(userId));
      setJoinedMeals(myMeals);
    } catch (err) {
      console.error('🔥 Failed to fetch meals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
      <Text style={styles.header}>🍽 My Joined Meals</Text>

      <FlatList
        data={joinedMeals}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
          <Text style={{ textAlign: 'center', marginTop: 20 }}>You haven't joined any meals yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
