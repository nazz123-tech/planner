import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", user?.uid] });
    },
  });
}
