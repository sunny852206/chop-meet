export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  MealList: undefined;
  CreateMeal: {
    addMeal: (meal: any) => void; // 你可以用你的 Meal type
  };
  MealDetail: {
    mealId: string;
  };
  ChatRoom: {
    mealId: string;
  };
};
