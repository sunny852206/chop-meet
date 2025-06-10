import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import type { Meal, RootStackParamList } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function MealListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMeals = () => {
    const mealRef = ref(db, 'meals');
    onValue(mealRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mealArray = Object.values(data) as Meal[];
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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text>📍 {item.location}</Text>
              <Text>📅 {item.date || 'N/A'} ⏰ {item.time}</Text>
              <Text>💰 {item.budget} 🍽️ {item.cuisine}</Text>
              <Text>👥 {item.people || 0} / {item.max || 'N/A'} joined</Text>

              <Pressable
                style={styles.button}
                onPress={() => navigation.navigate('ChatRoom', { mealId: item.id })}
              >
                <Text style={styles.buttonText}>Join</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 24 }}>
              No meal events found near you.
            </Text>
          }
        />
      )}
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
  button: {
    marginTop: 10,
    backgroundColor: '#007aff',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
