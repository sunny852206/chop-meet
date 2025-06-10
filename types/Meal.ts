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
