import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { HabitFrequency } from "@/app/types/habit";

interface CreateHabitParams {
    name: string;
    emoji: string;
    frequency: HabitFrequency;
}

export function useCreateHabit() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (habit: CreateHabitParams) =>
            addDoc(collection(db, `users/${user!.uid}/habits`), {
                ...habit,
                completedDates: [],
                createdAt: serverTimestamp(),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["habits", user?.uid],
            });
        },
    });
}
