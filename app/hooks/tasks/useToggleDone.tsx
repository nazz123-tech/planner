import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { Task } from "@/app/types/task";

interface ToggleTaskDoneParams {
    taskId: string;
    isDone: boolean;
}

export function useToggleTaskDone() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, isDone }: ToggleTaskDoneParams) =>
            updateDoc(doc(db, `users/${user!.uid}/tasks/${taskId}`), {
                isDone: !isDone,
            }),

        // Without this the checkbox, the strike-through and every board's
        // progress bar all sat still until the Firestore round trip came back.
        // `isDone` is the value before the tap, so the new one is its negation.
        onMutate: async ({ taskId, isDone }: ToggleTaskDoneParams) => {
            const queryKey = ["tasks", user?.uid];
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<Task[]>(queryKey);
            queryClient.setQueryData<Task[]>(queryKey, (old = []) =>
                old.map((task) =>
                    task.id === taskId ? { ...task, isDone: !isDone } : task,
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
