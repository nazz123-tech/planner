import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import { isScheduledOn, normalizeFrequency } from "@/app/shared/habits";
import type { Habit, HabitWithStats } from "@/app/types/habit";

function computeStats(habit: Habit): HabitWithStats {
    const frequency = normalizeFrequency(habit.frequency);
    const done = new Set(habit.completedDates ?? []);
    const today = dayjs();

    const completedToday = done.has(today.format("YYYY-MM-DD"));

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const day = today.subtract(6 - i, "day");
        const date = day.format("YYYY-MM-DD");
        return {
            date,
            done: done.has(date),
            scheduled: isScheduledOn(frequency, day.day()),
        };
    });

    // Streak: consecutive scheduled days completed, skipping unscheduled days.
    // Today counts as pending (not a miss) if it's scheduled but not yet done.
    let currentStreak = 0;
    let cursor = today;
    if (isScheduledOn(frequency, cursor.day()) && !completedToday) {
        cursor = cursor.subtract(1, "day");
    }
    for (let guard = 0; guard < 366; guard += 1) {
        if (isScheduledOn(frequency, cursor.day())) {
            if (done.has(cursor.format("YYYY-MM-DD"))) {
                currentStreak += 1;
            } else {
                break;
            }
        }
        cursor = cursor.subtract(1, "day");
    }

    return { ...habit, frequency, completedToday, currentStreak, last7Days };
}

export function useHabits(): {
    habits: HabitWithStats[];
    isLoading: boolean;
} {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(
            collection(db, `users/${user.uid}/habits`),
            (snapshot) => {
                const habits = snapshot.docs.map(
                    (d) => ({ id: d.id, ...d.data() }) as Habit,
                );
                queryClient.setQueryData(["habits", user.uid], habits);
            },
        );

        return () => unsubscribe();
    }, [user, queryClient]);

    const query = useQuery({
        queryKey: ["habits", user?.uid],
        queryFn: () => [] as Habit[],
        enabled: !!user,
        staleTime: Infinity,
    });

    const habits = useMemo(
        () => (query.data ?? []).map(computeStats),
        [query.data],
    );

    return { habits, isLoading: query.isLoading };
}
