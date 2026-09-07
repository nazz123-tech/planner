import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import { computeReminderFields } from "@/app/shared/reminders";
import type { Task } from "@/app/types/task";

interface UpdateTaskParams {
    taskId: string;
    data: Partial<Omit<Task, "id">>;
}

export function useUpdateTask() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: UpdateTaskParams) => {
            const queryKey = ["tasks", user?.uid];
            // onMutate has already merged `data` into the cache, so this is
            // the task as it will be after the write.
            const merged = (
                queryClient.getQueryData<Task[]>(queryKey) ?? []
            ).find((task) => task.id === taskId);

            const date = data.date ?? merged?.date;
            const time = "time" in data ? data.time : merged?.time;
            const schedule = computeReminderFields(date, time);

            // Only re-arm the reminder when the schedule actually moved,
            // so editing a title doesn't re-send an already-sent email.
            const rescheduled = schedule.remindAt !== (merged?.remindAt ?? null);

            return updateDoc(doc(db, `users/${user!.uid}/tasks/${taskId}`), {
                ...data,
                ...schedule,
                ...(rescheduled ? { reminderSentAt: null } : {}),
            });
        },

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
