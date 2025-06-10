import type { Meal } from "./Meal";

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  MealList: undefined;
  CreateMeal: { 
    addMeal: (meal: Meal) => void; 
    userId: string };
  MealDetail: {
    meal: Meal;
  };
  ChatRoom: {
    mealId: string;
  };
  EditMeal: { meal: Meal };
  MyMeals: undefined;
  MainTabs: undefined; 
};

export type ChatMessage = {
  senderId: string;
  senderName: string;
  message: string;
  text: string;
  timestamp: number;
  readBy?: string[];
};


