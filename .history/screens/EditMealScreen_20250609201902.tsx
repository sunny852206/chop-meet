import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

type EditMealRouteProp = RouteProp<RootStackParamList, 'EditMeal'>;

export default function EditMealScreen() {
  const route = useRoute<EditMealRouteProp>();
  const navigation = useNavigation();
  const meal = route.params?.meal;

  if (!meal) {
    return (
      <View style={styles.container}>
        <Text>⚠️ No meal found</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit: {meal.title}</Text>
      <TextInput style={styles.input} value={meal.location} editable={false} />
      <TextInput style={styles.input} value={meal.time} editable={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
  },
});
