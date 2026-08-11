export type HabitFrequency =
  | { type: "daily" }
  | { type: "weekdays"; days: WeekDay[] } 
  | { type: "timesPerWeek"; count: number };

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Habit {
  id: string;
  userId: string;
  name: string;
  icon: string;            
  frequency: HabitFrequency;         
  reminderTime?: string;          
  archivedAt?: string | null; 
}


export interface HabitEntry {
  date: string;       
  completedAt: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  last7Days: { date: string; done: boolean; isFuture: boolean }[];
}