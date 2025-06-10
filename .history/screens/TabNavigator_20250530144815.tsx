import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MealListScreen from './MealListScreen';
import CreateMealScreen from './CreateMealScreen';
import ChatHistoryScreen from './ChatHistoryScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Meals"
        component={MealListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateMealScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatHistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
