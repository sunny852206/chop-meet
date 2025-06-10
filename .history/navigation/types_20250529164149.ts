import type { Meal } from "../types/Meal"; // ← 根據你 Meal 型別存放位置調整路徑

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  MealList: undefined;
  CreateMeal: {
    addMeal: (meal: Meal) => void;
  };
  MealDetail: {
    meal: Meal;
  };
  ChatRoom: {
    mealId: string;
  };
};
