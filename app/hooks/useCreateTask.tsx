import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "./useAuth";
import type { Task } from "@/app/types/task";

export function useCreateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Omit<Task, "id">) =>
      addDoc(collection(db, `users/${user!.uid}/tasks`), task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
    },
  });
}
