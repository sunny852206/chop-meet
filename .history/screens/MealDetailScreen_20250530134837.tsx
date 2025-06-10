// screens/MealDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootStackParamList } from "../types";

type DetailNav = NativeStackNavigationProp<RootStackParamList, "MealDetail">;
type DetailRoute = RouteProp<RootStackParamList, "MealDetail">;

export default function MealDetailScreen() {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const meal = route.params.meal;

  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  const joinedKey = `joined_${meal.id}`;

  useEffect(() => {
    // 檢查是否已加入過這個 meal
    const checkJoined = async () => {
      const value = await AsyncStorage.getItem(joinedKey);
      setHasJoined(value === 'true');
      setLoading(false);
    };
    checkJoined();
  }, []);

  const handleJoin = async () => {
    if (meal.people >= meal.max) {
      Alert.alert("Sorry", "This meal is already full.");
      return;
    }

    await AsyncStorage.setItem(joinedKey, 'true');
    setHasJoined(true);
    Alert.alert("Success", "You have joined the meal!");
    // 👉 實際情況你應該還要更新 people 數量（最好從後端或 context 更新）
  };

  if (!meal) return <Text>Meal not found.</Text>;
  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{meal.title}</Text>
      <Text>Time: {meal.time}</Text>
      <Text>Cuisine: {meal.cuisine}</Text>
      <Text>Type: {meal.mealType === "Meal Buddy" ? "🍜 Meal Buddy" : "❤️ Open to More"}</Text>
      <Text>👥 {meal.people} / {meal.max} people</Text>

      <View style={{ marginTop: 20 }}>
        {!hasJoined ? (
          <Button
            title={meal.people >= meal.max ? "Full" : "Join this Meal"}
            onPress={handleJoin}
            disabled={meal.people >= meal.max}
          />
        ) : (
          <Button
            title="Enter Chat Room"
            onPress={() => navigation.navigate('ChatRoom', { mealId: meal.id })}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
});
