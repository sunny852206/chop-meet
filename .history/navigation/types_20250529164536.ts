import type { Meal } from "../types/Meal";

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
