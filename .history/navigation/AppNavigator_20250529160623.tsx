import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "../screens/LandingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import MealListScreen from "../screens/MealListScreen";
import CreateMealScreen from "../screens/CreateMealScreen";
import MealDetailScreen from "../screens/MealDetailScreen";
import ChatRoomScreen from "../screens/ChatRoomScreen";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MealList" component={MealListScreen} />
        <Stack.Screen name="CreateMeal" component={CreateMealScreen} />
        <Stack.Screen name="MealDetail" component={MealDetailScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
