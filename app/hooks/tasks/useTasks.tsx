import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";
import type { Task } from "@/app/types/task";

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, `users/${user.uid}/tasks`),
      (snapshot) => {
        const tasks = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Task,
        );
        queryClient.setQueryData(["tasks", user.uid], tasks);
      },
    );

    return () => unsubscribe();
  }, [user, queryClient]);

  return useQuery({
    queryKey: ["tasks", user?.uid],
    queryFn: () => [] as Task[],
    enabled: !!user,
    staleTime: Infinity,
  });
}
