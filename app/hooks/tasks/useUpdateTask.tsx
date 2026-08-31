import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { Task } from "@/app/types/task";

interface UpdateTaskParams {
    taskId: string;
    data: Partial<Omit<Task, "id">>;
}

export function useUpdateTask() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: UpdateTaskParams) =>
            updateDoc(doc(db, `users/${user!.uid}/tasks/${taskId}`), data),

        onMutate: async ({ taskId, data }: UpdateTaskParams) => {
            const queryKey = ["tasks", user?.uid];
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<Task[]>(queryKey);
            queryClient.setQueryData<Task[]>(queryKey, (old = []) =>
                old.map((task) =>
                    task.id === taskId ? { ...task, ...data } : task,
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
