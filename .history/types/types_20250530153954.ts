import type { Meal } from "./Meal";

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  MealList: undefined;
  CreateMeal: { 
    addMeal: (meal: Meal) => void; userId: string };
  MealDetail: {
    meal: Meal;
  };
  ChatRoom: {
    mealId: string;
  };
};

export type ChatMessage = {
  sender: string;
  message: string;
  timestamp: string;
};

export type Meal = {
  id: string;
  title: string;
  mealType: 'Meal Buddy' | 'Open to More';
  location: string;
  time: string;
  budget: string;
  cuisine: string;
  joinedIds?: string[];
};

