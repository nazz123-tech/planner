import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "./useAuth";

export function useDeleteTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) =>
      deleteDoc(doc(db, `users/${user!.uid}/tasks/${taskId}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
    },
  });
}
