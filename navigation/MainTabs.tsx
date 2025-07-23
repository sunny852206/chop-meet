// navigation/MainTabs.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MealListScreen from "../screens/MealListScreen";
import MyMealsScreen from "../screens/MyMealsScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "home";
          if (route.name === "Home") iconName = "home";
          else if (route.name === "MyMeals") iconName = "restaurant";
          else if (route.name === "Chats") iconName = "chatbubbles";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={MealListScreen} />
      <Tab.Screen name="MyMeals" component={MyMealsScreen} />
      <Tab.Screen name="Chats" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
