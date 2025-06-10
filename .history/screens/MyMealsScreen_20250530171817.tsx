import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useEffect, useState } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { db } from '../firebase';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import type { Meal } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

export default function MyMealsScreen() {
  const [myMeals, setMyMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({
    title: '',
    location: '',
    time: '',
    budget: '',
    cuisine: '',
  });

  const user = auth.currentUser;
  const userId = user?.uid;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!userId) return;

    const mealRef = ref(db, 'meals');
    const unsubscribe = onValue(mealRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const meals = Object.entries(data)
        .map(([id, meal]: [string, any]) => ({ id, ...meal }))
        .filter((meal) => meal.creatorId === userId);

      setMyMeals(meals);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleDelete = (mealId: string) => {
    Alert.alert('Delete Meal', 'Are you sure you want to delete this meal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(ref(db, `meals/${mealId}`));
            alert('Meal deleted');
          } catch (e) {
            console.error('Failed to delete meal:', e);
            alert('Failed to delete meal.');
          }
        },
      },
    ]);
  };

  const handleEdit = (meal: Meal) => {
    setEditingMealId(meal.id);
    setEditFields({
      title: meal.title,
      location: meal.location,
      time: meal.time,
      budget: meal.budget,
      cuisine: meal.cuisine,
    });
  };

  const handleSave = async (mealId: string) => {
    try {
      await update(ref(db, `meals/${mealId}`), editFields);
      setEditingMealId(null);
      alert('Meal updated!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update meal.');
    }
  };

  if (!userId) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍱 My Created Meals</Text>
      {loading && <Text>Loading...</Text>}
      {myMeals.length === 0 && !loading && (
        <Text style={styles.empty}>You haven’t created any meals yet.</Text>
      )}
      <FlatList
        data={myMeals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.mealTitle}>{item.title}</Text>
            <Text style={styles.meta}>📍 {item.location} · {item.time}</Text>

            <View style={styles.actions}>
              <Pressable onPress={() => navigation.navigate('ChatRoom', { mealId: item.id })}>
                <Text style={styles.link}>💬 Chat</Text>
              </Pressable>
              <Pressable onPress={() => handleEdit(item)}>
                <Text style={styles.edit}>✏ Edit</Text>
              </Pressable>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>🗑 Delete</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('EditMeal', { meal: item })}>
                <Text style={styles.edit}>✏ Edit</Text>
              </Pressable>
            </View>

            {editingMealId === item.id && (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.input}
                  value={editFields.title}
                  onChangeText={(text) =>
                    setEditFields((prev) => ({ ...prev, title: text }))
                  }
                  placeholder="Title"
                />
                <TextInput
                  style={styles.input}
                  value={editFields.location}
                  onChangeText={(text) =>
                    setEditFields((prev) => ({ ...prev, location: text }))
                  }
                  placeholder="Location"
                />
                <TextInput
                  style={styles.input}
                  value={editFields.time}
                  onChangeText={(text) =>
                    setEditFields((prev) => ({ ...prev, time: text }))
                  }
                  placeholder="Time"
                />
                <TextInput
                  style={styles.input}
                  value={editFields.budget}
                  onChangeText={(text) =>
                    setEditFields((prev) => ({ ...prev, budget: text }))
                  }
                  placeholder="Budget"
                />
                <TextInput
                  style={styles.input}
                  value={editFields.cuisine}
                  onChangeText={(text) =>
                    setEditFields((prev) => ({ ...prev, cuisine: text }))
                  }
                  placeholder="Cuisine"
                />

                <View style={styles.editButtons}>
                  <Pressable onPress={() => handleSave(item.id)} style={styles.saveBtn}>
                    <Text style={styles.saveText}>Save</Text>
                  </Pressable>
                  <Pressable onPress={() => setEditingMealId(null)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  mealTitle: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', marginTop: 4 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  link: { color: '#007aff', fontWeight: '600' },
  edit: { color: '#ff9500', fontWeight: '600' },
  delete: { color: '#ff3b30', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 30, color: '#888' },

  editForm: { marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  saveBtn: {
    backgroundColor: '#007aff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  saveText: { color: 'white', fontWeight: 'bold' },
  cancelText: { color: '#888', marginLeft: 10, marginTop: 10 },
});
