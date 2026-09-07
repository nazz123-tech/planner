import { useMutation } from "@tanstack/react-query";
import {
    collection,
    doc,
    serverTimestamp,
    writeBatch,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import { computeReminderFields } from "@/app/shared/reminders";
import type { Task } from "@/app/types/task";

// Firestore allows 500 writes per batch; stay comfortably under.
const BATCH_LIMIT = 450;

export function useImportTasks() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (tasks: Omit<Task, "id">[]) => {
            if (!user) throw new Error("Not authenticated");
            if (tasks.length === 0) return { imported: 0 };

            const tasksCol = collection(db, `users/${user.uid}/tasks`);

            for (let i = 0; i < tasks.length; i += BATCH_LIMIT) {
                const batch = writeBatch(db);
                for (const task of tasks.slice(i, i + BATCH_LIMIT)) {
                    batch.set(doc(tasksCol), {
                        ...task,
                        // Imported tasks get reminders too — without these
                        // fields the sweep can never match them.
                        ...computeReminderFields(task.date, task.time),
                        reminderSentAt: null,
                        createdAt: serverTimestamp(),
                    });
                }
                await batch.commit();
            }

            return { imported: tasks.length };
        },
    });
}

