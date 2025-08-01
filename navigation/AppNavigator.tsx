import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/types";
import LandingScreen from "../screens/LandingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import CreateMealScreen from "../screens/CreateMealScreen";
import TabNavigator from "./TabNavigator";
import ChatRoomScreen from "../screens/ChatRoomScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false, title: "" }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "" }}
        />
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false, title: "" }} // optional: hide the stack header
        />
        <Stack.Screen
          name="CreateMeal"
          component={CreateMealScreen}
          options={{
            title: "",
            headerBackVisible: true,
            headerBackTitle: "",
          }}
        />
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoomScreen}
          options={({ route }) => ({
            title: route.params?.mealTitle || "Chat",
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
