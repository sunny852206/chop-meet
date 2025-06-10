// screens/MealDetailScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { Meal, RootStackParamList } from "../types";



type DetailNav = NativeStackNavigationProp<RootStackParamList, "MealDetail">;
type DetailRoute = RouteProp<RootStackParamList, "MealDetail">;

export default function MealDetailScreen() {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const meal = route.params.meal;

  if (!meal) {  
    return <Text>Meal not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{meal.restaurant}</Text>
      <Text>Time: {meal.time}</Text>
      <Text>Cuisine: {meal.cuisine}</Text>
      <Text>Type: {meal.type === 'meal' ? 'Meal Buddy' : 'Open to More'}</Text>
      <Text>👥 {meal.people} / {meal.max} people</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Join this Meal" onPress={() => alert("Joined successfully!")} />
        <Button
          title="Enter Chat Room"
          onPress={() => navigation.navigate('ChatRoom', { mealId: meal.id })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 }
});
