import { useMutation } from "@tanstack/react-query";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useAuth } from "../useAuth";

export function useDeleteHabit() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: (habitId: string) =>
            deleteDoc(doc(db, `users/${user!.uid}/habits/${habitId}`)),
    });
}
