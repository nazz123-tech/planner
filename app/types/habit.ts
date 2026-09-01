export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HabitFrequency =
    | { type: "daily" }
    | { type: "weekdays"; days: WeekDay[] };

export interface Habit {
    id: string;
    name: string;
    emoji: string;
    frequency: HabitFrequency;
    completedDates: string[];
    createdAt?: { seconds: number; nanoseconds: number };
}

export interface HabitWithStats extends Habit {
    completedToday: boolean;
    currentStreak: number;
    last7Days: { date: string; done: boolean; scheduled: boolean }[];
}
