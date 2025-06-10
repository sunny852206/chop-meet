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
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import auth from '@react-native-firebase/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Meal } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyMealsScreen() {
  const [joinedMeals, setJoinedMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const userId = auth().currentUser?.uid;

  useEffect(() => {
    const fetchJoinedMeals = async () => {
      if (!userId) return;

      try {
        const snapshot = await get(ref(db, 'meals'));
        const data = snapshot.val();

        if (!data) return;

        const myMeals = Object.values(data).filter((meal: any) =>
          meal.joinedIds?.includes(userId)
        );

        setJoinedMeals(myMeals);
      } catch (err) {
        console.error('❌ Failed to fetch meals:', err);
        Alert.alert('Error', 'Failed to load your meals.');
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedMeals();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (joinedMeals.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No joined meals found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍱 My Meals</Text>

      <FlatList
        data={joinedMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('EditMeal', { meal: item })}
            style={styles.mealCard}
          >
            <Text style={styles.mealTitle}>{item.title}</Text>
            <Text>{item.location} | {item.time}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mealCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  mealTitle: { fontSize: 18, fontWeight: '600' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
