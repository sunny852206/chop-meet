export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  MealList: undefined;
  CreateMeal: {
    addMeal: (meal: Meal) => void;
  };
  MealDetail: {
    mealId: string;
  };
  ChatRoom: {
    mealId: string;
  };
};
