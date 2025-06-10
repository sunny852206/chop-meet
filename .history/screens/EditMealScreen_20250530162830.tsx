import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, Meal } from '../types';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';

type EditMealRouteProp = RouteProp<RootStackParamList, 'EditMeal'>;

export default function EditMealScreen() {
  const { params } = useRoute<EditMealRouteProp>();
  const navigation = useNavigation();
  const meal = params.meal;

  const [title, setTitle] = useState(meal.title);
  const [location, setLocation] = useState(meal.location);
  const [time, setTime] = useState(meal.time);
  const [budget, setBudget] = useState(meal.budget);
  const [cuisine, setCuisine] = useState(meal.cuisine);

  const handleUpdate = async () => {
    try {
      const updates = {
        title,
        location,
        time,
        budget,
        cuisine,
      };

      await update(ref(db, `meals/${meal.id}`), updates);

      if (Platform.OS === 'android') {
        ToastAndroid.show('Meal updated!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Success', 'Meal updated!');
      }

      navigation.goBack();
    } catch (err) {
      console.error('Update failed:', err);
      Alert.alert('Error', 'Failed to update meal.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✏ Edit Meal</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Location"
      />
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="Time"
      />
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        placeholder="Budget"
      />
      <TextInput
        style={styles.input}
        value={cuisine}
        onChangeText={setCuisine}
        placeholder="Cuisine"
      />

      <Pressable onPress={handleUpdate} style={styles.button}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007aff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
