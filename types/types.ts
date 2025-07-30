export type Meal = {
  id: string;
  title: string;
  mealType: "Meal Buddy" | "Open to More";
  location: string;
  time: string;
  date: string;
  budget: string;
  cuisine: string;
  people: number;
  max: number;
  creatorId: string;
  joinedIds: string[];
};

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  MealList: undefined;
  CreateMeal: {
    userId: string;
  };
  MealDetail: {
    meal: Meal;
  };
  ChatRoom: {
    mealId: string;
    mealTitle: string;
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
