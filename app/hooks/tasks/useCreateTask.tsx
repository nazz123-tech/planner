import { useMutation } from "@tanstack/react-query";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import { computeReminderFields } from "@/app/shared/reminders";
import type { Task } from "@/app/types/task";

export function useCreateTask() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: (task: Omit<Task, "id">) =>
            addDoc(collection(db, `users/${user!.uid}/tasks`), {
                ...task,
                ...computeReminderFields(task.date, task.time),
                reminderSentAt: null,
                createdAt: serverTimestamp(),
            }),
    });
}

