export type Meal = {
  id: string;
  title: string;
  mealType: "Meal Buddy" | "Open to More";
  location?: string;
  date?: string;
  time?: string;
  budget?: string;
  cuisine?: string;
  people?: number;
  max?: number;
  createdBy?: string;
};
