import { useMutation, useQueryClient } from "@tanstack/react-query";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { Habit } from "@/app/types/habit";

interface ToggleHabitParams {
    habitId: string;
    done: boolean;
}

export function useToggleHabit() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ habitId, done }: ToggleHabitParams) => {
            const today = dayjs().format("YYYY-MM-DD");
            return updateDoc(doc(db, `users/${user!.uid}/habits/${habitId}`), {
                completedDates: done ? arrayRemove(today) : arrayUnion(today),
            });
        },

        onMutate: async ({ habitId, done }: ToggleHabitParams) => {
            const queryKey = ["habits", user?.uid];
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<Habit[]>(queryKey);
            const today = dayjs().format("YYYY-MM-DD");

            queryClient.setQueryData<Habit[]>(queryKey, (old = []) =>
                old.map((habit) =>
                    habit.id === habitId
                        ? {
                              ...habit,
                              completedDates: done
                                  ? (habit.completedDates ?? []).filter(
                                        (d) => d !== today,
                                    )
                                  : [
                                        ...(habit.completedDates ?? []),
                                        today,
                                    ],
                          }
                        : habit,
                ),
            );

            return { previous, queryKey };
        },

        onError: (_error, _params, context) => {
            if (context?.previous) {
                queryClient.setQueryData(context.queryKey, context.previous);
            }
        },
    });
}
