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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase';
import type { RootStackParamList, Meal } from '../types';

export default function CreateMealScreen() {
  const [title, setTitle] = useState('');
  const [mealType, setMealType] = useState<'Meal Buddy' | 'Open to More'>('Meal Buddy');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState(new Date());
  const [budget, setBudget] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [people, setPeople] = useState('');
  const [max, setMax] = useState('');

  const route = useRoute<RouteProp<RootStackParamList, 'CreateMeal'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = route.params;

  const handleCreate = async () => {
    if (!title || !location || !time || !budget || !cuisine || !userId) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const newMealRef = push(ref(db, 'meals'));

      const newMeal: Meal = {
        id: newMealRef.key ?? '',
        title,
        mealType,
        location,
        time,
        date: date.toISOString().split('T')[0],
        budget,
        cuisine,
        creatorId: userId,
        joinedIds: [userId],
        people: Number(people),
        max: Number(max),
      };

      await set(ref(db, `meals/${newMealRef.key}`), newMeal);
      navigation.goBack();
    } catch (err) {
      console.error('Failed to create meal:', err);
      alert('Failed to create meal.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🍴 Meal Type</Text>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            mealType === 'Meal Buddy' && styles.activeToggle,
          ]}
          onPress={() => setMealType('Meal Buddy')}
        >
          <Text>Meal Buddy</Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            mealType === 'Open to More' && styles.activeToggle,
          ]}
          onPress={() => setMealType('Open to More')}
        >
          <Text>Open to More</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>🍱 Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>📍 Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} />

      <Text style={styles.label}>🕰 Time</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} />

      <Text style={styles.label}>📅 Date</Text>
      {Platform.OS === 'web' ? (
        <TextInput
          style={styles.input}
          value={date.toDateString()}
          editable={false}
        />
      ) : (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => selectedDate && setDate(selectedDate)}
        />
      )}

      <Text style={styles.label}>💰 Budget</Text>
      <TextInput style={styles.input} value={budget} onChangeText={setBudget} />

      <Text style={styles.label}>🍜 Cuisine</Text>
      <TextInput style={styles.input} value={cuisine} onChangeText={setCuisine} />

      <Text style={styles.label}>👥 People</Text>
      <TextInput style={styles.input} value={people} onChangeText={setPeople} keyboardType="number-pad" />

      <Text style={styles.label}>🔢 Max</Text>
      <TextInput style={styles.input} value={max} onChangeText={setMax} keyboardType="number-pad" />

      <Pressable onPress={handleCreate} style={styles.button}>
        <Text style={styles.buttonText}>Create Meal</Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Go Back</Text>
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
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#d0ebff',
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
  backButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  backButtonText: {
    color: '#007aff',
    fontWeight: 'bold',
  },
});
