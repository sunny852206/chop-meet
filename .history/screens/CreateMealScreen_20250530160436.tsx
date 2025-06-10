import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';
import type { RootStackParamList } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function CreateMealScreen() {
  const [title, setTitle] = useState('');
  const [mealType, setMealType] = useState<'Meal Buddy' | 'Open to More'>('Meal Buddy');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState(new Date());
  const [budget, setBudget] = useState('');
  const [cuisine, setCuisine] = useState('');

  const route = useRoute<RouteProp<RootStackParamList, 'CreateMeal'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addMeal, userId } = route.params;

  const handleCreate = async () => {
    if (!title || !location || !time || !budget || !cuisine || !userId) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const newMealRef = push(ref(db, 'meals'));
      const newMeal = {
        id: newMealRef.key,
        title,
        mealType,
        location,
        time,
        date: date.toISOString().split('T')[0],
        budget,
        cuisine,
        creatorId: userId,
        joinedIds: [userId],
      };

      await newMealRef.set(newMeal);
      addMeal(newMeal); // 更新 local state if needed
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create meal:', err);
      alert('Failed to create meal.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🍱 Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>📍 Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} />

      <Text style={styles.label}>🕰 Time</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} />

      <Text style={styles.label}>📅 Date</Text>
      <DateTimePicker
        value={date}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(_, selectedDate) => selectedDate && setDate(selectedDate)}
      />

      <Text style={styles.label}>💰 Budget</Text>
      <TextInput style={styles.input} value={budget} onChangeText={setBudget} />

      <Text style={styles.label}>🍜 Cuisine</Text>
      <TextInput style={styles.input} value={cuisine} onChangeText={setCuisine} />

      <Pressable onPress={handleCreate} style={styles.button}>
        <Text style={styles.buttonText}>Create Meal</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontWeight: 'bold', marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007aff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
